import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { saveBenefitEnrollment } from "@/shared/lib/benefitsStorage";
import { useToast } from "@/shared/hooks/use-toast";

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required").max(100),
  planType: z.string().min(1, "Plan type is required"),
  planName: z.string().min(1, "Plan name is required"),
  coverageLevel: z.string().min(1, "Coverage level is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  dependents: z.number().min(0).max(10),
});

type FormData = z.infer<typeof formSchema>;

interface BenefitEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BenefitEnrollmentDialog({ open, onOpenChange, onSuccess }: BenefitEnrollmentDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      planType: "health",
      planName: "Premium Health Plan",
      coverageLevel: "employee-only",
      effectiveDate: new Date().toISOString().split('T')[0],
      dependents: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      saveBenefitEnrollment({
        employeeId: 'emp-' + Date.now(),
        employeeName: data.employeeName,
        benefitPlanId: 'plan-1',
        benefitPlanName: data.planName,
        coverageLevel: data.coverageLevel as any,
        status: 'pending',
        effectiveDate: data.effectiveDate,
        employeeCost: 100,
        employerCost: 150,
        dependents: [],
      });

      toast({
        title: "Enrollment Submitted",
        description: `Benefit enrollment for ${data.planName} submitted successfully`,
      });

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit enrollment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in Benefits</DialogTitle>
          <DialogDescription>
            Submit a new benefit plan enrollment
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
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="health">Health Insurance</SelectItem>
                      <SelectItem value="dental">Dental Insurance</SelectItem>
                      <SelectItem value="vision">Vision Insurance</SelectItem>
                      <SelectItem value="life">Life Insurance</SelectItem>
                      <SelectItem value="disability">Disability Insurance</SelectItem>
                      <SelectItem value="retirement">Retirement Plan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Premium Health Plan">Premium Health Plan</SelectItem>
                      <SelectItem value="Standard Health Plan">Standard Health Plan</SelectItem>
                      <SelectItem value="Basic Health Plan">Basic Health Plan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverageLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coverage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee-only">Employee Only</SelectItem>
                      <SelectItem value="employee-spouse">Employee + Spouse</SelectItem>
                      <SelectItem value="employee-children">Employee + Children</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dependents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Dependents</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      max="10"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Enrollment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
