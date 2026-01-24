import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { Button } from '@/shared/components/ui/button';
import { Download, Calendar, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TrendsChart } from '@/modules/background-checks/components/TrendsChart';
import { CheckTypeComparisonChart } from '@/modules/background-checks/components/CheckTypeComparisonChart';
import { RecruiterPerformanceTable } from '@/modules/background-checks/components/RecruiterPerformanceTable';
import { BottleneckAnalysis } from '@/modules/background-checks/components/BottleneckAnalysis';
import { PredictiveInsights } from '@/modules/background-checks/components/PredictiveInsights';
import { DateRangeSelector } from '@/modules/background-checks/components/DateRangeSelector';
import { PeriodComparisonCard } from '@/modules/background-checks/components/PeriodComparisonCard';
import { toast } from '@/shared/hooks/use-toast';
import {
  getTrendsData,
  getCheckTypeComparison,
  getRecruiterPerformance,
  getBottleneckInsights,
  getPredictiveMetrics
} from '@/shared/lib/backgroundChecks/analyticsService';
import { getPeriodComparison } from '@/shared/lib/backgroundChecks/periodComparison';
import { exportAnalyticsReport } from '@/shared/lib/backgroundChecks/analyticsExport';

export default function BackgroundChecksAnalytics() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const days = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  
  const [trendsData, setTrendsData] = useState(getTrendsData(days));
  const [checkTypeData, setCheckTypeData] = useState(getCheckTypeComparison());
  const [recruiterData, setRecruiterData] = useState(getRecruiterPerformance());
  const [bottleneckData, setBottleneckData] = useState(getBottleneckInsights());
  const [predictiveData, setPredictiveData] = useState(getPredictiveMetrics());
  const [comparisonData, setComparisonData] = useState(getPeriodComparison(dateRange.from, dateRange.to));

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [days, dateRange]);

  const refreshData = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      setTrendsData(getTrendsData(days));
      setCheckTypeData(getCheckTypeComparison());
      setRecruiterData(getRecruiterPerformance());
      setBottleneckData(getBottleneckInsights());
      setPredictiveData(getPredictiveMetrics());
      setComparisonData(getPeriodComparison(dateRange.from, dateRange.to));
      setLastRefresh(new Date());
      setIsRefreshing(false);
      
      toast({
        title: "Analytics Refreshed",
        description: `Data updated at ${new Date().toLocaleTimeString()}`,
      });
    }, 1000);
  };

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range) {
      setDateRange(range);
      const newDays = Math.floor((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
      setTrendsData(getTrendsData(newDays));
      setComparisonData(getPeriodComparison(range.from, range.to));
    }
  };

  const handleExport = () => {
    const dateRangeStr = `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
    exportAnalyticsReport(
      trendsData,
      checkTypeData,
      recruiterData,
      bottleneckData,
      predictiveData,
      dateRangeStr
    );
    
    toast({
      title: "Report Exported",
      description: "Analytics report has been downloaded as PDF",
    });
  };

  return (
    <DashboardPageLayout
      title="Background Checks Analytics"
      subtitle="Comprehensive insights into verification processes and performance"
      actions={
        <div className="text-base font-semibold flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DateRangeSelector 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Predictive Insights */}
        <PredictiveInsights metrics={predictiveData} />

        {/* Period Comparison */}
        <PeriodComparisonCard comparison={comparisonData} />

        {/* Tabs for different analysis views */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Check Type Comparison</TabsTrigger>
            <TabsTrigger value="performance">Recruiter Performance</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottleneck Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <TrendsChart data={trendsData} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <CheckTypeComparisonChart data={checkTypeData} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <RecruiterPerformanceTable data={recruiterData} />
          </TabsContent>

          <TabsContent value="bottlenecks" className="space-y-4">
            <BottleneckAnalysis insights={bottleneckData} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
