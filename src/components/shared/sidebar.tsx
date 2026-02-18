"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { authRepository } from "@/repositories/auth";
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    BarChart3,
    LogOut,
    FileText
} from "lucide-react";
import { UserRole } from "@/models";

const navItems: { label: string; icon: any; href: string; roles: UserRole[] }[] = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["admin", "doctor", "receptionist"] },
    { label: "Patients", icon: Users, href: "/patients", roles: ["admin", "doctor", "receptionist"] },
    { label: "Appointments", icon: Calendar, href: "/appointments", roles: ["admin", "doctor", "receptionist"] },
    { label: "Prescriptions", icon: FileText, href: "/prescriptions", roles: ["admin", "doctor"] },
    { label: "Billing", icon: CreditCard, href: "/billing", roles: ["admin", "doctor", "receptionist"] },
    { label: "Settings", icon: Settings, href: "/settings", roles: ["admin", "doctor"] },
    { label: "Reports", icon: BarChart3, href: "/reports", roles: ["admin"] },
];

export function Sidebar({ onNavItemClick, className }: { onNavItemClick?: () => void; className?: string }) {
    const pathname = usePathname();
    const { user, refreshUser } = useAuth();

    const filteredNavItems = navItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    const handleLogout = async () => {
        await authRepository.logout();
        await refreshUser();
    };

    return (
        <div className={cn("flex h-screen w-64 flex-col border-r bg-white shrink-0", className)}>
            <div className="flex h-16 items-center px-6 border-b">
                <img src="/dental-home-icon-transparent.png" alt="Dental Home Icon" className="h-8 w-8 mr-2 object-contain" />
                <span className="text-xl font-black tracking-tight text-slate-900">Dental Home</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                {filteredNavItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={onNavItemClick}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-slate-600 hover:text-blue-600 hover:bg-blue-50 h-11 md:h-9",
                                pathname.startsWith(item.href) && "bg-blue-50 text-blue-600 font-medium"
                            )}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </Button>
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t bg-slate-50">
                <div className="flex items-center mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                        {user?.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
