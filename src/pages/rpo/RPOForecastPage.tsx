import { useMemo } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { RPORevenueForecastChart } from '@/components/rpo/RPORevenueForecastChart';
import { getRevenueProjection } from '@/shared/lib/rpoTrackingUtils';
import { DollarSign } from 'lucide-react';

export default function RPOForecastPage() {
  const revenueForecast = useMemo(() => getRevenueProjection(12), []);

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Revenue Forecast</h1>
          </div>
          <p className="text-muted-foreground">
            12-month revenue projection based on active RPO contracts and renewal probabilities
          </p>
        </div>

        <RPORevenueForecastChart forecasts={revenueForecast} />
      </div>
    </DashboardPageLayout>
  );
}
