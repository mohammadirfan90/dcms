"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { patientRepository } from "@/repositories/patient";
import { prescriptionRepository } from "@/repositories/prescription";
import { settingsRepository } from "@/repositories/settings";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Stethoscope,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    User as UserIcon,
    Pill
} from "lucide-react";
import { PrescriptionMedicine } from "@/models";
import { format } from "date-fns";

export default function NewPrescriptionPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const patientId = params.patientId as string;

    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ["patient", patientId],
        queryFn: () => patientRepository.getById(patientId)
    });

    const { data: settings } = useQuery({
        queryKey: ["clinic-settings"],
        queryFn: () => settingsRepository.getSettings()
    });

    const [medicines, setMedicines] = useState<Omit<PrescriptionMedicine, "$id" | "prescriptionId">[]>([]);
    const [visitDate, setVisitDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const createMutation = useMutation({
        mutationFn: (data: any) => prescriptionRepository.create(data.prescription, data.medicines),
        onSuccess: (prescription) => {
            queryClient.invalidateQueries({ queryKey: ["prescriptions", patientId] });
            toast.success("Prescription saved successfully");
            router.push(`/patients/${patientId}`);
        },
        onError: () => toast.error("Failed to save prescription")
    });

    const addMedicine = () => {
        setMedicines([...medicines, { name: "", dose: "", duration: "", instruction: "" }]);
    };

    const removeMedicine = (index: number) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const updateMedicine = (index: number, field: keyof Omit<PrescriptionMedicine, "$id" | "prescriptionId">, value: string) => {
        const newMeds = [...medicines];
        newMeds[index] = { ...newMeds[index], [field]: value };
        setMedicines(newMeds);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!patient) return;

        const formData = new FormData(e.currentTarget);
        const prescription = {
            patientId,
            doctorId: user?.$id || "",
            visitDate,
            ageAtVisit: patient.age || 0,
            sexAtVisit: (patient.gender as any) || "other",
            chiefComplaint: formData.get("chiefComplaint") as string,
            examination: formData.get("examination") as string,
            investigation: formData.get("investigation") as string,
            diagnosis: formData.get("diagnosis") as string,
            treatment: formData.get("treatment") as string,
            advice: formData.get("advice") as string,
            isFinalized: formData.get("isFinalized") === "on",
        };

        createMutation.mutate({ prescription, medicines });
    };

    if (isPatientLoading) return <div className="p-8 text-center">Loading patient data...</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">Patient not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                        New Prescription
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Summary Card (Read Only) */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-slate-500" />
                            Patient Identity (Relational)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div>
                            <Label className="text-slate-500">Name</Label>
                            <div className="font-semibold">{patient.name}</div>
                        </div>
                        <div>
                            <Label className="text-slate-500">Age / Gender</Label>
                            <div className="font-semibold">{patient.age}Y / {patient.gender}</div>
                        </div>
                        <div>
                            <Label className="text-slate-500">Phone</Label>
                            <div className="font-semibold">{patient.phone}</div>
                        </div>
                        <div>
                            <Label className="text-slate-500">Visit Date</Label>
                            <Input
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="h-8 bg-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Clinical Notes */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Clinical Findings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                                <Textarea id="chiefComplaint" name="chiefComplaint" placeholder="E.g. Toothache in lower left" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="examination">Examination</Label>
                                <Textarea id="examination" name="examination" placeholder="E.g. Deep caries in 36" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea id="diagnosis" name="diagnosis" placeholder="E.g. Irreversible Pulpitis" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="investigation">Investigation</Label>
                                <Textarea id="investigation" name="investigation" placeholder="E.g. IOPA radiograph" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescription & Advice */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-blue-600" />
                                    Prescription (Rx)
                                </CardTitle>
                                <Button type="button" size="sm" variant="outline" onClick={addMedicine}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Medicine
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {medicines.map((med, idx) => (
                                    <div key={idx} className="flex gap-2 items-start border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                                            <div className="md:col-span-2">
                                                <Input
                                                    placeholder="Medicine Name"
                                                    value={med.name}
                                                    onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                placeholder="Dose (1+0+1)"
                                                value={med.dose}
                                                onChange={(e) => updateMedicine(idx, "dose", e.target.value)}
                                            />
                                            <Input
                                                placeholder="Duration (5 days)"
                                                value={med.duration}
                                                onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                                            />
                                            <div className="md:col-span-4">
                                                <Input
                                                    placeholder="Special Instruction (After meal)"
                                                    value={med.instruction}
                                                    onChange={(e) => updateMedicine(idx, "instruction", e.target.value)}
                                                    className="h-8 text-sm text-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 mt-1"
                                            onClick={() => removeMedicine(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {medicines.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 italic text-sm">
                                        No medicines added yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Advice & Treatment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="treatment">Treatment Plan</Label>
                                    <Textarea id="treatment" name="treatment" placeholder="E.g. RCT followed by Crown" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="advice">Medical Advice</Label>
                                    <Textarea id="advice" name="advice" placeholder="E.g. Drink plenty of water" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-6 right-6 flex gap-3 shadow-lg p-2 bg-white rounded-full border">
                    <div className="flex items-center gap-2 px-4 border-r mr-2">
                        <input
                            type="checkbox"
                            id="isFinalized"
                            name="isFinalized"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <Label htmlFor="isFinalized" className="text-sm font-medium cursor-pointer">Finalize & Lock</Label>
                    </div>
                    <Button type="submit" size="lg" className="rounded-full px-8" disabled={createMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {createMutation.isPending ? "Saving..." : "Save Prescription"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
