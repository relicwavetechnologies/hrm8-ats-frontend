import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationService, Application as RawApplication } from "@/shared/lib/applicationService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Loader2, User2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobApplicantsListProps {
  jobId: string;
}

interface JobApplicantRow {
  id: string;
  candidateName: string;
  candidateEmail: string;
  appliedDate: string;
  status: string;
  stage: string;
}

export function JobApplicantsList({ jobId }: JobApplicantsListProps) {
  const [rows, setRows] = useState<JobApplicantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await applicationService.getJobApplications(jobId);
        const apps: RawApplication[] = res.data?.applications || [];
        const mapped: JobApplicantRow[] = apps.map((app: any) => ({
          id: app.id,
          candidateName:
            app.candidate?.firstName && app.candidate?.lastName
              ? `${app.candidate.firstName} ${app.candidate.lastName}`
              : "Unknown Candidate",
          candidateEmail: app.candidate?.email || "",
          appliedDate: app.appliedDate,
          status: app.status,
          stage: app.stage,
        }));
        setRows(mapped);
      } catch {
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [jobId]);

  const renderStatus = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="default">New</Badge>;
      case "SCREENING":
        return <Badge variant="secondary">Screening</Badge>;
      case "INTERVIEW":
        return <Badge variant="outline">Interview</Badge>;
      case "OFFER":
        return <Badge className="bg-green-500">Offer</Badge>;
      case "HIRED":
        return <Badge className="bg-green-600">Hired</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "WITHDRAWN":
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">All Applicants</CardTitle>
          <CardDescription>List of all candidates who applied to this job</CardDescription>
        </div>
        <Badge variant="outline" className="rounded-full">
          {rows.length} applicant{rows.length !== 1 ? "s" : ""}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <User2 className="h-8 w-8 opacity-50" />
            <p>No applicants yet for this job.</p>
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {rows.map((row) => (
              <Button
                key={row.id}
                type="button"
                variant="ghost"
                className="w-full flex items-center justify-between px-4 py-3 h-auto text-left hover:bg-muted/50 transition-colors justify-start rounded-none"
                onClick={() => navigate(`/jobs/${jobId}/applications/${row.id}`)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {row.candidateName}
                    </span>
                    {renderStatus(row.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applied{" "}
                    {row.appliedDate
                      ? formatDistanceToNow(new Date(row.appliedDate), {
                          addSuffix: true,
                        })
                      : "Unknown time"}
                  </p>
                  {row.candidateEmail && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {row.candidateEmail}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


