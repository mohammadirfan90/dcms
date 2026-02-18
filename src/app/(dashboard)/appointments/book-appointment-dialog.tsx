"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentRepository } from "@/repositories/appointment";
import { patientRepository } from "@/repositories/patient";
import { profileRepository } from "@/repositories/profile";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function BookAppointmentDialog({ patientId: initialPatientId }: { patientId?: string }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: doctors } = useQuery({
        queryKey: ["doctors", "list"],
        queryFn: () => profileRepository.getDoctors(),
    });

    const [formData, setFormData] = useState({
        patientId: initialPatientId || "",
        doctorId: "",
        date: new Date().toISOString().split("T")[0],
        timeSlot: "",
    });

    // Auto-fill doctorId based on role or first available
    useEffect(() => {
        if (user?.role === 'doctor') {
            setFormData(prev => ({ ...prev, doctorId: user.$id }));
        } else if (doctors?.documents.length && !formData.doctorId) {
            setFormData(prev => ({ ...prev, doctorId: doctors.documents[0].$id }));
        }
    }, [user, doctors, formData.doctorId]);

    const { data: patients } = useQuery({
        queryKey: ["patients", "list"],
        queryFn: () => patientRepository.getAll(),
        enabled: !initialPatientId && open,
    });

    const bookMutation = useMutation({
        mutationFn: (data: any) => appointmentRepository.create({
            ...data,
            status: "booked",
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Appointment booked successfully");
            setOpen(false);
            setFormData({
                patientId: initialPatientId || "",
                doctorId: user?.role === 'doctor' ? user.$id : (doctors?.documents[0]?.$id || ""),
                date: new Date().toISOString().split("T")[0],
                timeSlot: "",
            });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to book appointment");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patientId || !formData.doctorId || !formData.timeSlot) {
            toast.error("Please fill all required fields");
            return;
        }
        bookMutation.mutate(formData);
    };

    const timeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Book Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Book Appointment</DialogTitle>
                        <DialogDescription>
                            Select a patient and time slot to book an appointment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6 px-1">
                        {!initialPatientId && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="patient" className="text-sm font-medium">Patient*</Label>
                                <Select
                                    value={formData.patientId}
                                    onValueChange={(val) => setFormData({ ...formData, patientId: val })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select Patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients?.documents.map((p: any) => (
                                            <SelectItem key={p.$id} value={p.$id}>{p.name} ({p.phone})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {user?.role !== 'doctor' && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="doctor" className="text-sm font-medium">Doctor*</Label>
                                <Select
                                    value={formData.doctorId}
                                    onValueChange={(val) => setFormData({ ...formData, doctorId: val })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select Doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors?.documents.map((d: any) => (
                                            <SelectItem key={d.$id} value={d.$id}>Dr. {d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="date" className="text-sm font-medium">Date*</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                className="h-11"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="time" className="text-sm font-medium">Time*</Label>
                            <Select
                                value={formData.timeSlot}
                                onValueChange={(val) => setFormData({ ...formData, timeSlot: val })}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select Slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((slot) => (
                                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button type="button" variant="outline" className="h-11 sm:h-9" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-9" disabled={bookMutation.isPending}>
                            {bookMutation.isPending ? "Booking..." : "Book Now"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
