"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentRepository } from "@/repositories/appointment";
import { patientRepository } from "@/repositories/patient";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function AppointmentsPage() {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    const { data: appointments, isLoading: isApptsLoading } = useQuery({
        queryKey: ["appointments", selectedDate],
        queryFn: () => appointmentRepository.getAll([`equal("date", "${selectedDate}")`]),
    });

    const { data: patients } = useQuery({
        queryKey: ["patients-lookup"],
        queryFn: () => patientRepository.getAll(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: any }) =>
            appointmentRepository.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        }
    });

    const getPatientName = (id: string) => {
        return patients?.documents.find((p: any) => p.$id === id)?.name || "Unknown Patient";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 border-green-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                    <p className="text-slate-500">Manage daily schedule and bookings</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Book Appointment
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Manage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isApptsLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                                    Loading schedule...
                                </TableCell>
                            </TableRow>
                        ) : appointments?.documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 bg-slate-50/50 rounded-md">
                                    <div className="flex flex-col items-center">
                                        <CalendarIcon className="h-10 w-10 text-slate-300 mb-2" />
                                        <p className="text-slate-500">No appointments for this date.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments?.documents.map((appt: any) => (
                                <TableRow key={appt.$id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                            {appt.timeSlot}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-700">
                                        {getPatientName(appt.patientId)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(appt.status)}>
                                            {appt.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {appt.status === "booked" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updateStatusMutation.mutate({ id: appt.$id, status: "completed" })}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => updateStatusMutation.mutate({ id: appt.$id, status: "cancelled" })}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// Minimal Input for local use
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    )
}
