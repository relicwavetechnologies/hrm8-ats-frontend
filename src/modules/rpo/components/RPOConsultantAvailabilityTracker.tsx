import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Progress } from '@/shared/components/ui/progress';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  DollarSign,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import type { ConsultantRPOAvailability } from '@/shared/lib/rpoConsultantAvailabilityUtils';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface RPOConsultantAvailabilityTrackerProps {
  consultants: ConsultantRPOAvailability[];
  stats: {
    totalConsultants: number;
    available: number;
    partiallyAvailable: number;
    unavailable: number;
    totalCapacity: number;
    usedCapacity: number;
    availableCapacity: number;
    averageMonthlyRate: number;
  };
}

export function RPOConsultantAvailabilityTracker({ 
  consultants, 
  stats 
}: RPOConsultantAvailabilityTrackerProps) {
  const navigate = useNavigate();
  const [expandedConsultant, setExpandedConsultant] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'partially-available' | 'unavailable'>('all');

  const filteredConsultants = consultants.filter(c => {
    if (filterStatus === 'all') return true;
    return c.availability.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="h-4 w-4" />;
      case 'partially-available': return <AlertCircle className="h-4 w-4" />;
      case 'unavailable': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'warning' | 'destructive' => {
    switch (status) {
      case 'available': return 'default';
      case 'partially-available': return 'warning';
      case 'unavailable': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'partially-available': return 'Partially Available';
      case 'unavailable': return 'Unavailable';
      default: return status;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const capacityPercentage = stats.totalCapacity > 0 
    ? (stats.usedCapacity / stats.totalCapacity) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Consultant Availability Tracker
            </CardTitle>
            <CardDescription>
              Track consultant availability and capacity for RPO assignments
            </CardDescription>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-chart-1" />
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <p className="text-2xl font-bold">{stats.available}</p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <p className="text-sm text-muted-foreground">Partial</p>
            </div>
            <p className="text-2xl font-bold">{stats.partiallyAvailable}</p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Capacity Used</p>
            </div>
            <p className="text-2xl font-bold">{stats.usedCapacity}/{stats.totalCapacity}</p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Avg. Rate</p>
            </div>
            <p className="text-2xl font-bold">${(stats.averageMonthlyRate / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Capacity</span>
            <span className="font-medium">{capacityPercentage.toFixed(0)}% utilized</span>
          </div>
          <Progress value={capacityPercentage} className="h-2" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({stats.totalConsultants})
          </Button>
          <Button
            variant={filterStatus === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('available')}
          >
            Available ({stats.available})
          </Button>
          <Button
            variant={filterStatus === 'partially-available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('partially-available')}
          >
            Partial ({stats.partiallyAvailable})
          </Button>
          <Button
            variant={filterStatus === 'unavailable' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('unavailable')}
          >
            Unavailable ({stats.unavailable})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {filteredConsultants.map((item) => (
            <div
              key={item.consultant.id}
              className={cn(
                "border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                expandedConsultant === item.consultant.id && "bg-muted/30"
              )}
              onClick={() => setExpandedConsultant(
                expandedConsultant === item.consultant.id ? null : item.consultant.id
              )}
            >
              {/* Consultant Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.consultant.avatar} />
                    <AvatarFallback>{getInitials(item.consultant.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{item.consultant.name}</h4>
                      <Badge variant={getStatusVariant(item.availability.status)} className="gap-1">
                        {getStatusIcon(item.availability.status)}
                        {getStatusLabel(item.availability.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.consultant.type.replace('-', ' ')}
                    </p>
                    {item.consultant.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.consultant.specializations.slice(0, 3).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-lg font-bold">
                      {item.availability.currentRPOAssignments}/{item.availability.maxRPOCapacity}
                    </p>
                  </div>
                  {expandedConsultant === item.consultant.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Rate</p>
                  <p className="text-sm font-semibold">
                    ${item.rates.standardMonthlyRate.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RPO Experience</p>
                  <p className="text-sm font-semibold">
                    {item.experience.totalRPOContracts} contracts
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Assignments</p>
                  <p className="text-sm font-semibold">
                    {item.availability.currentRPOAssignments}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedConsultant === item.consultant.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Rate Breakdown */}
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Rate Structure</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="text-sm font-semibold">
                          ${item.rates.standardMonthlyRate.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Daily</p>
                        <p className="text-sm font-semibold">
                          ${item.rates.standardDailyRate.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Hourly</p>
                        <p className="text-sm font-semibold">
                          ${item.rates.standardHourlyRate}
                        </p>
                      </div>
                      {item.rates.averageRPORate && (
                        <div className="p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Avg. RPO Rate</p>
                          <p className="text-sm font-semibold">
                            ${item.rates.averageRPORate.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Assignments */}
                  {item.currentAssignments.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold mb-2">Current RPO Assignments</h5>
                      <div className="space-y-2">
                        {item.currentAssignments.map((assignment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border rounded bg-background"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{assignment.contractName}</p>
                                {!assignment.isActive && (
                                  <Badge variant="secondary" className="text-xs">
                                    Ended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {assignment.clientName}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(assignment.startDate), 'MMM yyyy')}
                                  {assignment.endDate && ` - ${format(new Date(assignment.endDate), 'MMM yyyy')}`}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold">
                                ${assignment.monthlyRate.toLocaleString()}/mo
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/recruitment-services/${assignment.contractId}`);
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>{item.consultant.email}</p>
                      <p>{item.consultant.phone}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/consultants/${item.consultant.id}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredConsultants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No consultants found matching the selected filter</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
