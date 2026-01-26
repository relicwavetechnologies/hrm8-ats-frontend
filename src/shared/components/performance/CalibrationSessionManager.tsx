import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Calendar, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Plus, Edit, FileText, BarChart3 } from "lucide-react";
import { CalibrationSession, CalibrationEmployee } from "@/types/performance";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface CalibrationSessionManagerProps {
  sessions: CalibrationSession[];
  onCreateSession: (session: Partial<CalibrationSession>) => void;
  onUpdateSession: (id: string, updates: Partial<CalibrationSession>) => void;
}

export function CalibrationSessionManager({
  sessions,
  onCreateSession,
  onUpdateSession,
}: CalibrationSessionManagerProps) {
  const [selectedSession, setSelectedSession] = useState<CalibrationSession | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<CalibrationEmployee | null>(null);

  const getStatusBadge = (status: CalibrationSession['status']) => {
    const variants = {
      scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      'in-progress': { label: "In Progress", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
    };
    return <Badge className={variants[status].className}>{variants[status].label}</Badge>;
  };

  const handleCreateSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onCreateSession({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      scheduledDate: formData.get('scheduledDate') as string,
      status: 'scheduled',
      facilitatorId: 'current-user',
      facilitatorName: 'Current User',
      participants: [],
      employees: [],
    });

    setIsCreateDialogOpen(false);
    toast.success("Calibration session created");
  };

  const handleUpdateEmployeeRating = () => {
    if (!selectedSession || !editingEmployee) return;

    const updatedEmployees = selectedSession.employees.map(emp =>
      emp.id === editingEmployee.id ? editingEmployee : emp
    );

    onUpdateSession(selectedSession.id, {
      employees: updatedEmployees,
    });

    setEditingEmployee(null);
    toast.success("Rating updated");
  };

  const calculateRatingDistribution = (employees: CalibrationEmployee[], type: 'initial' | 'final') => {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    employees.forEach(emp => {
      const rating = type === 'initial' ? emp.initialRating : (emp.finalRating || emp.initialRating);
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    return distribution;
  };

  const getDistributionData = (session: CalibrationSession) => {
    const before = calculateRatingDistribution(session.employees, 'initial');
    const after = calculateRatingDistribution(session.employees, 'final');
    
    return Object.keys(before).map(rating => ({
      rating: `${rating} Star`,
      before: before[Number(rating)],
      after: after[Number(rating)],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Calibration</h2>
          <p className="text-muted-foreground">Standardize ratings across teams with multi-manager sessions</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            setSelectedSession(session);
            setIsDetailDialogOpen(true);
          }}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {new Date(session.scheduledDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(session.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                {session.participants.length} participants
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mr-2" />
                {session.employees.length} employees to review
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-2" />
                {session.employees.filter(e => e.finalRating).length}/{session.employees.length} calibrated
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSession}>
            <DialogHeader>
              <DialogTitle>Create Calibration Session</DialogTitle>
              <DialogDescription>Set up a new performance calibration meeting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Session Name</Label>
                <Input id="name" name="name" placeholder="Q4 2024 Leadership Calibration" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Purpose and scope of this session..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input id="scheduledDate" name="scheduledDate" type="datetime-local" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Session</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedSession.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      Facilitated by {selectedSession.facilitatorName} • {new Date(selectedSession.scheduledDate).toLocaleDateString()}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedSession.status)}
                </div>
              </DialogHeader>

              <Tabs defaultValue="employees" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="employees">Employees ({selectedSession.employees.length})</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    {selectedSession.employees.map((employee) => (
                      <Card key={employee.id} className="mb-4">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{employee.employeeName}</CardTitle>
                              <CardDescription>
                                {employee.role} • {employee.department} • Manager: {employee.managerName}
                              </CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setEditingEmployee(employee)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Calibrate
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Initial Rating</p>
                              <p className="text-2xl font-bold">{employee.initialRating.toFixed(1)}</p>
                            </div>
                            {employee.proposedRating && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Proposed</p>
                                <p className="text-2xl font-bold text-blue-600">{employee.proposedRating.toFixed(1)}</p>
                              </div>
                            )}
                            {employee.finalRating && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Final Rating</p>
                                <p className="text-2xl font-bold text-green-600">{employee.finalRating.toFixed(1)}</p>
                              </div>
                            )}
                          </div>
                          {employee.comparisonMetrics && (
                            <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                              <div className="text-sm">
                                <p className="text-muted-foreground">Goals</p>
                                <p className="font-medium">{employee.comparisonMetrics.goalsCompleted}/{employee.comparisonMetrics.totalGoals}</p>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Avg Review</p>
                                <p className="font-medium">{employee.comparisonMetrics.avgReviewRating.toFixed(1)}</p>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Tenure</p>
                                <p className="font-medium">{employee.comparisonMetrics.tenure}y</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Distribution Comparison</CardTitle>
                      <CardDescription>Before and after calibration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDistributionData(selectedSession)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rating" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="before" fill="hsl(var(--muted))" name="Initial Ratings" />
                          <Bar dataKey="after" fill="hsl(var(--primary))" name="Calibrated Ratings" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Average Rating Change</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {(() => {
                            const initialAvg = selectedSession.employees.reduce((sum, e) => sum + e.initialRating, 0) / selectedSession.employees.length;
                            const finalAvg = selectedSession.employees.reduce((sum, e) => sum + (e.finalRating || e.initialRating), 0) / selectedSession.employees.length;
                            const change = finalAvg - initialAvg;
                            return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
                          })()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Calibrations Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {selectedSession.employees.filter(e => e.finalRating).length}/{selectedSession.employees.length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="participants" className="space-y-4">
                  <ScrollArea className="h-[500px]">
                    {selectedSession.participants.map((participant) => (
                      <Card key={participant.id} className="mb-3">
                        <CardContent className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-medium">{participant.userName}</p>
                            <p className="text-sm text-muted-foreground">
                              {participant.role} • {participant.department}
                            </p>
                          </div>
                          <Badge variant={participant.attendance === 'attending' ? 'default' : 'secondary'}>
                            {participant.attendance}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Rating Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent className="max-w-2xl">
          {editingEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Calibrate Rating: {editingEmployee.employeeName}</DialogTitle>
                <DialogDescription>{editingEmployee.role} • {editingEmployee.department}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Rating</Label>
                    <Input value={editingEmployee.initialRating} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedRating">Proposed Rating</Label>
                    <Select
                      value={editingEmployee.proposedRating?.toString()}
                      onValueChange={(value) => setEditingEmployee({ ...editingEmployee, proposedRating: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalRating">Final Rating</Label>
                    <Select
                      value={editingEmployee.finalRating?.toString()}
                      onValueChange={(value) => setEditingEmployee({ ...editingEmployee, finalRating: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rationale">Rationale</Label>
                  <Textarea
                    id="rationale"
                    value={editingEmployee.rationale || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, rationale: e.target.value })}
                    placeholder="Explain the reasoning for this rating..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discussionNotes">Discussion Notes</Label>
                  <Textarea
                    id="discussionNotes"
                    value={editingEmployee.discussionNotes || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, discussionNotes: e.target.value })}
                    placeholder="Key points from the calibration discussion..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                <Button onClick={handleUpdateEmployeeRating}>Save Calibration</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
