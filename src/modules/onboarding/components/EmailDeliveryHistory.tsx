import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getSentEmails, markEmailAsOpened, markEmailAsClicked, type ScheduledEmail } from "@/shared/lib/scheduledEmails";
import { format } from "date-fns";
import { Mail, CheckCircle2, XCircle, AlertCircle, Eye, MousePointerClick, Calendar } from "lucide-react";
import { toast } from "sonner";

export function EmailDeliveryHistory() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const sentEmails = useMemo(() => getSentEmails(), []);

  const filteredEmails = useMemo(() => {
    if (filterStatus === "all") return sentEmails;
    return sentEmails.filter(email => email.deliveryStatus === filterStatus);
  }, [sentEmails, filterStatus]);

  const stats = useMemo(() => {
    const delivered = sentEmails.filter(e => e.deliveryStatus === 'delivered').length;
    const failed = sentEmails.filter(e => e.deliveryStatus === 'failed').length;
    const bounced = sentEmails.filter(e => e.deliveryStatus === 'bounced').length;
    const opened = sentEmails.filter(e => e.openedAt).length;
    const clicked = sentEmails.filter(e => e.clickedAt).length;
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0';
    const clickRate = delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : '0';

    return { delivered, failed, bounced, opened, clicked, openRate, clickRate };
  }, [sentEmails]);

  const getDeliveryStatusBadge = (email: ScheduledEmail) => {
    switch (email.deliveryStatus) {
      case 'delivered':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      case 'bounced':
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Bounced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleSimulateOpen = (id: string) => {
    markEmailAsOpened(id);
    toast.success("Email marked as opened");
    window.location.reload();
  };

  const handleSimulateClick = (id: string) => {
    markEmailAsClicked(id);
    toast.success("Email marked as clicked");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentEmails.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sentEmails.length > 0 ? ((stats.delivered / sentEmails.length) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{stats.delivered} delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.opened} opened</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.clicked} clicked</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Delivery History</CardTitle>
              <CardDescription>Track when emails were sent and their engagement</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sent emails found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmails.map((email) => (
                  <Card key={email.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{email.emailType}</h4>
                              {getDeliveryStatusBadge(email)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{email.message}</p>
                          </div>
                        </div>
                        
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Sent: {email.sentAt ? format(new Date(email.sentAt), 'PPp') : 'Unknown'}</span>
                          </div>
                          
                          {email.openedAt && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Eye className="h-4 w-4" />
                              <span>Opened: {format(new Date(email.openedAt), 'PPp')}</span>
                            </div>
                          )}
                          
                          {email.clickedAt && (
                            <div className="flex items-center gap-2 text-purple-600">
                              <MousePointerClick className="h-4 w-4" />
                              <span>Clicked: {format(new Date(email.clickedAt), 'PPp')}</span>
                            </div>
                          )}
                          
                          <div className="text-muted-foreground">
                            Recipients: {email.recipientCount}
                          </div>
                        </div>

                        {/* Simulate actions (for demo purposes) */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSimulateOpen(email.id)}
                            disabled={!!email.openedAt}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Simulate Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSimulateClick(email.id)}
                            disabled={!!email.clickedAt}
                            className="gap-1"
                          >
                            <MousePointerClick className="h-3 w-3" />
                            Simulate Click
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
