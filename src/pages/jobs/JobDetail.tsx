import { useState, useEffect } from "react";
import { useParams, Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";

import {
  ArrowLeft,
  Edit,
  Share2,
  Archive,
  ArchiveRestore,
  Trash2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Eye,
  Globe,
  Globe2,
  Lock,
  Send,
  MoreVertical,
  Megaphone,
  Sparkles,
  Video,
  ArrowUpCircle,
  GitBranch,
  UserPlus,
  Users,
  CheckSquare,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { getJobById } from "@/shared/lib/mockJobStorage";
import { mockJobActivities } from "@/data/mockJobsData";
import { Job } from "@/shared/types/job";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";
import { EmploymentTypeBadge } from "@/modules/jobs/components/EmploymentTypeBadge";
import { ServiceTypeBadge } from "@/modules/jobs/components/ServiceTypeBadge";
import { JobQuickStats } from "@/modules/jobs/components/JobQuickStats";
import { DetailSkeleton } from "@/shared/components/skeletons/DetailSkeleton";
import { JobActivityFeed } from "@/modules/jobs/components/JobActivityFeed";
import { JobLifecycleActions } from "@/modules/jobs/components/JobLifecycleActions";
import { JobPaymentStatus } from "@/modules/jobs/components/JobPaymentStatus";
import { formatSalaryRange, formatExperienceLevel, formatRelativeDate } from "@/shared/lib/jobUtils";
import { ApplicationPipeline } from "@/modules/applications/components/ApplicationPipeline";
import { JobApplicantsList } from "@/modules/applications/components/JobApplicantsList";
import { AllApplicantsCard } from "@/modules/applications/components/AllApplicantsCard";
import { InitialScreeningTab } from "@/modules/applications/components/InitialScreeningTab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { JobEditDrawer } from "@/modules/jobs/components/JobEditDrawer";
import { ExternalPromotionDialog } from "@/modules/jobs/components/ExternalPromotionDialog";
import { JobBudgetTracker } from "@/modules/jobs/components/budget/JobBudgetTracker";
import { JobAIInterviewsTab } from "@/modules/jobs/components/aiInterview/JobAIInterviewsTab";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/jobService";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";
import { UpgradeServiceDialog } from "@/modules/jobs/components/UpgradeServiceDialog";
import { JobDetailPageSkeleton } from "@/modules/jobs/components/JobDetailPageSkeleton";
import { JobBoardVisibilityControl } from "@/modules/jobs/components/JobBoardVisibilityControl";
import { ArchiveJobDialog } from "@/modules/jobs/components/ArchiveJobDialog";
import { DeleteJobDialog } from "@/modules/jobs/components/DeleteJobDialog";
import { applicationService } from "@/shared/lib/applicationService";
import { TalentPoolSearchDialog } from "@/modules/applications/components/TalentPoolSearchDialog";
import { JobApplicationsFilterBar, JobApplicationsFilters } from "@/modules/applications/components/JobApplicationsFilterBar";
import { ApplicationListView } from "@/modules/applications/components/ApplicationListView";
import { LayoutGrid, List, Inbox } from "lucide-react";
import { Application } from "@/shared/types/application";
import { filterApplicationsByTags } from "@/shared/lib/applicationTags";
import { useMemo } from "react";
import { verifyJobPayment } from "@/shared/lib/payments";
import { useAuth } from "@/app/providers/AuthContext";
import { HiringTeamTab } from "@/modules/jobs/components/team/HiringTeamTab";
import { JobRound, jobRoundService } from "@/shared/lib/jobRoundService";
import { RoundDetailView } from "@/modules/applications/components/RoundDetailView";
import { RoundConfigDrawer, RoundConfigTab } from "@/modules/applications/components/RoundConfigDrawer";
import { CandidatesTab } from "@/modules/applications/components/CandidatesTab";
import { JobMessagesTab } from "@/modules/jobs/components/JobMessagesTab";
import { JobTasksTab } from "@/modules/jobs/components/tasks/JobTasksTab";
import { MessageSquarePlus } from "lucide-react";
import { JobInboxTab } from "@/modules/jobs/components/JobInboxTab";
import { JobOffersTab } from "@/modules/jobs/components/offers/JobOffersTab";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [upgradeServiceDialogOpen, setUpgradeServiceDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessingArchive, setIsProcessingArchive] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [applicantsCount, setApplicantsCount] = useState<number | undefined>(undefined);
  const [talentPoolDialogOpen, setTalentPoolDialogOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [rounds, setRounds] = useState<JobRound[]>([]);
  const [activeRoundTab, setActiveRoundTab] = useState<string>("overview");
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [selectedRoundForConfig, setSelectedRoundForConfig] = useState<JobRound | null>(null);
  const [initialConfigTab, setInitialConfigTab] = useState<RoundConfigTab>("general");

  const handleConfigureAssessment = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setInitialConfigTab("assessment");
      setConfigDrawerOpen(true);
    }
  };

  const handleConfigureInterview = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setInitialConfigTab("interview");
      setConfigDrawerOpen(true);
    }
  };

  const handleConfigureEmail = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setInitialConfigTab("email");
      setConfigDrawerOpen(true);
    }
  };

  const [activeTab, setActiveTab] = useState("overview");;
  const [applicationsFilters, setApplicationsFilters] = useState<JobApplicationsFilters>({
    searchQuery: '',
    selectedStages: [],
    selectedStatuses: [],
    selectedTags: [],
    dateFrom: undefined,
    dateTo: undefined,
    minScore: undefined,
    maxScore: undefined,
    assignedTo: undefined,
    quickFilter: null,
  });
  const [applicationsViewMode, setApplicationsViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Map backend ApplicationStatus to frontend ApplicationStatus
  const mapApplicationStatus = (status: string | null | undefined): Application['status'] => {
    // Handle null/undefined cases
    if (!status) {
      console.warn('[JobDetail] Application status is null/undefined, defaulting to "applied"');
      return 'applied';
    }

    // Normalize to uppercase for case-insensitive comparison
    const normalizedStatus = status.toUpperCase().trim();

    const statusMap: Record<string, Application['status']> = {
      'NEW': 'applied',
      'SCREENING': 'screening',
      'INTERVIEW': 'interview',
      'OFFER': 'offer',
      'HIRED': 'hired',
      'REJECTED': 'rejected',
      'WITHDRAWN': 'withdrawn',
    };

    const mappedStatus = statusMap[normalizedStatus];
    if (!mappedStatus) {
      console.warn(`[JobDetail] Unknown application status: "${status}" (normalized: "${normalizedStatus}"), defaulting to "applied"`);
      console.warn(`[JobDetail] Available status mappings:`, Object.keys(statusMap));
      return 'applied';
    }

    return mappedStatus;
  };

  // Map backend ApplicationStage to frontend ApplicationStage
  const mapApplicationStage = (stage: string | null | undefined): Application['stage'] => {
    // Handle null/undefined cases
    if (!stage) {
      console.warn('[JobDetail] Application stage is null/undefined, defaulting to "New Application"');
      return 'New Application';
    }

    // Normalize to uppercase for case-insensitive comparison
    const normalizedStage = stage.toUpperCase().trim();

    const stageMap: Record<string, Application['stage']> = {
      'NEW_APPLICATION': 'New Application',
      'RESUME_REVIEW': 'Resume Review',
      'PHONE_SCREEN': 'Phone Screen',
      'TECHNICAL_INTERVIEW': 'Technical Interview',
      'ONSITE_INTERVIEW': 'Manager Interview',
      'FINAL_ROUND': 'Final Round',
      'REFERENCE_CHECK': 'Reference Check',
      'OFFER_EXTENDED': 'Offer Extended',
      'OFFER_ACCEPTED': 'Offer Accepted',
      'REJECTED': 'Rejected',
      'WITHDRAWN': 'Withdrawn',
    };

    const mappedStage = stageMap[normalizedStage];
    if (!mappedStage) {
      console.warn(`[JobDetail] Unknown application stage: "${stage}", defaulting to "New Application"`);
      return 'New Application';
    }

    return mappedStage;
  };

  // Filter applications based on current filters - MUST be before early returns
  const filteredApplications = useMemo(() => {
    console.log('[JobDetail] Starting filter with:', {
      totalApplications: allApplications.length,
      filters: applicationsFilters,
      sampleStatuses: allApplications.slice(0, 3).map(app => app.status),
    });

    let filtered = [...allApplications];

    // Search filter
    if (applicationsFilters.searchQuery) {
      const query = applicationsFilters.searchQuery.toLowerCase();
      filtered = filtered.filter((app) =>
        app.candidateName.toLowerCase().includes(query) ||
        (app.candidateEmail && app.candidateEmail.toLowerCase().includes(query)) ||
        app.jobTitle.toLowerCase().includes(query)
      );
    }

    // Stage filter
    if (applicationsFilters.selectedStages.length > 0) {
      filtered = filtered.filter((app) => {
        // Defensive check: ensure stage exists
        if (!app.stage) {
          console.warn(`[JobDetail] Application ${app.id} has no stage, skipping stage filter`);
          return false;
        }
        return applicationsFilters.selectedStages.includes(app.stage);
      });
    }

    // Status filter
    if (applicationsFilters.selectedStatuses.length > 0) {
      console.log('[JobDetail] Filtering by status:', {
        selectedStatuses: applicationsFilters.selectedStatuses,
        totalBeforeFilter: filtered.length,
        ALLAppStatuses: filtered.map(app => ({ id: app.id, status: app.status, candidateName: app.candidateName })),
      });

      filtered = filtered.filter((app) => {
        // Defensive check: ensure status exists
        if (!app.status) {
          console.warn(`[JobDetail] Application ${app.id} has no status, skipping status filter`);
          return false;
        }

        const matches = applicationsFilters.selectedStatuses.includes(app.status);
        if (!matches && filtered.length <= 10) {
          // Only log for first 10 to avoid spam, but help debug
          console.log(`[JobDetail] Application ${app.id} (${app.candidateName}) status "${app.status}" (type: ${typeof app.status}) does not match selected statuses:`, applicationsFilters.selectedStatuses, `(types: ${applicationsFilters.selectedStatuses.map(s => typeof s).join(', ')})`);
        }
        return matches;
      });

      console.log('[JobDetail] After status filter:', {
        selectedStatuses: applicationsFilters.selectedStatuses,
        totalAfterFilter: filtered.length,
      });
    }

    // Tags filter
    if (applicationsFilters.selectedTags.length > 0) {
      filtered = filterApplicationsByTags(filtered, applicationsFilters.selectedTags);
    }

    // Date range filter
    if (applicationsFilters.dateFrom) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appliedDate);
        return appDate >= applicationsFilters.dateFrom!;
      });
    }
    if (applicationsFilters.dateTo) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appliedDate);
        // Set time to end of day
        const toDate = new Date(applicationsFilters.dateTo!);
        toDate.setHours(23, 59, 59, 999);
        return appDate <= toDate;
      });
    }

    // Score range filter
    if (applicationsFilters.minScore !== undefined || applicationsFilters.maxScore !== undefined) {
      filtered = filtered.filter((app) => {
        const score = app.score ?? app.aiMatchScore ?? 0;
        if (applicationsFilters.minScore !== undefined && score < applicationsFilters.minScore) {
          return false;
        }
        if (applicationsFilters.maxScore !== undefined && score > applicationsFilters.maxScore) {
          return false;
        }
        return true;
      });
    }

    // Quick filter: shortlisted
    if (applicationsFilters.quickFilter === 'shortlisted') {
      filtered = filtered.filter((app) => app.shortlisted);
    }

    // Quick filter: needs review (no score and unread)
    if (applicationsFilters.quickFilter === 'needs-review') {
      filtered = filtered.filter((app) =>
        (!app.score && !app.aiMatchScore) || !app.isRead
      );
    }

    console.log('[JobDetail] Filter result:', {
      totalAfterAllFilters: filtered.length,
      activeFilters: {
        search: !!applicationsFilters.searchQuery,
        stages: applicationsFilters.selectedStages.length,
        statuses: applicationsFilters.selectedStatuses.length,
        tags: applicationsFilters.selectedTags.length,
        dateRange: !!(applicationsFilters.dateFrom || applicationsFilters.dateTo),
        scoreRange: !!(applicationsFilters.minScore !== undefined || applicationsFilters.maxScore !== undefined),
        quickFilter: applicationsFilters.quickFilter,
      },
    });

    return filtered;
  }, [allApplications, applicationsFilters]);

  // Fetch job from API to get latest data
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await jobService.getJobById(jobId);
        if (response.success && response.data) {
          const mappedJob = mapBackendJobToFrontend(response.data.job);
          setJob(mappedJob);
        } else {
          // If API fails, try to get from mock storage as fallback
          const mockJob = getJobById(jobId);
          if (mockJob) {
            setJob(mockJob);
          } else {
            toast({
              title: "Job not found",
              description: response.error || "The job you're looking for doesn't exist.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        // Try to get from mock storage as fallback
        const mockJob = jobId ? getJobById(jobId) : null;
        if (mockJob) {
          setJob(mockJob);
        } else {
          toast({
            title: "Error",
            description: "Failed to load job details",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, refreshKey, toast]);

  // Fetch rounds
  useEffect(() => {
    if (!jobId) return;
    const fetchRounds = async () => {
      try {
        const response = await jobRoundService.getJobRounds(jobId);
        if (response.success && response.data) {
          // Sort by order
          const sortedRounds = (response.data.rounds || []).sort((a, b) => a.order - b.order);
          setRounds(sortedRounds);
        }
      } catch (error) {
        console.error("Error fetching rounds:", error);
      }
    };
    fetchRounds();
  }, [jobId]);

  // Verify payment after redirect from Stripe checkout
  useEffect(() => {
    const paymentParam = searchParams.get('payment');
    if (paymentParam === 'success' && jobId && user?.companyId && !isVerifyingPayment) {
      const verifyPayment = async () => {
        setIsVerifyingPayment(true);
        console.log('🔍 Verifying payment for job:', jobId);
        try {
          const response = await verifyJobPayment({
            jobId,
            companyId: user.companyId,
          });

          if (response.success && response.data) {
            if (response.data.paymentStatus === 'PAID') {
              toast({
                title: "Payment Successful! 🎉",
                description: response.data.published
                  ? "Your job has been published and is now live!"
                  : "Payment received. Your job is ready to be published.",
              });
              // Refresh the job to get updated payment status
              setRefreshKey(prev => prev + 1);
            } else if (response.data.alreadyPaid) {
              toast({
                title: "Payment Already Completed",
                description: "This job's payment was already processed.",
              });
            } else {
              console.log('Payment status:', response.data.paymentStatus);
            }
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({
            title: "Payment Verification",
            description: "We're having trouble verifying your payment. Please refresh the page.",
            variant: "destructive",
          });
        } finally {
          setIsVerifyingPayment(false);
          // Clear the payment query param to avoid re-verification on refresh
          searchParams.delete('payment');
          setSearchParams(searchParams, { replace: true });
        }
      };
      verifyPayment();
    }
  }, [searchParams, jobId, user?.companyId, toast, isVerifyingPayment, setSearchParams]);

  // Fetch applications for this job
  useEffect(() => {
    const loadApplications = async () => {
      if (!jobId) return;
      try {
        console.log('[JobDetail] Loading applicant count for jobId:', jobId);
        const res = await applicationService.getJobApplications(jobId);
        const apiApplications = res.data?.applications || [];

        // Extract round progress mapping to assign correct round IDs
        const roundMap: Record<string, string> = {};
        // @ts-expect-error - roundProgress exists in backend response but might not be in type definition
        if (res.data?.roundProgress) {
          // @ts-expect-error - iterating over unknown type
          Object.entries(res.data.roundProgress).forEach(([appId, progress]: [string, any]) => {
            if (progress?.roundId) {
              roundMap[appId] = progress.roundId;
            }
          });
        }

        // Map API applications to frontend Application type
        const mappedApplications: Application[] = apiApplications.map((app: any) => {
          let candidateName = 'Unknown Candidate';
          if (app.candidate?.firstName && app.candidate?.lastName) {
            candidateName = `${app.candidate.firstName} ${app.candidate.lastName}`;
          } else if (app.candidate?.firstName) {
            candidateName = app.candidate.firstName;
          } else if (app.candidate?.email) {
            candidateName = app.candidate.email.split('@')[0];
          } else if (app.candidateName) {
            candidateName = app.candidateName;
          }

          // Map status and stage with fallbacks
          const originalStatus = app.status;
          const mappedStatus = mapApplicationStatus(app.status || 'NEW');
          const mappedStage = mapApplicationStage(app.stage || 'NEW_APPLICATION');

          // Debug logging for ALL applications to see mapping
          console.log(`[JobDetail] Mapping application ${app.id} (${candidateName}):`, {
            originalStatus,
            mappedStatus,
            originalStage: app.stage,
            mappedStage,
            roundMapRoundId: roundMap[app.id],
            originalAppRoundId: app.roundId,
            finalRoundId: roundMap[app.id] || app.roundId
          });

          // Validate mapped values
          const validStatuses: Application['status'][] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
          if (!validStatuses.includes(mappedStatus)) {
            console.error(`[JobDetail] Invalid mapped status "${mappedStatus}" for application ${app.id} (original: "${originalStatus}"), using "applied"`);
          }

          // Safe date parsing helper
          const safeDate = (dateVal: string | Date | undefined): Date => {
            if (!dateVal) return new Date();
            if (dateVal instanceof Date) return dateVal;
            return new Date(dateVal);
          };

          return {
            id: app.id,
            candidateId: app.candidateId || app.candidate_id || app.candidate?.id || (app as any).candidate_id,
            candidateName,
            candidateEmail: app.candidate?.email || app.candidateEmail || '',
            candidatePhone: app.candidate?.phone,
            candidateCity: app.candidate?.city,
            candidateState: app.candidate?.state,
            candidateCountry: app.candidate?.country,
            candidatePhoto: app.candidate?.photo,
            jobId: app.jobId,
            jobTitle: app.job?.title || 'Unknown Job',
            employerName: app.job?.company?.name || 'Unknown Company',
            appliedDate: app.appliedDate instanceof Date ? app.appliedDate : new Date(app.appliedDate),
            status: mappedStatus, // Always set from mapping function
            stage: mappedStage, // Always set from mapping function
            roundId: roundMap[app.id] || app.roundId, // Assign round ID from progress map or direct backend field
            resumeUrl: app.resumeUrl,
            coverLetterUrl: app.coverLetterUrl,
            portfolioUrl: app.portfolioUrl,
            linkedInUrl: app.linkedInUrl,
            customAnswers: app.customAnswers || [],
            isRead: app.isRead,
            isNew: app.isNew,
            tags: app.tags || [],
            score: app.score,
            rank: app.rank,
            aiMatchScore: app.score,
            aiAnalysis: app.aiAnalysis || undefined,
            shortlisted: app.shortlisted || false,
            shortlistedAt: app.shortlistedAt ? new Date(app.shortlistedAt) : undefined,
            shortlistedBy: app.shortlistedBy,
            manuallyAdded: app.manuallyAdded || false,
            addedBy: app.addedBy,
            addedAt: app.addedAt ? new Date(app.addedAt) : undefined,
            recruiterNotes: app.recruiterNotes,
            notes: [],
            activities: [],
            interviews: [],
            createdAt: safeDate(app.createdAt),
            updatedAt: safeDate(app.updatedAt),
            candidatePreferences: app.candidate ? {
              salaryPreference: app.candidate.salaryPreference,
              employmentType: app.candidate.jobTypePreference,
              willingToRelocate: app.candidate.relocationWilling,
              visaStatus: app.candidate.visaStatus,
              workArrangement: app.candidate.remotePreference ? [app.candidate.remotePreference] : [],
            } : undefined,
          };
        });

        // Validate all mapped applications have valid statuses
        const invalidStatusApps = mappedApplications.filter(app => !app.status);
        if (invalidStatusApps.length > 0) {
          console.error(`[JobDetail] Found ${invalidStatusApps.length} applications with invalid/missing status:`, invalidStatusApps.map(app => ({ id: app.id, originalStatus: apiApplications.find(a => a.id === app.id)?.status })));
        }

        // Log status distribution for debugging
        const statusCounts = mappedApplications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`[JobDetail] Loaded ${mappedApplications.length} applications with status distribution:`, statusCounts);

        // Log ALL applications with their statuses to debug - EXPAND THIS IN CONSOLE
        console.group(`[JobDetail] All ${mappedApplications.length} applications with statuses:`);
        mappedApplications.forEach(app => {
          console.log(`${app.candidateName} (${app.id}): status="${app.status}"`);
        });
        console.groupEnd();

        // Log original API statuses before mapping - EXPAND THIS IN CONSOLE
        console.group(`[JobDetail] Original API statuses before mapping:`);
        apiApplications.forEach((app: any) => {
          console.log(`${app.candidate?.firstName || app.id}: originalStatus="${app.status}" (${typeof app.status}) → mapped="${mapApplicationStatus(app.status)}"`);
        });
        console.groupEnd();

        // Count how many applications should map to "applied"
        const shouldBeApplied = apiApplications.filter((app: any) => {
          const mapped = mapApplicationStatus(app.status);
          return mapped === 'applied';
        });
        console.log(`[JobDetail] Applications that should map to "applied": ${shouldBeApplied.length}`, shouldBeApplied.map((app: any) => ({ id: app.id, originalStatus: app.status })));

        setAllApplications(mappedApplications);
        setApplicantsCount(mappedApplications.length);
      } catch (err) {
        console.error("[JobDetail] Failed to load applications", err);
        setApplicantsCount(undefined);
        setAllApplications([]);
      }
    };

    loadApplications();
  }, [jobId, refreshKey]);

  const handleJobUpdate = async () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!job && !loading) {
    return <Navigate to="/ats/jobs" replace />;
  }

  if (loading || !job) {
    return (
      <DashboardPageLayout>
        <JobDetailPageSkeleton />
      </DashboardPageLayout>
    );
  }

  const activities = mockJobActivities.filter(a => a.jobId === job.id);

  const handleEditJob = () => {
    setEditDrawerOpen(true);
  };

  const handleToggleVisibility = async () => {
    if (!job || isTogglingVisibility) return;
    const newVisibility = job.visibility === 'private' ? 'public' : 'private';
    setIsTogglingVisibility(true);
    try {
      const res = await jobService.updateJob(job.id, { visibility: newVisibility } as any);
      if (res.success) {
        toast({
          title: newVisibility === 'private' ? 'Job set to Private' : 'Job set to Public',
          description: newVisibility === 'private'
            ? 'Only invited candidates can view and apply to this job.'
            : 'This job is now listed on the public job board.',
        });
        handleJobUpdate();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to update visibility', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update visibility', variant: 'destructive' });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleArchive = async () => {
    if (!job) return;
    setIsProcessingArchive(true);
    try {
      const response = job.archived
        ? await jobService.unarchiveJob(job.id)
        : await jobService.archiveJob(job.id);

      if (response.success) {
        toast({
          title: job.archived ? "Job unarchived" : "Job archived",
          description: job.archived
            ? "The job has been restored to active listings."
            : "The job has been archived and hidden from active listings.",
        });
        handleJobUpdate();
        setArchiveDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || `Failed to ${job.archived ? 'unarchive' : 'archive'} job`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${job.archived ? 'unarchive' : 'archive'} job`,
        variant: "destructive",
      });
    } finally {
      setIsProcessingArchive(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    setIsProcessingDelete(true);
    try {
      const response = await jobService.deleteJob(job.id);
      if (response.success) {
        toast({
          title: "Job deleted",
          description: "The job posting has been permanently deleted.",
        });
        // Navigate back to jobs list after successful deletion
        navigate('/ats/jobs');
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete job",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleRevertVersion = (version: number) => {
    toast({
      title: "Version reverted",
      description: `Job reverted to version ${version}. Changes will be applied.`,
    });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardPageLayout fullWidth>
      <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex h-[calc(100vh-65px)] w-full">
        {/* Secondary Sidebar - Tabs */}
        <div className="w-56 border-r bg-muted/5 flex-shrink-0 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">Job Menu</h3>
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
              <TabsTrigger
                value="overview"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
                asChild={false}
              >
                <List className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
                asChild={false}
              >
                <Users className="h-3.5 w-3.5" />
                Team
              </TabsTrigger>
              <TabsTrigger
                value="applicants"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <GitBranch className="h-3.5 w-3.5" />
                Pipeline
                {job.applicantsCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center">{job.applicantsCount}</Badge>
                )}
              </TabsTrigger>

              {/* Sub-navigation for Applicants */}
              {activeTab === 'applicants' && (
                <div className="flex flex-col gap-0.5 mt-0.5 mb-1 px-2 animate-in slide-in-from-top-1 duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveRoundTab('overview')}
                    className={`w-full justify-start pl-9 pr-3 py-1.5 text-xs rounded-md transition-colors ${
                      activeRoundTab === 'overview' ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Overview
                  </Button>
                  {rounds.map(round => (
                    <Button
                      key={round.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveRoundTab(round.id)}
                      className={`w-full justify-start pl-9 pr-3 py-1.5 text-xs rounded-md transition-colors ${
                        activeRoundTab === round.id ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="truncate">{round.name}</span>
                      <span className="ml-auto text-[10px] opacity-70">
                        {allApplications.filter(a => a.roundId === round.id).length}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
              <TabsTrigger
                value="screening"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <Inbox className="h-3.5 w-3.5" />
                AI Screening
              </TabsTrigger>
              <TabsTrigger
                value="candidates"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                Candidates
              </TabsTrigger>
              <TabsTrigger
                value="ai-interviews"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                Interviews
              </TabsTrigger>
              <TabsTrigger
                value="offers"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Offers
              </TabsTrigger>
              <TabsTrigger
                value="hired"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Hired
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="inbox"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <Inbox className="h-3.5 w-3.5" />
                Inbox
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="w-full justify-start gap-3 h-9 px-3 rounded-md text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-colors"
              >
                <MoreVertical className="h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="sourcing"
                className="hidden"
              >
                Sourcing
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto h-full bg-background p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <>
                <AtsPageHeader
                  title={job.title}
                  subtitle={`${job.employerName}${job.department ? ` • ${job.department}` : ''} • ${job.location}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <JobStatusBadge status={job.status} />
                      {job.assignedConsultantName ? (
                        <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                          Consultant: {job.assignedConsultantName}
                        </Badge>
                      ) : (
                        <ServiceTypeBadge type="self-managed" />
                      )}
                      {job.pipeline?.stage && (
                        <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                          Pipeline: {job.pipeline.stage.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/ats/jobs">
                        <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                        Back
                      </Link>
                    </Button>
                    <Button size="sm" onClick={handleEditJob}>
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </Button>

                    {/* Public / Private Toggle */}
                    <div className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-md border border-border bg-muted/30">
                      {job.visibility === 'private' ? (
                        <Lock className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <Globe2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className="text-xs font-medium whitespace-nowrap">
                        {job.visibility === 'private' ? 'Private' : 'Public'}
                      </span>
                      <Switch
                        checked={job.visibility === 'public'}
                        onCheckedChange={handleToggleVisibility}
                        disabled={isTogglingVisibility}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>

                    {/* Invite button — visible only for private jobs */}
                    {job.visibility === 'private' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => setTalentPoolDialogOpen(true)}
                      >
                        <Send className="h-3.5 w-3.5 mr-2" />
                        Invite
                      </Button>
                    )}
                    <JobLifecycleActions
                      job={job}
                      onJobUpdate={handleJobUpdate}
                      onEdit={handleEditJob}
                    />
                  </div>
                </AtsPageHeader>

                {/* Quick Stats */}
                <JobQuickStats
                  applicantsCount={job.applicantsCount}
                  viewsCount={job.viewsCount}
                  postingDate={job.postingDate}
                />
              </>
            )}

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="mt-3 space-y-3">
              {/* Payment Status - Show for paid packages */}
              {(job.serviceType !== 'self-managed' && job.serviceType !== 'rpo') && (
                <JobPaymentStatus job={job} onPaymentComplete={handleJobUpdate} />
              )}

              {/* Upgrade to Recruitment Service Banner for Self-Managed Jobs */}
              {job.serviceType === 'self-managed' && (job.status === 'open' || job.status === 'draft') && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ArrowUpCircle className="h-3.5 w-3.5 text-primary" />
                      Upgrade to HRM8 Recruitment Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Need additional support? Upgrade to one of our recruitment services to get expert help with candidate sourcing, screening, and hiring.
                    </p>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Professional candidate screening and evaluation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Dedicated recruitment consultant support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>End-to-end recruitment process management</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full h-8 text-xs"
                      onClick={() => setUpgradeServiceDialogOpen(true)}
                    >
                      <ArrowUpCircle className="h-3.5 w-3.5 mr-2" />
                      Upgrade to Recruitment Service
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 space-y-3">
                  {/* Job Details */}
                  <Card className="border-muted/60 shadow-none">
                  <CardHeader className="px-3 pt-3 pb-2">
                    <CardTitle className="text-xs font-semibold">Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 px-3 pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Arrangement:</span>
                          <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                            {job.workArrangement === 'on-site' ? 'On-site' : job.workArrangement === 'remote' ? 'Remote' : 'Hybrid'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Type:</span>
                          <EmploymentTypeBadge type={job.employmentType} />
                        </div>
                        {(job.salaryMin || job.salaryMax) && (
                          <div className="space-y-2 col-span-2">
                            <div className="flex items-center gap-2 text-xs">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">Salary:</span>
                              <span>{formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}</span>
                            </div>

                            {job.salaryDescription && (
                              <div className="ml-6 text-xs bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
                                <p className="text-foreground italic">
                                  💰 {job.salaryDescription}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Experience:</span>
                          <span>{formatExperienceLevel(job.experienceLevel)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Visibility:</span>
                          <Badge variant="outline" className="h-5 px-2 text-[10px] rounded-full capitalize">
                            {job.visibility}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">Service:</span>
                          <ServiceTypeBadge type={job.serviceType} />
                          {!job.serviceType || job.serviceType === 'self-managed' ? (
                            <span className="text-muted-foreground">Self-Managed</span>
                          ) : null}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Job Code</p>
                        <p className="font-mono text-xs font-medium">{job.jobCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Posted</p>
                        <p className="text-xs font-medium">{formatRelativeDate(job.postingDate)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card className="border-muted/60 shadow-none">
                  <CardHeader className="px-3 pt-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Description</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-3">
                      <div
                        className="prose prose-sm max-w-none text-xs leading-6"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                      />
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  <Card className="border-muted/60 shadow-none">
                  <CardHeader className="px-3 pt-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-3">
                      <ul className="space-y-1.5">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs">
                            <span className="text-primary mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Responsibilities */}
                  <Card className="border-muted/60 shadow-none">
                  <CardHeader className="px-3 pt-3 pb-2">
                    <CardTitle className="text-sm font-semibold">Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-3">
                      <ul className="space-y-1.5">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs">
                            <span className="text-primary mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Distribution */}
                  {job.jobBoardDistribution.length > 0 && (
                    <Card className="border-muted/60 shadow-none">
                      <CardHeader className="px-3 pt-3 pb-2">
                        <CardTitle className="text-sm font-semibold">Job Board Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-3">
                        <div className="flex flex-wrap gap-2">
                          {job.jobBoardDistribution.map((board) => (
                            <Badge key={board} variant="outline" className="h-5 px-2 text-[10px] rounded-full">
                              {board}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Activity Sidebar */}
                <div className="space-y-3">
                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 pt-0 px-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Total Views</span>
                        </div>
                        <span className="font-semibold">{job.viewsCount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                          <span>Apply Clicks</span>
                        </div>
                        <span className="font-semibold">{job.clicksCount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>Applicants</span>
                        </div>
                        <span className="font-semibold">{job.applicantsCount || 0}</span>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Posted</p>
                        <p className="text-xs font-medium">{formatRelativeDate(job.postingDate)}</p>
                      </div>
                      {job.closeDate && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Closed</p>
                          <p className="text-xs font-medium">{formatRelativeDate(job.closeDate)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-muted/60 shadow-none">
                    <CardHeader className="px-3 pt-3 pb-2">
                      <CardTitle className="text-sm font-semibold">Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <JobActivityFeed activities={activities} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Applicants Tab */}
            <TabsContent value="applicants" className="mt-2 space-y-2">
              {/* Action Bar */}
              <div className="flex items-center justify-end mb-4">
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => setTalentPoolDialogOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-2" />
                    Add Talent
                  </Button>
                </div>
              </div>

              {/* Content Area - Switched by Sidebar State */}
              {activeRoundTab === 'overview' ? (
                <div className="space-y-4">
                  {/* Filter Bar */}
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between">
                      <JobApplicationsFilterBar
                        filters={applicationsFilters}
                        onFiltersChange={setApplicationsFilters}
                        totalCount={allApplications.length}
                        filteredCount={filteredApplications.length}
                      />
                    </div>
                  </div>

                  <ApplicationPipeline
                    jobId={job.id}
                    jobTitle={job.title}
                    applications={filteredApplications}
                    enableMultiSelect={false}
                  />
                </div>
              ) : (
                // Round Detail View
                (() => {
                  const round = rounds.find(r => r.id === activeRoundTab);
                  if (!round) return null;
                  return (
                    <RoundDetailView
                      key={round.id}
                      jobId={job.id}
                      round={round}
                      applications={allApplications}
                      onRefresh={handleJobUpdate}
                      onApplicationClick={(app) => {
                        // We can open the drawer or some detailed view
                      }}
                      allRounds={rounds}
                      onMoveToRound={async (appId, roundId) => {
                        try {
                          const targetRound = rounds.find(r => r.id === roundId);
                          if (!targetRound) return;

                          const res = await applicationService.moveStage(appId, targetRound.name, roundId);
                          if (res.success) {
                            toast({ title: "Moved", description: "Candidate moved successfully" });
                            setRefreshKey(prev => prev + 1);
                          } else {
                            toast({ title: "Move Failed", description: res.error || "Failed to move candidate", variant: "destructive" });
                          }
                        } catch (e) {
                          console.error(e);
                          toast({ title: "Move Error", description: "An unexpected error occurred", variant: "destructive" });
                        }
                      }}
                      onMoveToNextRound={async (appId) => {
                        // Find current round index
                        const currentIndex = rounds.findIndex(r => r.id === round.id);
                        if (currentIndex === -1) {
                          toast({ title: "Error", description: `Current round not found in list. Round ID: ${round.id}`, variant: "destructive" });
                          return;
                        }
                        if (currentIndex === rounds.length - 1) {
                          toast({ title: "Info", description: "This is the last round. No next stage available.", variant: "default" });
                          return;
                        }

                        const nextRound = rounds[currentIndex + 1];
                        if (nextRound.fixedKey === "HIRED") {
                          toast({
                            title: "Use Offer Tab",
                            description: "Move candidate to Hired from the Offer onboarding flow.",
                            variant: "destructive",
                          });
                          return;
                        }
                        console.log(`[JobDetail] Moving app ${appId} from ${round.name} (${round.id}) to ${nextRound.name} (${nextRound.id})`);

                        const previousApplication = allApplications.find((a) => a.id === appId);
                        // Optimistic UI update for faster perceived movement
                        setAllApplications((prev) =>
                          prev.map((app) =>
                            app.id === appId
                              ? {
                                  ...app,
                                  roundId: nextRound.id,
                                  stage: app.stage,
                                }
                              : app
                          )
                        );

                        try {
                          const res = await applicationService.moveStage(appId, nextRound.name, nextRound.id);

                          if (res.success) {
                            toast({ title: "Success", description: `Candidate moved to ${nextRound.name}` });
                          } else {
                            // Rollback optimistic update
                            if (previousApplication) {
                              setAllApplications((prev) =>
                                prev.map((app) => (app.id === appId ? previousApplication : app))
                              );
                            }
                            console.error(`[JobDetail] Move failed:`, res);
                            toast({ title: "Move Failed", description: res.error || "Could not move candidate. Check console for details.", variant: "destructive" });
                          }
                        } catch (e: any) {
                          // Rollback optimistic update
                          if (previousApplication) {
                            setAllApplications((prev) =>
                              prev.map((app) => (app.id === appId ? previousApplication : app))
                            );
                          }
                          console.error(`[JobDetail] Exception during move:`, e);
                          toast({ title: "System Error", description: e.message || "Failed to move candidate", variant: "destructive" });
                        }
                      }}
                      onConfigureAssessment={handleConfigureAssessment}
                      onConfigureInterview={handleConfigureInterview}
                      onConfigureEmail={handleConfigureEmail}
                      isSimpleFlow={job?.setupType === 'simple'}
                    />
                  );
                })()
              )}
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="mt-2">
              <CandidatesTab
                applications={allApplications}
                jobId={job.id}
                jobTitle={job.title}
                rounds={rounds.map((round) => ({ id: round.id, name: round.name }))}
                onRefresh={handleJobUpdate}
              />
            </TabsContent>

            {/* AI Screening Tab */}
            <TabsContent value="screening" className="mt-6">
              <InitialScreeningTab
                jobId={job.id}
                jobTitle={job.title}
                jobRequirements={job.requirements}
                jobDescription={job.description}
                job={job}
              />
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="ai-interviews" className="h-full overflow-hidden p-6 pt-0">
              <JobAIInterviewsTab job={job} />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="offers" className="h-full overflow-hidden p-6 pt-0">
              <JobOffersTab
                jobId={job.id}
                jobTitle={job.title}
                applications={allApplications}
                rounds={rounds}
                onRefresh={handleJobUpdate}
              />
            </TabsContent>

            <TabsContent value="hired" className="h-full overflow-hidden p-6 pt-0">
              <JobOffersTab
                mode="hired"
                jobId={job.id}
                jobTitle={job.title}
                applications={allApplications}
                rounds={rounds}
                onRefresh={handleJobUpdate}
              />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="h-full overflow-hidden p-6 pt-0">
              <JobTasksTab job={job} applications={allApplications} onRefresh={handleJobUpdate} />
            </TabsContent>

            <TabsContent value="inbox" className="h-full overflow-hidden p-6 pt-0">
              <JobInboxTab jobId={job.id} jobTitle={job.title} applications={allApplications} />
            </TabsContent>

            <TabsContent value="messages" className="h-full overflow-hidden p-6 pt-0">
              <div className="h-full flex flex-col gap-4">
                <div className="flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                    <p className="text-muted-foreground">Manage communications with candidates</p>
                  </div>
                </div>
                {job.id && <JobMessagesTab jobId={job.id} />}
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-6 space-y-6">
              <HiringTeamTab jobId={job.id} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              {/* Job Board Visibility Control */}
              <JobBoardVisibilityControl job={job} onUpdate={handleJobUpdate} />
              <JobBudgetTracker jobId={job.id} />

              {!job.hasJobTargetPromotion && (job.serviceType === 'self-managed' || job.serviceType === 'rpo') && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Megaphone className="h-3.5 w-3.5 text-primary" />
                      Promote to External Job Boards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Maximize your job's reach by promoting it to 50M+ candidates across major job boards like Indeed, LinkedIn, and Glassdoor.
                    </p>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Get 3-5x more qualified applicants</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Reduce time-to-hire with broader exposure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Flexible budget options starting from $500</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full h-8 text-xs"
                      onClick={() => setPromotionDialogOpen(true)}
                    >
                      <Megaphone className="h-3.5 w-3.5 mr-2" />
                      Promote to External Job Boards
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Job Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={handleEditJob} className="w-full justify-start">
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Job Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setArchiveDialogOpen(true)}
                  >
                    {job.archived ? (
                      <>
                        <ArchiveRestore className="h-3.5 w-3.5 mr-2" />
                        Unarchive Job
                      </>
                    ) : (
                      <>
                        <Archive className="h-3.5 w-3.5 mr-2" />
                        Archive Job
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Job
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Round Configuration Drawer (unified) */}
      <RoundConfigDrawer
        open={configDrawerOpen}
        onOpenChange={(open) => {
          setConfigDrawerOpen(open);
          if (!open) setSelectedRoundForConfig(null);
        }}
        jobId={jobId || ''}
        round={selectedRoundForConfig}
        jobTitle={job?.title}
        initialTab={initialConfigTab}
        onSuccess={handleJobUpdate}
      />

      {/* Job Edit Drawer */}
      {jobId && (
        <JobEditDrawer
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          jobId={jobId}
          onSuccess={handleJobUpdate}
        />
      )}

      <ExternalPromotionDialog
        open={promotionDialogOpen}
        onOpenChange={setPromotionDialogOpen}
        job={job}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />

      <UpgradeServiceDialog
        open={upgradeServiceDialogOpen}
        onServiceTypeSelect={async (serviceType) => {
          // Handle service upgrade - this will be implemented in the upgrade flow
          toast({
            title: "Service upgrade initiated",
            description: `Upgrade to ${serviceType === 'shortlisting' ? 'Shortlisting Service' : serviceType === 'full-service' ? 'Full Recruitment Service' : 'Executive Search'} has been initiated.`,
          });
          setUpgradeServiceDialogOpen(false);
          handleJobUpdate();
        }}
        onCancel={() => setUpgradeServiceDialogOpen(false)}
      />

      {/* Archive/Unarchive Dialog */}
      {job && (
        <ArchiveJobDialog
          open={archiveDialogOpen}
          onOpenChange={setArchiveDialogOpen}
          job={job}
          onConfirm={handleArchive}
          isProcessing={isProcessingArchive}
          isArchive={!job.archived}
        />
      )}

      {/* Delete Job Dialog */}
      {job && (
        <DeleteJobDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          job={job}
          onConfirm={handleDelete}
          isProcessing={isProcessingDelete}
        />
      )}

      {/* Talent Pool Search Dialog */}
      {job && (
        <TalentPoolSearchDialog
          open={talentPoolDialogOpen}
          onOpenChange={setTalentPoolDialogOpen}
          jobId={job.id}
          jobTitle={job.title}
          onCandidateAdded={() => {
            setRefreshKey(prev => prev + 1);
            // Refresh applicants count
            const loadCount = async () => {
              try {
                const res = await applicationService.getJobApplications(job.id);
                const list = res.data?.applications || [];
                setApplicantsCount(list.length);
              } catch (err) {
                console.error("[JobDetail] Failed to load applicants count", err);
              }
            };
            loadCount();
          }}
        />
      )}

    </DashboardPageLayout>
  );
}
