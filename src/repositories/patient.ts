import { supabase } from "@/lib/supabase";
import { Patient, PatientSchema } from "@/models";

export const patientRepository = {
    async getAll() {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('name');

        if (error) throw error;
        return {
            documents: data.map(doc => ({ ...doc, $id: doc.id })),
            total: data.length
        };
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { ...data, $id: data.id };
    },

    async create(data: Omit<Patient, "$id" | "createdAt">) {
        const { data: doc, error } = await supabase
            .from('patients')
            .insert({
                ...data,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { ...doc, $id: doc.id };
    },

    async update(id: string, data: Partial<Omit<Patient, "$id" | "createdAt">>) {
        const { data: doc, error } = await supabase
            .from('patients')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { ...doc, $id: doc.id };
    },

    async search(query: string) {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%`);

        if (error) throw error;
        return {
            documents: data.map(doc => ({ ...doc, $id: doc.id })),
            total: data.length
        };
    },

    async getRecent(limit: number = 5) {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data.map(doc => ({ ...doc, $id: doc.id }));
    }
};
