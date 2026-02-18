"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { prescriptionRepository } from "@/repositories/prescription";
import { format } from "date-fns";
import {
    Search,
    Plus,
    FileText,
    Eye,
    Download,
    Stethoscope,
    Calendar,
    User
} from "lucide-react";
import { Input } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PrescriptionsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ["prescriptions-all"],
        queryFn: () => prescriptionRepository.getAll()
    });

    const filteredPrescriptions = prescriptions?.filter(p =>
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientPhone.includes(searchQuery)
    );

    const handleDownload = async (id: string, patientName: string) => {
        try {
            const fullPrescription = await prescriptionRepository.getById(id);
            // We need settings for the PDF generator
            const { settingsRepository } = await import("@/repositories/settings");
            const settings = await settingsRepository.getSettings();

            const { generatePrescriptionPDF } = await import("@/lib/pdf-generator");
            generatePrescriptionPDF(fullPrescription, settings);
            toast.success("PDF generated successfully");
        } catch (error) {
            toast.error("Failed to generate PDF");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Prescriptions</h1>
                    <p className="text-slate-500 mt-1">Manage and view all patient prescriptions in one place.</p>
                </div>
                <Link href="/patients">
                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold shrink-0 h-11">
                        <Plus className="mr-2 h-4 w-4" /> New Prescription
                    </Button>
                </Link>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by patient name or phone..."
                    className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-lg shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
            ) : filteredPrescriptions?.length === 0 ? (
                <Card className="border-dashed py-20 bg-white">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No prescriptions found</h3>
                        <p className="text-slate-500 max-w-sm mt-1">
                            {searchQuery ? "Try adjusting your search filters." : "Start by selecting a patient from the database to create a new prescription."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredPrescriptions?.map((p) => (
                        <Card key={p.$id} className="hover:shadow-md transition-all border-l-4 border-l-blue-600">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex gap-4 items-center min-w-0">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Stethoscope className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 text-lg truncate">{p.patientName}</h3>
                                                {p.isFinalized && <Badge className="bg-green-100 text-green-700 border-none text-[10px]">Finalized</Badge>}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(p.visitDate), "PPP")}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" />
                                                    {p.patientPhone}
                                                </div>
                                            </div>
                                            {p.diagnosis && (
                                                <p className="text-sm text-slate-600 mt-2 truncate max-w-[500px]">
                                                    <span className="font-bold text-slate-400 uppercase text-[10px] mr-2">Diagnosis:</span>
                                                    {p.diagnosis}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                        <Link href={`/prescriptions/${p.$id}/print`} className="flex-1 md:flex-initial">
                                            <Button variant="outline" className="w-full h-11 md:h-9 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="flex-1 md:flex-initial h-11 md:h-9 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold"
                                            onClick={() => handleDownload(p.$id, p.patientName)}
                                        >
                                            <Download className="mr-2 h-4 w-4" /> PDF
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
