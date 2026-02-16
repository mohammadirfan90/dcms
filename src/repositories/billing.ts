import { supabase } from "@/lib/supabase";
import { Bill, BillItem } from "@/models";

export const billingRepository = {
    async getBillsByPatient(patientId: string) {
        const { data, error } = await supabase
            .from('bills')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return {
            documents: data.map(doc => ({ ...doc, $id: doc.id })),
            total: data.length
        };
    },

    async getBillById(id: string) {
        const { data: bill, error: billError } = await supabase
            .from('bills')
            .select('*, bill_items(*)')
            .eq('id', id)
            .single();

        if (billError) throw billError;
        return {
            ...bill,
            $id: bill.id,
            items: bill.bill_items.map((item: any) => ({ ...item, $id: item.id }))
        };
    },

    async createBill(billData: Omit<Bill, "$id" | "createdAt">, items: Omit<BillItem, "$id" | "billId">[]) {
        // Start a manual "transaction" using multiple calls since simple SDK doesn't have Txs
        // In Supabase, you'd usually use an RPC or just multiple inserts if RLS allows.
        const { data: bill, error: billError } = await supabase
            .from('bills')
            .insert({
                patient_id: billData.patientId,
                total: billData.total,
                discount: billData.discount,
                paid: billData.paid,
                due: billData.due,
                status: billData.status,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (billError) throw billError;

        const { data: createdItems, error: itemsError } = await supabase
            .from('bill_items')
            .insert(items.map(item => ({
                bill_id: bill.id,
                description: item.description,
                amount: item.amount
            })))
            .select();

        if (itemsError) throw itemsError;

        return {
            ...bill,
            $id: bill.id,
            items: createdItems.map(item => ({ ...item, $id: item.id }))
        };
    },

    async updatePayment(id: string, paid: number, status: Bill["status"], due: number) {
        const { data: doc, error } = await supabase
            .from('bills')
            .update({
                paid,
                status,
                due
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { ...doc, $id: doc.id };
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
