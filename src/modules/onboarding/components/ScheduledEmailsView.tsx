import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Calendar, Clock, Mail, Trash2, Eye, X, Edit } from "lucide-react";
import { 
  getScheduledEmails, 
  cancelScheduledEmail, 
  deleteScheduledEmail,
  ScheduledEmail 
} from "@/shared/lib/scheduledEmails";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";
import { OnboardingWorkflow } from "@/shared/types/onboarding";

interface ScheduledEmailsViewProps {
  onEdit: (email: ScheduledEmail) => void;
  allWorkflows: OnboardingWorkflow[];
}

export function ScheduledEmailsView({ onEdit, allWorkflows }: ScheduledEmailsViewProps) {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(null);
  const { toast } = useToast();

  const loadScheduledEmails = () => {
    setScheduledEmails(getScheduledEmails());
  };

  useEffect(() => {
    loadScheduledEmails();
    // Refresh every 30 seconds to update status
    const interval = setInterval(loadScheduledEmails, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelEmail = (email: ScheduledEmail) => {
    setSelectedEmail(email);
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    if (!selectedEmail) return;
    
    cancelScheduledEmail(selectedEmail.id);
    loadScheduledEmails();
    setShowCancelDialog(false);
    setSelectedEmail(null);
    
    toast({
      title: "Email cancelled",
      description: "The scheduled email has been cancelled.",
    });
  };

  const handleDeleteEmail = (emailId: string) => {
    deleteScheduledEmail(emailId);
    loadScheduledEmails();
    
    toast({
      title: "Email deleted",
      description: "The scheduled email has been removed.",
    });
  };

  const handleViewDetails = (email: ScheduledEmail) => {
    setSelectedEmail(email);
    setShowDetailsDialog(true);
  };

  const pendingEmails = scheduledEmails.filter(e => e.status === 'pending');
  const pastEmails = scheduledEmails.filter(e => e.status !== 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Sent</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Scheduled Emails</h3>
          {pendingEmails.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No scheduled emails. Schedule an email from the bulk actions menu.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingEmails.map((email) => (
                <Card key={email.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{email.emailType}</span>
                          {getStatusBadge(email.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(email.scheduledFor, "PPP")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(email.scheduledFor, "p")}
                          </div>
                          <div>
                            To: {email.recipientCount} recipient{email.recipientCount > 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(email)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(email)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelEmail(email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {pastEmails.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">History</h3>
            <div className="space-y-3">
              {pastEmails.map((email) => (
                <Card key={email.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{email.emailType}</span>
                          {getStatusBadge(email.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(email.scheduledFor, "PPP")}
                          </div>
                          <div>
                            To: {email.recipientCount} recipient{email.recipientCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmail(email.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Email</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this scheduled email? The email will not be sent to the recipients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEmail(null)}>
              Keep Scheduled
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive hover:bg-destructive/90">
              Cancel Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scheduled Email Details</DialogTitle>
            <DialogDescription>
              Review the details of this scheduled email
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Email Type</div>
                <div>{selectedEmail.emailType}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div>{getStatusBadge(selectedEmail.status)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Scheduled For</div>
                <div className="flex items-center gap-4">
                  <span>{format(selectedEmail.scheduledFor, "PPP 'at' p")}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Recipients</div>
                <div>{selectedEmail.recipientCount} employee{selectedEmail.recipientCount > 1 ? 's' : ''}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Message</div>
                <div className="p-4 border rounded-md bg-muted/30 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedEmail.message}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Created</div>
                <div className="text-sm">{format(selectedEmail.createdAt, "PPP 'at' p")}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
