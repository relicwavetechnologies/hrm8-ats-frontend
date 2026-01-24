import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { EnhancedStatCard } from "@/modules/dashboard/components/EnhancedStatCard";
import { StandardChartCard } from "@/modules/dashboard/components/charts/StandardChartCard";
import { DashboardActionBar } from "@/modules/dashboard/components/DashboardActionBar";
import { ActiveFiltersIndicator } from "@/modules/dashboard/components/ActiveFiltersIndicator";
import { EditModeToggle } from '@/modules/dashboard/components/EditModeToggle';
import {
  Briefcase, Users, Target, TrendingUp, Download, Eye, Filter,
  BarChart3, DollarSign, Award, CheckCircle, UserCog
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { applyLocationFilterToMetric, applyLocationFilterToTimeSeries } from "@/shared/lib/mockDataWithLocations";
import { filterByDateRange } from "@/shared/lib/dashboardFilterUtils";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const servicePipeline = [
  { status: 'Discovery', count: 12 },
  { status: 'Active', count: 28 },
  { status: 'Shortlisting', count: 15 },
  { status: 'Interviewing', count: 18 },
  { status: 'Completed', count: 52 },
];

const serviceTypeDistribution = [
  { type: 'Shortlisting', count: 45, color: '#3b82f6' },
  { type: 'Full Service', count: 38, color: '#10b981' },
  { type: 'Executive Search', count: 22, color: '#f59e0b' },
  { type: 'RPO', count: 18, color: '#8b5cf6' },
  { type: 'Temp Staffing', count: 12, color: '#ec4899' },
];

const consultantPerformance = [
  { consultant: 'Sarah Chen', placements: 28, satisfaction: 4.8 },
  { consultant: 'Mike Johnson', placements: 25, satisfaction: 4.7 },
  { consultant: 'Emily Davis', placements: 22, satisfaction: 4.9 },
  { consultant: 'David Lee', placements: 20, satisfaction: 4.6 },
  { consultant: 'Ana Martinez', placements: 18, satisfaction: 4.8 },
];

const revenueTrends = [
  { month: 'Jan', revenue: 145000, target: 140000 },
  { month: 'Feb', revenue: 162000, target: 155000 },
  { month: 'Mar', revenue: 178000, target: 170000 },
  { month: 'Apr', revenue: 195000, target: 185000 },
  { month: 'May', revenue: 212000, target: 200000 },
  { month: 'Jun', revenue: 228000, target: 220000 },
];

const projectCompletionRate = [
  { month: 'Jan', completed: 8, total: 12, rate: 67 },
  { month: 'Feb', completed: 9, total: 14, rate: 64 },
  { month: 'Mar', completed: 11, total: 15, rate: 73 },
  { month: 'Apr', completed: 12, total: 16, rate: 75 },
  { month: 'May', completed: 14, total: 18, rate: 78 },
  { month: 'Jun', completed: 15, total: 19, rate: 79 },
];

export default function RecruitmentServicesDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const hasActiveFilters = !!(dateRange?.from) || selectedCountry !== "all" || selectedRegion !== "all";

  // Apply location filters to metrics
  const filteredActiveProjects = useMemo(() =>
    applyLocationFilterToMetric(28, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  const filteredServiceRevenue = useMemo(() =>
    applyLocationFilterToMetric(228000, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  const filteredCompletedProjects = useMemo(() =>
    applyLocationFilterToMetric(52, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  // Apply location filters to chart data
  const filteredServicePipeline = useMemo(() => {
    return applyLocationFilterToTimeSeries(
      servicePipeline,
      selectedCountry,
      selectedRegion,
      ['count']
    );
  }, [selectedCountry, selectedRegion]);

  const filteredConsultantPerformance = useMemo(() => {
    return applyLocationFilterToTimeSeries(
      consultantPerformance,
      selectedCountry,
      selectedRegion,
      ['placements', 'satisfaction']
    );
  }, [selectedCountry, selectedRegion]);

  const filteredRevenueTrends = useMemo(() => {
    const locationFiltered = applyLocationFilterToTimeSeries(
      revenueTrends,
      selectedCountry,
      selectedRegion,
      ['revenue', 'target']
    );
    return filterByDateRange(locationFiltered, dateRange, 'month');
  }, [selectedCountry, selectedRegion, dateRange]);

  const filteredProjectCompletionRate = useMemo(() => {
    const locationFiltered = applyLocationFilterToTimeSeries(
      projectCompletionRate,
      selectedCountry,
      selectedRegion,
      ['completed', 'total', 'rate']
    );
    return filterByDateRange(locationFiltered, dateRange, 'month');
  }, [selectedCountry, selectedRegion, dateRange]);

  const handleExport = () => {
    toast({ title: "Exporting recruitment services data..." });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setSelectedCountry("all");
    setSelectedRegion("all");
    toast({ title: "Filters reset" });
  };

  return (
    <DashboardPageLayout
      title="Recruitment Services Dashboard"
      subtitle="Track service projects, performance, and revenue metrics"
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
        {/* Active Filters Indicator */}
        <ActiveFiltersIndicator
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          dateRange={dateRange}
          onClearCountry={() => setSelectedCountry("all")}
          onClearRegion={() => setSelectedRegion("all")}
          onClearDateRange={() => setDateRange(undefined)}
        />

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Active Projects"
            value={filteredActiveProjects.toString()}
            change="+15.2%"
            trend="up"
            icon={<Briefcase className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View All", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/recruitment-services') },
              { label: "Create New", icon: <Target className="h-4 w-4" />, onClick: () => navigate('/recruitment-services?action=create') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Service Revenue"
            value=""
            isCurrency={true}
            rawValue={filteredServiceRevenue}
            change="+18.3%"
            trend="up"
            icon={<DollarSign className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Forecast", icon: <TrendingUp className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Success Rate"
            value="78.9%"
            change="+4.2%"
            trend="up"
            icon={<Award className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Completed Projects"
            value={filteredCompletedProjects.toString()}
            change="15 this month"
            trend="up"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View History", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Reports", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <StandardChartCard
            title="Service Pipeline"
            description={`Projects by status${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading pipeline data..." })}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredServicePipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" fill="#8b5cf6" name="Projects" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Service Type Distribution"
            description="Projects by service type"
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading distribution data..." })}
            menuItems={[
              { label: "View All Types", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  labelLine={false}
                  label={false}
                  fill="#8884d8"
                  dataKey="count"
                  strokeWidth={0}
                >
                  {serviceTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Consultant Performance"
            description={`Top performing consultants${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading performance data..." })}
            menuItems={[
              { label: "View All", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/consultants') },
              { label: "Leaderboard", icon: <Award className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredConsultantPerformance} layout="horizontal" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="consultant"
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
                <Bar dataKey="placements" fill="#3b82f6" name="Placements" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Revenue Trends"
            description={`Monthly revenue vs target${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading revenue trends..." })}
            menuItems={[
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Forecast", icon: <TrendingUp className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredRevenueTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  width={50}
                />
                <Tooltip
                  cursor={false}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue" dot={false} activeDot={false} />
                <Line type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" name="Target" dot={false} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Project Completion Rate"
            description={`Monthly completion metrics${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading completion data..." })}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredProjectCompletionRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="total" fill="#94a3b8" name="Total" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </StandardChartCard>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
