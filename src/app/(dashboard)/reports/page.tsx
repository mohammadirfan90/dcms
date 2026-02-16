"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Download,
    TrendingUp,
    Users as UsersIcon,
    CreditCard as CreditCardIcon,
    AlertCircle
} from "lucide-react";

export default function ReportsPage() {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const stats = [
        { label: "Total Patients", value: "142", icon: UsersIcon, color: "text-blue-600" },
        { label: "Total Revenue", value: "৳284,500", icon: TrendingUp, color: "text-green-600" },
        { label: "Total Collections", value: "৳210,000", icon: CreditCardIcon, color: "text-purple-600" },
        { label: "Total Outstanding", value: "৳74,500", icon: AlertCircle, color: "text-red-600" },
    ];

    const monthlyData = [
        { month: "January 2026", patients: 120, revenue: "৳240,000", collected: "৳200,000", due: "৳40,000" },
        { month: "February 2026", patients: 142, revenue: "৳284,500", collected: "৳210,000", due: "৳74,500" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
                    <p className="text-slate-500">Performance summary for {currentMonth}</p>
                </div>
                <Button variant="outline" className="border-slate-200">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border shadow-none">
                <CardHeader>
                    <CardTitle>Monthly Revenue Summary</CardTitle>
                    <CardDescription>Historical performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>New Patients</TableHead>
                                <TableHead>Potential Revenue</TableHead>
                                <TableHead>Actual Collections</TableHead>
                                <TableHead>Current Dues</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlyData.map((data) => (
                                <TableRow key={data.month}>
                                    <TableCell className="font-medium">{data.month}</TableCell>
                                    <TableCell>{data.patients}</TableCell>
                                    <TableCell>{data.revenue}</TableCell>
                                    <TableCell className="text-green-600 font-medium">{data.collected}</TableCell>
                                    <TableCell className="text-red-600 font-medium">{data.due}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
