import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getPerformanceReviews } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";
import type { ReviewStatus } from "@/types/performance";

export function ReviewsOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const reviews = useMemo(() => getPerformanceReviews(), []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = review.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          review.templateName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchQuery, statusFilter]);

  const getStatusBadge = (status: ReviewStatus) => {
    const variants: Record<ReviewStatus, { variant: any; label: string; icon: any }> = {
      'not-started': { variant: 'secondary', label: 'Not Started', icon: Clock },
      'in-progress': { variant: 'default', label: 'In Progress', icon: Clock },
      'completed': { variant: 'outline', label: 'Completed', icon: CheckCircle2 },
      'overdue': { variant: 'destructive', label: 'Overdue', icon: AlertCircle },
    };
    return variants[status];
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
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
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => navigate('/performance/reviews/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first performance review to get started"
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => navigate('/performance/reviews/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => {
            const statusBadge = getStatusBadge(review.status);
            const StatusIcon = statusBadge.icon;

            return (
              <Card 
                key={review.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/performance/reviews/${review.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{review.employeeName}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Template:</span>
                          <span>{review.templateName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Reviewer:</span>
                          <span>{review.reviewerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Period:</span>
                          <span>
                            {format(new Date(review.reviewPeriodStart), 'MMM d, yyyy')} - {format(new Date(review.reviewPeriodEnd), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.overallRating && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-3xl font-bold">{review.overallRating.toFixed(1)}</div>
                        <span className="text-xs text-muted-foreground">Overall Rating</span>
                      </div>
                    )}
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
