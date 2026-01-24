import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { JobApplicantsList } from "@/modules/applications/components/JobApplicantsList";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { jobService } from "@/shared/lib/jobService";
import { getJobById } from "@/shared/lib/mockJobStorage";
import { ListSkeleton } from "@/shared/components/skeletons/ListSkeleton";

export default function JobApplications() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        // Try to get from service first
        const response = await jobService.getJobById(jobId);
        if (response.success && response.data) {
          setJob(response.data);
        } else {
          // Fallback to mock storage if needed
          const mockJob = getJobById(jobId);
          if (mockJob) {
            setJob(mockJob);
          }
        }
      } catch (error) {
        console.error("Failed to fetch job", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <DashboardPageLayout>
        <ListSkeleton />
      </DashboardPageLayout>
    );
  }

  if (!jobId) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Job not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/ats/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Button>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Applications"
          subtitle={job ? `Manage applications for ${job.title}` : `Manage applications for Job ${jobId}`}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/ats/jobs/${jobId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job
              </Link>
            </Button>
          </div>
        </AtsPageHeader>

        <JobApplicantsList jobId={jobId} />
      </div>
    </DashboardPageLayout>
  );
}














































