"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { prescriptionRepository } from "@/repositories/prescription";
import { settingsRepository } from "@/repositories/settings";
import { format } from "date-fns";
import { Stethoscope, Phone, MapPin, Globe, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePrescriptionPDF } from "@/lib/pdf-generator";

export default function PrescriptionPrintPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: prescription, isLoading: isPrescriptionLoading } = useQuery({
        queryKey: ["prescription", id],
        queryFn: () => prescriptionRepository.getById(id)
    });

    const { data: settings, isLoading: isSettingsLoading } = useQuery({
        queryKey: ["clinic-settings"],
        queryFn: () => settingsRepository.getSettings()
    });

    const handleDownload = () => {
        if (prescription && settings) {
            generatePrescriptionPDF(prescription, settings);
        }
    };

    useEffect(() => {
        if (prescription && settings) {
            // Keep the automatic print trigger but don't close until download option is seen
            // setTimeout(() => { window.print(); }, 1000);
        }
    }, [prescription, settings]);

    if (isPrescriptionLoading || isSettingsLoading) {
        return <div className="p-8 text-center text-slate-500">Loading prescription for print...</div>;
    }

    if (!prescription) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="text-red-500 font-medium text-xl">Prescription Not Found</div>
                <p className="text-slate-500 text-sm">The prescription record could not be retrieved from the database.</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="text-red-500 font-medium text-xl">Clinic Settings Missing</div>
                <p className="text-slate-500 text-sm">Please configure clinic details in the Settings page before printing.</p>
                <Button variant="outline" onClick={() => router.push("/settings")}>Configure Settings</Button>
            </div>
        );
    }

    // Find the doctor in settings that matches prescription doctor
    const clinicDoctor = settings.doctors.find(d => d.name === prescription.doctor.name) || {
        name: prescription.doctor.name,
        degrees: prescription.doctor.degrees || "",
        speciality: prescription.doctor.speciality || "",
        registrationNumber: prescription.doctor.registrationNumber || ""
    };

    return (
        <div className="bg-slate-100 min-h-screen print:p-0 p-8 pb-20">
            {/* Toolbar - Hidden during print */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-lg border shadow-sm sticky top-4 z-50">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownload}>
                        <FileText className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto bg-white border print:border-0 shadow-sm print:shadow-none p-[15mm] min-h-[297mm] flex flex-col">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900 leading-tight uppercase tracking-tight">
                            {settings.name}
                        </h1>
                        <p className="text-blue-700 font-medium text-lg italic">{settings.subtitle}</p>
                        <div className="mt-4 space-y-1 text-slate-600 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                {settings.address}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-600" />
                                {settings.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-blue-600" />
                                {settings.visitingHours}
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 print:hidden">
                            <Stethoscope className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{clinicDoctor.name}</h2>
                        <p className="text-slate-700 font-medium">{clinicDoctor.degrees}</p>
                        <p className="text-blue-600 font-semibold">{clinicDoctor.speciality}</p>
                        <p className="text-slate-500 text-xs mt-1">Reg No: {clinicDoctor.registrationNumber}</p>
                    </div>
                </div>

                {/* Patient Info Bar */}
                <div className="grid grid-cols-4 gap-4 bg-slate-50 border rounded-lg p-4 mb-10 print:bg-slate-50">
                    <div>
                        <span className="text-xs uppercase text-slate-500 block mb-0.5">Patient Name</span>
                        <span className="font-bold text-slate-900">{prescription.patient.name}</span>
                    </div>
                    <div>
                        <span className="text-xs uppercase text-slate-500 block mb-0.5">Age / Sex</span>
                        <span className="font-bold text-slate-900">{prescription.ageAtVisit}Y / {prescription.sexAtVisit.toUpperCase()}</span>
                    </div>
                    <div>
                        <span className="text-xs uppercase text-slate-500 block mb-0.5">Patient ID</span>
                        <span className="font-bold text-slate-900">{prescription.patientId.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs uppercase text-slate-500 block mb-0.5">Date</span>
                        <span className="font-bold text-slate-900">{format(new Date(prescription.visitDate), "dd MMM yyyy")}</span>
                    </div>
                </div>

                {/* Clinical Content Section */}
                <div className="flex-1 grid grid-cols-12 gap-10">
                    {/* Clinical Notes (Sidebar left) */}
                    <div className="col-span-4 border-r pr-8 space-y-8">
                        {prescription.chiefComplaint && (
                            <div>
                                <h3 className="text-xs font-black uppercase text-blue-800 border-b mb-2">Chief Complaint</h3>
                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{prescription.chiefComplaint}</p>
                            </div>
                        )}
                        {prescription.examination && (
                            <div>
                                <h3 className="text-xs font-black uppercase text-blue-800 border-b mb-2">Examination</h3>
                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{prescription.examination}</p>
                            </div>
                        )}
                        {prescription.investigation && (
                            <div>
                                <h3 className="text-xs font-black uppercase text-blue-800 border-b mb-2">Investigation</h3>
                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{prescription.investigation}</p>
                            </div>
                        )}
                        {prescription.diagnosis && (
                            <div>
                                <h3 className="text-xs font-black uppercase text-blue-800 border-b mb-2">Diagnosis</h3>
                                <p className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">{prescription.diagnosis}</p>
                            </div>
                        )}
                    </div>

                    {/* Prescription Content (Main body right) */}
                    <div className="col-span-8 space-y-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl font-serif font-black italic text-blue-900">Rx</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <div className="space-y-6">
                                {prescription.medicines.map((med, idx) => (
                                    <div key={med.$id} className="relative pl-4">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-900">{idx + 1}. {med.name}</h4>
                                                <p className="text-slate-600 text-sm italic">{med.instruction}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-slate-900">{med.dose}</span>
                                                <p className="text-xs text-slate-500 uppercase font-black">{med.duration}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {prescription.medicines.length === 0 && (
                                    <p className="text-slate-400 italic text-sm">No medicines prescribed.</p>
                                )}
                            </div>
                        </div>

                        {prescription.treatment && (
                            <div className="pt-8 border-t border-dashed">
                                <h3 className="text-xs font-black uppercase text-blue-800 mb-3">Treatment Plan</h3>
                                <div className="p-4 bg-blue-50/30 rounded border border-blue-100/50">
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{prescription.treatment}</p>
                                </div>
                            </div>
                        )}

                        {prescription.advice && (
                            <div>
                                <h3 className="text-xs font-black uppercase text-blue-800 mb-2">Medical Advice</h3>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{prescription.advice}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-12 pt-10 border-t border-slate-200 text-center relative">
                    <div className="absolute -top-10 right-0 text-center w-48">
                        <div className="h-px bg-slate-400 mb-2"></div>
                        <span className="text-xs text-slate-500 uppercase">Doctor's Signature</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        This is a computer-generated prescription. Valid without physical signature.
                    </p>
                </div>
            </div>

            {/* Print specific CSS */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:border-0 {
                        border: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
