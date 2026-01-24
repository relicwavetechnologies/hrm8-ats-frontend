import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { RPOContractsList } from '@/modules/rpo/components/RPOContractsList';
import { getRPODashboardMetrics } from '@/shared/lib/rpoTrackingUtils';
import { Button } from '@/shared/components/ui/button';
import { FileBarChart, BarChart3 } from 'lucide-react';

export default function RPOContractsPage() {
  const metrics = useMemo(() => getRPODashboardMetrics(), []);

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileBarChart className="h-6 w-6" />
              <h1 className="text-3xl font-bold">RPO Contracts</h1>
            </div>
            <p className="text-muted-foreground">
              View and manage all RPO contracts with detailed tracking and status updates
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/rpo">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard
            </Link>
          </Button>
        </div>

        <RPOContractsList contracts={metrics.contracts} />
      </div>
    </DashboardPageLayout>
  );
}
