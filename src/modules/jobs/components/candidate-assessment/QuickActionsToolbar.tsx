import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Application } from "@/shared/types/application";
import {
  Mail,
  Calendar,
  ClipboardCheck,
  Shield,
  FileText,
  GitCompare,
  Download,
  MoreHorizontal,
  Send,
  UserX,
  ArrowRight,
  Briefcase,
  MessageSquare, // Added MessageSquare
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { messagingService } from "@/shared/services/messagingService";

interface QuickActionsToolbarProps {
  application: Application;
  nextStageName?: string;
  onNextStage?: () => void;
}

export function QuickActionsToolbar({ application, nextStageName, onNextStage }: QuickActionsToolbarProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    toast({
      title: `${action} - Coming Soon`,
      description: `This feature will be implemented in the next phase.`,
    });
  };

  return (
    <div className="px-6 pb-4 border-b bg-muted/20">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Next Stage Button (Replaces Move Dropdown) */}
        {nextStageName && onNextStage && (
          <Button
            variant="default"
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={onNextStage}
          >
            <ArrowRight className="h-4 w-4" />
            Move to {nextStageName}
          </Button>
        )}

        {/* Schedule Interview */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Schedule Interview")}
        >
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>

        {/* Send Email */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Send Email")}
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>

        {/* Message Candidate */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={async () => {
            // Robust extraction of IDs
            const candidateId = application.candidateId ||
              (application as any).candidate?.id ||
              (application as any).candidate_id;

            const jobId = application.jobId ||
              (application as any).job?.id ||
              (application as any).job_id;

            console.log('[QuickActionsToolbar] Message clicked', {
              candidateId,
              jobId,
              rawCandidateId: application.candidateId,
              rawJobId: application.jobId,
              fullObject: JSON.stringify(application)
            });

            if (!candidateId || !jobId) {
              console.error('[QuickActionsToolbar] Missing IDs', application);
              toast({
                title: "Cannot Start Conversation",
                description: !candidateId
                  ? "This application is not linked to a registered candidate account."
                  : "Missing job information.",
                variant: "destructive"
              });
              return;
            }

            try {
              const res = await messagingService.createConversation({
                participantId: candidateId,
                participantType: 'CANDIDATE',
                participantEmail: application.candidateEmail,
                participantName: application.candidateName,
                jobId: jobId,
                subject: `Regarding your application for ${application.jobTitle || 'Role'}`
              });
              console.log('[QuickActionsToolbar] Create conversation result:', res);

              if (res.success && res.data) {
                const url = `/ats/jobs/${jobId}?tab=messages&conversationId=${res.data.id}`;
                console.log('[QuickActionsToolbar] Navigating to:', url);
                navigate(url);
              } else {
                console.error('[QuickActionsToolbar] Failed to create conversation:', res);
                toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
              }
            } catch (e) {
              console.error('[QuickActionsToolbar] Exception:', e);
              toast({ title: "Error", description: "An error occurred", variant: "destructive" });
            }
          }}
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>

        {/* Assign Assessment */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Assign Assessment")}
        >
          <ClipboardCheck className="h-4 w-4" />
          Assign Assessment
        </Button>

        {/* Request Background Check */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Background Check")}
        >
          <Shield className="h-4 w-4" />
          Background Check
        </Button>

        {/* Make Offer (conditional) */}
        {(application.stage === "Final Round" || application.stage === "Reference Check") && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => handleAction("Make Offer")}
          >
            <Briefcase className="h-4 w-4" />
            Make Offer
          </Button>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MoreHorizontal className="h-4 w-4" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleAction("Add to Compare")}>
              <GitCompare className="h-4 w-4 mr-2" />
              Add to Compare
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Export Profile")}>
              <Download className="h-4 w-4 mr-2" />
              Export Profile (PDF)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Send to Client")}>
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Generate Report")}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction("Reject Candidate")}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <UserX className="h-4 w-4 mr-2" />
              Reject Candidate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
