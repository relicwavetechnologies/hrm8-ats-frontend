import { UnifiedNotificationCenter } from '@/components/notifications/UnifiedNotificationCenter';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
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
