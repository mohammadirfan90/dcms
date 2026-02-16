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
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
    const { user } = useAuth();
    const today = new Date().toISOString().split("T")[0];

    const { data: appointments } = useQuery({
        queryKey: ["appointments-today"],
        queryFn: () => appointmentRepository.getTodayAppointments(user?.role === 'doctor' ? user.$id : undefined),
    });

    const { data: patients } = useQuery({
        queryKey: ["patients-count"],
        queryFn: () => patientRepository.getAll(),
    });

    const { data: billingStats } = useQuery({
        queryKey: ["dashboard-billing-stats"],
        queryFn: () => billingRepository.getDashboardStats(),
    });

    const { data: recentPatients } = useQuery({
        queryKey: ["recent-patients"],
        queryFn: () => patientRepository.getRecent(5),
    });

    const stats = [
        {
            label: "Today's Appointments",
            value: appointments?.total || 0,
            icon: CalendarIcon,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Total Patients",
            value: patients?.total || 0,
            icon: Users,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Today's Income",
            value: `৳${billingStats?.income.toLocaleString() || "0"}`,
            icon: Banknote,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            label: "Pending Payments",
            value: billingStats?.pendingCount || "0",
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50"
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 text-sm">Welcome back, {user?.name || "User"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between font-mono">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                                </div>
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <Card className="lg:col-span-2 shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Today's Schedule</CardTitle>
                            <CardDescription>{format(new Date(), "MMMM dd, yyyy")}</CardDescription>
                        </div>
                        <Link href="/appointments">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                View all <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {appointments?.documents.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                No appointments scheduled for today.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments?.documents.slice(0, 5).map((appt: any) => (
                                    <div key={appt.$id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex flex-col items-center justify-center font-mono text-[10px] leading-tight text-blue-600 font-bold bg-blue-50 rounded-lg p-1">
                                                {appt.timeSlot.split(" ")[0]}
                                                <span className="text-[8px] font-normal">{appt.timeSlot.split(" ")[1]}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{appt.patients?.name || `Patient #${appt.patientId.slice(-4)}`}</p>
                                                <Badge variant="outline" className="text-[10px] font-mono h-5">
                                                    {appt.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Link href={`/appointments`}>
                                            <Button variant="ghost" size="icon">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-none bg-blue-600 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Start</CardTitle>
                            <CardDescription className="text-blue-100">Most frequent clinical actions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/patients" className="block w-full">
                                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                    Search Patients
                                </Button>
                            </Link>
                            <Link href="/appointments" className="block w-full">
                                <Button variant="outline" className="w-full border-blue-400 text-white hover:bg-blue-700">
                                    Check Schedule
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-none">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Patients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!recentPatients || recentPatients.length === 0 ? (
                                <div className="text-sm text-slate-500 text-center py-4 italic">
                                    No recent activity recorded.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentPatients.map((patient) => (
                                        <Link key={patient.$id} href={`/patients/${patient.$id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {patient.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{patient.name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{format(new Date(patient.created_at || patient.createdAt), "MMM dd, yyyy")}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
