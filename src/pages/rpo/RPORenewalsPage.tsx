import { useMemo } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { RPOContractRenewalAlerts } from '@/components/rpo/RPOContractRenewalAlerts';
import { getRenewalAlerts, getRenewalAlertsSummary } from '@/shared/lib/rpoRenewalUtils';
import { AlertTriangle } from 'lucide-react';

export default function RPORenewalsPage() {
  const renewalAlerts = useMemo(() => getRenewalAlerts(), []);
  const renewalSummary = useMemo(() => getRenewalAlertsSummary(), []);

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Contract Renewals</h1>
          </div>
          <p className="text-muted-foreground">
            Track upcoming renewals, review performance, and plan renewal strategies
          </p>
        </div>

        <RPOContractRenewalAlerts 
          alerts={renewalAlerts}
          summary={renewalSummary}
        />
      </div>
    </DashboardPageLayout>
  );
}
