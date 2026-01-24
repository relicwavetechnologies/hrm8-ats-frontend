import { useState } from 'react';
import { AIInterviewSessionCard } from './AIInterviewSessionCard';
import type { AIInterviewSession, InterviewStatus } from '@/shared/types/aiInterview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';

interface AIInterviewListProps {
  sessions: AIInterviewSession[];
  onViewDetails?: (session: AIInterviewSession) => void;
  onStartInterview?: (session: AIInterviewSession) => void;
}

export function AIInterviewList({ sessions, onViewDetails, onStartInterview }: AIInterviewListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<InterviewStatus | 'all'>('all');

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getSessionsByStatus = (status: InterviewStatus) => {
    return sessions.filter(s => s.status === status);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by candidate or job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as InterviewStatus | 'all')}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({sessions.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({getSessionsByStatus('scheduled').length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({getSessionsByStatus('in-progress').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({getSessionsByStatus('completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({getSessionsByStatus('cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="mt-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No interviews found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map(session => (
                <AIInterviewSessionCard
                  key={session.id}
                  session={session}
                  onViewDetails={onViewDetails}
                  onStartInterview={onStartInterview}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
