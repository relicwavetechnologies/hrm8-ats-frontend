import { CollaborativeFeedbackPanel } from '@/components/feedback/CollaborativeFeedbackPanel';
import { FeedbackRequestDialog } from '@/components/feedback/FeedbackRequestDialog';
import { BulkFeedbackRequestDialog } from '@/components/feedback/BulkFeedbackRequestDialog';
import { FeedbackExporter } from '@/components/feedback/FeedbackExporter';
import { Card, CardContent } from '@/shared/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface CandidateFeedbackTabProps {
  candidateId: string;
  candidateName: string;
}

export function CandidateFeedbackTab({ candidateId, candidateName }: CandidateFeedbackTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Team Feedback & Evaluation</h3>
        </div>
        <div className="flex gap-2">
          <FeedbackExporter 
            candidateId={candidateId}
            candidateName={candidateName}
          />
          <FeedbackRequestDialog 
            candidateId={candidateId}
            candidateName={candidateName}
          />
          <BulkFeedbackRequestDialog 
            candidateId={candidateId}
            candidateName={candidateName}
          />
        </div>
      </div>
      
      <CollaborativeFeedbackPanel
        candidateId={candidateId}
        candidateName={candidateName}
      />
    </div>
  );
}
