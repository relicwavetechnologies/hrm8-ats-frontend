import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/components/layouts/AtsPageHeader';
import { RPOContractsTable } from '@/components/rpo/RPOContractsTable';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { Building2, Users, DollarSign, Clock, TrendingUp, FileText, BarChart3, Eye, Plus, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceProject } from '@/shared/types/recruitmentService';
import { useCurrencyFormat } from '@/app/CurrencyFormatProvider';

// Mock data - replace with real data from your API/state management
const mockContracts: ServiceProject[] = [
  {
    id: '1',
    name: 'Enterprise RPO - Tech Hiring',
    serviceType: 'rpo',
    status: 'active',
    priority: 'high',
    stage: 'in-progress',
    clientId: 'emp-1',
    clientName: 'TechCorp Global',
    clientLogo: undefined,
    location: 'San Francisco, CA',
    country: 'United States',
    consultants: [
      { id: 'c1', name: 'Sarah Johnson', role: 'lead', avatar: undefined },
      { id: 'c2', name: 'Michael Chen', role: 'support', avatar: undefined },
    ],
    progress: 65,
    candidatesShortlisted: 45,
    candidatesInterviewed: 28,
    numberOfVacancies: 15,
    projectValue: 150000,
    upfrontPaid: 75000,
    balanceDue: 75000,
    currency: 'USD',
    startDate: '2024-01-15',
    deadline: '2024-12-31',
    isRPO: true,
    rpoStartDate: '2024-01-15',
    rpoEndDate: '2024-12-31',
    rpoDuration: 12,
    rpoMonthlyRetainer: 12500,
    targetPlacements: 50,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
  },
  {
    id: '2',
    name: 'Healthcare Recruitment Program',
    serviceType: 'rpo',
    status: 'active',
    priority: 'medium',
    stage: 'in-progress',
    clientId: 'emp-2',
    clientName: 'MediHealth Systems',
    clientLogo: undefined,
    location: 'Boston, MA',
    country: 'United States',
    consultants: [
      { id: 'c3', name: 'Emily Davis', role: 'lead', avatar: undefined },
    ],
    progress: 40,
    candidatesShortlisted: 30,
    candidatesInterviewed: 15,
    numberOfVacancies: 20,
    projectValue: 200000,
    upfrontPaid: 100000,
    balanceDue: 100000,
    currency: 'USD',
    startDate: '2024-02-01',
    deadline: '2025-01-31',
    isRPO: true,
    rpoStartDate: '2024-02-01',
    rpoEndDate: '2025-01-31',
    rpoDuration: 12,
    rpoMonthlyRetainer: 16500,
    targetPlacements: 75,
    createdAt: '2024-02-01',
    updatedAt: '2024-03-19',
  },
  {
    id: '3',
    name: 'Financial Services RPO',
    serviceType: 'rpo',
    status: 'on-hold',
    priority: 'low',
    stage: 'initiated',
    clientId: 'emp-3',
    clientName: 'Capital Finance Group',
    clientLogo: undefined,
    location: 'New York, NY',
    country: 'United States',
    consultants: [],
    progress: 10,
    candidatesShortlisted: 5,
    candidatesInterviewed: 2,
    numberOfVacancies: 8,
    projectValue: 100000,
    upfrontPaid: 50000,
    balanceDue: 50000,
    currency: 'USD',
    startDate: '2024-03-01',
    deadline: '2024-09-30',
    isRPO: true,
    rpoStartDate: '2024-03-01',
    rpoEndDate: '2024-09-30',
    rpoDuration: 7,
    rpoMonthlyRetainer: 14000,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10',
  },
];

export default function RPOManagementPage() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormat();
  
  // Calculate metrics from contracts
  const totalContracts = mockContracts.filter(c => c.status === 'active').length;
  const totalConsultants = new Set(
    mockContracts.flatMap(c => c.consultants.map(cons => cons.id))
  ).size;
  const monthlyRevenue = mockContracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.rpoMonthlyRetainer || 0), 0);
  const expiringContracts = mockContracts.filter(c => {
    if (!c.rpoEndDate) return false;
    const endDate = new Date(c.rpoEndDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;

  return (
    <DashboardPageLayout>
      <div className="w-full p-6 space-y-6">
        <AtsPageHeader title="RPO Management" subtitle="Manage and monitor your RPO contracts and consultants">
          <div className="text-base font-semibold flex items-center gap-2">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Consultants
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/rpo">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </AtsPageHeader>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Active Contracts"
            value={totalContracts.toString()}
            change="Currently running RPO contracts"
            trend="up"
            icon={<Building2 className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              {
                label: "View All Contracts",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/recruitment-services/rpo/contracts')
              },
              {
                label: "Create Contract",
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
          <EnhancedStatCard
            title="Dedicated Consultants"
            value={totalConsultants.toString()}
            change="Total assigned consultants"
            trend="up"
            icon={<Users className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              {
                label: "View All Consultants",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/recruitment-services/rpo/consultants')
              },
              {
                label: "Manage Consultants",
                icon: <Users className="h-4 w-4" />,
                onClick: () => navigate('/recruitment-services/rpo/consultants')
              }
            ]}
          />
          <EnhancedStatCard
            title="Monthly Recurring Revenue"
            value={monthlyRevenue.toString()}
            change="Total MRR from active contracts"
            trend="up"
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
            isCurrency={true}
            rawValue={monthlyRevenue}
            showMenu={true}
            menuItems={[
              {
                label: "View Report",
                icon: <BarChart3 className="h-4 w-4" />,
                onClick: () => navigate('/recruitment-services/rpo/forecast')
              },
              {
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                onClick: () => {}
              }
            ]}
          />
          <EnhancedStatCard
            title="Expiring Soon"
            value={expiringContracts.toString()}
            change="Contracts ending in 30 days"
            trend="down"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              {
                label: "View Renewals",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate('/recruitment-services/rpo/renewals')
              },
              {
                label: "Set Reminders",
                icon: <Clock className="h-4 w-4" />,
                onClick: () => {}
              }
            ]}
          />
        </div>

        {/* Contracts Table */}
        <div className="space-y-2">
          <div className="text-base font-semibold flex items-center justify-between">
            <h2 className="text-lg font-semibold">RPO Contracts</h2>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <RPOContractsTable contracts={mockContracts} />
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
