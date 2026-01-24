import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { EnhancedStatCard } from "@/components/dashboard/EnhancedStatCard";
import { StandardChartCard } from "@/components/dashboard/charts/StandardChartCard";
import { DashboardActionBar } from "@/components/dashboard/DashboardActionBar";
import { ActiveFiltersIndicator } from "@/components/dashboard/ActiveFiltersIndicator";
import { EditModeToggle } from '@/components/dashboard/EditModeToggle';
import {
  Users, UserCheck, UserX, Building2, Download, Eye, Filter,
  BarChart3, Calendar, Award, TrendingUp
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { applyLocationFilterToMetric, applyLocationFilterToTimeSeries } from "@/shared/lib/mockDataWithLocations";
import { filterByDateRange } from "@/shared/lib/dashboardFilterUtils";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const attendanceTrends = [
  { month: 'Jan', present: 92, absent: 5, late: 3 },
  { month: 'Feb', present: 94, absent: 4, late: 2 },
  { month: 'Mar', present: 93, absent: 5, late: 2 },
  { month: 'Apr', present: 95, absent: 3, late: 2 },
  { month: 'May', present: 94, absent: 4, late: 2 },
  { month: 'Jun', present: 96, absent: 2, late: 2 },
];

const employeeDistribution = [
  { department: 'Engineering', count: 145, color: '#3b82f6' },
  { department: 'Sales', count: 89, color: '#10b981' },
  { department: 'Marketing', count: 56, color: '#f59e0b' },
  { department: 'HR', count: 34, color: '#8b5cf6' },
  { department: 'Finance', count: 28, color: '#ec4899' },
  { department: 'Operations', count: 42, color: '#6366f1' },
];

const leaveAnalysis = [
  { type: 'Annual', approved: 145, pending: 23, rejected: 5 },
  { type: 'Sick', approved: 89, pending: 12, rejected: 3 },
  { type: 'Personal', approved: 56, pending: 8, rejected: 2 },
  { type: 'Unpaid', approved: 23, pending: 4, rejected: 1 },
];

const performanceOverview = [
  { quarter: 'Q1', excellent: 45, good: 78, average: 23, poor: 5 },
  { quarter: 'Q2', excellent: 52, good: 82, average: 18, poor: 3 },
  { quarter: 'Q3', excellent: 58, good: 85, average: 15, poor: 2 },
  { quarter: 'Q4', excellent: 64, good: 89, average: 12, poor: 1 },
];

export default function HRMSDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const hasActiveFilters = !!(dateRange?.from) || selectedCountry !== "all" || selectedRegion !== "all";

  // Apply location filters to metrics
  const filteredTotalEmployees = useMemo(() =>
    applyLocationFilterToMetric(394, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  const filteredLeaveRequests = useMemo(() =>
    applyLocationFilterToMetric(47, selectedCountry, selectedRegion),
    [selectedCountry, selectedRegion]
  );

  // Apply location filters to chart data
  const filteredAttendanceTrends = useMemo(() => {
    const locationFiltered = applyLocationFilterToTimeSeries(
      attendanceTrends,
      selectedCountry,
      selectedRegion,
      ['present', 'absent', 'late']
    );
    return filterByDateRange(locationFiltered, dateRange, 'month');
  }, [selectedCountry, selectedRegion, dateRange]);

  const filteredLeaveAnalysis = useMemo(() => {
    const locationFiltered = applyLocationFilterToTimeSeries(
      leaveAnalysis,
      selectedCountry,
      selectedRegion,
      ['approved', 'pending', 'rejected']
    );
    return filterByDateRange(locationFiltered, dateRange, 'type');
  }, [selectedCountry, selectedRegion, dateRange]);

  const filteredPerformanceOverview = useMemo(() => {
    const locationFiltered = applyLocationFilterToTimeSeries(
      performanceOverview,
      selectedCountry,
      selectedRegion,
      ['excellent', 'good', 'average', 'poor']
    );
    return filterByDateRange(locationFiltered, dateRange, 'quarter');
  }, [selectedCountry, selectedRegion, dateRange]);

  const handleExport = () => {
    toast({ title: "Exporting HRMS data..." });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setSelectedCountry("all");
    setSelectedRegion("all");
    toast({ title: "Filters reset" });
  };

  return (
    <DashboardPageLayout
      title="HRMS Dashboard"
      subtitle="Human resource management and employee analytics"
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
            title="Total Employees"
            value={filteredTotalEmployees.toString()}
            change="+12 this month"
            trend="up"
            icon={<Users className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View All", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/employees') },
              { label: "Add Employee", icon: <Users className="h-4 w-4" />, onClick: () => navigate('/employees/new') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Attendance Rate"
            value="95.2%"
            change="+1.8%"
            trend="up"
            icon={<UserCheck className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/attendance') },
              { label: "Reports", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Leave Requests"
            value={filteredLeaveRequests.toString()}
            change="23 pending"
            trend="up"
            icon={<Calendar className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              { label: "Review Requests", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/leave') },
              { label: "Policies", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Departments"
            value="6"
            change="394 employees"
            icon={<Building2 className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              { label: "View Structure", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/hrms/org-chart') },
              { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <StandardChartCard
            title="Attendance Trends"
            description={`Monthly attendance statistics${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading attendance trends..." })}
            menuItems={[
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredAttendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} name="Present" dot={false} activeDot={false} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={3} name="Absent" dot={false} activeDot={false} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={3} name="Late" dot={false} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Employee Distribution"
            description="By department"
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading distribution data..." })}
            menuItems={[
              { label: "View All", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/employees') },
              { label: "Org Chart", icon: <Building2 className="h-4 w-4" />, onClick: () => navigate('/hrms/org-chart') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employeeDistribution}
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
            title="Leave Analysis"
            description={`Leave requests by type${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading leave analysis..." })}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/leave') },
              { label: "Policies", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredLeaveAnalysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="type"
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
                <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <StandardChartCard
            title="Performance Overview"
            description={`Quarterly performance ratings${dateRange?.from ? ' (filtered)' : ''}`}
            className="bg-transparent border-0 shadow-none"
            onDownload={() => toast({ title: "Downloading performance data..." })}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/performance') },
              { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredPerformanceOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="quarter"
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
                <Bar dataKey="excellent" stackId="a" fill="#10b981" name="Excellent" barSize={40} />
                <Bar dataKey="good" stackId="a" fill="#3b82f6" name="Good" barSize={40} />
                <Bar dataKey="average" stackId="a" fill="#f59e0b" name="Average" barSize={40} />
                <Bar dataKey="poor" stackId="a" fill="#ef4444" name="Poor" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </StandardChartCard>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
