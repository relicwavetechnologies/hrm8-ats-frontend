import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useState, useMemo, useEffect } from "react";
import { Job } from "@/shared/types/job";

const offerSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  offerType: z.enum(["full-time", "part-time", "contract", "intern"]),
  salary: z.coerce.number().min(0),
  salaryCurrency: z.string().default("USD"),
  salaryPeriod: z.enum(["annual", "hourly", "monthly", "weekly", "daily"]),
  startDate: z.string().min(1, "Start date is required"),
  workLocation: z.string().min(1, "Work location is required"),
  workArrangement: z.enum(["on-site", "remote", "hybrid"]),
  probationPeriod: z.coerce.number().optional(),
  vacationDays: z.coerce.number().optional(),
  bonusStructure: z.string().optional(),
  equityOptions: z.string().optional(),
  benefits: z.string().optional(),
  customMessage: z.string().optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormProps {
  candidateName: string;
  jobTitle: string;
  job?: Job | null; // Optional job data to use for initial values
  onSubmit: (data: OfferFormData) => void;
  onCancel: () => void;
}

// Helper function to map job employment type to offer type
function mapEmploymentTypeToOfferType(employmentType?: string): "full-time" | "part-time" | "contract" | "intern" {
  switch (employmentType?.toLowerCase()) {
    case "part-time":
    case "part_time":
      return "part-time";
    case "contract":
      return "contract";
    case "intern":
    case "internship":
      return "intern";
    default:
      return "full-time";
  }
}

// Helper function to map job work arrangement to offer work arrangement
function mapWorkArrangement(workArrangement?: string): "on-site" | "remote" | "hybrid" {
  switch (workArrangement?.toLowerCase()) {
    case "remote":
      return "remote";
    case "hybrid":
      return "hybrid";
    default:
      return "on-site";
  }
}

export function OfferForm({ candidateName, jobTitle, job, onSubmit, onCancel }: OfferFormProps) {
  const [benefits, setBenefits] = useState<string[]>([]);

  // Calculate default values from job data
  const defaultValues = useMemo(() => {
    const today = new Date();
    const defaultExpiryDate = new Date(today);
    defaultExpiryDate.setDate(today.getDate() + 14); // Default to 2 weeks from now

    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() + 30); // Default to 1 month from now

    // Calculate default salary - use max if available, else min, else 0
    const defaultSalary = job?.salaryMax || job?.salaryMin || 0;

    // Get salary period from job, default to annual
    const defaultSalaryPeriod = (job?.salaryPeriod || "annual") as "annual" | "hourly" | "monthly" | "weekly" | "daily";

    return {
      offerType: mapEmploymentTypeToOfferType(job?.employmentType),
      salaryCurrency: job?.salaryCurrency || "USD",
      salaryPeriod: defaultSalaryPeriod,
      salary: defaultSalary,
      workArrangement: mapWorkArrangement(job?.workArrangement),
      workLocation: job?.location || "",
      templateId: "template-ft-001",
      startDate: defaultStartDate.toISOString().split("T")[0],
      expiryDate: defaultExpiryDate.toISOString().split("T")[0],
    };
  }, [job]);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues,
  });

  // Reset form values when job data changes
  useEffect(() => {
    if (job) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  const commonBenefits = [
    "Health Insurance",
    "Dental Insurance",
    "Vision Insurance",
    "401(k) Matching",
    "Life Insurance",
    "Disability Insurance",
    "Flexible Spending Account",
    "Professional Development",
    "Gym Membership",
    "Remote Work Stipend",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold">{candidateName}</h3>
        <p className="text-sm text-muted-foreground">{jobTitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer Template</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="template-ft-001">Full-Time Employment Offer</SelectItem>
                    <SelectItem value="template-pt-001">Part-Time Employment Offer</SelectItem>
                    <SelectItem value="template-ct-001">Contract Employment Offer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="offerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Location</FormLabel>
                  <FormControl>
                    <Input placeholder="New York Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workArrangement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Arrangement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="on-site">On-Site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="probationPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Probation Period (months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="3" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty if not applicable</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vacationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacation Days</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Benefits</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {commonBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center space-x-2">
                  <Checkbox
                    id={benefit}
                    checked={benefits.includes(benefit)}
                    onCheckedChange={(checked) => {
                      setBenefits(
                        checked
                          ? [...benefits, benefit]
                          : benefits.filter((b) => b !== benefit)
                      );
                    }}
                  />
                  <label
                    htmlFor={benefit}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {benefit}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="bonusStructure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bonus Structure (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Annual performance bonus up to 15% of base salary..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Personal message to the candidate..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Candidate must respond by this date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Generate Offer Letter</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
