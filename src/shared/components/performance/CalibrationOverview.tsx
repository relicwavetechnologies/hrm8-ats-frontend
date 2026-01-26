import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Plus, Search, Clock, CheckCircle2, Users, Calendar } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { getCalibrationSessions } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";

export function CalibrationOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const sessions = useMemo(() => getCalibrationSessions(), []);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          session.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [sessions, searchQuery]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      scheduled: { variant: 'secondary', label: 'Scheduled', icon: Clock },
      'in-progress': { variant: 'default', label: 'In Progress', icon: Clock },
      completed: { variant: 'outline', label: 'Completed', icon: CheckCircle2 },
    };
    return variants[status] || variants.scheduled;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calibration sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => navigate('/performance/calibration/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Calibration Sessions Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Create your first calibration session to get started"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/performance/calibration/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const statusBadge = getStatusBadge(session.status);
            const StatusIcon = statusBadge.icon;

            return (
              <Card 
                key={session.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/performance/calibration/${session.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      {session.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.description}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.scheduledDate), 'MMM d, yyyy')}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {session.participants.length} participants
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{session.employees.length} employees to calibrate</span>
                      </div>
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
