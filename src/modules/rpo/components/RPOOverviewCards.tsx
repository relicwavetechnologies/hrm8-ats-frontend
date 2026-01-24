import { EnhancedStatCard } from '@/modules/dashboard/components/EnhancedStatCard';
import { Building2, Users, DollarSign, AlertTriangle, Eye, Plus, Calendar, BarChart3 } from 'lucide-react';
import type { RPODashboardMetrics } from '@/shared/lib/rpoTrackingUtils';
import { useNavigate } from 'react-router-dom';

interface RPOOverviewCardsProps {
  metrics: RPODashboardMetrics;
}

export function RPOOverviewCards({ metrics }: RPOOverviewCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <EnhancedStatCard
        title="Active Contracts"
        value={metrics.totalActiveContracts.toString()}
        change={`Avg. ${metrics.averageContractDuration} months duration`}
        trend="up"
        icon={<Building2 className="h-6 w-6" />}
        variant="neutral"
        showMenu={true}
        menuItems={[
          {
            label: "View All",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => navigate('/rpo/contracts')
          },
          {
            label: "Create Contract",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => {}
          },
          {
            label: "View Timeline",
            icon: <Calendar className="h-4 w-4" />,
            onClick: () => {}
          }
        ]}
      />

      <EnhancedStatCard
        title="Dedicated Consultants"
        value={metrics.totalDedicatedConsultants.toString()}
        change="Full-time RPO assignments"
        trend="up"
        icon={<Users className="h-6 w-6" />}
        variant="success"
        showMenu={true}
        menuItems={[
          {
            label: "View Consultants",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => navigate('/consultants')
          },
          {
            label: "Assign to Project",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => {}
          }
        ]}
      />

      <EnhancedStatCard
        title="Monthly Recurring Revenue"
        value=""
        isCurrency={true}
        rawValue={metrics.totalMonthlyRecurringRevenue}
        change={`Total contract value: $${metrics.totalContractValue.toLocaleString()}`}
        trend="up"
        icon={<DollarSign className="h-6 w-6" />}
        variant="primary"
        showMenu={true}
        menuItems={[
          {
            label: "View MRR Report",
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => {}
          },
          {
            label: "Export",
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => {}
          }
        ]}
      />

      <EnhancedStatCard
        title="Expiring Soon"
        value={metrics.expiringContracts.toString()}
        change="Contracts ending within 30 days"
        trend={metrics.expiringContracts > 0 ? "up" : "down"}
        icon={<AlertTriangle className="h-6 w-6" />}
        variant={metrics.expiringContracts > 0 ? "warning" : "success"}
        showMenu={true}
        menuItems={[
          {
            label: "View Expiring",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => {}
          },
          {
            label: "Set Reminders",
            icon: <Calendar className="h-4 w-4" />,
            onClick: () => {}
          },
          ...(metrics.expiringContracts > 0 ? [{
            label: "Take Action",
            icon: <AlertTriangle className="h-4 w-4" />,
            onClick: () => {}
          }] : [])
        ]}
      />
    </div>
  );
}
