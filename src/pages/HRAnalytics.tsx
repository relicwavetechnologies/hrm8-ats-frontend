import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { StandardChartCard } from "@/components/dashboard/charts/StandardChartCard";
import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker-v2";
import type { DateRange } from "react-day-picker";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { Users, Briefcase, TrendingUp, DollarSign, MapPin, Award, Eye, Plus, Calendar, BarChart3, Download } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { useCurrencyFormat } from "@/app/providers/CurrencyFormatContext";
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/shared/hooks/use-toast";

export default function HRAnalytics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const employees = getEmployees();

  const handleExport = () => {
    toast({
      title: "Exporting Analytics",
      description: "Preparing your HR analytics export...",
    });
  };

  const analytics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const onLeave = employees.filter(e => e.status === 'on-leave').length;
    const noticePeriod = employees.filter(e => e.status === 'notice-period').length;

    const byDepartment = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = employees.reduce((acc, emp) => {
      acc[emp.location] = (acc[emp.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byEmploymentType = employees.reduce((acc, emp) => {
      acc[emp.employmentType] = (acc[emp.employmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgSalary = employees.reduce((sum, emp) => sum + emp.salary, 0) / total;
    const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);

    const allSkills = employees.flatMap(e => e.skills || []);
    const skillCounts = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      total,
      active,
      onLeave,
      noticePeriod,
      byDepartment,
      byLocation,
      byEmploymentType,
      avgSalary,
      totalPayroll,
      topSkills,
    };
  }, [employees]);

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">HR Analytics</h1>
            <p className="text-muted-foreground">
              Insights and statistics about your workforce
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select period"
              align="end"
            />
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Employees"
            value={analytics.total.toString()}
            change={`${analytics.active} active`}
            trend="up"
            icon={<Users className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              {
                label: "View All",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/employees')
              },
              {
                label: "Add Employee",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => navigate('/employees?action=create')
              },
              {
                label: "View Org Chart",
                icon: <BarChart3 className="h-4 w-4" />,
                onClick: () => navigate('/org-chart')
              }
            ]}
          />

          <EnhancedStatCard
            title="On Leave"
            value={analytics.onLeave.toString()}
            change={`${analytics.noticePeriod} in notice period`}
            trend={analytics.onLeave > 10 ? "up" : "down"}
            icon={<Calendar className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              {
                label: "View Leave Calendar",
                icon: <Calendar className="h-4 w-4" />,
                onClick: () => navigate('/leave-calendar')
              },
              {
                label: "Approve Requests",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/leave-requests')
              }
            ]}
          />

          <EnhancedStatCard
            title="Average Salary"
            value=""
            isCurrency={true}
            rawValue={analytics.avgSalary}
            change="Per employee"
            trend="up"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              {
                label: "View Compensation Report",
                icon: <BarChart3 className="h-4 w-4" />,
                onClick: () => {}
              },
              {
                label: "Export Data",
                icon: <Download className="h-4 w-4" />,
                onClick: () => {}
              }
            ]}
          />

          <EnhancedStatCard
            title="Total Payroll"
            value=""
            isCurrency={true}
            rawValue={analytics.totalPayroll}
            change="Monthly total"
            trend="up"
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              {
                label: "View Payroll Details",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {}
              },
              {
                label: "Run Payroll",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => {}
              },
              {
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                onClick: () => {}
              }
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StandardChartCard
            title="Employees by Department"
            description="Distribution across departments"
            showDatePicker={false}
            onDownload={() => toast({ title: "Downloading department data..." })}
            menuItems={[
              { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
              { label: "Filter Data", icon: <BarChart3 className="h-4 w-4" />, onClick: () => {} },
              { label: "Export Data", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <div className="space-y-4">
              {Object.entries(analytics.byDepartment)
                .sort((a, b) => b[1] - a[1])
                .map(([dept, count]) => (
                  <div key={dept} className="space-y-2">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <span className="text-sm font-medium">{dept}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({Math.round((count / analytics.total) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(count / analytics.total) * 100} />
                  </div>
                ))}
            </div>
          </StandardChartCard>

          <StandardChartCard
            title="Employees by Location"
            description="Geographic distribution"
            showDatePicker={false}
            onDownload={() => toast({ title: "Downloading location data..." })}
            menuItems={[
              { label: "View Map", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
              { label: "Export Data", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <div className="space-y-4">
              {Object.entries(analytics.byLocation)
                .sort((a, b) => b[1] - a[1])
                .map(([location, count]) => (
                  <div key={location} className="space-y-2">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <div className="text-base font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{location}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {count} ({Math.round((count / analytics.total) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(count / analytics.total) * 100} />
                  </div>
                ))}
            </div>
          </StandardChartCard>

          <StandardChartCard
            title="Employment Type Distribution"
            description="Breakdown by employment type"
            showDatePicker={false}
            onDownload={() => toast({ title: "Downloading employment data..." })}
            menuItems={[
              { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
              { label: "Export Data", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <div className="space-y-4">
              {Object.entries(analytics.byEmploymentType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="text-base font-semibold flex items-center justify-between">
                    <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                    <Badge variant="secondary">
                      {count} ({Math.round((count / analytics.total) * 100)}%)
                    </Badge>
                  </div>
                ))}
            </div>
          </StandardChartCard>

          <StandardChartCard
            title="Top Skills"
            description="Most common skills in workforce"
            showDatePicker={false}
            onDownload={() => toast({ title: "Downloading skills data..." })}
            menuItems={[
              { label: "View All Skills", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
              { label: "Export Data", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          >
            <div className="space-y-3">
              {analytics.topSkills.length > 0 ? (
                analytics.topSkills.map(([skill, count]) => (
                  <div key={skill} className="text-base font-semibold flex items-center justify-between">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{skill}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No skills data available
                </p>
              )}
            </div>
          </StandardChartCard>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
