import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { Link } from "react-router-dom";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FileText, Building2, Briefcase as BriefcaseIcon, Plus } from "lucide-react";
import { ComboboxWithAdd } from "@/shared/components/ui/combobox-with-add";
import { formatSalaryRange } from "@/shared/lib/jobUtils";
import { useAuth } from "@/app/providers/AuthContext";
import { useState, useMemo } from "react";
import { AddDepartmentDialog } from "@/modules/jobs/components/AddDepartmentDialog";
import { AddLocationDialog } from "@/modules/jobs/components/AddLocationDialog";
import { PositionDescriptionUpload } from "./PositionDescriptionUpload";
import { useToast } from "@/shared/hooks/use-toast";
import { Separator } from "@/shared/components/ui/separator";
import { useCompanyProfile } from "@/shared/hooks/useCompanyProfile";
import { CompanyProfileLocation } from "@/shared/types/companyProfile";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Info } from "lucide-react";
import { usePublicCategories } from "@/shared/hooks/useJobCategoriesTags";
import { JobPricingCalculator } from "./JobPricingCalculator";
interface JobWizardStep1Props {
  form: UseFormReturn<JobFormData>;
  companyAssignmentMode?: 'AUTO_RULES_ONLY' | 'MANUAL_ONLY';
  loadingCompanySettings?: boolean;
}
export function JobWizardStep1({
  form,
  companyAssignmentMode,
  loadingCompanySettings
}: JobWizardStep1Props) {
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const { user } = useAuth();
  const { data: profileData, refresh: refreshProfile } = useCompanyProfile();

  // Get company name from user
  const companyName = user?.companyName || "Your Company";

  // Use default department options
  const defaultDepartments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Finance", "Operations", "HR", "Customer Success", "Legal"];
  const departmentOptions = defaultDepartments;

  // Extract and format company profile locations
  const locationOptions = useMemo(() => {
    // Helper function to format location name
    const formatLocationName = (location: CompanyProfileLocation): string => {
      const parts = [location.name];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      return parts.join(", ");
    };

    const locations: string[] = [];

    if (profileData?.profile?.profileData) {
      const { primaryLocation, additionalLocations = [] } = profileData.profile.profileData;

      // Add primary location if exists
      if (primaryLocation) {
        const formatted = formatLocationName(primaryLocation);
        locations.push(formatted);
      }

      // Add additional locations
      additionalLocations.forEach((loc: CompanyProfileLocation) => {
        const formatted = formatLocationName(loc);
        locations.push(formatted);
      });
    }

    // If no locations from profile, add "Remote" as default
    if (locations.length === 0) {
      locations.push("Remote");
    }

    return locations;
  }, [profileData]);
  const handleAddDepartment = (departmentData: { name: string }) => {
    const newDepartmentName = departmentData.name;
    form.setValue("department", newDepartmentName);
    toast({
      title: "Department added",
      description: `${newDepartmentName} has been added successfully.`
    });
  };

  const handleAddLocation = async (locationData: { name: string; city?: string; country?: string }) => {
    const parts = [locationData.name];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.country) parts.push(locationData.country);
    const formattedLocationName = parts.join(", ");
    form.setValue("location", formattedLocationName);
    toast({
      title: "Location added",
      description: `${formattedLocationName} has been added successfully.`
    });
    // Refresh profile data to include the new location
    await refreshProfile();
  };
  return <div className="space-y-4">
    {/* Basic Details Section */}
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5" />
          Basic Details
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Start by providing the essential information about this job
        </p>
      </div>
      <Button variant="outline" size="sm" className="h-8 px-3" asChild>
        <Link to="/jobs/templates">
          <FileText className="h-4 w-4 mr-2" />
          View Templates
        </Link>
      </Button>
    </div>

    {/* Company Display - Read Only */}
    <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-md border">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Posting Job For</p>
        <p className="text-sm font-semibold">{companyName}</p>
      </div>
    </div>

    <div className="flex gap-3 items-start">
      {/* Job Title - Takes most of the space */}
      <FormField control={form.control} name="title" render={({
        field
      }) => <FormItem className="flex-1">
          <FormLabel>Job Title *</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Senior Full Stack Developer" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>} />

      {/* Number of Vacancies - Compact width */}
      <FormField control={form.control} name="numberOfVacancies" render={({
        field
      }) => <FormItem className="w-24">
          <FormLabel>Vacancies *</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              max="999"
              placeholder="1"
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              className="text-center"
            />
          </FormControl>
          <FormMessage />
        </FormItem>} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField control={form.control} name="department" render={({
        field
      }) => <FormItem>
          <FormLabel>Department *</FormLabel>
          <div className="flex gap-2">
            <FormControl className="flex-1">
              <ComboboxWithAdd value={field.value} onValueChange={field.onChange} options={departmentOptions} placeholder="Select department" emptyText="No departments found." />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setDepartmentDialogOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormDescription className="text-[11px]">
            Select or add department
          </FormDescription>
          <FormMessage />
        </FormItem>} />

      <FormField control={form.control} name="location" render={({
        field
      }) => <FormItem>
          <FormLabel>Location *</FormLabel>
          <div className="flex gap-2">
            <FormControl className="flex-1">
              <ComboboxWithAdd value={field.value} onValueChange={field.onChange} options={locationOptions} placeholder="Select location" emptyText="No locations found." />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setLocationDialogOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormDescription className="text-[11px]">
            Select or add location
          </FormDescription>
          <FormMessage />
        </FormItem>} />
    </div>

    {/* Job Category */}
    <FormField
      control={form.control}
      name="category_id"
      render={({ field }) => {
        const { data: categories, isLoading } = usePublicCategories();

        return (
          <FormItem>
            <FormLabel>Job Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="_loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : !categories || categories.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription className="text-[11px]">
              Helps candidates discover this job
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />

    {/* Employment Details Row - 3 columns */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <FormField control={form.control} name="employmentType" render={({
        field
      }) => <FormItem>
          <FormLabel>Employment Type *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>} />

      <FormField control={form.control} name="experienceLevel" render={({
        field
      }) => <FormItem>
          <FormLabel>Experience Level *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>} />

      <FormItem>
        <FormLabel>Work Arrangement *</FormLabel>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="workArrangement"
            render={({ field }) => {
              return (
                <div className="grid grid-cols-3 gap-1 rounded-md border bg-muted/20 p-1">
                  {[
                    { label: "On-site", value: "on-site" },
                    { label: "Remote", value: "remote" },
                    { label: "Hybrid", value: "hybrid" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={field.value === option.value ? "default" : "ghost"}
                      size="sm"
                      className="h-8 rounded-sm text-xs"
                      onClick={() => field.onChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              );
            }}
          />
        </div>
        <FormDescription className="text-[11px]">
          Choose where the role is performed
        </FormDescription>
        <FormMessage />
      </FormItem>
    </div>

    {/* Salary Information Section */}
    <div className="pt-4 border-t">
      <h3 className="text-base font-semibold mb-3">Salary Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3 items-center mb-3 rounded-md border bg-muted/20 p-3">
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium">Salary Visibility on Job Board</h4>
          <p className="text-[11px] text-muted-foreground">
            Salary is always used internally for filtering and reporting.
          </p>
        </div>

        <FormField control={form.control} name="hideSalary" render={({
          field
        }) => <FormItem className="flex flex-col justify-end">
            <FormLabel className="mb-1 text-xs">Hide on Job Post</FormLabel>
            <div className="flex items-center space-x-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-0 leading-none">
                <FormLabel className="text-sm font-normal">
                  {field.value ? "Hidden" : "Visible"}
                </FormLabel>
              </div>
            </div>
            <FormDescription className="text-[11px]">
              {field.value ? "Salary hidden from public view" : "Salary shown on job board"}
            </FormDescription>
          </FormItem>} />
      </div>

      <div className="space-y-3">
        {/* Salary Range & Currency Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField control={form.control} name="salaryCurrency" render={({
            field
          }) => <FormItem>
              <FormLabel>Currency *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                  <SelectItem value="SGD">SGD (S$)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />

          <FormField control={form.control} name="salaryPeriod" render={({
            field
          }) => <FormItem>
              <FormLabel>Period *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-[11px]">
                Pay frequency
              </FormDescription>
              <FormMessage />
            </FormItem>} />

          <FormField control={form.control} name="salaryMin" render={({
            field
          }) => <FormItem>
              <FormLabel>Minimum Salary *</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 80,000" {...field} onChange={e => {
                  const numericValue = e.target.value.replace(/,/g, '');
                  if (numericValue === '' || /^\d+$/.test(numericValue)) {
                    field.onChange(numericValue ? Number(numericValue) : undefined);
                  }
                }} value={field.value ? field.value.toLocaleString('en-US') : ''} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

          <FormField control={form.control} name="salaryMax" render={({
            field
          }) => <FormItem>
              <FormLabel>Maximum Salary *</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 120,000" {...field} onChange={e => {
                  const numericValue = e.target.value.replace(/,/g, '');
                  if (numericValue === '' || /^\d+$/.test(numericValue)) {
                    field.onChange(numericValue ? Number(numericValue) : undefined);
                  }
                }} value={field.value ? field.value.toLocaleString('en-US') : ''} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        </div>

        {/* Salary Description Field */}
        <FormField control={form.control} name="salaryDescription" render={({
          field
        }) => <FormItem>
            <FormLabel>Salary Description (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Competitive package with bonuses, equity options, and benefits" maxLength={100} {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription className="text-[11px]">
              Add concise compensation context (max 100 chars).
              {field.value && <span className="ml-2 font-medium">
                {field.value.length}/100
              </span>}
            </FormDescription>
            <FormMessage />
          </FormItem>} />

        {/* Preview of formatted salary */}
        {(form.watch("salaryMin") || form.watch("salaryMax")) && <div className="p-3 bg-secondary/40 rounded-md border">
          <p className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Salary Preview</p>
          <p className="text-base font-semibold">
            {formatSalaryRange(form.watch("salaryMin"), form.watch("salaryMax"), form.watch("salaryCurrency"), form.watch("salaryPeriod"))}
          </p>
          {form.watch("salaryDescription") && <p className="text-sm text-muted-foreground mt-2 italic">
            "{form.watch("salaryDescription")}"
          </p>}
        </div>}

        {/* Recruitment service pricing (when paid service selected) */}
        {form.watch("serviceType") && form.watch("serviceType") !== 'self-managed' && form.watch("serviceType") !== 'rpo' && (form.watch("salaryMax") || form.watch("salaryMin")) && (
          <JobPricingCalculator
            salaryMax={form.watch("salaryMax") || form.watch("salaryMin") || 0}
          />
        )}
      </div>
    </div>

    <PositionDescriptionUpload
      form={form}
      onFileProcessed={(text) => {
        form.setValue("positionDescriptionText", text);
      }}
    />

    {/* Add Department Dialog */}
    <AddDepartmentDialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen} onAdd={handleAddDepartment} employerName={companyName} />

    {/* Add Location Dialog */}
    <AddLocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} onAdd={handleAddLocation} employerName={companyName} />


    {/* Job Assignment Settings */}
    {!loadingCompanySettings && companyAssignmentMode && (
      <div className="space-y-2">
        <Separator />
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Company Assignment Mode:</span>{' '}
                {companyAssignmentMode === 'AUTO_RULES_ONLY'
                  ? 'Auto Assignment by Rules'
                  : 'Manual Assignment Only'}
              </p>
              <FormField
                control={form.control}
                name="assignmentMode"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value === 'AUTO'}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? 'AUTO' : 'MANUAL');
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Auto-assign consultant for this job
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {companyAssignmentMode === 'AUTO_RULES_ONLY'
                            ? 'This job will be automatically assigned to a consultant based on region, expertise, and availability. Payment for consultant services will be included when you publish the job.'
                            : 'Note: Your company is set to manual assignment, but you can enable auto-assignment for this specific job. Payment for consultant services will be included when you publish the job.'}
                        </p>
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )}
  </div>;
}
