import { useState, useEffect } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Building2, MapPin, Briefcase, TrendingUp } from "lucide-react";
import { getJobs } from "@/shared/lib/mockJobStorage";
import { Job } from "@/modules/jobs/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { InternalApplicationForm } from "@/modules/jobs/components/InternalApplicationForm";
import { toast } from "@/shared/hooks/use-toast";
import { InternalJobBadge } from "@/modules/jobs/components/InternalJobBadge";

export default function InternalJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    loadInternalJobs();
  }, []);

  const loadInternalJobs = () => {
    const allJobs = getJobs();
    const internalJobs = allJobs.filter(job => job.internalOnly || job.isInternal);
    setJobs(internalJobs);
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
  };

  const handleSubmitApplication = (data: any) => {
    setIsApplicationOpen(false);
    toast({
      title: "Application Submitted",
      description: "Your internal transfer application has been submitted successfully.",
    });
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader title="Internal Opportunities" subtitle="Explore career growth within the organization">
          <div className="hidden" />
        </AtsPageHeader>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-8 w-8 text-primary mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Why Transfer Internally?</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Faster hiring process - your history is already known</li>
                <li>• Maintain benefits and seniority</li>
                <li>• Explore new career paths without leaving the company</li>
                <li>• Priority consideration over external candidates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <CardTitle className="text-base font-semibold">{job.title}</CardTitle>
                      <InternalJobBadge internalOnly={job.internalOnly} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <Badge variant="outline">{job.workArrangement}</Badge>
                    </div>
                  </div>
                  <Button onClick={() => handleApply(job)}>
                    Apply Internally
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
                {job.eligibleDepartments && job.eligibleDepartments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Eligible Departments:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.eligibleDepartments.map((dept, index) => (
                        <Badge key={index} variant="secondary">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {jobs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Internal Opportunities</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for new internal job postings
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Internal Transfer Application</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <InternalApplicationForm
                jobTitle={selectedJob.title}
                currentPosition="Current Position"
                currentDepartment="Current Department"
                onSubmit={handleSubmitApplication}
                onCancel={() => setIsApplicationOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageLayout>
  );
}
