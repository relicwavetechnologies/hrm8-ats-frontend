import { Button } from "@/shared/components/ui/button";
import { Check, X } from "lucide-react";
import { updateExpense } from "@/shared/lib/expenseStorage";
import { toast } from "sonner";

interface ExpenseApprovalActionsProps {
    expenseId: string;
    onUpdate: () => void;
}

export function ExpenseApprovalActions({ expenseId, onUpdate }: ExpenseApprovalActionsProps) {
    const handleApprove = () => {
        updateExpense(expenseId, { status: 'approved' });
        toast.success("Expense approved");
        onUpdate();
    };

    const handleReject = () => {
        updateExpense(expenseId, { status: 'rejected' });
        toast.error("Expense rejected");
        onUpdate();
    };

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-success hover:text-success"
                onClick={handleApprove}
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={handleReject}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
