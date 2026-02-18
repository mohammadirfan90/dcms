import { supabase } from "@/lib/supabase";
import { Treatment } from "@/models";

export const treatmentRepository = {
    async getAllByPatient(patientId: string) {
        const { data, error } = await supabase
            .from('treatments')
            .select('*')
            .eq('patient_id', patientId)
            .order('visit_date', { ascending: false });

        if (error) throw error;
        return {
            documents: data.map(doc => ({
                ...doc,
                $id: doc.id,
                patientId: doc.patient_id,
                doctorId: doc.doctor_id,
                visitDate: doc.visit_date,
                toothNumbers: doc.tooth_numbers
            })),
            total: data.length
        };
    },

    async create(data: Omit<Treatment, "$id">) {
        const { data: doc, error } = await supabase
            .from('treatments')
            .insert({
                patient_id: data.patientId,
                doctor_id: data.doctorId,
                visit_date: data.visitDate,
                complaint: data.complaint,
                diagnosis: data.diagnosis,
                procedure: data.procedure,
                tooth_numbers: data.toothNumbers,
                notes: data.notes
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...doc,
            $id: doc.id,
            patientId: doc.patient_id,
            doctorId: doc.doctor_id,
            visitDate: doc.visit_date,
            toothNumbers: doc.tooth_numbers
        };
    },

    async update(id: string, data: Partial<Omit<Treatment, "$id">>) {
        const updateData: any = { ...data };
        if (data.patientId) { updateData.patient_id = data.patientId; delete updateData.patientId; }
        if (data.doctorId) { updateData.doctor_id = data.doctorId; delete updateData.doctorId; }
        if (data.visitDate) { updateData.visit_date = data.visitDate; delete updateData.visitDate; }
        if (data.toothNumbers) { updateData.tooth_numbers = data.toothNumbers; delete updateData.toothNumbers; }

        const { data: doc, error } = await supabase
            .from('treatments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return {
            ...doc,
            $id: doc.id,
            patientId: doc.patient_id,
            doctorId: doc.doctor_id,
            visitDate: doc.visit_date,
            toothNumbers: doc.tooth_numbers
        };
    },
};
