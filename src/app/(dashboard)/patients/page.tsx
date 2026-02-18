"use client";

import { useQuery } from "@tanstack/react-query";
import { patientRepository } from "@/repositories/patient";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: patients, isLoading } = useQuery({
        queryKey: ["patients", searchTerm],
        queryFn: () => searchTerm ? patientRepository.search(searchTerm) : patientRepository.getAll(),
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
                    <p className="text-slate-500">Manage and search your patient records</p>
                </div>
                <AddPatientDialog />
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by name or phone..."
                        className="pl-10 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Age/Gender</TableHead>
                                <TableHead>Last Visit</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        Loading patients...
                                    </TableCell>
                                </TableRow>
                            ) : patients?.documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        No patients found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients?.documents.map((patient: any) => (
                                    <TableRow key={patient.$id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                {patient.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{patient.phone}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {patient.age && <Badge variant="secondary">{patient.age}y</Badge>}
                                                {patient.gender && <Badge variant="outline" className="capitalize">{patient.gender}</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {patient.lastVisitDate
                                                ? format(new Date(patient.lastVisitDate), "MMM dd, yyyy")
                                                : "No visits yet"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/patients/${patient.$id}`}>
                                                <Button variant="outline" size="sm">View Profile</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading patients...</div>
                    ) : patients?.documents.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No patients found.</div>
                    ) : (
                        patients?.documents.map((patient: any) => (
                            <div key={patient.$id} className="p-4 space-y-3 active:bg-slate-50">
                                <Link href={`/patients/${patient.$id}`} className="block">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{patient.name}</p>
                                                <p className="text-sm text-slate-500">{patient.phone}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        {patient.age && <Badge variant="secondary" className="px-2">{patient.age}y</Badge>}
                                        {patient.gender && <Badge variant="outline" className="capitalize px-2">{patient.gender}</Badge>}
                                        <span className="text-[10px] text-slate-400 ml-auto font-mono">
                                            Last: {patient.lastVisitDate ? format(new Date(patient.lastVisitDate), "dd MMM") : "N/A"}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
