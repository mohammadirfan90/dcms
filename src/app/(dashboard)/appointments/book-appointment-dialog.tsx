"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentRepository } from "@/repositories/appointment";
import { patientRepository } from "@/repositories/patient";
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
import { Plus, Search } from "lucide-react";

export function BookAppointmentDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        patientId: "",
        doctorId: "doctor1", // Default for MVP
        date: new Date().toISOString().split("T")[0],
        timeSlot: "",
    });

    const { data: patients } = useQuery({
        queryKey: ["patients-list"],
        queryFn: () => patientRepository.getAll(),
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
                patientId: "",
                doctorId: "doctor1",
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
        if (!formData.patientId || !formData.timeSlot) {
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
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="patient" className="text-right">Patient*</Label>
                            <Select
                                value={formData.patientId}
                                onValueChange={(val) => setFormData({ ...formData, patientId: val })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients?.documents.map((p: any) => (
                                        <SelectItem key={p.$id} value={p.$id}>{p.name} ({p.phone})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Date*</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                className="col-span-3"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Time*</Label>
                            <Select
                                value={formData.timeSlot}
                                onValueChange={(val) => setFormData({ ...formData, timeSlot: val })}
                            >
                                <SelectTrigger className="col-span-3">
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
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={bookMutation.isPending}>
                            {bookMutation.isPending ? "Booking..." : "Book Now"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
