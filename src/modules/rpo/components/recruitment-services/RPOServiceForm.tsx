import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Separator } from "@/shared/components/ui/separator";
import { Info, Calculator, DollarSign, Users, Calendar, FileText } from "lucide-react";
import { rpoServiceSchema, type RPOServiceFormData } from "@/schemas/rpoServiceSchema";
import { RPOPricingCalculator } from "./RPOPricingCalculator";
import { RPOFeeStructureBuilder } from "@/modules/employers/components/detail/services/RPOFeeStructureBuilder";
import { RECRUITMENT_SERVICES } from "@/lib/subscriptionConfig";
import type { RPOFeeStructure } from "@/types/recruitmentService";

interface RPOServiceFormProps {
  initialData?: Partial<RPOServiceFormData>;
  onSubmit: (data: RPOServiceFormData) => void;
  onCancel?: () => void;
}

export function RPOServiceForm({ initialData, onSubmit, onCancel }: RPOServiceFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const guideConsultantRate = RECRUITMENT_SERVICES.rpo.baseMonthlyPerConsultant;
  const guideVacancyFee = RECRUITMENT_SERVICES.rpo.basePerVacancy;

  const form = useForm<RPOServiceFormData>({
    resolver: zodResolver(rpoServiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientId: initialData?.clientId || "",
      clientName: initialData?.clientName || "",
      location: initialData?.location || "",
      country: initialData?.country || "United States",
      rpoStartDate: initialData?.rpoStartDate || new Date().toISOString().split('T')[0],
      rpoDuration: initialData?.rpoDuration || 12,
      rpoNumberOfConsultants: initialData?.rpoNumberOfConsultants || 1,
      rpoMonthlyRatePerConsultant: initialData?.rpoMonthlyRatePerConsultant || guideConsultantRate,
      rpoPerVacancyFee: initialData?.rpoPerVacancyFee || guideVacancyFee,
      rpoEstimatedVacancies: initialData?.rpoEstimatedVacancies || 10,
      rpoIsCustomPricing: initialData?.rpoIsCustomPricing || false,
      rpoFeeStructures: (initialData?.rpoFeeStructures || []).map(fee => ({
        id: fee.id || `fee_${Date.now()}_${Math.random()}`,
        type: fee.type || 'consultant-monthly',
        name: fee.name || '',
        amount: fee.amount || 0,
        frequency: fee.frequency,
        description: fee.description,
        isGuidePrice: fee.isGuidePrice
      })) as RPOFeeStructure[],
      rpoAssignedConsultants: initialData?.rpoAssignedConsultants || [],
      rpoAutoRenew: initialData?.rpoAutoRenew || false,
      rpoNoticePeriod: initialData?.rpoNoticePeriod || 30,
      targetPlacements: initialData?.targetPlacements,
      rpoPrimaryContactId: initialData?.rpoPrimaryContactId,
      rpoAdditionalContactIds: initialData?.rpoAdditionalContactIds || [],
      rpoNotes: initialData?.rpoNotes || "",
      description: initialData?.description || "",
    },
  });

  const isCustomPricing = form.watch("rpoIsCustomPricing");
  const monthlyRate = form.watch("rpoMonthlyRatePerConsultant");
  const vacancyFee = form.watch("rpoPerVacancyFee");
  const isUsingGuidePrices = monthlyRate === guideConsultantRate && vacancyFee === guideVacancyFee;

  const handleFormSubmit = (data: RPOServiceFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Guide Pricing Alert */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg">RPO Guide Pricing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consultant Rate:</span>
              <Badge variant="secondary" className="font-mono">
                ${guideConsultantRate.toLocaleString()}/month
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Per Vacancy Fee:</span>
              <Badge variant="secondary" className="font-mono">
                ${guideVacancyFee.toLocaleString()}
              </Badge>
            </div>
            {!isUsingGuidePrices && (
              <Badge variant="outline" className="w-full justify-center mt-2">
                Using Custom Rates
              </Badge>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <FileText className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <Calculator className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="terms">
              <Calendar className="h-4 w-4 mr-2" />
              Terms
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Basic information about the RPO engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024 RPO Engagement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the RPO engagement"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <RPOPricingCalculator />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pricing Configuration</CardTitle>
                    <CardDescription>Set rates and estimated volumes</CardDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="rpoIsCustomPricing"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Custom Pricing</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rpoNumberOfConsultants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Consultants *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rpoDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Duration (months) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rpoMonthlyRatePerConsultant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rate per Consultant ($) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Guide: ${guideConsultantRate.toLocaleString()}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rpoPerVacancyFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per Vacancy Fee ($) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Guide: ${guideVacancyFee.toLocaleString()}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rpoEstimatedVacancies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Vacancies *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Expected number of positions to fill</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isCustomPricing && (
                  <>
                    <Separator />
                     <FormField
                      control={form.control}
                      name="rpoFeeStructures"
                      render={({ field }) => (
                        <FormItem>
                          <RPOFeeStructureBuilder 
                            fees={field.value as RPOFeeStructure[]} 
                            onChange={field.onChange} 
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team & Contacts</CardTitle>
                <CardDescription>Assign consultants and contacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-2" />
                  Consultant assignment coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contract Terms</CardTitle>
                <CardDescription>Define contract conditions and timelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rpoStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetPlacements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Placements</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>Target number of successful hires</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rpoAutoRenew"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Auto-Renew</FormLabel>
                          <FormDescription>Automatically renew contract</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rpoNoticePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notice Period (days) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={365}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rpoNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes & Special Terms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special terms, conditions, or notes about this engagement"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? "Update" : "Create"} RPO Service
          </Button>
        </div>
      </form>
    </Form>
  );
}
