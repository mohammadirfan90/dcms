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
            documents: data.map(doc => ({
                ...doc,
                $id: doc.id,
                medicalNotes: doc.medical_notes,
                lastVisitDate: doc.last_visit_date,
                createdAt: doc.created_at
            })),
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
        return {
            ...data,
            $id: data.id,
            medicalNotes: data.medical_notes,
            lastVisitDate: data.last_visit_date,
            createdAt: data.created_at
        };
    },

    async create(data: Omit<Patient, "$id" | "createdAt">) {
        const { data: doc, error } = await supabase
            .from('patients')
            .insert({
                name: data.name,
                phone: data.phone,
                age: data.age,
                gender: data.gender,
                address: data.address,
                medical_notes: data.medicalNotes,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...doc,
            $id: doc.id,
            medicalNotes: doc.medical_notes,
            lastVisitDate: doc.last_visit_date,
            createdAt: doc.created_at
        };
    },

    async update(id: string, data: Partial<Omit<Patient, "$id" | "createdAt">>) {
        const updateData: any = { ...data };
        if (data.medicalNotes !== undefined) {
            updateData.medical_notes = data.medicalNotes;
            delete updateData.medicalNotes;
        }
        if (data.lastVisitDate !== undefined) {
            updateData.last_visit_date = data.lastVisitDate;
            delete updateData.lastVisitDate;
        }

        const { data: doc, error } = await supabase
            .from('patients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return {
            ...doc,
            $id: doc.id,
            medicalNotes: doc.medical_notes,
            lastVisitDate: doc.last_visit_date,
            createdAt: doc.created_at
        };
    },

    async search(query: string) {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%`);

        if (error) throw error;
        return {
            documents: data.map(doc => ({
                ...doc,
                $id: doc.id,
                medicalNotes: doc.medical_notes,
                lastVisitDate: doc.last_visit_date,
                createdAt: doc.created_at
            })),
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
        return data.map(doc => ({
            ...doc,
            $id: doc.id,
            medicalNotes: doc.medical_notes,
            lastVisitDate: doc.last_visit_date,
            createdAt: doc.created_at
        }));
    }
};
