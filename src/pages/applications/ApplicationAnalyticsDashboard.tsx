import { useState, useMemo } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { DashboardActionBar } from '@/components/dashboard/DashboardActionBar';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { getApplications } from '@/shared/lib/mockApplicationStorage';
import {
  calculateTimeToHire,
  calculateConversionRates,
  analyzeSourceEffectiveness,
  analyzeRecruiterPerformance,
  getApplicationVolumeOverTime,
  getStatusDistribution
} from '@/shared/lib/applications/analyticsService';
import { TimeToHireChart } from '@/components/applications/analytics/TimeToHireChart';
import { ConversionRateChart } from '@/components/applications/analytics/ConversionRateChart';
import { SourceEffectivenessChart } from '@/components/applications/analytics/SourceEffectivenessChart';
import { RecruiterPerformanceTable } from '@/components/applications/analytics/RecruiterPerformanceTable';
import { StandardChartCard } from '@/components/dashboard/charts/StandardChartCard';
import { Clock, TrendingUp, Users, Award } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export default function ApplicationAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const applications = useMemo(() => {
    const allApps = getApplications();
    // Filter by date range
    if (!dateRange.from) return allApps;
    return allApps.filter(app => {
      const appDate = new Date(app.appliedDate);
      const from = startOfDay(dateRange.from!);
      const to = dateRange.to ? endOfDay(dateRange.to) : new Date();
      return appDate >= from && appDate <= to;
    });
  }, [dateRange]);

  const metrics = useMemo(() => {
    const timeToHire = calculateTimeToHire(applications);
    const conversionRates = calculateConversionRates(applications);
    const sourceEffectiveness = analyzeSourceEffectiveness(applications);
    const recruiterPerformance = analyzeRecruiterPerformance(applications);
    const volumeOverTime = getApplicationVolumeOverTime(applications);
    const statusDistribution = getStatusDistribution(applications);

    return {
      timeToHire,
      conversionRates,
      sourceEffectiveness,
      recruiterPerformance,
      volumeOverTime,
      statusDistribution,
    };
  }, [applications]);

  const handleExport = () => {
    console.log('Export analytics data');
  };

  const handleResetFilters = () => {
    setDateRange({
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date(),
    });
    setSelectedCountry('all');
    setSelectedRegion('all');
  };

  const hasActiveFilters = selectedCountry !== 'all' || selectedRegion !== 'all' ||
    (dateRange.from && dateRange.from.getTime() !== new Date(new Date().setMonth(new Date().getMonth() - 6)).getTime());

  return (
    <DashboardPageLayout
      dashboardActions={
        <DashboardActionBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          onCountryChange={setSelectedCountry}
          onRegionChange={setSelectedRegion}
          onExport={handleExport}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      }
    >
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application Analytics</h1>
            <p className="text-muted-foreground">
              Track hiring performance and optimize your recruitment process
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Avg Time to Hire"
            value={`${metrics.timeToHire.averageDays} days`}
            change=""
            icon={<Clock />}
            variant="primary"
          />
          <EnhancedStatCard
            title="Conversion Rate"
            value={`${metrics.conversionRates.overallRate}%`}
            change=""
            icon={<TrendingUp />}
            variant="success"
          />
          <EnhancedStatCard
            title="Total Applications"
            value={applications.length.toString()}
            change=""
            icon={<Users />}
            variant="neutral"
          />
          <EnhancedStatCard
            title="Active Recruiters"
            value={metrics.recruiterPerformance.recruiters.length.toString()}
            change=""
            icon={<Award />}
            variant="warning"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="time-to-hire">Time to Hire</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Rates</TabsTrigger>
            <TabsTrigger value="sources">Source Effectiveness</TabsTrigger>
            <TabsTrigger value="recruiters">Recruiter Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Application Volume Trend"
                className="bg-transparent border-0 shadow-none"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip cursor={false} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Applications"
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Status Distribution"
                className="bg-transparent border-0 shadow-none"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="status"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#8b5cf6" name="Count" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Median Time to Hire</div>
                  <div className="text-2xl font-bold">{metrics.timeToHire.medianDays} days</div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Top Source</div>
                  <div className="text-2xl font-bold">
                    {metrics.sourceEffectiveness.topPerforming[0] || 'N/A'}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Top Recruiter</div>
                  <div className="text-2xl font-bold">
                    {metrics.recruiterPerformance.topPerformers[0] || 'N/A'}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time-to-hire">
            <TimeToHireChart data={metrics.timeToHire} />
          </TabsContent>

          <TabsContent value="conversion">
            <ConversionRateChart data={metrics.conversionRates} />
          </TabsContent>

          <TabsContent value="sources">
            <SourceEffectivenessChart data={metrics.sourceEffectiveness} />
          </TabsContent>

          <TabsContent value="recruiters">
            <RecruiterPerformanceTable data={metrics.recruiterPerformance} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
