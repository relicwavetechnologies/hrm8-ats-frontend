import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { EnhancedStatCard } from "@/modules/dashboard/components/EnhancedStatCard";
import { StandardChartCard } from "@/modules/dashboard/components/charts/StandardChartCard";
import { DashboardActionBar } from "@/modules/dashboard/components/DashboardActionBar";
import { ActiveFiltersIndicator } from "@/modules/dashboard/components/ActiveFiltersIndicator";
import { EditModeToggle } from '@/modules/dashboard/components/EditModeToggle';
import {
  Users, Briefcase, TrendingUp, DollarSign, Download, Eye, Filter as FilterIcon,
  BarChart3, Building2, Target, CheckCircle
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { isWithinInterval } from "date-fns";
import {
  applyLocationFilterToMetric,
  applyLocationFilterToTimeSeries,
  getTotalByLocationFilter,
  clientsByLocation,
  projectsByLocation
} from "@/shared/lib/mockDataWithLocations";

const hiringTrends = [
  { month: 'Jan', hires: 45, applications: 320, interviews: 128 },
  { month: 'Feb', hires: 52, applications: 385, interviews: 145 },
  { month: 'Mar', hires: 48, applications: 402, interviews: 136 },
  { month: 'Apr', hires: 61, applications: 445, interviews: 167 },
  { month: 'May', hires: 58, applications: 468, interviews: 159 },
  { month: 'Jun', hires: 64, applications: 512, interviews: 178 },
];

const revenueExpenses = [
  { month: 'Jan', revenue: 245000, expenses: 182000 },
  { month: 'Feb', revenue: 268000, expenses: 195000 },
  { month: 'Mar', revenue: 289000, expenses: 201000 },
  { month: 'Apr', revenue: 312000, expenses: 215000 },
  { month: 'May', revenue: 334000, expenses: 228000 },
  { month: 'Jun', revenue: 356000, expenses: 235000 },
];

const employeeDistribution = [
  { department: 'Engineering', count: 145, color: '#3b82f6' },
  { department: 'Sales', count: 89, color: '#10b981' },
  { department: 'Marketing', count: 56, color: '#f59e0b' },
  { department: 'HR', count: 34, color: '#8b5cf6' },
  { department: 'Finance', count: 28, color: '#ec4899' },
  { department: 'Operations', count: 42, color: '#6366f1' },
];

const projectPipeline = [
  { status: 'Lead', count: 15 },
  { status: 'Proposal', count: 12 },
  { status: 'Negotiation', count: 8 },
  { status: 'Active', count: 32 },
  { status: 'Completed', count: 45 },
];

export default function OverviewDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const hasActiveFilters = !!(dateRange?.from) || selectedCountry !== "all" || selectedRegion !== "all";

  // Calculate filtered metrics
  const filteredTotalEmployees = useMemo(() =>
    applyLocationFilterToMetric(394, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  const filteredActiveProjects = useMemo(() =>
    getTotalByLocationFilter(projectsByLocation, selectedCountry, selectedRegion, 'active'),
    [selectedCountry, selectedRegion]
  );

  const filteredMonthlyRevenue = useMemo(() =>
    applyLocationFilterToMetric(356000, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  const filteredTotalClients = useMemo(() =>
    getTotalByLocationFilter(clientsByLocation, selectedCountry, selectedRegion, 'count'),
    [selectedCountry, selectedRegion]
  );

  // Filter data based on date range and location
  const filteredHiringTrends = useMemo(() => {
    let data = hiringTrends;

    // Apply date filter
    if (dateRange?.from) {
      data = data.filter((item) => {
        const itemDate = new Date(2024, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].indexOf(item.month), 1);
        return isWithinInterval(itemDate, {
          start: dateRange.from!,
          end: dateRange.to || dateRange.from!,
        });
      });
    }

    // Apply location filter
    return applyLocationFilterToTimeSeries(
      data,
      selectedCountry,
      selectedRegion,
      ['hires', 'applications', 'interviews']
    );
  }, [dateRange, selectedCountry, selectedRegion]);

  const filteredRevenueExpenses = useMemo(() => {
    let data = revenueExpenses;

    // Apply date filter
    if (dateRange?.from) {
      data = data.filter((item) => {
        const itemDate = new Date(2024, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].indexOf(item.month), 1);
        return isWithinInterval(itemDate, {
          start: dateRange.from!,
          end: dateRange.to || dateRange.from!,
        });
      });
    }

    // Apply location filter
    return applyLocationFilterToTimeSeries(
      data,
      selectedCountry,
      selectedRegion,
      ['revenue', 'expenses']
    );
  }, [dateRange, selectedCountry, selectedRegion]);

  const filteredEmployeeDistribution = useMemo(() => {
    return employeeDistribution;
  }, []);

  const filteredProjectPipeline = useMemo(() => {
    return projectPipeline;
  }, []);

  const handleExport = () => {
    toast({
      title: "Exporting overview data...",
      description: "Preparing your export..."
    });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setSelectedCountry("all");
    setSelectedRegion("all");
    toast({ title: "Filters reset" });
  };

  return (
    <DashboardPageLayout
      title="Overview Dashboard"
      subtitle="Comprehensive view of your organization's key metrics"
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
        <ActiveFiltersIndicator
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          dateRange={dateRange}
          onClearCountry={() => setSelectedCountry("all")}
          onClearRegion={() => setSelectedRegion("all")}
          onClearDateRange={() => setDateRange(undefined)}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Employees"
            value={filteredTotalEmployees.toString()}
            change="+12.5%"
            trend="up"
            icon={<Users className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View All", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/hrms') },
              { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => navigate('/hrms/analytics') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Active Projects"
            value={filteredActiveProjects.toString()}
            change="+8.3%"
            trend="up"
            icon={<Target className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View Projects", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/recruitment-services') },
              { label: "Pipeline", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Monthly Revenue"
            value=""
            isCurrency={true}
            rawValue={filteredMonthlyRevenue}
            change="+15.2%"
            trend="up"
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/finance') },
              { label: "Forecast", icon: <TrendingUp className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Total Clients"
            value={filteredTotalClients.toString()}
            change="+5.7%"
            trend="up"
            icon={<Building2 className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              { label: "View Clients", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/employers') },
              { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <StandardChartCard
            title="Hiring Trends"
            description={`Monthly hiring activity${hasActiveFilters ? ' (filtered)' : ''}`}
            onDownload={() => toast({ title: "Downloading hiring trends..." })}
            className="bg-transparent border-0 shadow-none"
            menuItems={[
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => navigate('/analytics') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredHiringTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  dataKey="hires"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="interviews"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Revenue vs Expenses"
            description={`Financial performance comparison${hasActiveFilters ? ' (filtered)' : ''}`}
            onDownload={() => toast({ title: "Downloading financial data..." })}
            className="bg-transparent border-0 shadow-none"
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/finance') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredRevenueExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" fill="#38bdf8" name="Expenses" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Employee Distribution"
            description="By department"
            onDownload={() => toast({ title: "Downloading employee data..." })}
            className="bg-transparent border-0 shadow-none"
            menuItems={[
              { label: "View All", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/hrms') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filteredEmployeeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  labelLine={false}
                  label={false}
                  fill="#8884d8"
                  dataKey="count"
                  strokeWidth={0}
                >
                  {employeeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Project Pipeline"
            description="Projects by status"
            onDownload={() => toast({ title: "Downloading pipeline data..." })}
            className="bg-transparent border-0 shadow-none"
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/recruitment-services') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredProjectPipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        </div>
      </div>
    </DashboardPageLayout>
  );
}
