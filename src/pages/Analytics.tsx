import { useState } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export default function Analytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "12m">("6m");
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel");

  const handleExport = () => {
    toast({
      title: "Export started",
      description: `Exporting analytics data as ${exportFormat.toUpperCase()}...`,
    });

    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Analytics data has been exported successfully.",
      });
    }, 1500);
  };

  return (
    <DashboardPageLayout>
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recruitment Analytics</h1>
            <p className="text-muted-foreground">
              Track candidate pipeline, source effectiveness, and hiring metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10 border-dashed">
          <h3 className="text-xl font-medium text-muted-foreground">Analytics Components Under Maintenance</h3>
          <p className="text-sm text-muted-foreground mt-2">Charts and metrics are currently being updated.</p>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
