import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { RPOConsultantAvailabilityTracker } from '@/components/rpo/RPOConsultantAvailabilityTracker';
import { getConsultantRPOAvailability, getConsultantRPOStats } from '@/shared/lib/rpoConsultantAvailabilityUtils';
import { Button } from '@/shared/components/ui/button';
import { Users, BarChart3 } from 'lucide-react';

export default function RPOConsultantsPage() {
  const consultantAvailability = useMemo(() => getConsultantRPOAvailability(), []);
  const availabilityStats = useMemo(() => getConsultantRPOStats(), []);

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6" />
              <h1 className="text-3xl font-bold">RPO Consultants</h1>
            </div>
            <p className="text-muted-foreground">
              Track consultant availability, capacity, and RPO assignment allocation
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/rpo">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard
            </Link>
          </Button>
        </div>

        <RPOConsultantAvailabilityTracker 
          consultants={consultantAvailability}
          stats={availabilityStats}
        />
      </div>
    </DashboardPageLayout>
  );
}
