import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { savePayslip } from "@/shared/lib/payrollStorage";
import { useToast } from "@/shared/hooks/use-toast";

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required").max(100),
  payPeriodStart: z.string().min(1, "Pay period start is required"),
  payPeriodEnd: z.string().min(1, "Pay period end is required"),
  baseSalary: z.number().min(0, "Base salary must be positive"),
  bonus: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PayrollRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PayrollRunDialog({ open, onOpenChange, onSuccess }: PayrollRunDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      payPeriodStart: "",
      payPeriodEnd: "",
      baseSalary: 0,
      bonus: 0,
      deductions: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const grossPay = data.baseSalary + (data.bonus || 0);
      const totalDeductions = (data.deductions || 0);
      const netPay = grossPay - totalDeductions;

      savePayslip({
        payrollRunId: 'run-' + Date.now(),
        employeeId: 'emp-' + Date.now(),
        employeeName: data.employeeName,
        period: data.payPeriodStart.slice(0, 7),
        baseSalary: data.baseSalary,
        allowances: data.bonus ? [{
          id: 'bonus-1',
          name: 'Bonus',
          type: 'bonus' as const,
          amount: data.bonus,
          isPercentage: false,
          isRecurring: false,
        }] : [],
        deductions: data.deductions ? [{
          id: 'deduction-1',
          name: 'Deductions',
          type: 'other' as const,
          amount: data.deductions,
          isPercentage: false,
          isRecurring: false,
        }] : [],
        grossPay,
        netPay,
        workDays: 22,
        overtimeHours: 0,
        leaveDays: 0,
        status: 'draft',
      });

      toast({
        title: "Payroll Created",
        description: `Payroll record for ${data.employeeName} created successfully`,
      });

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payroll record",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Payroll</DialogTitle>
          <DialogDescription>
            Generate a new payroll record for an employee
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter employee name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payPeriodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Period Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payPeriodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Period End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deductions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deductions ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Payroll
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
