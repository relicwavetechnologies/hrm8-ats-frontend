import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";

export default function JobCreate() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Jobs page with action=create parameter
    navigate('/ats/jobs?action=create', { replace: true });
  }, [navigate]);

  return (
    <DashboardPageLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
