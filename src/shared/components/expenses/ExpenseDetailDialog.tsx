import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import type { Expense } from "@/shared/types/expense";
import { FileText, Calendar, User, Tag, Receipt, CheckCircle, XCircle, Clock } from "lucide-react";

interface ExpenseDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense: Expense | null;
}

export function ExpenseDetailDialog({ open, onOpenChange, expense }: ExpenseDetailDialogProps) {
    if (!expense) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-4 w-4 text-success" />;
            case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
            case 'reimbursed': return <CheckCircle className="h-4 w-4 text-primary" />;
            default: return <Clock className="h-4 w-4 text-warning" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-semibold">Expense Details</DialogTitle>
                        <Badge
                            variant={
                                expense.status === 'approved' ? 'default' :
                                    expense.status === 'rejected' ? 'destructive' :
                                        expense.status === 'reimbursed' ? 'secondary' : 'outline'
                            }
                            className="flex items-center gap-1"
                        >
                            {getStatusIcon(expense.status)}
                            <span className="capitalize">{expense.status}</span>
                        </Badge>
                    </div>
                    <DialogDescription>Review detailed information about this expense claim.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Merchant</p>
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium text-base font-semibold">{expense.merchant}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Amount</p>
                            <p className="text-2xl font-bold">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {expense.currency}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Employee</p>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p>{expense.employeeName}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Date</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p>{format(new Date(expense.date), 'MMMM dd, yyyy')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Category</p>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className="capitalize">{expense.category}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Description</p>
                        <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm">{expense.description}</p>
                        </div>
                    </div>

                    {expense.notes && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Notes</p>
                            <div className="p-3 bg-muted rounded-md text-sm italic">
                                {expense.notes}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Receipt</p>
                        <div className="p-8 border-2 border-dashed rounded-lg text-center flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer">
                            <Receipt className="h-10 w-10 text-muted-foreground opacity-50" />
                            <p className="text-sm font-medium">Click to view original receipt</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    {expense.status === 'approved' && (
                        <Button variant="default">Reimburse Now</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
