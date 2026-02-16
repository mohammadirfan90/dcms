"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { authRepository } from "@/repositories/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { refreshUser } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error: loginError } = await authRepository.login(email, password);
            if (loginError) throw loginError;

            const user = await refreshUser();

            if (!user) {
                toast.error("Account created, but database profile is missing. Please contact administrator.");
                return;
            }

            toast.success("Logged in successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Stethoscope className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">DCMS Login</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your chamber
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
