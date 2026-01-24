import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { DashboardActionBar } from '@/modules/dashboard/components/DashboardActionBar';
import { ActiveFiltersIndicator } from '@/modules/dashboard/components/ActiveFiltersIndicator';
import { EditModeToggle } from '@/modules/dashboard/components/EditModeToggle';
import { EnhancedStatCard } from '@/modules/dashboard/components/EnhancedStatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DollarSign, TrendingUp, PieChart, Users } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import type { DateRange } from 'react-day-picker';
import {
  getAssessmentRevenueMetrics,
  getAssessmentUsageMetrics,
  getAssessmentRevenueTrends,
  getRevenueByTypeDistribution,
  getTopClientsByRevenue,
  getGeographicRevenueDistribution,
  getAssessmentProfitability,
  getClientLifetimeValues,
  getRetentionMetrics,
} from '@/modules/assessments/services';
import { RevenueTrendsChart } from '@/modules/dashboard/components/charts/RevenueTrendsChart';
import { RevenueByTypeChart } from '@/modules/dashboard/components/charts/RevenueByTypeChart';
import { GeographicRevenueChart } from '@/modules/dashboard/components/charts/GeographicRevenueChart';
import { TopClientsChart } from '@/modules/dashboard/components/charts/TopClientsChart';
import { ProfitabilityChart } from '@/modules/dashboard/components/charts/ProfitabilityChart';
import { ClientLifetimeValueChart } from '@/modules/dashboard/components/charts/ClientLifetimeValueChart';
import { RetentionMetricsChart } from '@/modules/dashboard/components/charts/RetentionMetricsChart';
import { RevenueProjectionChart } from '@/modules/dashboard/components/charts/RevenueProjectionChart';
import { generateRevenueForecast } from '@/shared/lib/forecasting/revenueForecast';

export default function AssessmentsDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [country, setCountry] = useState('all');
  const [region, setRegion] = useState('all');

  const revenueMetrics = useMemo(() => {
    const range = dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined;
    return getAssessmentRevenueMetrics(range, country, region);
  }, [dateRange, country, region]);

  const usageMetrics = useMemo(() => {
    const range = dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined;
    return getAssessmentUsageMetrics(range, country, region);
  }, [dateRange, country, region]);

  const profitability = useMemo(() => {
    const range = dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined;
    return getAssessmentProfitability(range, country, region);
  }, [dateRange, country, region]);

  const revenueTrends = useMemo(() => getAssessmentRevenueTrends(), []);
  const revenueByType = useMemo(() => getRevenueByTypeDistribution(), []);
  const topClients = useMemo(() => getTopClientsByRevenue(10), []);
  const geographicRevenue = useMemo(() => getGeographicRevenueDistribution(), []);
  const clvData = useMemo(() => getClientLifetimeValues(), []);
  const retentionMetrics = useMemo(() => getRetentionMetrics(), []);
  const revenueForecast = useMemo(() => generateRevenueForecast(revenueTrends, 6), [revenueTrends]);

  const hasActiveFilters = dateRange !== undefined || country !== 'all' || region !== 'all';

  const clearFilters = () => {
    setDateRange(undefined);
    setCountry('all');
    setRegion('all');
  };

  const handleExport = () => {
    toast({ title: "Exporting revenue report..." });
  };

  return (
    <DashboardPageLayout
      dashboardActions={<EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />}
    >
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight transition-colors duration-500">
              Assessments Business Performance
            </h1>
            <p className="text-muted-foreground transition-colors duration-500">
              Monitor assessment revenue, usage patterns, and profitability metrics
            </p>
          </div>
          {!isEditMode && (
            <DashboardActionBar
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedCountry={country}
              selectedRegion={region}
              onCountryChange={setCountry}
              onRegionChange={setRegion}
              onExport={handleExport}
              onResetFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </div>

        {hasActiveFilters && (
          <ActiveFiltersIndicator
            dateRange={dateRange}
            selectedCountry={country}
            selectedRegion={region}
            onClearCountry={() => setCountry('all')}
            onClearRegion={() => setRegion('all')}
            onClearDateRange={() => setDateRange(undefined)}
          />
        )}


        {/* Key Revenue Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Revenue"
            value={`$${revenueMetrics.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6" />}
            change={`+${revenueMetrics.monthOverMonthGrowth}%`}
            trend="up"
            variant="neutral"
          />
          <EnhancedStatCard
            title="Assessment Volume"
            value={usageMetrics.totalVolume.toString()}
            icon={<TrendingUp className="h-6 w-6" />}
            change="+18%"
            trend="up"
            variant="primary"
          />
          <EnhancedStatCard
            title="Profit Margin"
            value={`${revenueMetrics.profitMargin.toFixed(1)}%`}
            icon={<PieChart className="h-6 w-6" />}
            change="+3.2%"
            trend="up"
            variant="success"
          />
          <EnhancedStatCard
            title="Revenue per Client"
            value={`$${Math.round(revenueMetrics.revenuePerClient).toLocaleString()}`}
            icon={<Users className="h-6 w-6" />}
            change="+8.5%"
            trend="up"
            variant="warning"
          />
        </div>

        {/* Business Summary */}
        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardHeader>
            <CardTitle className="transition-colors duration-500">Business Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium transition-colors duration-500">Net Profit</p>
                <p className="text-2xl font-bold transition-colors duration-500 text-green-600 dark:text-green-400">
                  ${profitability.netProfit.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground transition-colors duration-500">
                  {profitability.marginPercentage.toFixed(1)}% margin
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium transition-colors duration-500">Client Adoption Rate</p>
                <p className="text-2xl font-bold transition-colors duration-500">
                  {usageMetrics.clientAdoptionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground transition-colors duration-500">
                  Active clients using assessments
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium transition-colors duration-500">Cost per Assessment</p>
                <p className="text-2xl font-bold transition-colors duration-500">
                  ${profitability.costPerUnit.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground transition-colors duration-500">
                  Average operational cost
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts & Analytics */}
        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardHeader>
            <CardTitle className="transition-colors duration-500">Business Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList>
                <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
                <TabsTrigger value="breakdown">Type Breakdown</TabsTrigger>
                <TabsTrigger value="geography">Geography</TabsTrigger>
                <TabsTrigger value="clients">Top Clients</TabsTrigger>
                <TabsTrigger value="profitability">Profitability</TabsTrigger>
                <TabsTrigger value="clv">Client Lifetime Value</TabsTrigger>
                <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-4">
                <RevenueTrendsChart 
                  data={revenueTrends}
                  description="6-month revenue, profit, and volume trends"
                />
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <RevenueByTypeChart 
                  data={revenueByType}
                  description="Revenue breakdown by assessment type"
                />
              </TabsContent>

              <TabsContent value="geography" className="space-y-4">
                <GeographicRevenueChart 
                  data={geographicRevenue}
                  description="Revenue distribution by country/region"
                />
              </TabsContent>

              <TabsContent value="clients" className="space-y-4">
                <TopClientsChart 
                  data={topClients}
                  description="Top 10 clients by total revenue"
                />
              </TabsContent>

              <TabsContent value="profitability" className="space-y-4">
                <ProfitabilityChart 
                  data={revenueByType}
                  description="Revenue vs costs analysis by type"
                />
              </TabsContent>

              <TabsContent value="clv" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <ClientLifetimeValueChart 
                    data={clvData}
                    title="Top Clients by Lifetime Value"
                    description="Total revenue and growth trends per client"
                    showPredictions={true}
                  />
                  <RetentionMetricsChart 
                    data={retentionMetrics}
                    title="Client Retention Overview"
                    description="Client tenure and retention metrics"
                  />
                </div>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-4">
                <RevenueProjectionChart
                  title="Assessment Revenue Forecast"
                  description="6-month revenue projection based on historical trends with 95% confidence intervals"
                  forecast={revenueForecast}
                  onDownload={() => toast({ title: "Downloading forecast data..." })}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
