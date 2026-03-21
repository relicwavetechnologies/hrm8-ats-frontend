import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users, Mail, UserCheck, Percent } from "lucide-react";
import { jobService } from "@/shared/lib/jobService";
import { Job } from "@/shared/types/job";

interface ExecutiveSearchTabProps {
  job: Job;
}

interface ExecutiveSearchSummary {
  prospectCount: number;
  invitedCount: number;
  convertedCount: number;
  responseRate: number;
}

export function ExecutiveSearchTab({ job }: ExecutiveSearchTabProps) {
  const [summary, setSummary] = useState<ExecutiveSearchSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await jobService.getExecutiveSearchSummary(job.id);
        if (response.success && response.data) {
          setSummary(response.data as ExecutiveSearchSummary);
        } else {
          setSummary({ prospectCount: 0, invitedCount: 0, convertedCount: 0, responseRate: 0 });
        }
      } catch {
        setSummary({ prospectCount: 0, invitedCount: 0, convertedCount: 0, responseRate: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [job.id]);

  if (loading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const s = summary ?? { prospectCount: 0, invitedCount: 0, convertedCount: 0, responseRate: 0 };

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Search Progress</CardTitle>
          <CardDescription>
            Your consultant is actively sourcing and inviting candidates. This view shows read-only metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prospects</p>
                <p className="text-2xl font-semibold">{s.prospectCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invited</p>
                <p className="text-2xl font-semibold">{s.invitedCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Converted</p>
                <p className="text-2xl font-semibold">{s.convertedCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-semibold">{s.responseRate}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
