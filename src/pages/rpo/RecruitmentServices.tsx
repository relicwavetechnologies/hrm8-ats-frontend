import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, FolderKanban, Users, Briefcase, Target, Building, DollarSign, FileText, Eye, BarChart3 } from 'lucide-react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { Button } from '@/shared/components/ui/button';
import { DataTable } from '@/shared/components/tables/DataTable';
import { EnhancedStatCard } from '@/modules/dashboard/components/EnhancedStatCard';
import { createServiceProjectColumns } from '@/modules/rpo/components/recruitment-services/ServiceProjectTableColumns';
import { getAllServiceProjects, getServiceStats, updateServiceProject } from '@/shared/lib/recruitmentServiceStorage';
import { toast } from 'sonner';
import type { ServiceProject } from '@/shared/types/recruitmentService';
import type { ServiceStats } from '@/shared/types/recruitmentService';
import { useCurrencyFormat } from '@/app/providers/CurrencyFormatContext';

export default function RecruitmentServices() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormat();
  const [projects, setProjects] = useState<ServiceProject[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const projectsData = getAllServiceProjects();
      const statsData = getServiceStats();
      setProjects(projectsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load service projects:', err);
      toast.error('Failed to load service projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleView = (id: string) => {
    toast.info('Project detail view coming soon!');
  };

  const handleEdit = (id: string) => {
    toast.info('Edit project coming soon!');
  };

  const handleViewTasks = (id: string) => {
    toast.info('Task management coming soon!');
  };

  const handleArchive = (id: string) => {
    try {
      const updated = updateServiceProject(id, { status: 'cancelled' });
      if (updated) {
        setProjects(projects.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
        toast.success('Project archived successfully!');
      } else {
        toast.error('Failed to archive project');
      }
    } catch (err) {
      console.error('Archive error:', err);
      toast.error('Failed to archive project');
    }
  };

  const columns = createServiceProjectColumns(
    handleView,
    handleEdit,
    handleViewTasks,
    handleArchive
  );

  return (
    <DashboardPageLayout
      breadcrumbActions={
        <>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        <AtsPageHeader title="Recruitment Services" subtitle="Manage and track all recruitment service projects">
          <div className="flex gap-2 items-center">
            <Button variant="outline" asChild>
              <Link to="/recruitment-services/rpo">
                <FileText className="mr-2 h-4 w-4" />
                RPO Dashboard
              </Link>
            </Button>
            <Button onClick={() => toast.info('New service project coming soon!')}>
              <Plus className="mr-2 h-4 w-4" />
              New Service Project
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/recruitment-services">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </AtsPageHeader>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <EnhancedStatCard
              title="Active Projects"
              value={stats.totalActive.toString()}
              change="+7"
              icon={<FolderKanban className="h-6 w-6" />}
              variant="neutral"
              showMenu={true}
              menuItems={[
                {
                  label: "View All Projects",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => navigate('/recruitment-services')
                },
                {
                  label: "Create Project",
                  icon: <Plus className="h-4 w-4" />,
                  onClick: () => toast.info('New service project coming soon!')
                }
              ]}
            />
            
            <EnhancedStatCard
              title="Shortlisting"
              value={stats.byType.shortlisting.toString()}
              change="Projects"
              icon={<Users className="h-6 w-6" />}
              variant="primary"
              showMenu={true}
              menuItems={[
                {
                  label: "View Shortlisting",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => navigate('/recruitment-services')
                }
              ]}
            />

            <EnhancedStatCard
              title="Full-Service"
              value={stats.byType.fullService.toString()}
              change="Projects"
              icon={<Briefcase className="h-6 w-6" />}
              variant="success"
              showMenu={true}
              menuItems={[
                {
                  label: "View Full-Service",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => navigate('/recruitment-services')
                }
              ]}
            />

            <EnhancedStatCard
              title="Executive Search"
              value={stats.byType.executiveSearch.toString()}
              change="Projects"
              icon={<Target className="h-6 w-6" />}
              variant="warning"
              showMenu={true}
              menuItems={[
                {
                  label: "View Executive",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => navigate('/recruitment-services')
                }
              ]}
            />

            <EnhancedStatCard
              title="RPO"
              value={stats.byType.rpo.toString()}
              change="Contracts"
              icon={<Building className="h-6 w-6" />}
              variant="primary"
              showMenu={true}
              menuItems={[
                {
                  label: "View RPO",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => navigate('/recruitment-services/rpo')
                }
              ]}
            />

            <EnhancedStatCard
              title="Service Revenue"
              value={stats.totalRevenue.toString()}
              change="+22%"
              icon={<DollarSign className="h-6 w-6" />}
              variant="success"
              isCurrency={true}
              rawValue={stats.totalRevenue}
              showMenu={true}
              menuItems={[
                {
                  label: "View Report",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => navigate('/dashboard/recruitment-services')
                },
                {
                  label: "Export",
                  icon: <Download className="h-4 w-4" />,
                  onClick: () => {}
                }
              ]}
            />
          </div>
        ) : null}

        {/* Data Table */}
        <div className="overflow-x-auto -mx-1 px-1">
          <DataTable
            columns={columns}
            data={projects}
            selectable
            searchable
            searchKeys={['name', 'clientName']}
            typeFilter
            typeOptions={[
              { label: 'Shortlisting', value: 'shortlisting' },
              { label: 'Full-Service', value: 'full-service' },
              { label: 'Executive Search', value: 'executive-search' },
              { label: 'RPO', value: 'rpo' }
            ]}
            typeKey="serviceType"
            statusFilter
            statusOptions={[
              { label: 'Active', value: 'active' },
              { label: 'On Hold', value: 'on-hold' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' }
            ]}
            statusKey="status"
            emptyMessage="No service projects found"
          />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
