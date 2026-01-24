import { useState, useMemo, useEffect } from "react";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { DashboardActionBar } from "@/components/dashboard/DashboardActionBar";
import { ActiveFiltersIndicator } from "@/components/dashboard/ActiveFiltersIndicator";
import { EnhancedStatCard } from "@/components/dashboard/EnhancedStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { EditModeToggle } from '@/components/dashboard/EditModeToggle';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import {
  Briefcase, TrendingUp, TrendingDown, Clock,
  CheckCircle, AlertCircle, Download, Eye, Filter, BarChart3, Calendar, Plus
} from "lucide-react";
import { getJobs } from "@/shared/lib/mockJobStorage";
import { StandardChartCard } from "@/components/dashboard/charts/StandardChartCard";
import { useToast } from "@/shared/hooks/use-toast";
import type { DateRange } from "react-day-picker";

export default function JobsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const jobs = getJobs();

  const handleExport = () => {
    toast({ title: "Exporting jobs analytics..." });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setSelectedCountry("all");
    setSelectedRegion("all");
  };

  const hasActiveFilters =
    selectedCountry !== "all" ||
    selectedRegion !== "all" ||
    dateRange !== undefined;

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter(j => j.status === 'open').length;
    const filled = jobs.filter(j => j.status === 'filled').length;
    const draft = jobs.filter(j => j.status === 'draft').length;

    return {
      total,
      active,
      filled,
      draft,
      fillRate: total > 0 ? ((filled / total) * 100).toFixed(1) : 0,
    };
  }, [jobs]);

  // Job posting trends
  const postingTrends = [
    { month: 'Jan', posted: 45, filled: 32, active: 89 },
    { month: 'Feb', posted: 52, filled: 38, active: 103 },
    { month: 'Mar', posted: 48, filled: 35, active: 116 },
    { month: 'Apr', posted: 61, filled: 42, active: 135 },
    { month: 'May', posted: 58, filled: 47, active: 146 },
    { month: 'Jun', posted: 67, filled: 51, active: 162 },
  ];

  // Department demand
  const departmentData = [
    { name: 'Engineering', openings: 67, filled: 45, color: '#3b82f6' },
    { name: 'Sales', openings: 34, filled: 28, color: '#10b981' },
    { name: 'Marketing', openings: 23, filled: 19, color: '#f59e0b' },
    { name: 'Product', openings: 18, filled: 14, color: '#8b5cf6' },
    { name: 'Operations', openings: 15, filled: 12, color: '#ec4899' },
    { name: 'HR', openings: 8, filled: 6, color: '#06b6d4' },
  ];

  // Time to fill analysis
  const timeToFillData = [
    { range: '0-15 days', count: 45 },
    { range: '16-30 days', count: 89 },
    { range: '31-45 days', count: 67 },
    { range: '46-60 days', count: 34 },
    { range: '60+ days', count: 18 },
  ];

  // Job type distribution
  const jobTypeData = [
    { type: 'Full-time', count: 178, color: '#3b82f6' },
    { type: 'Contract', count: 45, color: '#10b981' },
    { type: 'Part-time', count: 23, color: '#f59e0b' },
    { type: 'Internship', count: 18, color: '#8b5cf6' },
  ];

  // Application volume
  const applicationVolume = [
    { week: 'W1', applications: 234 },
    { week: 'W2', applications: 289 },
    { week: 'W3', applications: 312 },
    { week: 'W4', applications: 298 },
    { week: 'W5', applications: 345 },
    { week: 'W6', applications: 378 },
  ];

  // Cost per hire
  const costPerHireData = [
    { quarter: 'Q1', cost: 4200 },
    { quarter: 'Q2', cost: 3950 },
    { quarter: 'Q3', cost: 3800 },
    { quarter: 'Q4', cost: 3600 },
  ];

  // Location demand
  const locationData = [
    { location: 'New York', openings: 45 },
    { location: 'San Francisco', openings: 42 },
    { location: 'Remote', openings: 89 },
    { location: 'London', openings: 28 },
    { location: 'Austin', openings: 23 },
  ];

  // Hiring funnel
  const funnelData = [
    { stage: 'Posted', count: 264, percentage: 100 },
    { stage: 'Applications', count: 2145, percentage: 100 },
    { stage: 'Screened', count: 876, percentage: 41 },
    { stage: 'Interviewed', count: 432, percentage: 20 },
    { stage: 'Offered', count: 178, percentage: 8 },
    { stage: 'Filled', count: 142, percentage: 7 },
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardPageLayout>
        <DashboardSkeleton />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      title="Jobs Analytics"
      subtitle="Job posting performance, hiring metrics, and recruitment efficiency"
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
            title="Total Job Postings"
            value={metrics.total.toString()}
            change="+18.2%"
            trend="up"
            icon={<Briefcase className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              { label: "View All Jobs", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/ats/jobs') },
              { label: "Create New", icon: <Plus className="h-4 w-4" />, onClick: () => navigate('/ats/jobs/new') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Active Jobs"
            value={metrics.active.toString()}
            change="Currently hiring"
            trend="up"
            icon={<AlertCircle className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View Active Jobs", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/ats/jobs?status=open') },
              { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Fill Rate"
            value={`${metrics.fillRate}%`}
            change="+2.4%"
            trend="up"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Compare", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Avg. Time to Fill"
            value="32 days"
            change="-5 days"
            trend="up"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="funnel">Hiring Funnel</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Job Posting Activity"
                description="Monthly job posting and fill rates"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading posting data..." })}
                menuItems={[
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={postingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPosted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFilled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={false} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area
                      type="monotone"
                      dataKey="posted"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPosted)"
                      name="Posted"
                    />
                    <Area
                      type="monotone"
                      dataKey="filled"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorFilled)"
                      name="Filled"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Application Volume"
                description="Weekly application submissions"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading application data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applicationVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={false} />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Job Type Distribution"
                description="Breakdown by employment type"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading job type data..." })}
                menuItems={[
                  { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      strokeWidth={0}
                    >
                      {jobTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Location Demand"
                description="Open positions by location"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading location data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="location" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="openings" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Department Hiring Demand"
                description="Open positions vs filled by department"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading department data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="openings" fill="#3b82f6" name="Open Positions" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="filled" fill="#10b981" name="Filled" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Department Fill Rates"
                description="Hiring success by department"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading fill rate data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <div className="space-y-4">
                  {departmentData.map((dept, index) => {
                    const fillRate = ((dept.filled / dept.openings) * 100).toFixed(1);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="text-base font-semibold flex items-center justify-between">
                          <div className="text-base font-semibold flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.color }}
                            />
                            <span className="text-sm font-medium">{dept.name}</span>
                          </div>
                          <div className="text-base font-semibold flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {dept.filled}/{dept.openings}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {fillRate}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${fillRate}%`,
                              backgroundColor: dept.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </StandardChartCard>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Time to Fill Distribution"
                description="How quickly positions are being filled"
                className="bg-transparent border-0 shadow-none"
                onDownload={() => toast({ title: "Downloading time to fill data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeToFillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                      {timeToFillData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#ef4444'][index]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Cost Per Hire Trend"
                description="Quarterly recruitment cost efficiency"
                className="bg-transparent border-0 shadow-none"
                showDatePicker={true}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onDownload={() => toast({ title: "Downloading cost data..." })}
                menuItems={[
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costPerHireData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${value}`} cursor={false} />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-500">32</div>
                      <div className="text-xs text-muted-foreground mt-1">Days to Fill</div>
                      <div className="text-xs text-green-500 mt-1">↓ 15% vs target</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-500">$3,600</div>
                      <div className="text-xs text-muted-foreground mt-1">Cost Per Hire</div>
                      <div className="text-xs text-green-500 mt-1">↓ $600 vs last Q</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-500">67%</div>
                      <div className="text-xs text-muted-foreground mt-1">Offer Accept Rate</div>
                      <div className="text-xs text-green-500 mt-1">↑ 5% vs last Q</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-500">4.2</div>
                      <div className="text-xs text-muted-foreground mt-1">Quality of Hire</div>
                      <div className="text-xs text-green-500 mt-1">↑ 0.3 vs target</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <StandardChartCard
              title="Hiring Funnel Analysis"
              description="Conversion rates through the recruitment process"
              onDownload={() => toast({ title: "Downloading funnel data..." })}
              menuItems={[
                { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
              ]}
            >
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-24 justify-center">
                          {stage.stage}
                        </Badge>
                        <span className="text-2xl font-bold">{stage.count.toLocaleString()}</span>
                        {index > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({stage.percentage}% conversion)
                          </span>
                        )}
                      </div>
                      {index > 0 && index < funnelData.length - 1 && (
                        <span className="text-sm text-muted-foreground">
                          {((stage.count / funnelData[index - 1].count) * 100).toFixed(1)}% pass rate
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-muted rounded-full h-8">
                      <div
                        className="h-8 rounded-full flex items-center justify-end px-3 transition-all"
                        style={{
                          width: `${index === 0 ? 100 : (stage.count / funnelData[1].count * 100)}%`,
                          backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][index]
                        }}
                      >
                        {index === 0 ? (
                          <span className="text-sm font-medium text-white">
                            {stage.count} jobs
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {((stage.count / funnelData[1].count) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">6.6%</div>
                    <div className="text-xs text-muted-foreground">Overall Conversion</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">8.1</div>
                    <div className="text-xs text-muted-foreground">Applications Per Job</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">49%</div>
                    <div className="text-xs text-muted-foreground">Interview Success</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">80%</div>
                    <div className="text-xs text-muted-foreground">Offer-to-Hire Rate</div>
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
