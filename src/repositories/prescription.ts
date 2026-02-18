import { supabase } from "@/lib/supabase";
import { Prescription, PrescriptionMedicine, PrescriptionWithDetails } from "@/models";

export const prescriptionRepository = {
    async create(prescription: Omit<Prescription, "$id" | "createdAt">, medicines: Omit<PrescriptionMedicine, "$id" | "prescriptionId">[]) {
        // Start transaction via separate calls since Supabase doesn't support complex transactions easily in JS
        const { data: pData, error: pError } = await supabase
            .from('prescriptions')
            .insert({
                patient_id: prescription.patientId,
                doctor_id: prescription.doctorId,
                visit_date: prescription.visitDate,
                age_at_visit: prescription.ageAtVisit,
                sex_at_visit: prescription.sexAtVisit,
                chief_complaint: prescription.chiefComplaint,
                examination: prescription.examination,
                investigation: prescription.investigation,
                diagnosis: prescription.diagnosis,
                treatment: prescription.treatment,
                advice: prescription.advice,
                is_finalized: prescription.isFinalized || false
            })
            .select()
            .single();

        if (pError) throw pError;

        if (medicines.length > 0) {
            const { error: medError } = await supabase
                .from('prescription_medicines')
                .insert(medicines.map(m => ({
                    prescription_id: pData.id,
                    name: m.name,
                    dose: m.dose,
                    duration: m.duration,
                    instruction: m.instruction
                })));

            if (medError) throw medError;
        }

        return this.getById(pData.id);
    },

    async getById(id: string): Promise<PrescriptionWithDetails> {
        const { data: p, error: pError } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patient:patients(name, phone, address),
                doctor:profiles(name, specialization)
            `)
            .eq('id', id)
            .single();

        if (pError) throw pError;

        const { data: meds, error: mError } = await supabase
            .from('prescription_medicines')
            .select('*')
            .eq('prescription_id', id);

        if (mError) throw mError;

        // Fetch doctor clinical info if not in profiles directly (based on ClinicDoctorSchema)
        // Note: For now we'll rely on profiles join, and in render we join settings details

        return {
            ...p,
            $id: p.id,
            patientId: p.patient_id,
            doctorId: p.doctor_id,
            visitDate: p.visit_date,
            ageAtVisit: p.age_at_visit,
            sexAtVisit: p.sex_at_visit,
            chiefComplaint: p.chief_complaint,
            examination: p.examination,
            investigation: p.investigation,
            diagnosis: p.diagnosis,
            treatment: p.treatment,
            advice: p.advice,
            isFinalized: p.is_finalized,
            createdAt: p.created_at,
            medicines: meds.map(m => ({
                ...m,
                $id: m.id,
                prescriptionId: m.prescription_id
            })),
            patient: p.patient || { name: "Unknown Patient", phone: "N/A", address: null },
            doctor: {
                name: p.doctor?.name || "Unknown Doctor",
                degrees: "",
                speciality: p.doctor?.specialization || "Physician",
                registrationNumber: ""
            }
        };
    },

    async getByPatient(patientId: string): Promise<Prescription[]> {
        const { data, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('patient_id', patientId)
            .order('visit_date', { ascending: false });

        if (error) throw error;
        return data.map(p => ({
            ...p,
            $id: p.id,
            patientId: p.patient_id,
            doctorId: p.doctor_id,
            visitDate: p.visit_date,
            ageAtVisit: p.age_at_visit,
            sexAtVisit: p.sex_at_visit,
            chiefComplaint: p.chief_complaint,
            examination: p.examination,
            investigation: p.investigation,
            diagnosis: p.diagnosis,
            treatment: p.treatment,
            advice: p.advice,
            isFinalized: p.is_finalized,
            createdAt: p.created_at
        }));
    },

    async finalize(id: string) {
        const { error } = await supabase
            .from('prescriptions')
            .update({ is_finalized: true })
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async getAll() {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patient:patients(name, phone)
            `)
            .order('visit_date', { ascending: false });

        if (error) throw error;
        return data.map(p => ({
            ...p,
            $id: p.id,
            patientId: p.patient_id,
            doctorId: p.doctor_id,
            visitDate: p.visit_date,
            ageAtVisit: p.age_at_visit,
            sexAtVisit: p.sex_at_visit,
            chiefComplaint: p.chief_complaint,
            examination: p.examination,
            investigation: p.investigation,
            diagnosis: p.diagnosis,
            treatment: p.treatment,
            advice: p.advice,
            isFinalized: p.is_finalized,
            createdAt: p.created_at,
            patientName: p.patient?.name || "Unknown",
            patientPhone: p.patient?.phone || "N/A"
        }));
    }
};
