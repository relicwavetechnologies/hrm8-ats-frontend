import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ActivityTimeline } from './ActivityTimeline';
import { getCandidateHistory } from '@/shared/lib/mockCandidateHistory';
import { History, Download } from 'lucide-react';
import { DateRangePicker } from '@/shared/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface HistoryTabProps {
  candidateId: string;
}

export function HistoryTab({ candidateId }: HistoryTabProps) {
  const [history, setHistory] = useState(getCandidateHistory(candidateId));
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleExport = () => {
    const csv = [
      ['Event', 'Description', 'User', 'Date'],
      ...filteredHistory.map((event) => [
        event.title,
        event.description || '',
        event.userName || '',
        event.timestamp.toISOString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `candidate-history-${candidateId}.csv`;
    link.click();
  };

  const filteredHistory = history.filter((event) => {
    const matchesType = filterType === 'all' || event.eventType === filterType;
    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (event.timestamp >= dateRange.from && event.timestamp <= dateRange.to);
    return matchesType && matchesDateRange;
  });

  if (history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Activity Yet"
        description="Activity history will appear here as actions are taken on this candidate"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="status_change">Status Changes</SelectItem>
              <SelectItem value="job_application">Job Applications</SelectItem>
              <SelectItem value="interview">Interviews</SelectItem>
              <SelectItem value="email_sent">Emails</SelectItem>
              <SelectItem value="note_added">Notes</SelectItem>
              <SelectItem value="document_uploaded">Documents</SelectItem>
              <SelectItem value="profile_updated">Profile Updates</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker date={dateRange} onDateChange={setDateRange} />

          <div className="flex-1" />

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>
      </Card>

      {/* Timeline */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Events Found"
          description="Try adjusting your filters to see more events"
        />
      ) : (
        <Card className="p-6">
          <ActivityTimeline events={filteredHistory} />
        </Card>
      )}
    </div>
  );
}