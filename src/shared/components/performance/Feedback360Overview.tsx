import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Plus, Search, Filter, Clock, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getFeedback360 } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";
import type { FeedbackType } from "@/types/performance";

export function Feedback360Overview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const feedbacks = useMemo(() => getFeedback360(), []);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const matchesSearch = feedback.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feedback.providers.some(p => p.providerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
      // Note: feedbackType is per provider, not per feedback request
      return matchesSearch && matchesStatus;
    });
  }, [feedbacks, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      'in-progress': { variant: 'default', label: 'In Progress', icon: Clock },
      completed: { variant: 'outline', label: 'Completed', icon: CheckCircle2 },
    };
    return variants[status] || variants.pending;
  };


  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => navigate('/performance/feedback/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Request Feedback
        </Button>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Request your first 360 feedback to get started"
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => navigate('/performance/feedback/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Feedback
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredFeedbacks.map((feedback) => {
            const statusBadge = getStatusBadge(feedback.status);
            const StatusIcon = statusBadge.icon;
            const completedProviders = feedback.providers.filter(p => p.status === 'submitted').length;
            const totalProviders = feedback.providers.length;

            return (
              <Card 
                key={feedback.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/performance/feedback/${feedback.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{feedback.employeeName}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Review Cycle:</span>
                          <span>{feedback.reviewCycle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Requested By:</span>
                          <span>{feedback.requestedByName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Providers:</span>
                          <span>{completedProviders}/{totalProviders} submitted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Due Date:</span>
                          <span>{format(new Date(feedback.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                        {feedback.completedAt && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Completed:</span>
                            <span>{format(new Date(feedback.completedAt), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-2xl font-bold">{completedProviders}/{totalProviders}</div>
                      <span className="text-xs text-muted-foreground">Responses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
