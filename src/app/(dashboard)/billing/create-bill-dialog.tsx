"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { billingRepository } from "@/repositories/billing";
import { treatmentRepository } from "@/repositories/treatment";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, ReceiptText } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface CreateBillDialogProps {
    patientId: string;
}

export function CreateBillDialog({ patientId }: CreateBillDialogProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [items, setItems] = useState<{ description: string; amount: number }[]>([
        { description: "Consultation", amount: 500 }
    ]);

    const [discount, setDiscount] = useState(0);
    const [paid, setPaid] = useState(0);

    const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);

    // UI-only estimates (Server will recalculate)
    const estimateTotal = () => Math.max(0, calculateSubtotal() - discount);
    const estimateDue = () => Math.max(0, estimateTotal() - paid);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const bill = await billingRepository.createBill(user?.role || 'receptionist', { patientId }, data.items);

            if (data.discount > 0) {
                await billingRepository.applyDiscount(user?.role || 'receptionist', bill.$id, data.discount);
            }

            if (data.paid > 0) {
                await billingRepository.recordPayment(bill.$id, data.paid);
            }

            // Standalone doctor workflow: Auto-finalize?
            // "finalize bill" is a specific requirement. Let's add a button for it.
            return bill;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills", patientId] });
            toast.success("Bill generated successfully");
            setOpen(false);
            setItems([{ description: "Consultation", amount: 500 }]);
            setDiscount(0);
            setPaid(0);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to generate bill");
        }
    });

    const addItem = () => {
        setItems([...items, { description: "", amount: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: "description" | "amount", value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: field === "amount" ? parseFloat(value) || 0 : value };
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ items, discount, paid });
    };

    const canApplyDiscount = user?.role === 'doctor' || user?.role === 'admin';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <ReceiptText className="mr-2 h-4 w-4" /> Create Bill
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Generate Bill</DialogTitle>
                        <DialogDescription>
                            Add treatment items and record payments.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6 px-1 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-semibold">Bill Items</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-9 px-3">
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border bg-slate-50/50 relative group">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:hidden">Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                            placeholder="Procedure name"
                                            className="h-10 sm:h-9"
                                        />
                                    </div>
                                    <div className="w-full sm:w-[120px] space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:hidden">Amount</Label>
                                        <Input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateItem(index, "amount", e.target.value)}
                                            className="h-10 sm:h-9 text-right"
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border shadow-sm sm:static sm:h-9 sm:w-9 sm:bg-transparent sm:border-none sm:shadow-none sm:mt-6"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-end gap-3 pt-6 border-t bg-white sticky bottom-0 z-10">
                            <div className="flex items-center gap-4 w-full justify-between sm:justify-end">
                                <Label className="text-slate-500 font-medium">Subtotal</Label>
                                <span className="w-24 text-right font-bold text-slate-900">৳{calculateSubtotal()}</span>
                            </div>
                            <div className="flex items-center gap-4 w-full justify-between sm:justify-end">
                                <Label htmlFor="discount" className={`text-slate-500 font-medium ${!canApplyDiscount && 'opacity-50'}`}>
                                    Discount {!canApplyDiscount && '(Doctor only)'}
                                </Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    className="w-24 h-10 sm:h-9 text-right font-bold"
                                    value={discount}
                                    disabled={!canApplyDiscount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex items-center gap-4 w-full justify-between sm:justify-end border-t pt-3 mt-1">
                                <Label className="text-lg font-bold text-blue-600">Total Amount</Label>
                                <span className="w-24 text-right text-xl font-black text-blue-600">৳{estimateTotal()}</span>
                            </div>
                            <div className="flex items-center gap-4 w-full justify-between sm:justify-end bg-green-50/50 p-2 rounded-lg mt-2">
                                <Label htmlFor="paid" className="text-green-700 font-bold">Initial Payment</Label>
                                <Input
                                    id="paid"
                                    type="number"
                                    className="w-24 h-11 sm:h-9 text-right font-black border-green-200 text-green-700 focus-visible:ring-green-500"
                                    value={paid}
                                    onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button type="button" variant="outline" className="h-11 sm:h-9" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-9 text-base sm:text-sm" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Generating..." : "Generate & Save Bill"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
