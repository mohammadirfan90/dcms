"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { patientRepository } from "@/repositories/patient";
import { treatmentRepository } from "@/repositories/treatment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
    User,
    Phone,
    MapPin,
    FileText,
    Clock,
    Plus,
    ArrowLeft,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTreatmentDialog } from "../add-treatment-dialog";
import { BookAppointmentDialog } from "../../appointments/book-appointment-dialog";
import { billingRepository } from "@/repositories/billing";
import { CreateBillDialog } from "../../billing/create-bill-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export default function PatientProfilePage() {
    const params = useParams();
    const id = params.id as string;

    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ["patient", id],
        queryFn: () => patientRepository.getById(id),
    });

    const { data: bills, isLoading: isBillsLoading } = useQuery({
        queryKey: ["bills", id],
        queryFn: () => billingRepository.getBillsByPatient(id),
    });

    const { data: treatments, isLoading: isTreatmentsLoading } = useQuery({
        queryKey: ["treatments", id],
        queryFn: () => treatmentRepository.getAllByPatient(id),
    });

    if (isPatientLoading) {
        return <div className="p-8 space-y-4 text-center text-slate-500">Loading profile...</div>;
    }

    if (!patient) {
        return <div className="p-8 text-center text-red-500 font-medium">Patient not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/patients">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Patient Identity */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <User className="h-10 w-10 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">{patient.name}</CardTitle>
                            <CardDescription>Patient ID: {patient.$id}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 mr-3 text-slate-400" />
                                <span>{patient.phone}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-3 text-slate-400" />
                                <span>{patient.age ? `${patient.age} years` : "Age not specified"} • <span className="capitalize">{patient.gender || "Gender N/A"}</span></span>
                            </div>
                            <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 mr-3 mt-1 text-slate-400" />
                                <span>{patient.address || "No address provided"}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-2 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" /> Medical Notes
                                </h4>
                                <p className="text-sm text-slate-600 italic">
                                    {patient.medicalNotes || "No medical notes recorded."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Center & Right: Workspace */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="treatments" className="w-full">
                        <TabsList className="mb-4 bg-white border">
                            <TabsTrigger value="treatments">Treatment Timeline</TabsTrigger>
                            <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="treatments" className="space-y-4">
                            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-semibold">Treatment History</h3>
                                <AddTreatmentDialog patientId={id} />
                            </div>

                            {isTreatmentsLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : treatments?.documents.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                    <p className="text-slate-500">No treatment records found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {treatments?.documents.map((treatment: any) => (
                                        <div key={treatment.$id} className="relative flex items-start gap-6 pl-10">
                                            <div className="absolute left-0 mt-1 h-10 w-10 rounded-full border bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <Card className="flex-1">
                                                <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold text-slate-900">{treatment.procedure}</h4>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {format(new Date(treatment.visitDate), "MMM dd, yyyy")}
                                                        </span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="py-3 px-4">
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap"><span className="font-semibold">Diagnosis:</span> {treatment.diagnosis}</p>
                                                    {treatment.toothNumbers?.length > 0 && (
                                                        <div className="mt-2 flex gap-1 items-center">
                                                            <span className="text-xs font-semibold text-slate-500 mr-2">Teeth:</span>
                                                            {treatment.toothNumbers.map((t: string) => (
                                                                <Badge key={t} variant="secondary" className="text-[10px] py-0">{t}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="billing" className="space-y-4">
                            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-semibold">Billing History</h3>
                                <CreateBillDialog patientId={id} />
                            </div>

                            {isBillsLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : bills?.documents.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                    <p className="text-slate-500">No billing history found.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border shadow-sm">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Paid</TableHead>
                                                <TableHead>Due</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bills?.documents.map((bill: any) => (
                                                <TableRow key={bill.$id}>
                                                    <TableCell>{format(new Date(bill.createdAt), "MMM dd, yyyy")}</TableCell>
                                                    <TableCell className="font-bold">৳{bill.total}</TableCell>
                                                    <TableCell className="text-green-600">৳{bill.paid}</TableCell>
                                                    <TableCell className="text-red-600">৳{bill.due}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            bill.status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
                                                                bill.status === "partial" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                                    "bg-red-50 text-red-700 border-red-200"
                                                        }>
                                                            {bill.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="appointments">
                            <Card>
                                <CardContent className="py-10 text-center text-slate-500">
                                    Appointment module coming soon
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
