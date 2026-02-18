import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "doctor", "receptionist"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
    $id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: UserRoleSchema,
    specialization: z.string().nullable().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const PatientSchema = z.object({
    $id: z.string(),
    name: z.string(),
    phone: z.string(),
    age: z.number().nullable().optional(),
    gender: z.enum(["male", "female", "other"]).nullable().optional(),
    address: z.string().nullable().optional(),
    medicalNotes: z.string().nullable().optional(),
    createdAt: z.string(),
    lastVisitDate: z.string().nullable().optional(),
});
export type Patient = z.infer<typeof PatientSchema>;

export const AppointmentStatusSchema = z.enum(["booked", "completed", "cancelled"]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const AppointmentSchema = z.object({
    $id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(),
    timeSlot: z.string(),
    status: AppointmentStatusSchema,
});
export type Appointment = z.infer<typeof AppointmentSchema>;

export const TreatmentSchema = z.object({
    $id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    visitDate: z.string(),
    complaint: z.string(),
    diagnosis: z.string(),
    procedure: z.string(),
    toothNumbers: z.array(z.string()),
    notes: z.string().nullable().optional(),
    followUpDate: z.string().nullable().optional(),
    attachments: z.array(z.string()).nullable().optional(), // Cloudinary URLs
});
export type Treatment = z.infer<typeof TreatmentSchema>;

export const BillStatusSchema = z.enum(["paid", "partial", "due"]);
export type BillStatus = z.infer<typeof BillStatusSchema>;

export const BillSchema = z.object({
    $id: z.string(),
    patientId: z.string(),
    treatmentId: z.string().optional(),
    total: z.number(),
    discount: z.number().default(0),
    paid: z.number().default(0),
    due: z.number(),
    status: BillStatusSchema,
    isFinalized: z.boolean().default(false),
    createdAt: z.string(),
});
export type Bill = z.infer<typeof BillSchema>;

export const BillItemSchema = z.object({
    $id: z.string(),
    billId: z.string(),
    description: z.string(),
    amount: z.number(),
});
export type BillItem = z.infer<typeof BillItemSchema>;

export const PaymentSchema = z.object({
    $id: z.string(),
    billId: z.string(),
    amount: z.number(),
    paymentMethod: z.string().default("cash"),
    createdAt: z.string(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const ClinicDoctorSchema = z.object({
    id: z.string(),
    name: z.string(),
    degrees: z.string(),
    speciality: z.string(),
    registrationNumber: z.string(),
    signatureImage: z.string().nullable().optional(),
});
export type ClinicDoctor = z.infer<typeof ClinicDoctorSchema>;

export const ClinicSettingsSchema = z.object({
    name: z.string(),
    subtitle: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    address: z.string(),
    phone: z.string(),
    visitingHours: z.string(),
    doctors: z.array(ClinicDoctorSchema),
});
export type ClinicSettings = z.infer<typeof ClinicSettingsSchema>;

export const PrescriptionMedicineSchema = z.object({
    $id: z.string(),
    prescriptionId: z.string(),
    name: z.string(),
    dose: z.string(),
    duration: z.string(),
    instruction: z.string(),
});
export type PrescriptionMedicine = z.infer<typeof PrescriptionMedicineSchema>;

export const PrescriptionSchema = z.object({
    $id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    visitDate: z.string(),
    ageAtVisit: z.number(),
    sexAtVisit: z.enum(["male", "female", "other"]),
    chiefComplaint: z.string().nullable().optional(),
    examination: z.string().nullable().optional(),
    investigation: z.string().nullable().optional(),
    diagnosis: z.string().nullable().optional(),
    treatment: z.string().nullable().optional(),
    advice: z.string().nullable().optional(),
    isFinalized: z.boolean().default(false),
    createdAt: z.string(),
});
export type Prescription = z.infer<typeof PrescriptionSchema>;

// Detailed prescription with joins
export type PrescriptionWithDetails = Prescription & {
    patient: {
        name: string;
        phone: string;
        address: string | null;
    };
    doctor: {
        name: string;
        degrees: string | null;
        speciality: string | null;
        registrationNumber: string | null;
    };
    medicines: PrescriptionMedicine[];
};
