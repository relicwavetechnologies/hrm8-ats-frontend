import { useParams, Link, Navigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { JobWizard } from "@/modules/jobs/components/JobWizard";
import { getJobById } from "@/shared/lib/mockJobStorage";

export default function JobEdit() {
  const { jobId } = useParams();
  const job = jobId ? getJobById(jobId) : null;

  if (!job) {
    return <Navigate to="/ats/jobs" replace />;
  }

  const defaultValues = {
    serviceType: job.serviceType,
    postAsHRM8: false,
    employerId: job.employerId,
    title: job.title,
    department: job.department,
    location: job.location,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    workArrangement: job.workArrangement || 'on-site',
    tags: job.tags || [],
    description: job.description,
    requirements: job.requirements.map((text, index) => ({
      id: `req-${Date.now()}-${index}`,
      text,
      order: index + 1,
    })),
    responsibilities: job.responsibilities.map((text, index) => ({
      id: `resp-${Date.now()}-${index}`,
      text,
      order: index + 1,
    })),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    salaryPeriod: job.salaryPeriod || 'annual' as const,
    salaryDescription: job.salaryDescription,
    hideSalary: !job.salaryMin && !job.salaryMax,
    closeDate: job.closeDate,
    visibility: job.visibility,
    stealth: job.stealth,
    status: job.status === 'draft' ? 'draft' as const : 'open' as const,
    jobBoardDistribution: job.jobBoardDistribution,
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/ats/jobs/${jobId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-muted-foreground">{job.title}</p>
          </div>
        </div>
        <JobWizard serviceType={job.serviceType} defaultValues={defaultValues} jobId={jobId} />
      </div>
    </DashboardPageLayout>
  );
}
