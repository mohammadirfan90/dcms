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
    Calendar,
    Lock,
    Trash2,
    Stethoscope
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTreatmentDialog } from "../add-treatment-dialog";
import { BookAppointmentDialog } from "../../appointments/book-appointment-dialog";
import { billingRepository } from "@/repositories/billing";
import { CreateBillDialog } from "../../billing/create-bill-dialog";
import { RecordPaymentDialog } from "../../billing/record-payment-dialog";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { prescriptionRepository } from "@/repositories/prescription";
import { settingsRepository } from "@/repositories/settings";
import { generatePrescriptionPDF } from "@/lib/pdf-generator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export default function PatientProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
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

    const { data: prescriptions, isLoading: isPrescriptionsLoading } = useQuery({
        queryKey: ["prescriptions", id],
        queryFn: () => prescriptionRepository.getByPatient(id),
    });

    const handleDownloadPrescription = async (prescriptionId: string) => {
        try {
            toast.loading("Preparing PDF...", { id: "pdf-gen" });
            const [p, settings] = await Promise.all([
                prescriptionRepository.getById(prescriptionId),
                settingsRepository.getSettings()
            ]);

            if (!p || !settings) throw new Error("Missing data");

            generatePrescriptionPDF(p, settings);
            toast.success("Prescription downloaded!", { id: "pdf-gen" });
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF", { id: "pdf-gen" });
        }
    };

    const finalizeMutation = useMutation({
        mutationFn: (billId: string) => billingRepository.finalizeBill(user?.role || '', billId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills", id] });
            toast.success("Bill finalized and locked");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to finalize bill");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (billId: string) => billingRepository.deleteBill(user?.role || '', billId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills", id] });
            toast.success("Bill deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete bill");
        }
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
                    <Button variant="ghost" size="sm" className="h-9">
                        <ArrowLeft className="mr-2 h-4 w-4" /> <span className="text-sm">Back to Patients</span>
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Patient Identity */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center pb-2 px-4 sm:px-6">
                            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl break-words">{patient.name}</CardTitle>
                            <CardDescription className="text-xs break-all">ID: {patient.$id}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 px-4 sm:px-6">
                            <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 mr-3 text-slate-400 shrink-0" />
                                <span>{patient.phone}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-3 text-slate-400 shrink-0" />
                                <span>{patient.age ? `${patient.age}y` : "Age N/A"} • <span className="capitalize">{patient.gender || "Gender N/A"}</span></span>
                            </div>
                            <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 mr-3 mt-1 text-slate-400 shrink-0" />
                                <span className="line-clamp-2">{patient.address || "No address provided"}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                                    <FileText className="h-3 w-3 mr-2" /> Medical Notes
                                </h4>
                                <p className="text-sm text-slate-600 italic line-clamp-3">
                                    {patient.medicalNotes || "No medical notes recorded."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Center & Right: Workspace */}
                <div className="md:col-span-2 overflow-hidden">
                    <Tabs defaultValue="treatments" className="w-full">
                        <div className="w-full overflow-x-auto pb-1 mb-4 no-scrollbar">
                            <TabsList className="inline-flex bg-white border w-auto sm:w-full min-w-max sm:min-w-0 justify-start sm:justify-center">
                                <TabsTrigger value="treatments">Timeline</TabsTrigger>
                                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                                <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
                                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="treatments" className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border shadow-sm gap-4">
                                <h3 className="font-semibold text-slate-900">Treatment History</h3>
                                <AddTreatmentDialog patientId={id} />
                            </div>

                            {isTreatmentsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ) : treatments?.documents.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                    <p className="text-slate-500">No treatment records found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {treatments?.documents.map((treatment: any) => (
                                        <div key={treatment.$id} className="relative flex items-start gap-4 sm:gap-6 pl-10">
                                            <div className="absolute left-0 mt-1 h-10 w-10 rounded-full border bg-white flex items-center justify-center text-slate-500 shadow-sm z-10">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <Card className="flex-1 overflow-hidden">
                                                <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
                                                        <h4 className="font-bold text-slate-900 break-words">{treatment.procedure}</h4>
                                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                                                            {format(new Date(treatment.visitDate), "MMM dd, yyyy")}
                                                        </span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="py-3 px-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Diagnosis</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{treatment.diagnosis}</p>
                                                    </div>
                                                    {treatment.toothNumbers?.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                                                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mr-1">Teeth:</span>
                                                            {treatment.toothNumbers.map((t: string) => (
                                                                <Badge key={t} variant="secondary" className="text-[10px] sm:text-xs font-black px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-100">{t}</Badge>
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

                        <TabsContent value="prescriptions" className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border shadow-sm gap-4">
                                <h3 className="font-semibold text-slate-900">Prescription History</h3>
                                {(user?.role === 'doctor' || user?.role === 'admin') && (
                                    <Link href={`/prescriptions/new/${id}`} className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                            <Plus className="mr-2 h-4 w-4" /> New Prescription
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {isPrescriptionsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ) : prescriptions?.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                    <p className="text-slate-500">No prescriptions found.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {prescriptions?.map((p) => (
                                        <Card key={p.$id} className="hover:bg-slate-50/50 transition-colors border-l-4 border-l-blue-600">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                            <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-black text-slate-900 truncate">Prescription on {format(new Date(p.visitDate), "PPP")}</div>
                                                            <div className="text-sm text-slate-500 truncate mt-1">
                                                                {p.chiefComplaint || "No chief complaint recorded."}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                                        <Link href={`/prescriptions/${p.$id}/print`} className="flex-1 sm:flex-initial">
                                                            <Button
                                                                variant="outline"
                                                                className="w-full h-11 sm:h-9 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                                                            >
                                                                <FileText className="mr-2 h-4 w-4" /> View
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 sm:flex-initial h-11 sm:h-9 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold"
                                                            onClick={() => handleDownloadPrescription(p.$id)}
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" /> PDF
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
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
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ) : bills?.documents.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                    <p className="text-slate-500">No billing history found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block bg-white rounded-lg border shadow-sm overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Paid</TableHead>
                                                    <TableHead>Due</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
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
                                                                {bill.isFinalized && <Lock className="ml-1 h-3 w-3 inline" />}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                {!bill.isFinalized && (user?.role === 'doctor' || user?.role === 'admin') && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                            onClick={() => finalizeMutation.mutate(bill.$id)}
                                                                            disabled={finalizeMutation.isPending}
                                                                        >
                                                                            Finalize
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => {
                                                                                if (confirm("Are you sure you want to delete this bill?")) {
                                                                                    deleteMutation.mutate(bill.$id);
                                                                                }
                                                                            }}
                                                                            disabled={deleteMutation.isPending}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {bill.due > 0 && (
                                                                    <RecordPaymentDialog
                                                                        billId={bill.$id}
                                                                        patientId={id}
                                                                        currentDue={bill.due}
                                                                    />
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={async () => {
                                                                        try {
                                                                            const fullBill = await billingRepository.getBillById(bill.$id);
                                                                            import("@/lib/pdf-generator").then(m => m.generateInvoicePDF(fullBill, patient.name));
                                                                        } catch (error) {
                                                                            toast.error("Failed to generate PDF");
                                                                        }
                                                                    }}
                                                                    title="Download PDF Invoice"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="grid grid-cols-1 gap-4 md:hidden">
                                        {bills?.documents.map((bill: any) => (
                                            <Card key={bill.$id} className="border-l-4 border-l-blue-600">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400">{format(new Date(bill.createdAt), "PPP")}</p>
                                                            <p className="text-lg font-black text-slate-900 mt-1">৳{bill.total}</p>
                                                        </div>
                                                        <Badge variant="outline" className={
                                                            bill.status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
                                                                bill.status === "partial" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                                    "bg-red-50 text-red-700 border-red-200"
                                                        }>
                                                            {bill.status}
                                                            {bill.isFinalized && <Lock className="ml-1 h-3 w-3 inline" />}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-sm">
                                                        <div>
                                                            <p className="text-slate-500 text-[10px] uppercase font-bold">Paid</p>
                                                            <p className="text-green-600 font-bold">৳{bill.paid}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-500 text-[10px] uppercase font-bold">Due</p>
                                                            <p className="text-red-600 font-bold">৳{bill.due}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                                                        {bill.due > 0 && (
                                                            <div className="flex-1">
                                                                <RecordPaymentDialog
                                                                    billId={bill.$id}
                                                                    patientId={id}
                                                                    currentDue={bill.due}
                                                                />
                                                            </div>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 h-11"
                                                            onClick={async () => {
                                                                try {
                                                                    const fullBill = await billingRepository.getBillById(bill.$id);
                                                                    import("@/lib/pdf-generator").then(m => m.generateInvoicePDF(fullBill, patient.name));
                                                                } catch (error) {
                                                                    toast.error("Failed to generate PDF");
                                                                }
                                                            }}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" /> Invoice
                                                        </Button>
                                                        {!bill.isFinalized && (user?.role === 'doctor' || user?.role === 'admin') && (
                                                            <Button
                                                                variant="ghost"
                                                                className="h-11 text-amber-600 px-3"
                                                                onClick={() => finalizeMutation.mutate(bill.$id)}
                                                            >
                                                                Finalize
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Audit Trail */}
                            <div className="bg-white rounded-lg border shadow-sm p-4 mt-6">
                                <h4 className="font-semibold mb-3 flex items-center text-slate-900">
                                    <Clock className="h-4 w-4 mr-2" /> Financial Audit Trail (Payments)
                                </h4>
                                <div className="space-y-3">
                                    {bills?.documents.flatMap((b: any) => b.payments || []).length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No payments recorded yet.</p>
                                    ) : (
                                        <>
                                            {/* Desktop View */}
                                            <div className="hidden sm:block overflow-hidden rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50">
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Bill ID</TableHead>
                                                            <TableHead>Method</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {bills?.documents.flatMap((b: any) => (b.payments || []).map((p: any) => ({ ...p, billId: b.$id })))
                                                            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                            .map((payment: any, idx: number) => (
                                                                <TableRow key={idx} className="text-xs">
                                                                    <TableCell>{format(new Date(payment.createdAt), "MMM dd, yyyy HH:mm")}</TableCell>
                                                                    <TableCell className="font-mono text-[10px]">{payment.billId.slice(0, 8)}...</TableCell>
                                                                    <TableCell className="capitalize">{payment.payment_method}</TableCell>
                                                                    <TableCell className="text-right font-bold text-green-600">৳{payment.amount}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {/* Mobile View */}
                                            <div className="sm:hidden space-y-2">
                                                {bills?.documents.flatMap((b: any) => (b.payments || []).map((p: any) => ({ ...p, billId: b.$id })))
                                                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .map((payment: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-slate-50 border border-slate-100 text-[10px]">
                                                            <div>
                                                                <p className="font-bold text-slate-600">{format(new Date(payment.createdAt), "MMM dd, HH:mm")}</p>
                                                                <p className="text-slate-400 capitalize">{payment.payment_method}</p>
                                                            </div>
                                                            <div className="text-right font-black text-green-700 text-sm">
                                                                ৳{payment.amount}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="appointments" className="space-y-4">
                            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-semibold">Upcoming Appointments</h3>
                                <BookAppointmentDialog patientId={id} />
                            </div>
                            {/* TODO: Add appointment list here */}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
