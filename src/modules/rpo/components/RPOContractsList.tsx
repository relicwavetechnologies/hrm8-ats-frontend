import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  ExternalLink,
  Building2,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import type { RPOContractSummary } from '@/shared/lib/rpoTrackingUtils';
import { cn } from '@/shared/lib/utils';
import { RPOConsultantAssignmentDialog } from './RPOConsultantAssignmentDialog';
import { getAllServiceProjects } from '@/shared/lib/recruitmentServiceStorage';

interface RPOContractsListProps {
  contracts: RPOContractSummary[];
}

export function RPOContractsList({ contracts }: RPOContractsListProps) {
  const navigate = useNavigate();
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [, setRefreshKey] = useState(0);

  const selectedContract = selectedContractId 
    ? getAllServiceProjects().find(p => p.id === selectedContractId)
    : null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'on-hold': return 'warning';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">RPO Contracts</h3>
          <p className="text-sm text-muted-foreground">
            Active and upcoming RPO service agreements
          </p>
        </div>

        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className={cn(
                "border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                contract.isExpiring && "border-warning bg-warning/5",
                expandedContract === contract.id && "bg-muted/30"
              )}
              onClick={() => setExpandedContract(
                expandedContract === contract.id ? null : contract.id
              )}
            >
              {/* Contract Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {contract.clientLogo && (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contract.clientLogo} />
                      <AvatarFallback>{getInitials(contract.clientName)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{contract.name}</h4>
                      <Badge variant={getStatusVariant(contract.status)}>
                        {contract.status}
                      </Badge>
                      {contract.isExpiring && (
                        <Badge variant="warning" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contract.clientName} • {contract.country}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContractId(contract.id);
                      setAssignmentDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recruitment-services/${contract.id}`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              {/* Contract Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{contract.duration} months</p>
                    {contract.daysRemaining !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {contract.daysRemaining} days left
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Consultants</p>
                    <p className="text-sm font-medium">{contract.numberOfConsultants}</p>
                    <p className="text-xs text-muted-foreground">Dedicated team</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Retainer</p>
                    <p className="text-sm font-medium">
                      ${contract.monthlyRetainer.toLocaleString()}
                    </p>
                    {contract.perVacancyFee && (
                      <p className="text-xs text-muted-foreground">
                        +${contract.perVacancyFee.toLocaleString()}/vacancy
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contract Value</p>
                    <p className="text-sm font-medium">
                      ${contract.totalContractValue.toLocaleString()}
                    </p>
                    {contract.targetPlacements && (
                      <p className="text-xs text-muted-foreground">
                        Target: {contract.targetPlacements} placements
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {contract.targetPlacements && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Placement Progress</span>
                    <span className="font-medium">
                      {contract.currentPlacements} / {contract.targetPlacements}
                    </span>
                  </div>
                  <Progress 
                    value={(contract.currentPlacements / contract.targetPlacements) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Expanded Details */}
              {expandedContract === contract.id && (
                <div className="pt-4 border-t space-y-4">
                  {/* Assigned Consultants */}
                  {contract.assignedConsultants.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold mb-3">Dedicated Consultants</h5>
                      <div className="grid gap-2 md:grid-cols-2">
                        {contract.assignedConsultants.map((consultant) => (
                          <div
                            key={consultant.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-background"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={consultant.avatar} />
                              <AvatarFallback>
                                {getInitials(consultant.consultantName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {consultant.consultantName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${consultant.monthlyRate.toLocaleString()}/month
                              </p>
                            </div>
                            {!consultant.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fee Structures */}
                  {contract.feeStructures.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold mb-3">Fee Structure</h5>
                      <div className="space-y-2">
                        {contract.feeStructures.map((fee, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded bg-background"
                          >
                            <div>
                              <p className="text-sm font-medium">{fee.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {fee.type.replace('-', ' ')}
                                {fee.frequency && ` • ${fee.frequency}`}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              ${fee.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h5 className="text-sm font-semibold mb-3">Contract Timeline</h5>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">
                          {format(new Date(contract.startDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {contract.endDate && (
                        <>
                          <div className="text-muted-foreground">→</div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">
                              {format(new Date(contract.endDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {contracts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No RPO contracts found</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Dialog */}
      {selectedContract && (
        <RPOConsultantAssignmentDialog
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          contract={selectedContract}
          onAssignmentComplete={() => setRefreshKey(k => k + 1)}
        />
      )}
    </Card>
  );
}
