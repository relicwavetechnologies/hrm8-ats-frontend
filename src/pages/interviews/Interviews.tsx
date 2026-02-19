import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { JobAIInterviewsTab } from "@/modules/jobs/components/aiInterview/JobAIInterviewsTab";

export default function Interviews() {
  return (
    <DashboardPageLayout>
      <div className="p-4 space-y-3">
        <AtsPageHeader
          title="Interviews"
          subtitle="Unified interview operations across all jobs with board, calendar, and table views."
        />
        <JobAIInterviewsTab />
      </div>
    </DashboardPageLayout>
  );
}
