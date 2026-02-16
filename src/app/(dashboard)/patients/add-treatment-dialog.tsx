"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentRepository } from "@/repositories/treatment";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface AddTreatmentDialogProps {
    patientId: string;
}

export function AddTreatmentDialog({ patientId }: AddTreatmentDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [toothInput, setToothInput] = useState("");

    const [formData, setFormData] = useState({
        patientId: patientId,
        doctorId: "doctor1", // Default for MVP
        visitDate: new Date().toISOString().split("T")[0],
        complaint: "",
        diagnosis: "",
        procedure: "",
        toothNumbers: [] as string[],
        notes: "",
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => treatmentRepository.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
            toast.success("Treatment record added");
            setOpen(false);
            setFormData({
                patientId: patientId,
                doctorId: "doctor1",
                visitDate: new Date().toISOString().split("T")[0],
                complaint: "",
                diagnosis: "",
                procedure: "",
                toothNumbers: [],
                notes: "",
            });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add treatment");
        }
    });

    const addTooth = () => {
        if (toothInput && !formData.toothNumbers.includes(toothInput)) {
            setFormData({
                ...formData,
                toothNumbers: [...formData.toothNumbers, toothInput]
            });
            setToothInput("");
        }
    };

    const removeTooth = (tooth: string) => {
        setFormData({
            ...formData,
            toothNumbers: formData.toothNumbers.filter(t => t !== tooth)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.procedure || !formData.diagnosis) {
            toast.error("Procedure and Diagnosis are required");
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600">
                    <Plus className="mr-2 h-4 w-4" /> New Record
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Treatment Record</DialogTitle>
                        <DialogDescription>
                            Record diagnosis and procedures performed during this visit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Visit Date</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                className="col-span-3"
                                value={formData.visitDate}
                                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="complaint" className="text-right mt-2">Complaint</Label>
                            <Textarea
                                id="complaint"
                                className="col-span-3"
                                placeholder="Patient's primary complaint"
                                value={formData.complaint}
                                onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="diagnosis" className="text-right mt-2">Diagnosis*</Label>
                            <Textarea
                                id="diagnosis"
                                required
                                className="col-span-3"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="procedure" className="text-right">Procedure*</Label>
                            <Input
                                id="procedure"
                                required
                                className="col-span-3"
                                placeholder="e.g. Filling, Root Canal"
                                value={formData.procedure}
                                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Teeth</Label>
                            <div className="col-span-3 flex gap-2 overflow-hidden">
                                <Input
                                    placeholder="No."
                                    className="w-20"
                                    value={toothInput}
                                    onChange={(e) => setToothInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTooth())}
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addTooth}>Add</Button>
                            </div>
                        </div>
                        {formData.toothNumbers.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-start-2 col-span-3 flex flex-wrap gap-2">
                                    {formData.toothNumbers.map(t => (
                                        <Badge key={t} variant="secondary" className="pl-2 pr-1 py-1">
                                            {t}
                                            <button type="button" onClick={() => removeTooth(t)} className="ml-1 hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="notes" className="text-right mt-2">Notes</Label>
                            <Textarea
                                id="notes"
                                className="col-span-3"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Saving..." : "Save Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
