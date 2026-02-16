"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "@/models";
import { authRepository } from "@/repositories/auth";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const currentUser = await authRepository.getCurrentUser();
            setUser(currentUser);
            return currentUser;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user && pathname !== "/login") {
                router.push("/login");
            } else if (user && pathname === "/login") {
                router.push("/dashboard");
            }
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
