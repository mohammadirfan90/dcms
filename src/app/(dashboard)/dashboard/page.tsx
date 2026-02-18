"use client";

import { useQuery } from "@tanstack/react-query";
import { appointmentRepository } from "@/repositories/appointment";
import { patientRepository } from "@/repositories/patient";
import { billingRepository } from "@/repositories/billing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    Calendar as CalendarIcon,
    Banknote,
    AlertCircle,
    Clock,
    ArrowRight,
    Search,
    Stethoscope,
    User,
    Plus
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { BookAppointmentDialog } from "../appointments/book-appointment-dialog";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const { user } = useAuth();
    const today = new Date().toISOString().split("T")[0];

    const { data: appointments } = useQuery({
        queryKey: ["appointments-today"],
        queryFn: () => appointmentRepository.getTodayAppointments(user?.role === 'doctor' ? user.$id : undefined),
    });

    const { data: billingStats } = useQuery({
        queryKey: ["dashboard-billing-stats"],
        queryFn: () => billingRepository.getDashboardStats(),
    });

    const { data: recentPatients } = useQuery({
        queryKey: ["recent-patients"],
        queryFn: () => patientRepository.getRecent(5),
    });

    // Operational Logic: Next Patient
    const nextAppointment = appointments?.documents
        .filter(a => a.status === 'pending')
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))[0];

    const { data: nextPatientBill } = useQuery({
        queryKey: ["next-patient-bill", nextAppointment?.patientId],
        queryFn: () => billingRepository.getBillsByPatient(nextAppointment.patientId),
        enabled: !!nextAppointment?.patientId
    });

    const nextPatientTotalDue = nextPatientBill?.documents.reduce((sum, b) => sum + Number(b.due), 0) || 0;

    // Operational Logic: Queue grouping
    const queue = {
        checkedIn: appointments?.documents.filter(a => a.status === 'pending') || [],
        completed: appointments?.documents.filter(a => a.status === 'completed') || [],
        cancelled: appointments?.documents.filter(a => a.status === 'cancelled') || []
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Command Center Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                        <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Practice Overview</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Welcome back, {user?.name}. You have {appointments?.total || 0} appointments scheduled today.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Queue</span>
                    </div>
                    <BookAppointmentDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Clinical Focus */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Next Patient Card */}
                    <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden border-t-4 border-t-blue-600">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-blue-50 text-blue-600 border-none font-black px-3 py-1 text-[10px] uppercase tracking-widest">Next Appointment</Badge>
                                <span className="font-mono text-sm font-black text-blue-600">{nextAppointment?.timeSlot || "--:--"}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {nextAppointment ? (
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-3xl italic">
                                                {nextAppointment.patients?.name?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{nextAppointment.patients?.name}</h2>
                                                <div className="flex items-center gap-4 mt-1 text-slate-500 font-bold text-sm">
                                                    <span className="flex items-center gap-1"><User className="h-4 w-4" /> {nextAppointment.patients?.phone}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Last visit: {nextAppointment.patients?.last_visit_date ? format(new Date(nextAppointment.patients.last_visit_date), "MMM dd") : "None"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
                                            <p className={`text-2xl font-black ${nextPatientTotalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>৳{nextPatientTotalDue.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Link href={`/prescriptions/new/${nextAppointment.patientId}`} className="flex-1">
                                            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 text-lg">
                                                <Plus className="mr-2 h-6 w-6" /> Start Visit
                                            </Button>
                                        </Link>
                                        <Link href={`/patients/${nextAppointment.patientId}`}>
                                            <Button variant="outline" className="h-14 px-6 border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50">
                                                Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed">
                                    <p className="text-slate-500 font-bold italic">No pending appointments for now.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Waiting Queue */}
                    <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" /> Waiting Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-2">
                                {queue.checkedIn.length === 0 && (
                                    <div className="py-4 text-center text-slate-400 text-sm italic">Queue is currently empty</div>
                                )}
                                {queue.checkedIn.map(appt => (
                                    <div key={appt.$id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-blue-600 border shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {appt.timeSlot.split(" ")[0]}
                                            </div>
                                            <span className="font-black text-slate-900">{appt.patients?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-blue-100 text-blue-600 border-none font-black uppercase text-[9px]">Waiting</Badge>
                                            <Link href={`/patients/${appt.patientId}`}>
                                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Operations & Finance */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Active Visit Panel */}
                    <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[2rem] overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        <CardHeader className="p-8 pb-4 relative">
                            <CardTitle className="text-xl font-black">Active Visit Control</CardTitle>
                            <CardDescription className="text-blue-100 font-medium italic">Operational shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-3 relative">
                            {nextAppointment ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/patients/${nextAppointment.patientId}`} className="col-span-2">
                                        <Button className="w-full bg-white/10 hover:bg-white/20 border-none text-white font-bold h-12 rounded-xl">
                                            Add Treatment
                                        </Button>
                                    </Link>
                                    <Link href={`/prescriptions/new/${nextAppointment.patientId}`}>
                                        <Button className="w-full bg-white/10 hover:bg-white/20 border-none text-white font-bold h-12 rounded-xl">
                                            RX Builder
                                        </Button>
                                    </Link>
                                    <Link href={`/billing`}>
                                        <Button className="w-full bg-white/10 hover:bg-white/20 border-none text-white font-bold h-12 rounded-xl">
                                            Quick Bill
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-sm text-blue-200 mt-2 italic">Start a visit to enable controls</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900">Financial Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                                        <Banknote className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Collected Today</p>
                                        <p className="text-xl font-black text-slate-900">৳{billingStats?.income.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Pending Dues</p>
                                        <p className="text-xl font-black text-slate-900">{billingStats?.pendingCount} Cases</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Follow-ups */}
                    <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" /> Pending Follow-ups
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-4">
                                {recentPatients?.slice(0, 3).map(p => (
                                    <div key={p.$id} className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{p.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Last seen {format(new Date(p.createdAt), "MMM dd")}</p>
                                        </div>
                                        <Link href={`/patients/${p.$id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-indigo-600 hover:bg-indigo-50">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
