import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { EnhancedStatCard } from "@/modules/dashboard/components/EnhancedStatCard";
import { DashboardActionBar } from "@/modules/dashboard/components/DashboardActionBar";
import { ActiveFiltersIndicator } from "@/modules/dashboard/components/ActiveFiltersIndicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { EditModeToggle } from '@/components/dashboard/EditModeToggle';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import {
  Users, TrendingUp, TrendingDown, Clock,
  CheckCircle, Award, Download, Eye, Filter, BarChart3, Calendar, Plus
} from "lucide-react";
import { getCandidates } from "@/shared/lib/mockCandidateStorage";
import { StandardChartCard } from "@/modules/dashboard/components/charts/StandardChartCard";
import { useToast } from "@/shared/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { applyLocationFilterToMetric } from "@/shared/lib/mockDataWithLocations";

export default function CandidatesDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const candidates = getCandidates();

  const hasActiveFilters = !!(dateRange?.from) || selectedCountry !== "all" || selectedRegion !== "all";

  const handleExport = () => {
    toast({ title: "Exporting candidate analytics..." });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setSelectedCountry("all");
    setSelectedRegion("all");
    toast({ title: "Filters reset" });
  };

  // Calculate metrics with location filtering
  const metrics = useMemo(() => {
    const total = applyLocationFilterToMetric(candidates.length, selectedCountry, selectedRegion);
    const active = applyLocationFilterToMetric(
      candidates.filter(c => c.status === 'active').length,
      selectedCountry,
      selectedRegion
    );
    const placed = applyLocationFilterToMetric(
      candidates.filter(c => c.status === 'placed').length,
      selectedCountry,
      selectedRegion
    );
    const inactive = applyLocationFilterToMetric(
      candidates.filter(c => c.status === 'inactive').length,
      selectedCountry,
      selectedRegion
    );

    return {
      total,
      active,
      placed,
      inactive,
      placementRate: total > 0 ? ((placed / total) * 100).toFixed(1) : 0,
      activeRate: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
    };
  }, [candidates, selectedCountry, selectedRegion]);

  // Monthly trends data
  const monthlyTrends = [
    { month: 'Jan', applications: 145, placed: 23, active: 89, inactive: 33 },
    { month: 'Feb', applications: 167, placed: 28, active: 102, inactive: 37 },
    { month: 'Mar', applications: 189, placed: 31, active: 118, inactive: 40 },
    { month: 'Apr', applications: 203, placed: 35, active: 128, inactive: 40 },
    { month: 'May', applications: 221, placed: 38, active: 139, inactive: 44 },
    { month: 'Jun', applications: 238, placed: 42, active: 151, inactive: 45 },
  ];

  // Source breakdown
  const sourceData = [
    { name: 'LinkedIn', value: 145, color: '#0077b5' },
    { name: 'Indeed', value: 98, color: '#2164f3' },
    { name: 'Referral', value: 87, color: '#10b981' },
    { name: 'Career Site', value: 76, color: '#f59e0b' },
    { name: 'Agency', value: 54, color: '#8b5cf6' },
    { name: 'Other', value: 42, color: '#6b7280' },
  ];

  // Experience level distribution
  const experienceData = [
    { level: 'Entry', count: 123, percentage: 24.6 },
    { level: 'Mid-Level', count: 198, percentage: 39.6 },
    { level: 'Senior', count: 145, percentage: 29.0 },
    { level: 'Executive', count: 34, percentage: 6.8 },
  ];

  // Time to hire trends
  const timeToHireData = [
    { month: 'Jan', days: 28 },
    { month: 'Feb', days: 26 },
    { month: 'Mar', days: 25 },
    { month: 'Apr', days: 23 },
    { month: 'May', days: 21 },
    { month: 'Jun', days: 20 },
  ];

  // Top skills in demand
  const topSkills = [
    { skill: 'React', count: 234 },
    { skill: 'TypeScript', count: 198 },
    { skill: 'Python', count: 176 },
    { skill: 'Node.js', count: 156 },
    { skill: 'AWS', count: 145 },
    { skill: 'SQL', count: 134 },
    { skill: 'Docker', count: 123 },
    { skill: 'GraphQL', count: 98 },
  ];

  // Conversion funnel
  const funnelData = [
    { stage: 'Applied', count: 1250, color: '#3b82f6' },
    { stage: 'Screening', count: 875, color: '#8b5cf6' },
    { stage: 'Interview', count: 420, color: '#ec4899' },
    { stage: 'Offer', count: 125, color: '#f59e0b' },
    { stage: 'Placed', count: 98, color: '#10b981' },
  ];

  return (
    <DashboardPageLayout
      title="Candidates Analytics"
      subtitle="Track recruitment metrics and candidate pipeline performance"
      breadcrumbActions={
        !isEditMode ? (
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
        ) : undefined
      }
      dashboardActions={<EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />}
    >
      <div className="p-6 space-y-6">
        {/* Active Filters */}
        {!isEditMode && (
          <ActiveFiltersIndicator
            selectedCountry={selectedCountry}
            selectedRegion={selectedRegion}
            dateRange={dateRange}
            onClearCountry={() => setSelectedCountry("all")}
            onClearRegion={() => setSelectedRegion("all")}
            onClearDateRange={() => setDateRange(undefined)}
          />
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Candidates"
            value={metrics.total.toString()}
            change="+12.5%"
            trend="up"
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              { label: "View All Candidates", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/candidates') },
              { label: "Add Candidate", icon: <Plus className="h-4 w-4" />, onClick: () => navigate('/candidates?action=create') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Active Candidates"
            value={metrics.active.toString()}
            change={`${metrics.activeRate}% of total`}
            trend="up"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View Active", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/candidates?status=active') },
              { label: "View Pipeline", icon: <Filter className="h-4 w-4" />, onClick: () => navigate('/candidates/pipeline') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Placement Rate"
            value={`${metrics.placementRate}%`}
            change="+3.2%"
            trend="up"
            icon={<Award className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View Placements", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/candidates?status=placed') },
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Avg. Time to Hire"
            value="21 days"
            change="-2 days"
            trend="up"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Application Trends"
                description={`Monthly candidate applications over time${dateRange?.from ? ' (filtered)' : ''}`}
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading application trends..." })}
                menuItems={[
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorApplications)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Status Distribution"
                description={`Candidate pipeline by status${dateRange?.from ? ' (filtered)' : ''}`}
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading status data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="active" fill="#10b981" name="Active" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="placed" fill="#3b82f6" name="Placed" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="inactive" fill="#6b7280" name="Inactive" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Time to Hire Trend"
                description={`Average days from application to placement${dateRange?.from ? ' (filtered)' : ''}`}
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading time to hire data..." })}
                menuItems={[
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeToHireData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Line
                      type="monotone"
                      dataKey="days"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Experience Level Distribution"
                description="Candidates by experience level"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading experience data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={experienceData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="level"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                      {experienceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Candidate Sources"
                description="Where candidates are coming from"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading source data..." })}
                menuItems={[
                  { label: "View All Sources", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter by Source", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={130}
                      labelLine={false}
                      label={false}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Source Performance"
                description="Candidates by source channel"
                onDownload={() => toast({ title: "Downloading performance data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <div className="space-y-4">
                  {sourceData.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <div className="text-base font-semibold flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="text-sm font-medium">{source.name}</span>
                        </div>
                        <span className="text-sm font-bold">{source.value}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(source.value / 502) * 100}%`,
                            backgroundColor: source.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </StandardChartCard>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <StandardChartCard
              title="Top Skills in Demand"
              description="Most requested skills across open positions"
              className="bg-transparent border-0 shadow-none"
              onDownload={() => toast({ title: "Downloading skills data..." })}
              menuItems={[
                { label: "View All Skills", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
              ]}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topSkills} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="skill"
                    type="category"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </StandardChartCard>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <StandardChartCard
              title="Recruitment Funnel"
              description="Candidate progression through hiring stages"
              onDownload={() => toast({ title: "Downloading funnel data..." })}
              menuItems={[
                { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
              ]}
            >
              <div className="space-y-4">
                {funnelData.map((stage, index) => {
                  const percentage = index === 0 ? 100 : ((stage.count / funnelData[0].count) * 100).toFixed(1);
                  const dropOff = index > 0
                    ? ((funnelData[index - 1].count - stage.count) / funnelData[index - 1].count * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="w-20 justify-center"
                            style={{ borderColor: stage.color, color: stage.color }}
                          >
                            {stage.stage}
                          </Badge>
                          <span className="text-2xl font-bold">{stage.count}</span>
                          <span className="text-sm text-muted-foreground">
                            ({percentage}% of total)
                          </span>
                        </div>
                        {index > 0 && (
                          <span className="text-sm text-destructive">
                            -{dropOff}% drop-off
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-8">
                        <div
                          className="h-8 rounded-full flex items-center justify-end px-3 transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: stage.color
                          }}
                        >
                          <span className="text-sm font-medium text-white">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">7.8%</div>
                    <div className="text-xs text-muted-foreground">Conversion Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">30%</div>
                    <div className="text-xs text-muted-foreground">Screening Pass</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">48%</div>
                    <div className="text-xs text-muted-foreground">Interview Pass</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">78%</div>
                    <div className="text-xs text-muted-foreground">Offer Acceptance</div>
                  </div>
                </div>
              </div>
            </StandardChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
