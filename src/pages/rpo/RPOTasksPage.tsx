import { useMemo, useState } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { RPOTaskBoard } from '@/components/rpo/RPOTaskBoard';
import { getAllRPOTasks, getTaskStats } from '@/shared/lib/rpoTaskStorage';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export default function RPOTasksPage() {
  const [tasks, setTasks] = useState(getAllRPOTasks());
  const stats = useMemo(() => getTaskStats(), [tasks]);

  const handleTasksChange = () => {
    setTasks(getAllRPOTasks());
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-6 w-6" />
            <h1 className="text-3xl font-bold">RPO Tasks & Allocation</h1>
          </div>
          <p className="text-muted-foreground">
            Manage tasks, track consultant workload, and ensure timely completion of RPO activities
          </p>
        </div>

        {/* Task Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overdue</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {stats.overdue}
                {stats.overdue > 0 && <Badge variant="destructive" className="ml-2">!</Badge>}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <RPOTaskBoard tasks={tasks} onTasksChange={handleTasksChange} />
      </div>
    </DashboardPageLayout>
  );
}
