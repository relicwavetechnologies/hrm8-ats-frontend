import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus, Users, MessageSquare, Award, AlertTriangle, GraduationCap, TrendingUp, Target } from "lucide-react";
import { Feedback360Card } from "@/shared/components/performance/Feedback360Card";
import { Feedback360RequestDialog } from "@/shared/components/performance/Feedback360RequestDialog";
import { Feedback360ResponseDialog } from "@/shared/components/performance/Feedback360ResponseDialog";
import { OneOnOneMeetingTracker } from "@/shared/components/performance/OneOnOneMeetingTracker";
import { CalibrationSessionManager } from "@/shared/components/performance/CalibrationSessionManager";
import { SkillsAssessmentMatrix } from "@/shared/components/performance/SkillsAssessmentMatrix";
import { PIPManager } from "@/shared/components/performance/PIPManager";
import { SuccessionPlanning } from "@/shared/components/performance/SuccessionPlanning";
import { LearningDevelopment } from "@/shared/components/performance/LearningDevelopment";
import { getFeedback360, getOneOnOneMeetings, getMeetingTemplates, saveOneOnOneMeeting, getCalibrationSessions, saveCalibrationSession, updateCalibrationSession, getSkillsAssessments, saveSkillsAssessment, updateSkillsAssessment, getPIPs, updatePIP, getSuccessionPlans, getPerformanceGoals } from "@/shared/lib/performanceStorage";
import { getCourses, getTrainingPaths, getCourseEnrollments, getEmployeeCertifications, getSkillDevelopmentPrograms, getLearningAnalytics } from "@/shared/lib/learningStorage";
import { getGamificationProfile, saveGamificationProfile } from "@/shared/lib/gamificationStorage";
import { getCertificates } from "@/shared/lib/certificateStorage";
import { mockChallenges } from "@/shared/data/mockGamificationData";
import { getEmployees } from "@/shared/lib/employeeStorage";
import type { GamificationProfile } from "@/shared/types/performance";
import type { OneOnOneMeeting, Feedback360, CalibrationSession, SkillAssessment, PerformanceImprovementPlan, PIPCheckIn } from "@/shared/types/performance";
import { mockCalibrationSessions } from "@/shared/data/mockCalibrationData";
import { mockSkillCategories, mockSkillAssessments, mockRoleSkillRequirements } from "@/shared/data/mockSkillsData";
import { mockPIPs } from "@/shared/data/mockPIPData";
import { mockSuccessionPlans, mockNineBoxData, mockLeadershipPipeline } from "@/shared/data/mockSuccessionData";
import { toast } from "sonner";

export default function TalentDevelopment() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback360DialogOpen, setFeedback360DialogOpen] = useState(false);
  const [feedbackResponseDialogOpen, setFeedbackResponseDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [currentUserRole] = useState<'manager' | 'hr'>('manager');

  // Mock current user
  const currentEmployeeId = "1";
  const currentEmployeeName = "John Smith";

  const my360Feedback = useMemo(() => getFeedback360(currentEmployeeId), [currentEmployeeId, refreshKey]);
  const meetings = useMemo(() => getOneOnOneMeetings(), [refreshKey]);
  const meetingTemplates = useMemo(() => getMeetingTemplates(), [refreshKey]);
  const calibrationSessions = useMemo(() => {
    const stored = getCalibrationSessions();
    return stored.length > 0 ? stored : mockCalibrationSessions;
  }, [refreshKey]);
  const skillsAssessments = useMemo(() => {
    const stored = getSkillsAssessments();
    return stored.length > 0 ? stored : mockSkillAssessments;
  }, [refreshKey]);
  const pips = useMemo(() => {
    const stored = getPIPs();
    return stored.length > 0 ? stored : mockPIPs;
  }, [refreshKey]);
  const successionPlans = useMemo(() => {
    const stored = getSuccessionPlans();
    return stored.length > 0 ? stored : mockSuccessionPlans;
  }, [refreshKey]);
  const employees = useMemo(() => getEmployees(), []);
  const currentEmployee = employees.find(e => e.id === currentEmployeeId) || employees[0];
  const allGoals = useMemo(() => getPerformanceGoals(currentEmployeeId), [currentEmployeeId, refreshKey]);

  // Learning & Development data
  const courses = useMemo(() => getCourses(), [refreshKey]);
  const trainingPaths = useMemo(() => getTrainingPaths(), [refreshKey]);
  const courseEnrollments = useMemo(() => getCourseEnrollments(currentEmployeeId), [currentEmployeeId, refreshKey]);
  const employeeCertifications = useMemo(() => getEmployeeCertifications(currentEmployeeId), [currentEmployeeId, refreshKey]);
  const skillDevelopmentPrograms = useMemo(() => getSkillDevelopmentPrograms(currentEmployeeId), [currentEmployeeId, refreshKey]);
  const learningAnalytics = useMemo(() => getLearningAnalytics(currentEmployeeId), [currentEmployeeId, refreshKey]);

  // Gamification data
  const gamificationProfile = useMemo(() => {
    let profile = getGamificationProfile(currentEmployeeId);
    if (!profile) {
      const defaultProfile: GamificationProfile = {
        employeeId: currentEmployeeId,
        totalPoints: 0,
        level: 1,
        rank: 'Novice',
        badges: [],
        streak: 0,
        longestStreak: 0,
        completedChallenges: [],
        achievements: [],
        lastActivity: new Date()
      };
      saveGamificationProfile(defaultProfile);
      profile = defaultProfile;
    }
    return profile;
  }, [currentEmployeeId, refreshKey]);
  const challenges = useMemo(() => mockChallenges, [refreshKey]);
  const myCertificates = useMemo(() => getCertificates(currentEmployeeId), [currentEmployeeId, refreshKey]);

  const activeMeetings = meetings.filter(m => m.status !== 'completed');
  const pending360Feedback = my360Feedback.filter(f => f.status === 'in-progress');
  const activePIPs = pips.filter(p => p.status === 'active');
  const completedCourses = courseEnrollments.filter(e => e.status === 'completed').length;

  const handleCreateCalibrationSession = (session: Partial<CalibrationSession>) => {
    const newSession: CalibrationSession = {
      ...session as CalibrationSession,
      id: `cal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCalibrationSession(newSession);
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdateCalibrationSession = (id: string, updates: Partial<CalibrationSession>) => {
    updateCalibrationSession(id, updates);
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateSkillsAssessment = (assessment: Partial<SkillAssessment>) => {
    const newAssessment: SkillAssessment = {
      ...assessment as SkillAssessment,
      id: `skills-assess-${Date.now()}`,
      employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      role: currentEmployee.jobTitle,
      department: currentEmployee.department,
      assessorId: currentEmployeeId,
      assessorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      assessmentDate: assessment.assessmentDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSkillsAssessment(newAssessment);
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdateSkillsAssessment = (id: string, updates: Partial<SkillAssessment>) => {
    updateSkillsAssessment(id, updates);
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdatePIP = (id: string, updates: Partial<PerformanceImprovementPlan>) => {
    updatePIP(id, updates);
    setRefreshKey(prev => prev + 1);
  };

  const handleCreatePIPCheckIn = (pipId: string, checkIn: Partial<PIPCheckIn>) => {
    const pip = pips.find(p => p.id === pipId);
    if (!pip) return;

    const updatedCheckIns = [...pip.checkIns, checkIn as PIPCheckIn];
    updatePIP(pipId, { checkIns: updatedCheckIns });
    setRefreshKey(prev => prev + 1);
  };

  const handleEnrollCourse = (courseId: string) => {
    toast.success("Enrolled in course successfully");
    setRefreshKey(prev => prev + 1);
  };

  const handleStartCourse = (enrollmentId: string) => {
    toast.success("Course started");
    setRefreshKey(prev => prev + 1);
  };

  const handleViewCertificate = (certificationId: string) => {
    toast.success("Opening certificate");
  };

  const handleJoinChallenge = (challengeId: string) => {
    toast.success("Joined challenge successfully!");
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Talent Development</h1>
            <p className="text-muted-foreground">
              Grow skills, provide feedback, and develop your team
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setFeedback360DialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Request 360° Feedback
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">1-on-1 Meetings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMeetings.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming meetings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">360° Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pending360Feedback.length}</div>
              <p className="text-xs text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active PIPs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePIPs.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList>
            <TabsTrigger value="feedback">
              <Users className="mr-2 h-4 w-4" />
              360° Feedback
            </TabsTrigger>
            <TabsTrigger value="meetings">
              <Users className="mr-2 h-4 w-4" />
              1-on-1s
            </TabsTrigger>
            <TabsTrigger value="calibration">
              <Users className="mr-2 h-4 w-4" />
              Calibration
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Award className="mr-2 h-4 w-4" />
              Skills Matrix
            </TabsTrigger>
            <TabsTrigger value="pip">
              <AlertTriangle className="mr-2 h-4 w-4" />
              PIPs
            </TabsTrigger>
            <TabsTrigger value="succession">
              <TrendingUp className="mr-2 h-4 w-4" />
              Succession Planning
            </TabsTrigger>
            <TabsTrigger value="learning">
              <GraduationCap className="mr-2 h-4 w-4" />
              Learning & Development
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">360° Feedback</h3>
                <Button onClick={() => setFeedback360DialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Feedback
                </Button>
              </div>

              {my360Feedback.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No 360° Feedback</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Request feedback from your manager, peers, and team members
                    </p>
                    <Button onClick={() => setFeedback360DialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Request Feedback
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {my360Feedback.map((feedback) => (
                    <div key={feedback.id} className="relative">
                      <Feedback360Card feedback={feedback} />
                      {feedback.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-4 right-4"
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setFeedbackResponseDialogOpen(true);
                          }}
                        >
                          Respond to Feedback
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <OneOnOneMeetingTracker
              meetings={meetings}
              templates={meetingTemplates}
              onScheduleMeeting={(meeting) => {
                saveOneOnOneMeeting(meeting);
                setRefreshKey(prev => prev + 1);
              }}
              onUpdateMeeting={(meeting) => {
                saveOneOnOneMeeting(meeting);
                setRefreshKey(prev => prev + 1);
              }}
              onUpdateActionItem={(meetingId, actionItem) => {
                const meeting = meetings.find(m => m.id === meetingId);
                if (meeting) {
                  const updated = {
                    ...meeting,
                    actionItems: meeting.actionItems.map(a => a.id === actionItem.id ? actionItem : a)
                  };
                  saveOneOnOneMeeting(updated);
                  setRefreshKey(prev => prev + 1);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="calibration" className="space-y-6">
            <CalibrationSessionManager
              sessions={calibrationSessions}
              onCreateSession={handleCreateCalibrationSession}
              onUpdateSession={handleUpdateCalibrationSession}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillsAssessmentMatrix
              categories={mockSkillCategories}
              assessments={skillsAssessments}
              roleRequirements={mockRoleSkillRequirements}
              currentEmployeeId={currentEmployeeId}
              onCreateAssessment={handleCreateSkillsAssessment}
              onUpdateAssessment={handleUpdateSkillsAssessment}
            />
          </TabsContent>

          <TabsContent value="pip" className="space-y-6">
            <PIPManager
              pips={pips}
              onUpdatePIP={handleUpdatePIP}
              onCreateCheckIn={handleCreatePIPCheckIn}
            />
          </TabsContent>

          <TabsContent value="succession" className="space-y-6">
            <SuccessionPlanning
              successionPlans={successionPlans}
              nineBoxData={mockNineBoxData}
              leadershipPipeline={mockLeadershipPipeline}
            />
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <LearningDevelopment
              courses={courses}
              trainingPaths={trainingPaths}
              enrollments={courseEnrollments}
              certifications={employeeCertifications}
              skillPrograms={skillDevelopmentPrograms}
              analytics={learningAnalytics!}
              onEnrollCourse={handleEnrollCourse}
              onStartCourse={handleStartCourse}
              onViewCertificate={handleViewCertificate}
              employeeData={{
                id: currentEmployeeId,
                name: currentEmployeeName,
                role: currentEmployee.jobTitle,
                department: currentEmployee.department,
                skills: ['React', 'TypeScript', 'Leadership'],
                experienceLevel: 'Senior',
              }}
              goals={allGoals}
              performanceGaps={[]}
              showTeamAnalytics={currentUserRole === 'hr'}
              gamificationProfile={gamificationProfile}
              challenges={challenges}
              certificates={myCertificates}
              onJoinChallenge={handleJoinChallenge}
            />
          </TabsContent>
        </Tabs>

        <Feedback360RequestDialog
          open={feedback360DialogOpen}
          onOpenChange={setFeedback360DialogOpen}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />

        {selectedFeedback && (
          <Feedback360ResponseDialog
            open={feedbackResponseDialogOpen}
            onOpenChange={setFeedbackResponseDialogOpen}
            feedback={selectedFeedback}
            providerId="current-user-id"
            providerName="Current User"
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
