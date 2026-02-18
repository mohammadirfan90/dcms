"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { treatmentRepository } from "@/repositories/treatment";
import { profileRepository } from "@/repositories/profile";
import { useAuth } from "@/providers/auth-provider";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface AddTreatmentDialogProps {
    patientId: string;
}

export function AddTreatmentDialog({ patientId }: AddTreatmentDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [toothInput, setToothInput] = useState("");

    const { data: doctors } = useQuery({
        queryKey: ["doctors", "list"],
        queryFn: () => profileRepository.getDoctors(),
        enabled: open
    });

    const [formData, setFormData] = useState({
        patientId: patientId,
        doctorId: "",
        visitDate: new Date().toISOString().split("T")[0],
        complaint: "",
        diagnosis: "",
        procedure: "",
        toothNumbers: [] as string[],
        notes: "",
    });

    // Auto-fill doctorId
    useEffect(() => {
        if (user?.role === 'doctor') {
            setFormData(prev => ({ ...prev, doctorId: user.$id }));
        } else if (doctors?.documents.length && !formData.doctorId) {
            setFormData(prev => ({ ...prev, doctorId: doctors.documents[0].$id }));
        }
    }, [user, doctors, formData.doctorId]);

    const createMutation = useMutation({
        mutationFn: (data: any) => treatmentRepository.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["treatments", patientId] });
            toast.success("Treatment record added");
            setOpen(false);
            setFormData({
                patientId: patientId,
                doctorId: user?.role === 'doctor' ? user.$id : (doctors?.documents[0]?.$id || ""),
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
        if (!formData.procedure || !formData.diagnosis || !formData.doctorId) {
            toast.error("Procedure, Diagnosis, and Doctor are required");
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
                    <div className="grid gap-6 py-6 px-1">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="date" className="text-sm font-medium">Visit Date</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                className="h-11"
                                value={formData.visitDate}
                                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                            />
                        </div>

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
                            <Label htmlFor="complaint" className="text-sm font-medium">Complaint</Label>
                            <Textarea
                                id="complaint"
                                className="min-h-[80px]"
                                placeholder="Patient's primary complaint"
                                value={formData.complaint}
                                onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis*</Label>
                            <Textarea
                                id="diagnosis"
                                required
                                className="min-h-[80px]"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="procedure" className="text-sm font-medium">Procedure*</Label>
                            <Input
                                id="procedure"
                                required
                                className="h-11"
                                placeholder="e.g. Filling, Root Canal"
                                value={formData.procedure}
                                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium">Teeth</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="No."
                                    className="h-11 w-24"
                                    value={toothInput}
                                    onChange={(e) => setToothInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTooth())}
                                />
                                <Button type="button" variant="outline" className="h-11" onClick={addTooth}>Add</Button>
                            </div>
                            {formData.toothNumbers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.toothNumbers.map(t => (
                                        <Badge key={t} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm">
                                            {t}
                                            <button type="button" onClick={() => removeTooth(t)} className="ml-2 hover:text-red-500">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                            <Textarea
                                id="notes"
                                className="min-h-[80px]"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button type="button" variant="outline" className="h-11 sm:h-9" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-9" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Saving..." : "Save Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
