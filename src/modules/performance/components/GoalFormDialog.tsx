import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { savePerformanceGoal } from "@/shared/lib/performanceStorage";
import type { PerformanceGoal, GoalKPI } from "@/shared/types/performance";

const kpiSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "KPI name is required"),
  target: z.number().min(0, "Target must be positive"),
  current: z.number().min(0, "Current value must be positive"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),
});

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  startDate: z.date({ required_error: "Start date is required" }),
  targetDate: z.date({ required_error: "Target date is required" }),
  kpis: z.array(kpiSchema).min(1, "At least one KPI is required"),
}).refine((data) => data.targetDate > data.startDate, {
  message: "Target date must be after start date",
  path: ["targetDate"],
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: PerformanceGoal;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  employeeId,
  employeeName,
  onSuccess,
}: GoalFormDialogProps) {
  const [kpis, setKpis] = useState<GoalKPI[]>(
    goal?.kpis || [
      {
        
        name: "",
        target: 0,
        current: 0,
        unit: "",
        description: "",
      },
    ]
  );

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      category: goal?.category || "",
      priority: goal?.priority || "medium",
      startDate: goal?.startDate ? new Date(goal.startDate) : new Date(),
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : new Date(),
      kpis: kpis.map(kpi => ({
        id: kpi.id,
        name: kpi.name || "",
        target: kpi.target || 0,
        current: kpi.current || 0,
        unit: kpi.unit || "",
        description: kpi.description || "",
      })),
    },
  });

  const addKpi = () => {
    const newKpi: GoalKPI = {
      
      name: "",
      target: 0,
      current: 0,
      unit: "",
      description: "",
    };
    const updatedKpis = [...kpis, newKpi];
    setKpis(updatedKpis);
    form.setValue("kpis", updatedKpis);
  };

  const removeKpi = (id: string) => {
    if (kpis.length <= 1) {
      toast.error("At least one KPI is required");
      return;
    }
    const updatedKpis = kpis.filter((kpi) => kpi.id !== id);
    setKpis(updatedKpis);
    form.setValue("kpis", updatedKpis);
  };

  const updateKpi = (id: string, field: keyof GoalKPI, value: any) => {
    const updatedKpis = kpis.map((kpi) =>
      kpi.id === id ? { ...kpi, [field]: value } : kpi
    ) as GoalKPI[];
    setKpis(updatedKpis);
    form.setValue("kpis", updatedKpis);
  };

  const onSubmit = (data: GoalFormValues) => {
    const goalData: PerformanceGoal = {
      id: goal?.id || crypto.randomUUID(),
      employeeId,
      employeeName,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: goal?.status || "not-started",
      startDate: data.startDate.toISOString(),
      targetDate: data.targetDate.toISOString(),
      progress: goal?.progress || 0,
      kpis: data.kpis.map(kpi => ({
        id: kpi.id,
        name: kpi.name,
        target: kpi.target,
        current: kpi.current,
        unit: kpi.unit,
        description: kpi.description,
      })),
      createdBy: employeeId,
      createdAt: goal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePerformanceGoal(goalData);
    toast.success(goal ? "Goal updated successfully" : "Goal created successfully");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
          <DialogDescription>
            Set goals and define KPIs to track your performance
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Increase customer satisfaction" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the goal and expected outcomes..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sales, Customer Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
                  <p className="text-sm text-muted-foreground">
                    Add measurable KPIs to track progress
                  </p>
                </div>
                <Button type="button" onClick={addKpi} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add KPI
                </Button>
              </div>

              {form.formState.errors.kpis && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.kpis.message}
                </p>
              )}

              <div className="space-y-4">
                {kpis.map((kpi, index) => (
                  <Card key={kpi.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">KPI #{index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKpi(kpi.id)}
                          disabled={kpis.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">KPI Name</Label>
                          <Input
                            placeholder="e.g., Response Time"
                            value={kpi.name}
                            onChange={(e) => updateKpi(kpi.id, "name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Unit</Label>
                          <Input
                            placeholder="e.g., minutes, %, count"
                            value={kpi.unit}
                            onChange={(e) => updateKpi(kpi.id, "unit", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Target Value</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            value={kpi.target}
                            onChange={(e) =>
                              updateKpi(kpi.id, "target", parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Current Value</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={kpi.current}
                            onChange={(e) =>
                              updateKpi(kpi.id, "current", parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium">Description (Optional)</Label>
                          <Input
                            placeholder="Additional details about this KPI"
                            value={kpi.description}
                            onChange={(e) =>
                              updateKpi(kpi.id, "description", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {goal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
