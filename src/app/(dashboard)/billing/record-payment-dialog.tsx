"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingRepository } from "@/repositories/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Banknote } from "lucide-react";

interface RecordPaymentDialogProps {
    billId: string;
    patientId: string;
    currentDue: number;
}

export function RecordPaymentDialog({ billId, patientId, currentDue }: RecordPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(currentDue);
    const [method, setMethod] = useState("cash");
    const queryClient = useQueryClient();

    const paymentMutation = useMutation({
        mutationFn: () => billingRepository.recordPayment(billId, amount, method),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
            toast.success("Payment recorded successfully");
            setOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to record payment");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-11 sm:h-9 w-full sm:w-auto text-green-700 border-green-200 hover:bg-green-50 font-bold">
                    <Banknote className="mr-2 h-4 w-4" /> Pay Now
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl">Record Payment</DialogTitle>
                        <DialogDescription className="text-sm">
                            Enter the payment details below.
                            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md font-bold text-center border border-red-100">
                                Remaining Due: ৳{currentDue}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="amount" className="font-semibold">Amount (৳)</Label>
                            <Input
                                id="amount"
                                type="number"
                                className="h-12 text-lg font-black"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                max={currentDue}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="method" className="font-semibold">Payment Method</Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="mobile">Mobile Banking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button type="button" variant="outline" className="h-12 sm:h-9" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 h-12 sm:h-9 font-bold" disabled={paymentMutation.isPending}>
                            {paymentMutation.isPending ? "Recording..." : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
