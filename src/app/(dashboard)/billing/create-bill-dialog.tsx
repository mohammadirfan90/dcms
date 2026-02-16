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

interface CreateBillDialogProps {
    patientId: string;
}

export function CreateBillDialog({ patientId }: CreateBillDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [items, setItems] = useState<{ description: string; amount: number }[]>([
        { description: "Consultation", amount: 500 }
    ]);

    const [discount, setDiscount] = useState(0);
    const [paid, setPaid] = useState(0);

    const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);
    const calculateTotal = () => Math.max(0, calculateSubtotal() - discount);
    const calculateDue = () => Math.max(0, calculateTotal() - paid);

    const createMutation = useMutation({
        mutationFn: (data: any) => billingRepository.createBill(data.bill, data.items),
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
        const total = calculateTotal();
        const due = calculateDue();
        const status = paid >= total ? "paid" : paid > 0 ? "partial" : "due";

        createMutation.mutate({
            bill: {
                patientId,
                total,
                discount,
                paid,
                due,
                status,
            },
            items
        });
    };

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
                    <div className="py-4 space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[120px]">Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                                placeholder="Procedure name"
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateItem(index, "amount", e.target.value)}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                            <Plus className="h-4 w-4 mr-1" /> Add Item
                        </Button>

                        <div className="flex flex-col items-end gap-2 pt-4 border-t">
                            <div className="flex items-center gap-4 w-full justify-end">
                                <Label className="text-slate-500">Subtotal:</Label>
                                <span className="w-24 text-right font-medium">৳{calculateSubtotal()}</span>
                            </div>
                            <div className="flex items-center gap-4 w-full justify-end">
                                <Label htmlFor="discount" className="text-slate-500">Discount:</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    className="w-24 h-8 text-right"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex items-center gap-4 w-full justify-end border-t pt-2 mt-2">
                                <Label className="text-lg font-bold">Total:</Label>
                                <span className="w-24 text-right text-lg font-bold">৳{calculateTotal()}</span>
                            </div>
                            <div className="flex items-center gap-4 w-full justify-end">
                                <Label htmlFor="paid" className="text-green-600 font-medium">Paid:</Label>
                                <Input
                                    id="paid"
                                    type="number"
                                    className="w-24 h-8 text-right font-medium text-green-700"
                                    value={paid}
                                    onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex items-center gap-4 w-full justify-end">
                                <Label className="text-red-600 font-medium">Due:</Label>
                                <span className="w-24 text-right font-medium text-red-600">৳{calculateDue()}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Generating..." : "Generate & Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
