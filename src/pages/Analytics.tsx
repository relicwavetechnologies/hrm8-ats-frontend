import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";
import { getCandidates } from "@/shared/lib/mockCandidateStorage";
import { 
  calculateRecruitmentMetrics, 
  calculatePipelineMetrics,
  calculateSourceEffectiveness,
  calculateTimeToHireTrend,
  calculateCandidateTrends,
  calculateConversionFunnel
} from "@/shared/lib/analyticsService";
import { MetricsOverview } from "@/components/analytics/MetricsOverview";
import { PipelineFunnelChart } from "@/components/analytics/PipelineFunnelChart";
import { SourceEffectivenessChart } from "@/components/analytics/SourceEffectivenessChart";
import { TimeToHireTrendChart } from "@/components/analytics/TimeToHireTrendChart";
import { CandidateTrendChart } from "@/components/analytics/CandidateTrendChart";
import { PipelineStageMetrics } from "@/components/analytics/PipelineStageMetrics";
import { useToast } from "@/shared/hooks/use-toast";

export default function Analytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "12m">("6m");
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel");

  const candidates = useMemo(() => getCandidates(), []);
  
  const metrics = useMemo(() => calculateRecruitmentMetrics(candidates), [candidates]);
  const pipelineMetrics = useMemo(() => calculatePipelineMetrics(candidates), [candidates]);
  const sourceEffectiveness = useMemo(() => calculateSourceEffectiveness(candidates), [candidates]);
  
  const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
  const timeToHireTrend = useMemo(() => calculateTimeToHireTrend(candidates, monthsToShow), [candidates, monthsToShow]);
  const candidateTrends = useMemo(() => calculateCandidateTrends(candidates, monthsToShow), [candidates, monthsToShow]);
  const conversionFunnel = useMemo(() => calculateConversionFunnel(candidates), [candidates]);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: `Exporting analytics data as ${exportFormat.toUpperCase()}...`,
    });
    
    // Mock export functionality
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Analytics data has been exported successfully.",
      });
    }, 1500);
  };

  return (
    <DashboardPageLayout>
      <div className="space-y-6 p-6 animate-fade-in">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recruitment Analytics</h1>
            <p className="text-muted-foreground">
              Track candidate pipeline, source effectiveness, and hiring metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <MetricsOverview metrics={metrics} />

        {/* Charts & Insights */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <PipelineStageMetrics data={pipelineMetrics} />
              <PipelineFunnelChart data={conversionFunnel} />
            </div>
            <SourceEffectivenessChart data={sourceEffectiveness} />
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <PipelineStageMetrics data={pipelineMetrics} />
            <PipelineFunnelChart data={conversionFunnel} />
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <SourceEffectivenessChart data={sourceEffectiveness} />
            <div className="grid gap-4 md:grid-cols-3">
              {sourceEffectiveness.slice(0, 3).map((source) => (
                <div key={source.source} className="p-6 border rounded-lg bg-card">
                  <h3 className="font-semibold mb-4">{source.source}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Candidates</span>
                      <span className="font-medium">{source.candidates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Hired</span>
                      <span className="font-medium text-green-600">{source.hired}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-medium">{source.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Rating</span>
                      <span className="font-medium">{source.averageRating}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TimeToHireTrendChart data={timeToHireTrend} />
            <CandidateTrendChart data={candidateTrends} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
