import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { saveExpense } from "@/shared/lib/expenseStorage";
import { toast } from "sonner";
import { Receipt } from "lucide-react";

const expenseSchema = z.object({
    merchant: z.string().min(1, "Merchant is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    category: z.enum(['travel', 'meals', 'accommodation', 'transport', 'supplies', 'equipment', 'training', 'other']),
    currency: z.string().default("USD"),
    description: z.string().min(1, "Description is required"),
    notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseSubmissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ExpenseSubmissionDialog({ open, onOpenChange, onSuccess }: ExpenseSubmissionDialogProps) {
    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            merchant: "",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            category: "other",
            currency: "USD",
            description: "",
            notes: "",
        },
    });

    const onSubmit = (data: ExpenseFormData) => {
        try {
            saveExpense({
                ...data,
                employeeId: 'current-user',
                employeeName: 'Current User',
                status: 'submitted',
                approvalWorkflow: [],
                currentApprovalLevel: 0,
                merchant: data.merchant,
                date: data.date,
                amount: data.amount,
                description: data.description,
                category: data.category,
                currency: data.currency,
            });
            toast.success("Expense submitted successfully");
            onOpenChange(false);
            onSuccess?.();
            form.reset();
        } catch (error) {
            toast.error("Failed to submit expense");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Submit Expense Claim</DialogTitle>
                    <DialogDescription>Enter the details of your expense and upload a receipt if available.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="merchant">Merchant</Label>
                            <Input id="merchant" {...form.register("merchant")} placeholder="e.g., Starbucks" />
                            {form.formState.errors.merchant && <p className="text-xs text-destructive">{form.formState.errors.merchant.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" {...form.register("date")} />
                            {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    className="pl-7"
                                    {...form.register("amount", { valueAsNumber: true })}
                                />
                            </div>
                            {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={(v: any) => form.setValue("category", v)} defaultValue="other">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="meals">Meals</SelectItem>
                                    <SelectItem value="accommodation">Accommodation</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
                                    <SelectItem value="supplies">Supplies</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...form.register("description")} placeholder="e.g., Lunch with client" />
                        {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea id="notes" {...form.register("notes")} placeholder="Additional details..." />
                    </div>

                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Click to upload receipt</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Submit Claim</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
