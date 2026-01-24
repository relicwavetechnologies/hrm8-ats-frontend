import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { DigestSettings } from '@/components/backgroundChecks/DigestSettings';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function DigestSettingsPage() {
  const navigate = useNavigate();

  const breadcrumbActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/background-checks')}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Background Checks
    </Button>
  );

  return (
    <DashboardPageLayout breadcrumbActions={breadcrumbActions}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Digest Settings</h1>
          <p className="text-muted-foreground">
            Configure your email digest preferences for background check notifications
          </p>
        </div>

        <DigestSettings />
      </div>
    </DashboardPageLayout>
  );
}
