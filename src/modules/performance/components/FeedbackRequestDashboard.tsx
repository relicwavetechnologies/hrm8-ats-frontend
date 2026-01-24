import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { getFeedbackRequests, sendReminder, completeRequest } from '@/shared/lib/feedbackRequestService';
import { FeedbackRequest } from '@/shared/types/feedbackRequest';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { MobileFeedbackRequestList } from './MobileFeedbackRequestList';
import { format } from 'date-fns';
import { useToast } from '@/shared/hooks/use-toast';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';

export function FeedbackRequestDashboard() {
  const isMobile = useIsMobile();
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FeedbackRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchTerm, statusFilter, sortBy]);

  const loadRequests = () => {
    const allRequests = getFeedbackRequests();
    setRequests(allRequests);
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.candidateName.toLowerCase().includes(search) ||
          r.requestedToName.toLowerCase().includes(search) ||
          r.requestedByName.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'requestedAt':
          return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        case 'candidate':
          return a.candidateName.localeCompare(b.candidateName);
        case 'member':
          return a.requestedToName.localeCompare(b.requestedToName);
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

  const handleSendReminder = (request: FeedbackRequest) => {
    sendReminder(request.id);
    toast({
      title: 'Reminder Sent',
      description: `Reminder email sent to ${request.requestedToName}`,
    });
    loadRequests();
  };

  const handleMarkComplete = (requestId: string) => {
    completeRequest(requestId);
    toast({
      title: 'Request Completed',
      description: 'Feedback request marked as completed',
    });
    loadRequests();
  };

  // Bulk actions handlers
  const handleSelectAll = () => {
    setSelectedIds(filteredRequests.map(r => r.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkExport = (ids: string[]) => {
    const selected = requests.filter(r => ids.includes(r.id));
    const data = JSON.stringify(selected, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-requests-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = (ids: string[]) => {
    setRequests(prev => prev.filter(r => !ids.includes(r.id)));
    setSelectedIds([]);
  };

  const handleBulkApprove = (ids: string[]) => {
    ids.forEach(id => completeRequest(id));
    loadRequests();
    setSelectedIds([]);
  };

  const handleBulkSendReminder = (ids: string[]) => {
    ids.forEach(id => sendReminder(id));
    toast({
      title: 'Reminders Sent',
      description: `Sent ${ids.length} reminder emails`,
    });
    loadRequests();
    setSelectedIds([]);
  };

  const getStatusBadge = (status: FeedbackRequest['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('dueDate');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || sortBy !== 'dueDate';

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    overdue: requests.filter(r => r.status === 'overdue').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          Feedback Request Dashboard
        </h2>
        <p className="text-muted-foreground">
          Centralized view of all feedback requests across candidates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by candidate, team member, or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="requestedAt">Request Date</SelectItem>
                <SelectItem value="candidate">Candidate Name</SelectItem>
                <SelectItem value="member">Team Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <BulkActionsToolbar
            selectedIds={selectedIds}
            totalCount={filteredRequests.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onExport={handleBulkExport}
            onDelete={handleBulkDelete}
            onApprove={handleBulkApprove}
            onSendReminder={handleBulkSendReminder}
          />
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <MobileFeedbackRequestList
              requests={filteredRequests}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSendReminder={handleSendReminder}
              onMarkComplete={handleMarkComplete}
            />
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No feedback requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAll();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="animate-fade-in">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(request.id)}
                          onCheckedChange={() => handleToggleSelect(request.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{request.candidateName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{request.requestedToName}</span>
                          <span className="text-xs text-muted-foreground">
                            {request.requestedToEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{request.requestedByName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(request.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Requested {format(new Date(request.requestedAt), 'MMM d')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.status !== 'completed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendReminder(request)}
                                disabled={request.reminderSent}
                                title="Send reminder"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkComplete(request.id)}
                                title="Mark as complete"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
