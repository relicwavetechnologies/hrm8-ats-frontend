import { useState } from "react";
import { Plus, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { getOvertimeRequests, updateOvertimeRequest } from "@/shared/lib/attendanceStorage";
import { format, parseISO } from "date-fns";
import type { OvertimeStatus } from "@/shared/types/attendance";

export function OvertimeManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const requests = getOvertimeRequests();

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    updateOvertimeRequest(id, {
      status: 'approved',
      respondedAt: new Date().toISOString(),
      respondedBy: 'current-user',
    });
    toast({
      title: "Approved",
      description: "Overtime request has been approved",
    });
  };

  const handleReject = (id: string) => {
    updateOvertimeRequest(id, {
      status: 'rejected',
      respondedAt: new Date().toISOString(),
      respondedBy: 'current-user',
    });
    toast({
      title: "Rejected",
      description: "Overtime request has been rejected",
    });
  };

  const getStatusBadge = (status: OvertimeStatus) => {
    const variants: Record<OvertimeStatus, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      approved: { variant: 'outline', label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
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
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Overtime Requests</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first overtime request to get started"
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const statusBadge = getStatusBadge(request.status);
            const StatusIcon = statusBadge.icon;

            return (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{request.employeeName}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date: </span>
                          <span className="font-medium">
                            {format(parseISO(request.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hours: </span>
                          <span className="font-medium">{request.hours}h</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">Reason: </span>
                          <span className="font-medium">{request.reason}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Requested: </span>
                          <span className="font-medium">
                            {format(parseISO(request.requestedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {request.respondedAt && (
                          <div>
                            <span className="text-muted-foreground">Responded: </span>
                            <span className="font-medium">
                              {format(parseISO(request.respondedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        {request.responseNotes && (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Notes: </span>
                            <span className="font-medium">{request.responseNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
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
