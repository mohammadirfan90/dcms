"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientRepository } from "@/repositories/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function AddPatientDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        age: "",
        gender: "other",
        address: "",
        medicalNotes: "",
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => patientRepository.create({
            ...data,
            age: data.age ? parseInt(data.age) : undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            toast.success("Patient added successfully");
            setOpen(false);
            setFormData({
                name: "",
                phone: "",
                age: "",
                gender: "other",
                address: "",
                medicalNotes: "",
            });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add patient");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                        <DialogDescription>
                            Enter patient details to create a new profile.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name*</Label>
                            <Input
                                id="name"
                                required
                                className="col-span-3"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone*</Label>
                            <Input
                                id="phone"
                                required
                                className="col-span-3"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="age" className="text-right">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    className="col-span-3"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="gender" className="text-right">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="address" className="text-right mt-2">Address</Label>
                            <Textarea
                                id="address"
                                className="col-span-3"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="notes" className="text-right mt-2">Medical Notes</Label>
                            <Textarea
                                id="notes"
                                className="col-span-3"
                                placeholder="Allergies, chronic conditions, etc."
                                value={formData.medicalNotes}
                                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Adding..." : "Add Patient"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
