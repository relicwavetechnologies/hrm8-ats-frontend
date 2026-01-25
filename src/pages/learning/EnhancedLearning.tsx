import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/shared/components/layouts/AtsPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { BookOpen, Award, TrendingUp, Target, Brain, Sparkles } from 'lucide-react';
import { getCourses, getCourseEnrollments, getEmployeeCertifications, getSkillDevelopmentPrograms } from '@/shared/lib/learningStorage';
import { getSkillGaps } from '@/shared/lib/advancedAnalyticsStorage';
import type { Course, CourseEnrollment, EmployeeCertification, SkillDevelopmentProgram } from '@/shared/types/performance';
import type { SkillGapAnalysis } from '@/shared/types/advancedAnalytics';

export default function EnhancedLearning() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [programs, setPrograms] = useState<SkillDevelopmentProgram[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis[]>([]);

  useEffect(() => {
    setCourses(getCourses());
    setEnrollments(getCourseEnrollments());
    setCertifications(getEmployeeCertifications());
    setPrograms(getSkillDevelopmentPrograms());
    setSkillGaps(getSkillGaps());
  }, []);

  const activeEnrollments = enrollments.filter(e => e.status === 'in-progress');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader 
          title="Enhanced Learning Management" 
          subtitle="AI-powered learning paths, skill development, and certification tracking"
        >
          <Button size="sm" className="gap-2">
            <Brain className="h-4 w-4" />
            Get AI Recommendations
          </Button>
        </AtsPageHeader>

        {/* Learning Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-primary" />
                Active Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEnrollments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Award className="h-3 w-3 text-success" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certifications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active certifications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-chart-1" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrollments.length > 0 ? Math.round((completedCourses.length / enrollments.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall course completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Target className="h-3 w-3 text-warning" />
                Skill Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillGaps.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Critical skills to develop</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
              <TabsTrigger 
                value="courses"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Course Catalog
              </TabsTrigger>
              <TabsTrigger 
                value="programs"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Development Programs
              </TabsTrigger>
              <TabsTrigger 
                value="certifications"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Certifications
              </TabsTrigger>
              <TabsTrigger 
                value="gaps"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Skill Gap Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="courses" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Available Courses</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Recommended for You
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium">{course.title}</CardTitle>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{course.duration} hours</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <Button className="w-full mt-4" size="sm">Enroll</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Skill Development Programs</CardTitle>
                <CardDescription className="text-sm">Structured learning paths for career growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold">Development Program</h4>
                          <p className="text-sm text-muted-foreground">
                            Target: {program.targetLevel}/5
                          </p>
                        </div>
                        <Badge variant={program.status === 'active' ? 'default' : program.status === 'cancelled' ? 'destructive' : 'secondary'}>
                          {program.status}
                        </Badge>
                      </div>
                      <Progress value={program.progress} className="h-2 mb-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{program.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Employee Certifications</CardTitle>
                <CardDescription className="text-sm">Professional certifications and credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Award className="h-4 w-4 text-success" />
                            Certification {cert.certificationId}
                          </h4>
                          <p className="text-sm text-muted-foreground">Certification Provider</p>
                        </div>
                        <Badge variant={cert.status === 'active' ? 'default' : cert.status === 'expired' ? 'destructive' : 'secondary'}>
                          {cert.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Issue Date</p>
                          <p className="font-medium">{new Date(cert.issuedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expiry Date</p>
                          <p className="font-medium">{new Date(cert.expiryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Critical Skill Gaps</CardTitle>
                <CardDescription className="text-sm">Areas requiring immediate attention and development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillGaps.map((gap) => (
                    <div key={gap.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold">{gap.skillName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {gap.affectedEmployees} employees affected • {gap.departmentsAffected.join(', ')}
                          </p>
                        </div>
                        <Badge variant={gap.priority === 'critical' || gap.priority === 'high' ? 'destructive' : 'default'}>
                          {gap.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Current</p>
                          <p className="text-lg font-semibold">{gap.currentLevel}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Required</p>
                          <p className="text-lg font-semibold">{gap.requiredLevel}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gap</p>
                          <p className="text-lg font-semibold text-destructive">-{gap.gap}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Recommended Actions:</p>
                        {gap.recommendedActions.map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-muted-foreground">{action}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                        <Brain className="h-4 w-4" />
                        Get AI Learning Path
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
