import { format } from 'date-fns';
import { MoreVertical, Eye, Edit, Users, FileText, Trash2 } from 'lucide-react';
import { Column } from '@/components/tables/DataTable';
import { ServiceProject } from '@/shared/types/recruitmentService';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'on-hold':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'completed':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function createRPOContractsColumns(): Column<ServiceProject>[] {
  return [
    {
      key: 'name',
      label: 'Contract / Client',
      sortable: true,
      render: (contract) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {contract.clientLogo ? (
              <img src={contract.clientLogo} alt={contract.clientName} className="h-8 w-8 rounded" />
            ) : (
              <span className="text-sm font-semibold text-primary">
                {contract.clientName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <Link 
              to={`/rpo/${contract.id}`}
              className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
            >
              {contract.name}
            </Link>
            <Link
              to={`/employers/${contract.clientId}`}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline line-clamp-1 block transition-colors"
            >
              {contract.clientName}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      sortable: true,
      render: (contract) => (
        <Badge variant="outline" className={cn('capitalize', getStatusColor(contract.status))}>
          {contract.status.replace('-', ' ')}
        </Badge>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      width: '160px',
      sortable: true,
      render: (contract) => (
        <div className="text-sm">
          <p className="font-medium">{contract.location}</p>
          <p className="text-xs text-muted-foreground">{contract.country}</p>
        </div>
      ),
    },
    {
      key: 'consultants',
      label: 'Consultants',
      sortable: false,
      render: (contract) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {contract.consultants.slice(0, 3).map((consultant, idx) => (
              <Avatar key={consultant.id} className="h-8 w-8 border-2 border-background">
                {consultant.avatar ? (
                  <AvatarImage src={consultant.avatar} alt={consultant.name} />
                ) : (
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {consultant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
            ))}
          </div>
          {contract.consultants.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{contract.consultants.length - 3}
            </span>
          )}
          {contract.consultants.length === 0 && (
            <span className="text-sm text-muted-foreground">No consultants</span>
          )}
        </div>
      ),
    },
    {
      key: 'rpoMonthlyRetainer',
      label: 'Monthly Fee',
      width: '140px',
      sortable: true,
      render: (contract) => (
        <span className="font-medium">
          {contract.rpoMonthlyRetainer 
            ? formatCurrency(contract.rpoMonthlyRetainer, contract.currency)
            : '—'}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Contract Period',
      width: '180px',
      sortable: true,
      render: (contract) => (
        <div className="text-sm">
          <p>{format(new Date(contract.rpoStartDate || contract.startDate), 'MMM d, yyyy')}</p>
          <p className="text-xs text-muted-foreground">
            to {contract.rpoEndDate ? format(new Date(contract.rpoEndDate), 'MMM d, yyyy') : 'Ongoing'}
          </p>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      width: '180px',
      sortable: true,
      render: (contract) => {
        if (!contract.targetPlacements) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        const placed = contract.candidatesInterviewed || 0;
        const target = contract.targetPlacements;
        const percentage = Math.min(Math.round((placed / target) * 100), 100);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{placed} / {target}</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (contract) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/rpo/${contract.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit contract', contract.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Contract
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Assign consultants', contract.id)}>
              <Users className="h-4 w-4 mr-2" />
              Assign Consultants
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Generate report', contract.id)}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => console.log('Cancel contract', contract.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Contract
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
