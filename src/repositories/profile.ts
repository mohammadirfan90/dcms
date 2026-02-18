import { supabase } from "@/lib/supabase";
import { UserProfile, UserProfileSchema } from "@/models";

export const profileRepository = {
    async getDoctors() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'doctor');

        if (error) throw error;
        return {
            documents: data.map(doc => ({
                ...doc,
                $id: doc.id
            })),
            total: data.length
        };
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return {
            ...data,
            $id: data.id
        };
    }
};
