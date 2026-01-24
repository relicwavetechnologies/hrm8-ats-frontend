import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { saveOffboardingWorkflow } from "@/shared/lib/offboardingStorage";
import { useToast } from "@/shared/hooks/use-toast";

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required").max(100),
  reason: z.string().min(1, "Reason is required"),
  lastWorkingDay: z.string().min(1, "Last working day is required"),
  exitInterviewDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OffboardingChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OffboardingChecklistDialog({ open, onOpenChange, onSuccess }: OffboardingChecklistDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      reason: "resignation",
      lastWorkingDay: "",
      exitInterviewDate: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      saveOffboardingWorkflow({
        employeeId: 'emp-' + Date.now(),
        employeeName: data.employeeName,
        jobTitle: 'Employee',
        department: 'General',
        separationType: data.reason as any,
        noticeDate: new Date().toISOString().split('T')[0],
        lastWorkingDay: data.lastWorkingDay,
        noticePeriodDays: 14,
        status: 'in-progress',
        exitInterviewScheduled: !!data.exitInterviewDate,
        exitInterviewCompleted: false,
        clearanceItems: [],
        finalSettlementPaid: false,
        rehireEligible: false,
        createdBy: 'Current User',
      });

      toast({
        title: "Offboarding Process Started",
        description: `Offboarding for ${data.employeeName} initiated successfully`,
      });

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start offboarding process",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Offboarding</DialogTitle>
          <DialogDescription>
            Initiate the offboarding process for an employee
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leaving</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="resignation">Resignation</SelectItem>
                      <SelectItem value="termination">Termination</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="contract-end">Contract End</SelectItem>
                      <SelectItem value="mutual-agreement">Mutual Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastWorkingDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Working Day</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exitInterviewDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Interview Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes"
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
                Start Process
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
