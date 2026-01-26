import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { saveCompensationReview } from "@/shared/lib/compensationStorage";
import { useToast } from "@/shared/hooks/use-toast";

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required").max(100),
  changeType: z.string().min(1, "Change type is required"),
  currentAmount: z.number().min(0, "Current amount must be positive"),
  newAmount: z.number().min(0, "New amount must be positive"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

type FormData = z.infer<typeof formSchema>;

interface CompensationAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CompensationAdjustmentDialog({ open, onOpenChange, onSuccess }: CompensationAdjustmentDialogProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      changeType: "salary-increase",
      currentAmount: 0,
      newAmount: 0,
      effectiveDate: new Date().toISOString().split('T')[0],
      reason: "",
    },
  });

  const watchedValues = form.watch();
  const percentageChange = watchedValues.currentAmount > 0
    ? ((watchedValues.newAmount - watchedValues.currentAmount) / watchedValues.currentAmount * 100).toFixed(2)
    : "0.00";

  const onSubmit = async (data: FormData) => {
    try {
      saveCompensationReview({
        employeeId: 'emp-' + Date.now(),
        employeeName: data.employeeName,
        currentSalary: data.currentAmount,
        proposedSalary: data.newAmount,
        increaseAmount: data.newAmount - data.currentAmount,
        increasePercentage: parseFloat(percentageChange),
        effectiveDate: data.effectiveDate,
        justification: data.reason,
        reviewCycle: 'annual',
        reviewYear: new Date().getFullYear(),
        status: 'pending',
        reviewedBy: 'Current User',
      });

      toast({
        title: "Compensation Change Submitted",
        description: `Change request for ${data.employeeName} submitted successfully`,
      });

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit compensation change",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Compensation</DialogTitle>
          <DialogDescription>
            Submit a compensation change request
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

            <FormField
              control={form.control}
              name="changeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Change Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select change type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="salary-increase">Salary Increase</SelectItem>
                      <SelectItem value="salary-decrease">Salary Decrease</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="market-adjustment">Market Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount ($)</FormLabel>
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
                name="newAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Amount ($)</FormLabel>
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
            </div>

            {watchedValues.currentAmount > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Change: <span className={`font-semibold ${parseFloat(percentageChange) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {parseFloat(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
                  </span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this change (minimum 10 characters)"
                      className="resize-none"
                      rows={3}
                      {...field}
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
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
