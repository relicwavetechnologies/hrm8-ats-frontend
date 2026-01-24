import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/components/layouts/AtsPageHeader';
import { AIInterviewList } from '@/components/aiInterview/common/AIInterviewList';
import { Button } from '@/shared/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { initializeAIInterviewMockData } from '@/shared/lib/aiInterview/initializeMockData';
import { DataResetButton } from '@/components/dev/DataResetButton';
import type { AIInterviewSession } from '@/shared/types/aiInterview';

export default function AIInterviews() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize comprehensive mock data on first load
    initializeAIInterviewMockData();
  }, []);

  const sessions = getAIInterviewSessions();

  const handleViewDetails = (session: AIInterviewSession) => {
    navigate(`/ai-interviews/${session.id}`);
  };

  const handleStartInterview = (session: AIInterviewSession) => {
    navigate(`/ai-interviews/session/${session.invitationToken}`);
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader title="AI Interviews" subtitle="AI-powered interviews for efficient candidate screening">
          <div className="flex gap-2 items-center">
            <DataResetButton />
            <Button variant="outline" onClick={() => navigate('/dashboard/addons?tab=ai-interviews')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/ai-interviews/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => navigate('/ai-interviews/schedule')}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </AtsPageHeader>

        <div className="overflow-x-auto -mx-1 px-1">
          <AIInterviewList
            sessions={sessions}
            onViewDetails={handleViewDetails}
            onStartInterview={handleStartInterview}
          />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
