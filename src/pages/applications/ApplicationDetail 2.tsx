import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { applicationService, Application as RawApplication } from "@/shared/lib/applicationService";
import { format } from "date-fns";

export default function ApplicationDetail() {
  const { id, jobId } = useParams<{ id: string; jobId?: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<RawApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await applicationService.getApplicationForAdmin(id);
        console.log('[ATS ApplicationDetail] getApplicationForAdmin response', res);

        if (!res.success) {
          setApplication(null);
          setError(res.error || "Unable to load application.");
          return;
        }

        setApplication(res.data?.application || null);
      } catch (e: any) {
        console.error("Failed to load application (admin)", e);
        setApplication(null);
        setError("Unable to load application.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

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

  const body = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error || !application) {
      return (
        <div className="py-16 text-center space-y-4">
          <p className="text-muted-foreground">
            {error || "Application not found or no longer available."}
          </p>
        </div>
      );
    }

    const q = application.questionnaireData || {};
    const createdAt = application.appliedDate || application.createdAt;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {q.jobMeta?.title || "Application"} –{" "}
              {application.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Applied{" "}
              {createdAt
                ? format(new Date(createdAt), "PPP p")
                : "Unknown date"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {renderStatus(application.status)}
            {application.stage && (
              <Badge variant="outline" className="text-xs">
                {application.stage}
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidate</CardTitle>
            <CardDescription>
              {q.candidateName || "Unknown Candidate"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {q.candidateEmail && (
              <p>
                <span className="font-medium">Email:</span>{" "}
                {q.candidateEmail}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents & Links</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="font-medium">Resume:</span>{" "}
              {application.resumeUrl ? "Uploaded (mock)" : "Not provided"}
            </p>
            <p>
              <span className="font-medium">Cover Letter:</span>{" "}
              {q.coverLetterMarkdown ? "Provided" : "Not provided"}
            </p>
            {application.portfolioUrl && (
              <p>
                <span className="font-medium">Portfolio:</span>{" "}
                "Uploaded (mock)"
              </p>
            )}
            {application.linkedInUrl && (
              <p>
                <span className="font-medium">LinkedIn:</span>{" "}
                <a
                  href={application.linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  {application.linkedInUrl}
                </a>
              </p>
            )}
            {application.websiteUrl && (
              <p>
                <span className="font-medium">Website:</span>{" "}
                <a
                  href={application.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  {application.websiteUrl}
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        {q.coverLetterMarkdown && (
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md">
                {q.coverLetterMarkdown}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (jobId) {
              navigate(`/ats/jobs/${jobId}/applications`);
            } else {
              navigate(-1);
            }
          }}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        {body()}
      </div>
    </DashboardPageLayout>
  );
}


