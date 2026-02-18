import { supabase } from "@/lib/supabase";
import { ClinicSettings, ClinicSettingsSchema } from "@/models";

export const settingsRepository = {
    async getSettings(): Promise<ClinicSettings | null> {
        const { data, error } = await supabase
            .from('clinic_settings')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return {
                name: "Your Clinic Name",
                subtitle: "Dental Care & Surgery",
                address: "Clinic Address",
                phone: "Phone Number",
                visitingHours: "Visiting Hours",
                doctors: []
            };
            throw error;
        }

        return {
            ...data,
            visitingHours: data.visiting_hours,
        };
    },

    async updateSettings(settings: Omit<ClinicSettings, 'visitingHours'> & { visiting_hours: string }) {
        const { data: existing } = await supabase.from('clinic_settings').select('id').limit(1).single();

        if (existing) {
            const { error } = await supabase
                .from('clinic_settings')
                .update(settings)
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('clinic_settings')
                .insert(settings);
            if (error) throw error;
        }

        return this.getSettings();
    }
};
