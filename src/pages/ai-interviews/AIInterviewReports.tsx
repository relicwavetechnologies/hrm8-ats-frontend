import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { useInterviewReports } from '@/shared/hooks/useInterviewReports';
import { ReportSummaryCard } from '@/components/aiInterview/reports/ReportSummaryCard';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Search } from 'lucide-react';
import { initializeAIInterviewMockData } from '@/shared/lib/aiInterview/initializeMockData';
import { DataResetButton } from '@/components/dev/DataResetButton';

export default function AIInterviewReports() {
  const navigate = useNavigate();
  const { reports, loading } = useInterviewReports();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Ensure mock data is initialized
    initializeAIInterviewMockData();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Interview Reports"
        description="View and manage AI interview reports"
        actions={<DataResetButton />}
      />

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="finalized">Finalized</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>Loading reports...</div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map(report => (
            <ReportSummaryCard
              key={report.id}
              report={report}
              onView={() => navigate(`/ai-interviews/reports/${report.id}`)}
            />
          ))}
          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No reports found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
}
