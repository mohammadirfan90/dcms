import { supabase } from "@/lib/supabase";
import { UserProfile, UserProfileSchema } from "@/models";

export const authRepository = {
    async getCurrentUser() {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return null;

            const { data: profile, error: dbError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (dbError || !profile) return null;

            return UserProfileSchema.parse({
                ...profile,
                $id: profile.id
            });
        } catch (error) {
            return null;
        }
    },

    async login(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password });
    },

    async logout() {
        return await supabase.auth.signOut();
    }
};
