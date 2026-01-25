import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Button } from "@/shared/components/ui/button";
import { Plus, MoreVertical, Pencil, Copy, Trash2, Briefcase, FileText, Clock, CheckCircle, Download, Upload, Archive, BarChart3, Filter, X, Zap, Eye } from "lucide-react";
import { EnhancedStatCard } from "@/modules/dashboard/components/EnhancedStatCard";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { jobService } from "@/shared/lib/jobService";
import { Job } from "@/shared/types/job";
import { useJobPostingPermission } from "@/shared/hooks/useJobPostingPermission";
import { mapBackendJobToFrontend, mapBackendJobToFormData } from "@/shared/lib/jobDataMapper";
import { useAuth } from "@/app/AuthContext";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { JobWizard } from "@/modules/jobs/components/JobWizard";
import { JobEditDrawer } from "@/modules/jobs/components/JobEditDrawer";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";
import { EmploymentTypeBadge } from "@/modules/jobs/components/EmploymentTypeBadge";
import { ServiceTypeBadge } from "@/modules/jobs/components/ServiceTypeBadge";
import { EntityAvatar } from "@/shared/components/tables/EntityAvatar";
import { formatRelativeDate } from "@/shared/lib/jobUtils";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useToast } from "@/shared/hooks/use-toast";
import { WarningConfirmationDialog } from "@/shared/components/ui/warning-confirmation-dialog";
import { DeleteConfirmationDialog } from "@/shared/components/ui/delete-confirmation-dialog";
import { JobsFilterBar } from "@/modules/jobs/components/JobsFilterBar";
import { getCountryFromLocation, expandRegionsToCountries, REGION_COUNTRY_MAP, getRegionForCountry } from "@/shared/lib/countryRegions";
import { useDraftJob } from "@/shared/hooks/useDraftJob";

import { AdvancedFilterBuilder } from "@/modules/jobs/components/filters/AdvancedFilterBuilder";
import { SavedFiltersPanel } from "@/modules/jobs/components/filters/SavedFiltersPanel";
import { BulkActionsToolbar } from "@/modules/jobs/components/bulk/BulkActionsToolbar";
import { FilterCriteria, SavedFilter } from "@/shared/lib/savedFiltersService";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { DashboardSkeleton } from "@/shared/components/skeletons/DashboardSkeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/shared/components/ui/alert-dialog";

export default function Jobs() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canPostJobs, loading: permissionLoading } = useJobPostingPermission();
  const { user, profileSummary } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingJobIdForEdit, setEditingJobIdForEdit] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria>({});
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<Job | null>(null);
  const [pendingFromTemplate, setPendingFromTemplate] = useState(false);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Build filters object
        const filters: { status?: string } = {};
        if (selectedStatus !== 'all') {
          // Convert frontend status format to backend format
          const statusMap: Record<string, string> = {
            'draft': 'DRAFT',
            'open': 'OPEN',
            'closed': 'CLOSED',
            'on-hold': 'ON_HOLD',
            'filled': 'FILLED',
            'cancelled': 'CANCELLED',
            'template': 'TEMPLATE',
          };
          filters.status = statusMap[selectedStatus] || selectedStatus.toUpperCase();
        }
        const response = await jobService.getJobs(filters);
        if (response.success && response.data) {
          // Map backend jobs to frontend format
          const jobsData = Array.isArray(response.data) ? response.data : [];
          const mappedJobs = jobsData.map(mapBackendJobToFrontend);
          setJobs(mappedJobs);
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to fetch jobs',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch jobs',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [refreshKey, selectedStatus, toast]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeJobs = jobs.filter(j => {
      const status = typeof j.status === 'string' ? j.status.toLowerCase() : j.status;
      return status === 'open';
    }).length;
    const totalApplicants = jobs.reduce((sum, j) => {
      const count = j.applicantsCount ?? 0;
      return sum + (isNaN(count) ? 0 : count);
    }, 0);
    const avgApplicants = jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0;
    const filledJobs = jobs.filter(j => {
      const status = typeof j.status === 'string' ? j.status.toLowerCase() : j.status;
      return status === 'filled';
    }).length;

    return {
      total: jobs.length || 0,
      active: activeJobs || 0,
      applicants: totalApplicants || 0,
      filled: filledJobs || 0,
      avgApplicants: avgApplicants || 0,
    };
  }, [jobs]);

  // Auto-open job wizard when navigating with action=create
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      const fromTemplate = searchParams.get('fromTemplate') === 'true';
      // Clear params first to avoid re-triggering
      setSearchParams({}, { replace: true });
      // Then handle the create action
      handleCreateJob(fromTemplate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  // Extract unique consultants and countries
  const uniqueConsultants = useMemo(() => {
    const consultants = new Set<string>();
    jobs.forEach(job => {
      if (job.assignedConsultantName) {
        consultants.add(job.assignedConsultantName);
      }
    });
    return ['Unassigned', ...Array.from(consultants).sort()];
  }, [jobs]);

  // Generate location options grouped by region
  const locationOptions = useMemo(() => {
    // Get all unique countries from jobs
    const jobCountries = new Set<string>();
    jobs.forEach(job => {
      const country = getCountryFromLocation(job.location);
      jobCountries.add(country);
    });

    // Group countries by region
    const optionsByRegion: Record<string, string[]> = {
      'Americas': [],
      'Europe': [],
      'APAC': [],
      'Middle East & Africa': [],
      'Global': []
    };

    jobCountries.forEach(country => {
      const region = getRegionForCountry(country);
      if (region && optionsByRegion[region]) {
        optionsByRegion[region].push(country);
      }
    });

    // Build hierarchical structure
    return Object.entries(optionsByRegion)
      .filter(([_, countries]) => countries.length > 0)
      .map(([region, countries]) => ({
        region,
        countries: countries.sort()
      }));
  }, [jobs]);

  // Apply all filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const searchFields = [
          job.title,
          job.employerName,
          job.location,
          job.department,
        ];
        if (!searchFields.some(field => field.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Consultant filter
      if (selectedConsultant !== 'all') {
        if (selectedConsultant === 'my-jobs') {
          if (job.createdBy !== 'admin-1') return false;
        } else {
          const consultantName = job.assignedConsultantName || 'Unassigned';
          if (consultantName !== selectedConsultant) return false;
        }
      }

      // Location filter
      if (selectedLocation !== 'all') {
        const jobCountry = getCountryFromLocation(job.location);
        if (jobCountry !== selectedLocation) return false;
      }

      // Service filter
      if (selectedService !== 'all') {
        if (job.serviceType !== selectedService) return false;
      }

      // Note: Status filter is handled on the backend via API call
      // Advanced filters (which may include multiple statuses)
      if (advancedFilters.status && advancedFilters.status.length > 0) {
        if (!advancedFilters.status.includes(job.status)) return false;
      }

      if (advancedFilters.department && advancedFilters.department.length > 0) {
        if (!advancedFilters.department.includes(job.department)) return false;
      }

      if (advancedFilters.employmentType && advancedFilters.employmentType.length > 0) {
        if (!advancedFilters.employmentType.includes(job.employmentType)) return false;
      }

      if (advancedFilters.experienceLevel && advancedFilters.experienceLevel.length > 0) {
        if (!advancedFilters.experienceLevel.includes(job.experienceLevel)) return false;
      }

      if (advancedFilters.salaryRange) {
        if (advancedFilters.salaryRange.min && job.salaryMax && job.salaryMax < advancedFilters.salaryRange.min) return false;
        if (advancedFilters.salaryRange.max && job.salaryMin && job.salaryMin > advancedFilters.salaryRange.max) return false;
      }

      if (advancedFilters.applicantRange) {
        if (advancedFilters.applicantRange.min && job.applicantsCount < advancedFilters.applicantRange.min) return false;
        if (advancedFilters.applicantRange.max && job.applicantsCount > advancedFilters.applicantRange.max) return false;
      }

      return true;
    });
  }, [jobs, searchValue, selectedConsultant, selectedLocation, selectedService, selectedStatus, advancedFilters]);

  const handleDelete = (id: string) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (jobToDelete) {
      setIsDeleting(true);
      try {
        const response = await jobService.deleteJob(jobToDelete);
        if (response.success) {
          toast({
            title: "Job Deleted",
            description: "The job posting has been removed.",
          });
          setRefreshKey(prev => prev + 1);
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to delete job",
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete job",
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setJobToDelete(null);
      }
    }
  };

  const { refetch: refetchDraft } = useDraftJob();

  const handleCreateJob = async (fromTemplate = false) => {
    // Refetch to get the latest draft and use the returned value
    const latestDraft = await refetchDraft();

    // If coming from template, load the draft directly (template data already applied)
    if (latestDraft && fromTemplate) {
      setEditingJobId(latestDraft.id);
      setDrawerOpen(true);
      toast({
        title: "Template applied",
        description: `Template data has been filled into your draft job.`,
        duration: 4000,
      });
      return;
    }

    // If draft exists and NOT from template, show dialog to let user choose
    if (latestDraft && !fromTemplate) {
      setPendingDraft(latestDraft);
      setPendingFromTemplate(false);
      setShowDraftDialog(true);
      return;
    }

    // No draft found, start fresh
    setEditingJobId(null);
    setDrawerOpen(true);
  };

  const handleContinueWithDraft = () => {
    if (pendingDraft) {
      setEditingJobId(pendingDraft.id);
      setDrawerOpen(true);
      toast({
        title: "Draft loaded",
        description: `Continuing with your draft: "${pendingDraft.title || 'Untitled Job'}"`,
        duration: 4000,
      });
    }
    setShowDraftDialog(false);
    setPendingDraft(null);
    setPendingFromTemplate(false);
  };

  const handleStartNewJob = () => {
    setEditingJobId(null);
    setDrawerOpen(true);
    setShowDraftDialog(false);
    setPendingDraft(null);
    setPendingFromTemplate(false);
  };

  const handleEditJob = (jobId: string) => {
    setEditingJobIdForEdit(jobId);
    setEditDrawerOpen(true);
  };

  const handleJobSuccess = () => {
    setDrawerOpen(false);
    setEditingJobId(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingJobId(null);
  };

  const handleApplyAdvancedFilters = (filters: FilterCriteria) => {
    setAdvancedFilters(filters);
    setShowAdvancedFilters(false);
  };

  const handleSelectSavedFilter = (filter: SavedFilter) => {
    setAdvancedFilters(filter.filters);
    setShowSavedFilters(false);
    toast({
      title: "Filter applied",
      description: `"${filter.name}" filter has been applied.`,
    });
  };

  const handleBulkAction = (action: string) => {
    if (action.startsWith('status:')) {
      const status = action.split(':')[1];
      toast({
        title: "Status updated",
        description: `${selectedJobs.length} job(s) status changed to ${status}.`,
      });
    } else if (action.startsWith('assign:')) {
      const consultant = action.split(':')[1];
      toast({
        title: "Consultant assigned",
        description: `${selectedJobs.length} job(s) assigned to ${consultant}.`,
      });
    } else if (action === 'archive') {
      toast({
        title: "Jobs archived",
        description: `${selectedJobs.length} job(s) have been archived.`,
      });
    } else if (action === 'delete') {
      setShowBulkDeleteDialog(true);
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      const response = await jobService.bulkDeleteJobs(selectedJobs);
      if (response.success) {
        toast({
          title: "Jobs deleted",
          description: response.data?.message || `${selectedJobs.length} job(s) have been deleted.`,
        });
        setSelectedJobs([]);
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete jobs",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete jobs",
        variant: 'destructive',
      });
    } finally {
      setIsDeletingBulk(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.status?.length) count++;
    if (advancedFilters.department?.length) count++;
    if (advancedFilters.employmentType?.length) count++;
    if (advancedFilters.experienceLevel?.length) count++;
    if (advancedFilters.salaryRange?.min || advancedFilters.salaryRange?.max) count++;
    if (advancedFilters.applicantRange?.min || advancedFilters.applicantRange?.max) count++;
    return count;
  }, [advancedFilters]);

  const [editingJobData, setEditingJobData] = useState<any>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (editingJobId) {
        try {
          const response = await jobService.getJobById(editingJobId);
          if (response.success && response.data) {
            // Map backend job to form data format
            const formData = mapBackendJobToFormData(response.data);
            setEditingJobData(formData);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load job data",
            variant: 'destructive',
          });
        }
      } else {
        setEditingJobData(null);
      }
    };

    fetchJobData();
  }, [editingJobId, toast]);

  const columns: Column<Job>[] = [
    {
      key: 'name',
      label: 'Job Title',
      sortable: true,
      render: (job) => {
        // Use company name from job or fallback to user's company
        const companyName = job.employerName || user?.companyName || profileSummary?.name || "Company";
        const companyId = job.employerId || user?.companyId || "";

        return (
          <div className="flex items-center gap-3">
            <EntityAvatar
              name={companyName}
              src={job.employerLogo}
              type="logo"
            />
            <div className="min-w-0 flex-1">
              {(() => {
                const parts = job.title.split(' - ');
                const role = parts[0] || job.title;
                const domain = parts.length > 1 ? parts.slice(1).join(' - ') : '';
                return (
                  <>
                    <div
                      className="font-semibold text-base truncate block w-full"
                    >
                      {role}
                    </div>
                    {domain && (
                      <span className="text-sm text-muted-foreground truncate block w-full">
                        {domain}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground truncate block w-full">
                      {companyName}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        );
      }
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (job) => {
        if (job.location.toLowerCase() === 'remote') {
          return (
            <div className="text-sm">
              <p className="font-medium">Remote</p>
              {job.country && (
                <p className="text-xs text-muted-foreground">{job.country}</p>
              )}
              <Badge variant="outline" className="text-xs mt-1">
                {job.workArrangement === 'on-site' ? 'On-site' : job.workArrangement === 'remote' ? 'Remote' : 'Hybrid'}
              </Badge>
            </div>
          );
        }

        return (
          <div>
            <div className="text-sm">
              <p className="font-medium">{job.location}</p>
              {job.country && (
                <p className="text-xs text-muted-foreground">{job.country}</p>
              )}
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {job.workArrangement === 'on-site' ? 'On-site' : job.workArrangement === 'remote' ? 'Remote' : 'Hybrid'}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'employmentType',
      label: 'Type',
      sortable: true,
      render: (job) => <EmploymentTypeBadge type={job.employmentType} />
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (job) => <JobStatusBadge status={job.status} />
    },
    {
      key: 'applicants',
      label: 'Applicants',
      sortable: true,
      render: (job) => (
        <div
          className="flex items-center gap-2 group"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/ats/jobs/${job.id}?tab=applicants`);
          }}
        >
          <span className="font-medium group-hover:text-primary transition-colors cursor-pointer">
            {job.applicantsCount ?? 0}
          </span>
          {job.unreadApplicants && job.unreadApplicants > 0 && (
            <span className="text-xs text-muted-foreground/70">
              {job.unreadApplicants} unread
            </span>
          )}
        </div>
      )
    },
    {
      key: 'serviceType',
      label: 'Service',
      sortable: true,
      render: (job) => (
        <div className="flex flex-col gap-1">
          <ServiceTypeBadge type={job.serviceType} />
          {job.serviceType !== 'self-managed' && (
            <button
              type="button"
              className="text-[11px] text-primary underline-offset-2 hover:underline text-left"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/ats/jobs/${job.id}?tab=service`);
              }}
            >
              View recruitment workflow
            </button>
          )}
        </div>
      )
    },
    {
      key: 'postedDate',
      label: 'Posted',
      sortable: true,
      render: (job) => (
        <span className="text-sm text-muted-foreground">
          {formatRelativeDate(job.postingDate)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: "80px",
      render: (job) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditJob(job.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(job.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  ];

  return (
    <DashboardPageLayout
      breadcrumbActions={
        <>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        {!permissionLoading && !canPostJobs && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Limited Access:</strong> You don't have permission to post jobs. Contact your administrator to request job posting permissions.
            </p>
          </div>
        )}
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <AtsPageHeader
              title="Jobs"
              subtitle="Create and manage job postings"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedFilters(!showSavedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Saved Filters
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/ats/jobs/templates">
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/ats/jobs/automation">
                    <Zap className="h-4 w-4 mr-2" />
                    Automation
                  </Link>
                </Button>
                {canPostJobs ? (
                  <Button size="sm" onClick={() => {
                    // Clear any URL params first to avoid interference
                    setSearchParams({}, { replace: true });
                    handleCreateJob(false);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled title="Contact your administrator to request job posting permissions">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/ats/jobs">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </AtsPageHeader>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <EnhancedStatCard
                title="Total Jobs"
                value={stats.total}
                change="+8%"
                trend="up"
                icon={<Briefcase className="h-6 w-6" />}
                variant="neutral"
                showMenu={true}
                menuItems={[
                  { label: "View all jobs", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "View templates", icon: <FileText className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export data", icon: <Download className="h-4 w-4" />, onClick: () => { } },
                ]}
              />
              <EnhancedStatCard
                title="Active Postings"
                value={stats.active}
                change="+12%"
                trend="up"
                icon={<Clock className="h-6 w-6" />}
                variant="success"
                showMenu={true}
                menuItems={[
                  { label: "View active jobs", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  {
                    label: "Post new job", icon: <Plus className="h-4 w-4" />, onClick: () => {
                      setSearchParams({}, { replace: true });
                      handleCreateJob(false);
                    }
                  },
                ]}
              />
              <EnhancedStatCard
                title="Total Applicants"
                value={stats.applicants}
                change="+15%"
                trend="up"
                icon={<FileText className="h-6 w-6" />}
                variant="primary"
                showMenu={true}
                menuItems={[
                  { label: "View applicants", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export data", icon: <Download className="h-4 w-4" />, onClick: () => { } },
                ]}
              />
              <EnhancedStatCard
                title="Filled Positions"
                value={stats.filled}
                change="+5%"
                trend="up"
                icon={<CheckCircle className="h-6 w-6" />}
                variant="warning"
                showMenu={true}
                menuItems={[
                  { label: "View filled", icon: <CheckCircle className="h-4 w-4" />, onClick: () => { } },
                  { label: "View analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                ]}
              />
            </div>

            {showSavedFilters && (
              <SavedFiltersPanel onSelectFilter={handleSelectSavedFilter} />
            )}

            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <JobsFilterBar
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  selectedConsultants={selectedConsultant === 'all' ? [] : [selectedConsultant]}
                  onConsultantsChange={(consultants) => setSelectedConsultant(consultants[0] || 'all')}
                  selectedLocations={selectedLocation === 'all' ? [] : [selectedLocation]}
                  onLocationsChange={(locations) => setSelectedLocation(locations[0] || 'all')}
                  selectedService={selectedService}
                  onServiceChange={setSelectedService}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  consultantOptions={uniqueConsultants}
                  locationOptions={locationOptions}
                  currentUserId="admin-1"
                />
              </div>
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="shrink-0 h-9"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleContent>
                <AdvancedFilterBuilder
                  onApply={handleApplyAdvancedFilters}
                  initialFilters={advancedFilters}
                />
              </CollapsibleContent>
            </Collapsible>

            {selectedJobs.length > 0 && (
              <BulkActionsToolbar
                selectedCount={selectedJobs.length}
                onClearSelection={() => setSelectedJobs([])}
                onBulkAction={handleBulkAction}
              />
            )}

            <DataTable
              data={filteredJobs}
              columns={columns}
              searchable={false}
              selectable
              onSelectedRowsChange={setSelectedJobs}
              onRowClick={(job) => {
                navigate(`/ats/jobs/${job.id}`);
              }}
              emptyMessage="No jobs found"
              tableId="jobs"
            />

            <FormDrawer
              open={drawerOpen}
              onOpenChange={handleDrawerClose}
              title={editingJobId ? "Edit Job" : "Post Job"}
              description={editingJobId ? "Update the job posting details" : "Fill in the details to post a new job"}
              width="2xl"
            >
              <JobWizard
                key={editingJobId || 'new'}
                jobId={editingJobId || undefined}
                defaultValues={editingJobData || undefined}
                onSuccess={handleJobSuccess}
                onCancel={handleDrawerClose}
                embedded
              />
            </FormDrawer>

            <WarningConfirmationDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={confirmDelete}
              type="delete"
              title="Delete Job Posting"
              description="This action cannot be undone. This will permanently delete the job posting and all associated data."
              isProcessing={isDeleting}
            />

            <DeleteConfirmationDialog
              open={showBulkDeleteDialog}
              onOpenChange={setShowBulkDeleteDialog}
              onConfirm={confirmBulkDelete}
              title="Delete Jobs"
              description={`Are you sure you want to delete ${selectedJobs.length} job(s)? This action cannot be undone.`}
              isDeleting={isDeletingBulk}
            />

            <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Continue with Draft or Start New?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have an existing draft job: <strong>"{pendingDraft?.title || 'Untitled Job'}"</strong>.
                    <br /><br />
                    Would you like to continue editing your draft or start a new job posting?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel onClick={() => {
                    setShowDraftDialog(false);
                    setPendingDraft(null);
                    setPendingFromTemplate(false);
                  }}>
                    Cancel
                  </AlertDialogCancel>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleContinueWithDraft}
                      className="flex-1 sm:flex-initial"
                    >
                      Continue Draft
                    </Button>
                    <Button
                      onClick={handleStartNewJob}
                      variant="default"
                      className="flex-1 sm:flex-initial"
                    >
                      Start New Job
                    </Button>
                  </div>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Job Edit Drawer */}
            {editingJobIdForEdit && (
              <JobEditDrawer
                open={editDrawerOpen}
                onOpenChange={(open) => {
                  setEditDrawerOpen(open);
                  if (!open) {
                    setEditingJobIdForEdit(null);
                  }
                }}
                jobId={editingJobIdForEdit}
                onSuccess={() => {
                  setRefreshKey(prev => prev + 1);
                }}
              />
            )}
          </>
        )}
      </div>
    </DashboardPageLayout>
  );
}
