import { UnifiedNotificationCenter } from '@/modules/notifications/components/UnifiedNotificationCenter';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { Helmet } from 'react-helmet-async';

export default function NotificationCenterPage() {
  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Notification Center - HRM8</title>
      </Helmet>
      <UnifiedNotificationCenter />
    </DashboardPageLayout>
  );
}
