import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { EmailLogsList } from '@/components/emails/EmailLogsList';
import { ScheduledEmailsList } from '@/components/emails/ScheduledEmailsList';
import { DraftEmailsList } from '@/components/emails/DraftEmailsList';
import { EmailAnalytics } from '@/components/emails/EmailAnalytics';
import { ScheduleEmailDialog } from '@/components/emails/ScheduleEmailDialog';
import { EmailDetailDialog } from '@/components/emails/EmailDetailDialog';
import { EmailFilters, EmailFilterState } from '@/components/emails/EmailFilters';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Mail, Clock, Eye, MousePointerClick, Plus, FileText } from 'lucide-react';
import { getEmailStats, getRecentEmails, getScheduledEmails, getDraftEmails, saveEmailLog, deleteEmailLog, getFilteredEmails } from '@/shared/lib/emailTrackingStorage';
import { EmailLog } from '@/shared/types/emailTracking';
import { toast } from 'sonner';

export default function EmailCenter() {
  const [stats, setStats] = useState(getEmailStats());
  const [recentEmails, setRecentEmails] = useState(getRecentEmails());
  const [scheduledEmails, setScheduledEmails] = useState(getScheduledEmails());
  const [draftEmails, setDraftEmails] = useState(getDraftEmails());
  const [filteredEmails, setFilteredEmails] = useState<EmailLog[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailLog | null>(null);
  const [detailEmail, setDetailEmail] = useState<EmailLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<EmailFilterState>({});

  const refreshData = () => {
    setStats(getEmailStats());
    setRecentEmails(getRecentEmails());
    setScheduledEmails(getScheduledEmails());
    setDraftEmails(getDraftEmails());
    if (Object.keys(activeFilters).length > 0) {
      setFilteredEmails(getFilteredEmails(activeFilters));
    }
  };

  const handleScheduleEmail = (emailData: Omit<EmailLog, 'id' | 'createdAt'>) => {
    const newEmail: EmailLog = {
      ...emailData,
      id: editingEmail?.id || Date.now().toString(),
      createdAt: editingEmail?.createdAt || new Date().toISOString(),
    };
    saveEmailLog(newEmail);
    toast.success(editingEmail ? 'Email updated successfully' : 'Email scheduled successfully');
    setEditingEmail(null);
    refreshData();
  };

  const handleEditEmail = (email: EmailLog) => {
    setEditingEmail(email);
    setScheduleDialogOpen(true);
  };

  const handleCancelEmail = (email: EmailLog) => {
    deleteEmailLog(email.id);
    toast.success('Email cancelled successfully');
    refreshData();
  };

  const handleDeleteDraft = (email: EmailLog) => {
    deleteEmailLog(email.id);
    toast.success('Draft deleted successfully');
    refreshData();
  };

  const handleSendDraft = (email: EmailLog) => {
    const updatedEmail: EmailLog = {
      ...email,
      status: 'scheduled',
      scheduledFor: new Date().toISOString(),
    };
    saveEmailLog(updatedEmail);
    toast.success('Draft scheduled for sending');
    refreshData();
  };

  const handleViewDetails = (email: EmailLog) => {
    setDetailEmail(email);
    setDetailDialogOpen(true);
  };

  const handleFilterChange = (filters: EmailFilterState) => {
    setActiveFilters(filters);
    setFilteredEmails(getFilteredEmails(filters));
  };

  const handleCloseScheduleDialog = (open: boolean) => {
    setScheduleDialogOpen(open);
    if (!open) {
      setEditingEmail(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Center</h1>
          <p className="text-muted-foreground">Manage and track all email communications</p>
        </div>
        <Button onClick={() => setScheduleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Email
        </Button>
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <EnhancedStatCard
            title="Total Sent"
            value={stats.totalSent.toString()}
            icon={<Mail className="h-6 w-6" />}
            change=""
            variant="neutral"
          />
          <EnhancedStatCard
            title="Open Rate"
            value={`${stats.openRate.toFixed(1)}%`}
            icon={<Eye className="h-6 w-6" />}
            change=""
            variant="primary"
          />
          <EnhancedStatCard
            title="Click Rate"
            value={`${stats.clickRate.toFixed(1)}%`}
            icon={<MousePointerClick className="h-6 w-6" />}
            change=""
            variant="success"
          />
          <EnhancedStatCard
            title="Scheduled"
            value={scheduledEmails.length.toString()}
            icon={<Clock className="h-6 w-6" />}
            change=""
            variant="warning"
          />
          <EnhancedStatCard
            title="Drafts"
            value={draftEmails.length.toString()}
            icon={<FileText className="h-6 w-6" />}
            change=""
            variant="neutral"
          />
        </div>

        {/* Analytics Charts */}
        <EmailAnalytics stats={stats} />

        {/* Email Lists */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Emails</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="filtered">Advanced Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <EmailLogsList emails={recentEmails} onViewDetails={handleViewDetails} />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <ScheduledEmailsList
              emails={scheduledEmails}
              onEdit={handleEditEmail}
              onCancel={handleCancelEmail}
            />
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <DraftEmailsList
              emails={draftEmails}
              onEdit={handleEditEmail}
              onDelete={handleDeleteDraft}
              onSend={handleSendDraft}
            />
          </TabsContent>

          <TabsContent value="filtered" className="space-y-4">
            <EmailFilters onFilterChange={handleFilterChange} />
            <EmailLogsList emails={filteredEmails} onViewDetails={handleViewDetails} />
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleEmailDialog
        open={scheduleDialogOpen}
        onOpenChange={handleCloseScheduleDialog}
        onSchedule={handleScheduleEmail}
        initialData={editingEmail || undefined}
      />

      <EmailDetailDialog
        email={detailEmail}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
