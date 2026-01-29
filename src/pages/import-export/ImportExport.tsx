import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { Upload, Download } from "lucide-react";

export default function ImportExport() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action} started`,
      description: "This feature is currently under maintenance.",
    });
  };

  return (
    <DashboardPageLayout>
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="text-base font-semibold">
          <h1 className="text-3xl font-bold tracking-tight">Import / Export</h1>
          <p className="text-muted-foreground">
            Manage data import and export tasks
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold text-lg flex items-center mb-4">
              <Upload className="mr-2 h-5 w-5" /> Import Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Import candidates, jobs, and other data from CSV or Excel files.
            </p>
            <Button onClick={() => handleAction("Import")}>Start Import</Button>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold text-lg flex items-center mb-4">
              <Download className="mr-2 h-5 w-5" /> Export Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export your system data for backup or reporting purposes.
            </p>
            <Button variant="outline" onClick={() => handleAction("Export")}>Start Export</Button>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
