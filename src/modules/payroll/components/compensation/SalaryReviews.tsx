import { useState, useMemo } from "react";
import { Plus, Search, Filter, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { getCompensationReviews, updateCompensationReview } from "@/lib/compensationStorage";
import { format } from "date-fns";

export function SalaryReviews() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const reviews = getCompensationReviews();

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = review.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchQuery, statusFilter]);

  const handleApprove = (id: string) => {
    updateCompensationReview(id, {
      status: 'approved',
      reviewedBy: 'current-user',
      reviewedAt: new Date().toISOString(),
    });
    toast({
      title: "Review Approved",
      description: "Salary review has been approved",
    });
  };

  const handleReject = (id: string) => {
    updateCompensationReview(id, {
      status: 'rejected',
      reviewedBy: 'current-user',
      reviewedAt: new Date().toISOString(),
    });
    toast({
      title: "Review Rejected",
      description: "Salary review has been rejected",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      draft: { variant: 'secondary', label: 'Draft', icon: Clock },
      pending: { variant: 'default', label: 'Pending', icon: Clock },
      approved: { variant: 'outline', label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
      implemented: { variant: 'outline', label: 'Implemented', icon: CheckCircle },
    };
    return variants[status] || variants.draft;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first salary review to get started"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => {
            const statusBadge = getStatusBadge(review.status);
            const StatusIcon = statusBadge.icon;

            return (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{review.employeeName}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current Salary: </span>
                          <span className="font-medium">${review.currentSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proposed Salary: </span>
                          <span className="font-medium">${review.proposedSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Increase: </span>
                          <span className="font-medium text-green-600">
                            +{review.increasePercentage.toFixed(1)}% (${review.increaseAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Effective Date: </span>
                          <span className="font-medium">
                            {format(new Date(review.effectiveDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Cycle: </span>
                          <span className="font-medium capitalize">{review.reviewCycle} {review.reviewYear}</span>
                        </div>
                        {review.performanceRating && (
                          <div>
                            <span className="text-muted-foreground">Performance: </span>
                            <span className="font-medium">{review.performanceRating}/5</span>
                          </div>
                        )}
                        {review.marketPosition && (
                          <div>
                            <span className="text-muted-foreground">Market Position: </span>
                            <span className="font-medium">{review.marketPosition}</span>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Justification: </span>
                          <p className="text-sm mt-1">{review.justification}</p>
                        </div>
                      </div>
                    </div>

                    {review.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(review.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
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
