import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { RPOPerformanceDashboard } from '@/components/rpo/RPOPerformanceDashboard';
import { 
  getAllContractPerformanceMetrics,
  getPerformanceMetricsSummary,
  getYearOverYearComparison,
  getMonthlyPerformanceTrend,
  getPerformanceBenchmarks
} from '@/shared/lib/rpoPerformanceUtils';
import { Button } from '@/shared/components/ui/button';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function RPOPerformancePage() {
  const performanceMetrics = useMemo(() => getAllContractPerformanceMetrics(), []);
  const performanceSummary = useMemo(() => getPerformanceMetricsSummary(), []);
  const yoyComparison = useMemo(() => getYearOverYearComparison(), []);
  const monthlyTrend = useMemo(() => getMonthlyPerformanceTrend(12), []);
  const benchmarks = useMemo(() => getPerformanceBenchmarks(), []);

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6" />
              <h1 className="text-3xl font-bold">RPO Performance Metrics</h1>
            </div>
            <p className="text-muted-foreground">
              Comprehensive performance tracking with placement success rates, time-to-fill, and client satisfaction
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/rpo">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard
            </Link>
          </Button>
        </div>

        <RPOPerformanceDashboard
          contracts={performanceMetrics}
          summary={performanceSummary}
          yoyComparison={yoyComparison}
          monthlyTrend={monthlyTrend}
          benchmarks={benchmarks}
        />
      </div>
    </DashboardPageLayout>
  );
}
