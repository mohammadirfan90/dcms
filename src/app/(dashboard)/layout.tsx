"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, user } = useAuth();

    if (isLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="space-y-4 w-full max-w-md p-8">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
