import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import type { Payslip } from "@/shared/types/payroll";
import { Separator } from "@/shared/components/ui/separator";

interface PayslipDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: Payslip | null;
}

export function PayslipDetailDialog({ open, onOpenChange, payslip }: PayslipDetailDialogProps) {
  if (!payslip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payslip Details</DialogTitle>
          <DialogDescription>
            {payslip.employeeName} - {payslip.period}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Earnings</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Salary</span>
                <span className="font-medium">${payslip.baseSalary.toLocaleString()}</span>
              </div>
              {payslip.allowances.map((allowance) => (
                <div key={allowance.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{allowance.name}</span>
                  <span className="font-medium">${allowance.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="font-medium">Gross Pay</span>
            <span className="font-bold text-lg">${payslip.grossPay.toLocaleString()}</span>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Deductions</p>
            <div className="space-y-2">
              {payslip.deductions.map((deduction) => (
                <div key={deduction.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{deduction.name}</span>
                  <span className="font-medium text-destructive">-${deduction.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="font-bold">Net Pay</span>
            <span className="font-bold text-xl text-primary">${payslip.netPay.toLocaleString()}</span>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Work Days</p>
              <p className="font-medium">{payslip.workDays}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Overtime</p>
              <p className="font-medium">{payslip.overtimeHours} hrs</p>
            </div>
            <div>
              <p className="text-muted-foreground">Leave Days</p>
              <p className="font-medium">{payslip.leaveDays}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              variant={payslip.status === 'paid' ? 'default' : 'secondary'}
              className="mt-1"
            >
              {payslip.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
