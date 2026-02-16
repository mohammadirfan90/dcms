import { supabase } from "@/lib/supabase";
import { Appointment, AppointmentStatus } from "@/models";

export const appointmentRepository = {
    async getAll() {
        const { data, error } = await supabase
            .from('appointments')
            .select('*, patients(*)');

        if (error) throw error;
        return {
            documents: data.map(doc => ({ ...doc, $id: doc.id })),
            total: data.length
        };
    },

    async create(data: Omit<Appointment, "$id">) {
        // Check for double booking
        const { data: existing, error: checkError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', data.doctorId)
            .eq('date', data.date)
            .eq('time_slot', data.timeSlot)
            .neq('status', 'cancelled');

        if (checkError) throw checkError;
        if (existing && existing.length > 0) {
            throw new Error("Doctor is already booked for this time slot.");
        }

        const { data: doc, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: data.patientId,
                doctor_id: data.doctorId,
                date: data.date,
                time_slot: data.timeSlot,
                status: data.status
            })
            .select()
            .single();

        if (error) throw error;
        return { ...doc, $id: doc.id };
    },

    async updateStatus(id: string, status: AppointmentStatus) {
        const { data: doc, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { ...doc, $id: doc.id };
    },

    async getTodayAppointments(doctorId?: string) {
        const today = new Date().toISOString().split("T")[0];
        let query = supabase
            .from('appointments')
            .select('*, patients(*)')
            .eq('date', today);

        if (doctorId) {
            query = query.eq('doctor_id', doctorId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
            documents: data.map(doc => ({ ...doc, $id: doc.id })),
            total: data.length
        };
    }
};
