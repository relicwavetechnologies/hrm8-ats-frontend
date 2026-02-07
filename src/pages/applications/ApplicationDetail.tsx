import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { applicationService, Application as RawApplication } from "@/shared/lib/applicationService";
import { messagingService } from "@/shared/services/messagingService";
import { format } from "date-fns";
import { ApplicationStatusBadge } from "@/modules/applications/components/ApplicationStatusBadge";
import { DetailSkeleton } from "@/shared/components/skeletons/DetailSkeleton";
import { DocumentViewer } from "@/modules/candidates/components/DocumentViewer";
import { CandidateDocument } from "@/shared/types/entities";
import { ApproveHireDialog } from "@/modules/applications/components/ApproveHireDialog";

export default function ApplicationDetail() {
  const { id, jobId } = useParams<{ id: string; jobId?: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<RawApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<CandidateDocument | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);

  const handleViewResume = async () => {
    if (!id) return;
    setIsLoadingResume(true);
    try {
      const res = await applicationService.getApplicationResume(id);
      if (res.success && res.data) {
        // Adapt response to CandidateDocument
        const doc: CandidateDocument = {
          id: res.data.id,
          candidateId: res.data.candidateId,
          documentType: 'resume',
          fileName: res.data.fileName,
          fileUrl: res.data.fileUrl,
          fileSize: res.data.fileSize,
          uploadedBy: res.data.uploadedBy || 'Candidate',
          uploadedAt: new Date(res.data.uploadedAt),
          content: res.data.content
        };
        setViewingDocument(doc);
      } else {
        console.error("Failed to load resume");
      }
    } catch (e) {
      console.error("Error loading resume:", e);
    } finally {
      setIsLoadingResume(false);
    }
  };

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
      } catch (e) {
        console.error("Failed to load application (admin)", e);
        setApplication(null);
        setError("Unable to load application.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const body = () => {
    if (isLoading) {
      return <DetailSkeleton />;
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
        <AtsPageHeader
          title={`${q.jobMeta?.title || "Application"} – ${application.id.slice(0, 8)}`}
          subtitle={`Applied ${createdAt ? format(new Date(createdAt), "PPP p") : "Unknown date"}`}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <ApplicationStatusBadge status={application.status} />
              {application.stage && (
                <Badge variant="outline" className="text-xs">
                  {application.stage}
                </Badge>
              )}
            </div>

            {/* Show Approve Hire action for HIRED applications */}
            {application.status === 'HIRED' && (
              <ApproveHireDialog
                applicationId={application.id}
                candidateName={q.candidateName || "Candidate"}
                jobTitle={q.jobMeta?.title || "Job"}
                onSuccess={() => window.location.reload()}
              />
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!application.candidateId || !jobId) return;

                try {
                  // Create or get existing conversation
                  const res = await messagingService.createConversation({
                    participantId: application.candidateId,
                    participantType: 'CANDIDATE',
                    jobId: jobId,
                    subject: `Regarding your application for ${q.jobMeta?.title || 'Role'}`
                  });

                  if (res.success && res.data) {
                    navigate(`/jobs/${jobId}?tab=messages&conversationId=${res.data.id}`);
                  }
                } catch (e) {
                  console.error("Failed to start conversation", e);
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (jobId) {
                  navigate(`/ats/jobs/${jobId}/applications`);
                } else {
                  navigate(-1);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </AtsPageHeader>

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
            <div className="flex items-center gap-2">
              <span className="font-medium">Resume:</span>{" "}
              {application.resumeUrl ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Uploaded</span>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={handleViewResume}
                    disabled={isLoadingResume}
                  >
                    {isLoadingResume ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    View & Annotate
                  </Button>
                </div>
              ) : (
                "Not provided"
              )}
            </div>
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

        {
          q.coverLetterMarkdown && (
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
          )
        }
      </div >
    );
  };

  return (
    <DashboardPageLayout>
      <div className="p-6">
        {body()}
      </div>
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </DashboardPageLayout>
  );
}


