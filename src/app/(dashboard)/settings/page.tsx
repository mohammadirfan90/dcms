"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsRepository } from "@/repositories/settings";
import { profileRepository } from "@/repositories/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Users, Save, Plus, Trash2 } from "lucide-react";
import { ClinicDoctor } from "@/models";

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const { data: settings, isLoading } = useQuery({
        queryKey: ["clinic-settings"],
        queryFn: () => settingsRepository.getSettings()
    });

    const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);

    useEffect(() => {
        if (settings?.doctors) {
            setDoctors(settings.doctors);
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => settingsRepository.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clinic-settings"] });
            toast.success("Settings updated successfully");
        },
        onError: () => toast.error("Failed to update settings")
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            subtitle: formData.get("subtitle") as string,
            address: formData.get("address") as string,
            phone: formData.get("phone") as string,
            visiting_hours: formData.get("visitingHours") as string,
            doctors: doctors
        };
        updateMutation.mutate(data);
    };

    const addDoctor = () => {
        setDoctors([...doctors, {
            id: crypto.randomUUID(),
            name: "",
            degrees: "",
            speciality: "",
            registrationNumber: "",
            signatureImage: null
        }]);
    };

    const removeDoctor = (id: string) => {
        setDoctors(doctors.filter(d => d.id !== id));
    };

    const updateDoctor = (id: string, field: keyof ClinicDoctor, value: string) => {
        setDoctors(doctors.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clinic Settings</h2>
                    <p className="text-muted-foreground">Manage your clinic branding and doctor profiles for prescriptions.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            General Information
                        </CardTitle>
                        <CardDescription>Main clinic details shown on headers and invoices.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Clinic Name</Label>
                            <Input id="name" name="name" defaultValue={settings?.name} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subtitle">Subtitle / Slogan</Label>
                            <Input id="subtitle" name="subtitle" defaultValue={settings?.subtitle || ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" name="address" defaultValue={settings?.address} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" defaultValue={settings?.phone} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="visitingHours">Visiting Hours</Label>
                            <Input id="visitingHours" name="visitingHours" defaultValue={settings?.visitingHours} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Prescription Doctors
                            </CardTitle>
                            <CardDescription>Manage degrees and specialities for prescription headers.</CardDescription>
                        </div>
                        <Button type="button" size="sm" onClick={addDoctor}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {doctors.map((doc, idx) => (
                            <div key={doc.id} className="p-4 border rounded-lg relative space-y-3 bg-slate-50/50">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-2 text-red-500"
                                    onClick={() => removeDoctor(doc.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Doctor Name</Label>
                                        <Input
                                            value={doc.name}
                                            onChange={(e) => updateDoctor(doc.id, "name", e.target.value)}
                                            placeholder="Dr. John Doe"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Degrees</Label>
                                        <Input
                                            value={doc.degrees}
                                            onChange={(e) => updateDoctor(doc.id, "degrees", e.target.value)}
                                            placeholder="MBBS, FCPS"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Speciality</Label>
                                        <Input
                                            value={doc.speciality}
                                            onChange={(e) => updateDoctor(doc.id, "speciality", e.target.value)}
                                            placeholder="Orthodontist"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Registration No.</Label>
                                        <Input
                                            value={doc.registrationNumber}
                                            onChange={(e) => updateDoctor(doc.id, "registrationNumber", e.target.value)}
                                            placeholder="BMDC A-12345"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 flex justify-end">
                    <Button type="submit" size="lg" disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
