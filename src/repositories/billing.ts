import { supabase } from "@/lib/supabase";
import { Bill, BillItem } from "@/models";

export const billingRepository = {
    async getBillsByPatient(patientId: string) {
        const { data, error } = await supabase
            .from('bills')
            .select('*, payments(*)')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return {
            documents: data.map(doc => ({
                ...doc,
                $id: doc.id,
                patientId: doc.patient_id,
                treatmentId: doc.treatment_id,
                isFinalized: doc.is_finalized,
                createdAt: doc.created_at,
                payments: doc.payments?.map((p: any) => ({
                    ...p,
                    $id: p.id,
                    createdAt: p.created_at
                })) || []
            })),
            total: data.length
        };
    },

    async getAllBills() {
        const { data, error } = await supabase
            .from('bills')
            .select('*, patients(name), payments(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return {
            documents: data.map(doc => ({
                ...doc,
                $id: doc.id,
                patientId: doc.patient_id,
                patientName: doc.patients?.name || "Unknown",
                treatmentId: doc.treatment_id,
                isFinalized: doc.is_finalized,
                createdAt: doc.created_at,
                payments: doc.payments?.map((p: any) => ({
                    ...p,
                    $id: p.id,
                    createdAt: p.created_at
                })) || []
            })),
            total: data.length
        };
    },

    async getBillById(id: string) {
        const { data: bill, error: billError } = await supabase
            .from('bills')
            .select('*, bill_items(*), payments(*)')
            .eq('id', id)
            .single();

        if (billError) throw billError;
        return {
            ...bill,
            $id: bill.id,
            patientId: bill.patient_id,
            treatmentId: bill.treatment_id,
            isFinalized: bill.is_finalized,
            createdAt: bill.created_at,
            items: bill.bill_items.map((item: any) => ({
                ...item,
                $id: item.id,
                billId: item.bill_id
            })),
            payments: bill.payments?.map((p: any) => ({
                ...p,
                $id: p.id,
                billId: p.bill_id,
                createdAt: p.created_at
            })) || []
        };
    },

    async createBill(role: string, billData: { patientId: string; treatmentId?: string }, items: { description: string; amount: number }[]) {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        if (subtotal < 0) throw new Error("Subtotal cannot be negative");

        const { data: bill, error: billError } = await supabase
            .from('bills')
            .insert({
                patient_id: billData.patientId,
                treatment_id: billData.treatmentId,
                total: subtotal,
                discount: 0,
                paid: 0,
                due: subtotal,
                status: 'due',
                is_finalized: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (billError) throw billError;

        const { error: itemsError } = await supabase
            .from('bill_items')
            .insert(items.map(item => ({
                bill_id: bill.id,
                description: item.description,
                amount: item.amount
            })));

        if (itemsError) throw itemsError;

        return this.getBillById(bill.id);
    },

    async addBillItem(role: string, billId: string, description: string, amount: number) {
        if (role !== 'doctor' && role !== 'admin') {
            throw new Error("Receptionists cannot edit bill items after initial save");
        }

        const bill = await this.getBillById(billId);
        if (bill.isFinalized) throw new Error("Cannot add items to a finalized bill");

        const { error: itemError } = await supabase
            .from('bill_items')
            .insert({
                bill_id: billId,
                description,
                amount
            });

        if (itemError) throw itemError;

        const newTotal = Number(bill.total) + amount;
        const newDue = Number(bill.due) + amount;

        const { error: billError } = await supabase
            .from('bills')
            .update({
                total: newTotal,
                due: newDue
            })
            .eq('id', billId);

        if (billError) throw billError;
        return this.getBillById(billId);
    },

    async applyDiscount(role: string, billId: string, discount: number) {
        if (role !== 'doctor' && role !== 'admin') {
            throw new Error("Only Doctors can apply discounts");
        }

        const bill = await this.getBillById(billId);
        if (bill.isFinalized) throw new Error("Cannot add discount to a finalized bill");

        const newTotal = Math.max(0, bill.total - discount);
        const newDue = Math.max(0, newTotal - bill.paid);
        const newStatus = bill.paid >= newTotal ? "paid" : (bill.paid > 0 ? "partial" : "due");

        const { error } = await supabase
            .from('bills')
            .update({
                discount: discount,
                total: newTotal,
                due: newDue,
                status: newStatus
            })
            .eq('id', billId);

        if (error) throw error;
        return this.getBillById(billId);
    },

    async finalizeBill(role: string, billId: string) {
        const bill = await this.getBillById(billId);

        if (role !== 'doctor' && role !== 'admin') {
            // Check restriction: cannot finalize doctor bill
            if (bill.treatmentId) {
                throw new Error("Receptionists cannot finalize doctor-led bills");
            }
            throw new Error("Receptionists cannot finalize bills");
        }

        const { error } = await supabase
            .from('bills')
            .update({ is_finalized: true })
            .eq('id', billId);

        if (error) throw error;
        return this.getBillById(billId);
    },

    async recordPayment(billId: string, amount: number, method: string = "cash") {
        const bill = await this.getBillById(billId);

        if (amount <= 0) throw new Error("Payment amount must be positive");
        if (amount > bill.due) throw new Error("Payment exceeds due amount");

        const { error: pError } = await supabase
            .from('payments')
            .insert({
                bill_id: billId,
                amount: amount,
                payment_method: method,
                created_at: new Date().toISOString()
            });

        if (pError) throw pError;

        const newPaid = Number(bill.paid) + amount;
        const newDue = Number(bill.total) - newPaid;
        const newStatus = newPaid >= bill.total ? "paid" : (newPaid > 0 ? "partial" : "due");

        const { error: bError } = await supabase
            .from('bills')
            .update({
                paid: newPaid,
                due: newDue,
                status: newStatus
            })
            .eq('id', billId);

        if (bError) throw bError;
        return this.getBillById(billId);
    },

    async deleteBill(role: string, billId: string) {
        if (role === 'receptionist') {
            throw new Error("Receptionists are restricted from deleting bills");
        }

        const bill = await this.getBillById(billId);
        if (bill.isFinalized) throw new Error("Cannot delete a finalized bill");

        const { error } = await supabase
            .from('bills')
            .delete()
            .eq('id', billId);

        if (error) throw error;
        return true;
    },

    async getDashboardStats() {
        const today = new Date().toISOString().split("T")[0];

        const { data: todayBills, error: incomeError } = await supabase
            .from('bills')
            .select('paid')
            .gte('created_at', `${today}T00:00:00Z`);

        if (incomeError) throw incomeError;
        const income = todayBills?.reduce((sum, bill) => sum + Number(bill.paid), 0) || 0;

        const { data: pendingBills, error: pendingError } = await supabase
            .from('bills')
            .select('due')
            .gt('due', 0);

        if (pendingError) throw pendingError;
        const pendingCount = pendingBills?.length || 0;

        return { income, pendingCount };
    }
};
