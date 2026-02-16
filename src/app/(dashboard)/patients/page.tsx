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
import { Plus, Search, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: patients, isLoading } = useQuery({
        queryKey: ["patients", searchTerm],
        queryFn: () => searchTerm ? patientRepository.search(searchTerm) : patientRepository.getAll(),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
                    <p className="text-slate-500">Manage and search your patient records</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by name or phone..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-2">
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
        </div>
    );
}
