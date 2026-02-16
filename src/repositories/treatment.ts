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
            documents: data.map(doc => ({ ...doc, $id: doc.id })),
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
        return { ...doc, $id: doc.id };
    },

    async update(id: string, data: Partial<Omit<Treatment, "$id">>) {
        const { data: doc, error } = await supabase
            .from('treatments')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { ...doc, $id: doc.id };
    },
};
