"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Stethoscope } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="flex h-16 items-center justify-between px-6 border-b bg-white md:hidden shrink-0">
                <div className="flex items-center">
                    <img src="/dental-home-icon-transparent.png" alt="Dental Home" className="h-8 w-8 mr-2 object-contain" />
                    <span className="text-xl font-black tracking-tight text-slate-900">Dental Home</span>
                </div>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar className="h-full w-full border-none" onNavItemClick={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Sidebar - Restored to original behavior for desktop */}
            <Sidebar className="hidden md:flex" />

            <main className="flex-1 overflow-y-auto w-full">
                <div className="mx-auto max-w-7xl p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
