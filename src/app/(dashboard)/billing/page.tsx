"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingRepository } from "@/repositories/billing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
    FileText,
    Clock,
    Search,
    Filter,
    Lock,
    Trash2,
    Banknote,
    ArrowRight
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export default function BillingPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: bills, isLoading } = useQuery({
        queryKey: ["bills", "all"],
        queryFn: () => billingRepository.getAllBills()
    });

    const finalizeMutation = useMutation({
        mutationFn: (billId: string) => billingRepository.finalizeBill(user?.role || '', billId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
            toast.success("Bill finalized successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to finalize bill");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (billId: string) => billingRepository.deleteBill(user?.role || '', billId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
            toast.success("Bill deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete bill");
        }
    });

    const filteredBills = bills?.documents.filter(bill =>
        bill.patientName.toLowerCase().includes(search.toLowerCase()) ||
        bill.status.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Billing Management</h1>
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 border-b-2 border-blue-600 pb-1">Billing Management</h1>
                    <p className="text-slate-500 mt-1">Manage all patient invoices and financial records.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search patient or status..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="bg-white">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-600 font-medium">Total Collected</CardDescription>
                        <CardTitle className="text-2xl text-emerald-900">
                            ৳{bills?.documents.reduce((sum, b) => sum + b.paid, 0).toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-rose-600 font-medium">Outstanding Dues</CardDescription>
                        <CardTitle className="text-2xl text-rose-900">
                            ৳{bills?.documents.reduce((sum, b) => sum + b.due, 0).toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 font-medium">Total Invoiced</CardDescription>
                        <CardTitle className="text-2xl text-blue-900">
                            ৳{bills?.documents.reduce((sum, b) => sum + b.total, 0).toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-lg">Financial Overview</CardTitle>
                    <CardDescription>Comprehensive list of all generated bills.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Patient</TableHead>
                                <TableHead className="font-semibold">Items</TableHead>
                                <TableHead className="font-semibold">Total</TableHead>
                                <TableHead className="font-semibold">Paid</TableHead>
                                <TableHead className="font-semibold">Due</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-slate-500 italic">
                                        No matching billing records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBills.map((bill) => (
                                    <TableRow key={bill.$id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="text-slate-600">
                                            {format(new Date(bill.createdAt), "MMM dd, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Link
                                                    href={`/patients/${bill.patientId}`}
                                                    className="font-bold text-blue-600 hover:underline flex items-center"
                                                >
                                                    {bill.patientName}
                                                    <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                                <span className="text-[10px] text-slate-400 font-mono">ID: {bill.$id.slice(0, 8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 h-5">
                                                {bill.treatmentId ? "Treatment" : "Consultation"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">৳{bill.total}</TableCell>
                                        <TableCell className="text-emerald-600 font-medium">৳{bill.paid}</TableCell>
                                        <TableCell className="text-rose-600 font-bold">৳{bill.due}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "border-2",
                                                bill.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                    bill.status === "partial" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        "bg-rose-50 text-rose-700 border-rose-200"
                                            )}>
                                                {bill.status.toUpperCase()}
                                                {bill.isFinalized && <Lock className="ml-1.5 h-3 w-3 inline" />}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {!bill.isFinalized && (user?.role === 'doctor' || user?.role === 'admin') && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 h-8"
                                                            title="Finalize Bill"
                                                            onClick={() => finalizeMutation.mutate(bill.$id)}
                                                            disabled={finalizeMutation.isPending}
                                                        >
                                                            Finalize
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 h-8 w-8 p-0"
                                                            title="Delete Bill"
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
                                                        patientId={bill.patientId}
                                                        currentDue={bill.due}
                                                    />
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 w-8 p-0"
                                                    onClick={async () => {
                                                        try {
                                                            const fullBill = await billingRepository.getBillById(bill.$id);
                                                            import("@/lib/pdf-generator").then(m => m.generateInvoicePDF(fullBill, bill.patientName));
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-lg flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-slate-500" />
                        Recent Payment Audit Trail
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="font-semibold">DateTime</TableHead>
                                <TableHead className="font-semibold">Patient</TableHead>
                                <TableHead className="font-semibold">Method</TableHead>
                                <TableHead className="text-right font-semibold">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills?.documents.length === 0 || bills?.documents.flatMap(b => b.payments).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-400 italic">
                                        No payments recorded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bills?.documents.flatMap(b => (b.payments || []).map((p: any) => ({ ...p, patientName: b.patientName, patientId: b.patientId })))
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .slice(0, 10)
                                    .map((payment: any, idx: number) => (
                                        <TableRow key={idx} className="hover:bg-slate-50/50">
                                            <TableCell className="text-slate-500 text-sm">
                                                {format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell className="font-medium">{payment.patientName}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600">
                                                    {payment.payment_method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                ৳{payment.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
