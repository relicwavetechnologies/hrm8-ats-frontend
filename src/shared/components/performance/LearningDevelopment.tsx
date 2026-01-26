import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  Clock,
  Search,
  Filter,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Target,
  BarChart3,
  Users,
  FileText,
  Star,
  ArrowRight,
  Trophy,
  Sparkles,
} from 'lucide-react';
import {
  Course,
  TrainingPath,
  CourseEnrollment,
  EmployeeCertification,
  SkillDevelopmentProgram,
  LearningAnalytics,
  GamificationProfile,
  Challenge,
  Certificate as CertificateType,
} from '@/types/performance';
import { CourseContentViewer } from './CourseContentViewer';
import { AILearningRecommendations } from './AILearningRecommendations';
import { TeamLearningAnalytics } from './TeamLearningAnalytics';
import { GamificationDashboard } from './GamificationDashboard';
import { CertificateGallery } from './CertificateGallery';
import { ChallengeCenter } from './ChallengeCenter';
import { toast } from 'sonner';

interface LearningDevelopmentProps {
  courses: Course[];
  trainingPaths: TrainingPath[];
  enrollments: CourseEnrollment[];
  certifications: EmployeeCertification[];
  skillPrograms: SkillDevelopmentProgram[];
  analytics: LearningAnalytics;
  onEnrollCourse: (courseId: string) => void;
  onStartCourse: (enrollmentId: string) => void;
  onViewCertificate: (certificationId: string) => void;
  employeeData?: {
    id: string;
    name: string;
    role: string;
    department: string;
    skills?: string[];
    experienceLevel?: string;
  };
  goals?: any[];
  performanceGaps?: any[];
  showTeamAnalytics?: boolean;
  gamificationProfile?: GamificationProfile;
  challenges?: Challenge[];
  certificates?: CertificateType[];
  onJoinChallenge?: (challengeId: string) => void;
}

export function LearningDevelopment({
  courses,
  trainingPaths,
  enrollments,
  certifications,
  skillPrograms,
  analytics,
  onEnrollCourse,
  onStartCourse,
  onViewCertificate,
  employeeData,
  goals = [],
  performanceGaps = [],
  showTeamAnalytics = false,
  gamificationProfile,
  challenges = [],
  certificates = [],
  onJoinChallenge,
}: LearningDevelopmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [aiRecommendationsOpen, setAiRecommendationsOpen] = useState(false);
  const [teamAnalyticsTimeRange, setTeamAnalyticsTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [viewMode, setViewMode] = useState<'individual' | 'team'>(showTeamAnalytics ? 'team' : 'individual');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'not-started':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'active': 'default',
      'completed': 'secondary',
      'expired': 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-700',
      'intermediate': 'bg-blue-100 text-blue-700',
      'advanced': 'bg-purple-100 text-purple-700',
      'expert': 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={colors[level] || 'bg-muted'}>
        {level}
      </Badge>
    );
  };

  const handleOpenCourse = (course: Course) => {
    // Find enrollment for this course
    const enrollment = enrollments.find(e => e.courseId === course.id);
    if (enrollment) {
      setSelectedCourse(course);
      setViewerOpen(true);
    } else {
      toast.error('You must enroll in this course first');
    }
  };

  const handleProgressUpdate = (lessonId: string, progress: number) => {
    toast.success('Progress updated');
  };

  const handleCompleteLesson = (lessonId: string) => {
    toast.success('Lesson completed!');
  };

  const handleCompleteAssessment = (assessmentId: string, score: number) => {
    toast.success(`Assessment completed with ${score.toFixed(0)}%!`);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = Array.from(new Set(courses.map(c => c.category)));

  // Mock team analytics data (in real app, this would come from props or API)
  const mockDepartmentStats = [
    { department: 'Engineering', totalEmployees: 85, enrolledEmployees: 72, completedCourses: 145, inProgressCourses: 38, averageProgress: 78, totalLearningHours: 1240, certificationsEarned: 28, skillsGapScore: 2.3, investmentAmount: 42500, estimatedROI: 145 },
    { department: 'Product', totalEmployees: 42, enrolledEmployees: 38, completedCourses: 89, inProgressCourses: 22, averageProgress: 82, totalLearningHours: 680, certificationsEarned: 18, skillsGapScore: 1.8, investmentAmount: 28000, estimatedROI: 156 },
    { department: 'Marketing', totalEmployees: 35, enrolledEmployees: 31, completedCourses: 67, inProgressCourses: 19, averageProgress: 75, totalLearningHours: 520, certificationsEarned: 12, skillsGapScore: 2.1, investmentAmount: 18500, estimatedROI: 138 },
    { department: 'Sales', totalEmployees: 56, enrolledEmployees: 48, completedCourses: 92, inProgressCourses: 28, averageProgress: 71, totalLearningHours: 720, certificationsEarned: 15, skillsGapScore: 2.5, investmentAmount: 24000, estimatedROI: 165 },
  ];

  const mockSkillGaps = [
    { skill: 'React Advanced Patterns', currentLevel: 2.8, requiredLevel: 4.5, gap: 1.7, departmentsAffected: ['Engineering', 'Product'] },
    { skill: 'Data Analysis', currentLevel: 2.5, requiredLevel: 4.0, gap: 1.5, departmentsAffected: ['Marketing', 'Sales'] },
    { skill: 'Leadership', currentLevel: 3.2, requiredLevel: 4.8, gap: 1.6, departmentsAffected: ['All Departments'] },
    { skill: 'Cloud Architecture', currentLevel: 2.3, requiredLevel: 4.2, gap: 1.9, departmentsAffected: ['Engineering'] },
  ];

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      {showTeamAnalytics && (
        <div className="flex justify-end">
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-auto">
            <TabsList>
              <TabsTrigger value="individual">
                <Users className="h-4 w-4 mr-2" />
                My Learning
              </TabsTrigger>
              <TabsTrigger value="team">
                <BarChart3 className="h-4 w-4 mr-2" />
                Team Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Conditionally render Team Analytics or Individual Learning */}
      {viewMode === 'team' ? (
        <TeamLearningAnalytics
          departmentStats={mockDepartmentStats}
          skillGaps={mockSkillGaps}
          timeRange={teamAnalyticsTimeRange}
          onTimeRangeChange={setTeamAnalyticsTimeRange}
        />
      ) : (
        <>
          {/* AI Recommendations Banner */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Course Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized course suggestions based on your skills, goals, and performance data
                </p>
              </div>
            </div>
            <Button onClick={() => setAiRecommendationsOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLearningHours}h</div>
            <p className="text-xs text-muted-foreground">
              {analytics.learningStreak} day streak 🔥
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.coursesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.coursesInProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gamificationProfile?.totalPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              Level {gamificationProfile?.level || 1} • {gamificationProfile?.rank || 'Novice'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gamificationProfile?.badges.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {certificates.length} certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{gamificationProfile?.rank || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageAssessmentScore}% avg score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-learning" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-learning">
            <BookOpen className="h-4 w-4 mr-2" />
            My Learning
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="catalog">
            <Search className="h-4 w-4 mr-2" />
            Course Catalog
          </TabsTrigger>
          <TabsTrigger value="paths">
            <Target className="h-4 w-4 mr-2" />
            Training Paths
          </TabsTrigger>
          <TabsTrigger value="programs">
            <TrendingUp className="h-4 w-4 mr-2" />
            Development Programs
          </TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {gamificationProfile && (
            <GamificationDashboard
              profile={gamificationProfile}
              activeChallenges={challenges.filter(c => c.status === 'active')}
            />
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          {employeeData && (
            <CertificateGallery employeeId={employeeData.id} />
          )}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <ChallengeCenter
            challenges={challenges}
            currentEmployeeId={employeeData?.id || ''}
            onJoinChallenge={onJoinChallenge}
          />
        </TabsContent>

        {/* My Learning Tab */}
        <TabsContent value="my-learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Track your learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(enrollment.status)}
                      <h4 className="font-semibold">{enrollment.courseTitle}</h4>
                      {enrollment.isRequired && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(enrollment.timeSpent / 60)}h {enrollment.timeSpent % 60}m spent
                      </div>
                      {enrollment.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {new Date(enrollment.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {enrollment.assessmentScores.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>
                          Latest score: {enrollment.assessmentScores[enrollment.assessmentScores.length - 1].score}%
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      const course = courses.find(c => c.id === enrollment.courseId);
                      if (course) {
                        handleOpenCourse(course);
                      }
                    }}
                    disabled={enrollment.status === 'completed'}
                  >
                    {enrollment.status === 'completed' ? 'Completed' : 'Continue'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}

              {enrollments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No enrolled courses yet</p>
                  <p className="text-sm">Browse the course catalog to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    {course.thumbnail && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        {getLevelBadge(course.level)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}h
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.enrollmentCount}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-lg font-bold">${course.price}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onEnrollCourse(course.id)}
                        >
                          Enroll
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No courses found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Paths</CardTitle>
              <CardDescription>Structured learning journeys for career growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingPaths.map(path => (
                  <Card key={path.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{path.title}</CardTitle>
                            {path.isRecommended && (
                              <Badge variant="default">Recommended</Badge>
                            )}
                          </div>
                          <CardDescription>{path.description}</CardDescription>
                        </div>
                        {getLevelBadge(path.level)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Target Role:</span>
                            <span className="text-muted-foreground">{path.targetRole || 'Various'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Duration:</span>
                            <span className="text-muted-foreground">{path.estimatedDuration}h total</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Courses:</span>
                            <span className="text-muted-foreground">{path.courses.length} courses</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Enrolled:</span>
                            <span className="text-muted-foreground">{path.enrollmentCount} people</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Skills Covered:</p>
                          <div className="flex flex-wrap gap-1">
                            {path.skills.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">
                        Start Learning Path
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Development Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Development Programs</CardTitle>
              <CardDescription>Structured programs for career advancement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillPrograms.map(program => (
                  <Card key={program.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{program.title}</CardTitle>
                          <CardDescription>{program.description}</CardDescription>
                        </div>
                        <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                          {program.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Manager:</span>
                            <span className="text-muted-foreground">{program.managerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Timeline:</span>
                            <span className="text-muted-foreground">
                              {new Date(program.startDate).toLocaleDateString()} - {new Date(program.targetEndDate).toLocaleDateString()}
                            </span>
                          </div>
                          {program.budget && (
                            <div className="flex items-center gap-2 text-sm">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Budget:</span>
                              <span className="text-muted-foreground">
                                ${program.spentAmount || 0} / ${program.budget}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Target Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {program.targetSkills.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">{program.progress}%</span>
                        </div>
                        <Progress value={program.progress} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Milestones ({program.milestones.length})</p>
                        <div className="space-y-2">
                          {program.milestones.slice(0, 3).map(milestone => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              {milestone.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full" variant="outline">
                        View Full Program
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {skillPrograms.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No development programs yet</p>
                    <p className="text-sm">Talk to your manager about creating a development plan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}

      {/* Course Content Viewer Dialog */}
      {selectedCourse && (
        <CourseContentViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          course={selectedCourse}
          enrollment={enrollments.find(e => e.courseId === selectedCourse.id)!}
          onProgressUpdate={handleProgressUpdate}
          onCompleteLesson={handleCompleteLesson}
          onCompleteAssessment={handleCompleteAssessment}
        />
      )}

      {/* AI Recommendations Dialog */}
      {employeeData && (
        <AILearningRecommendations
          open={aiRecommendationsOpen}
          onOpenChange={setAiRecommendationsOpen}
          employeeData={employeeData}
          availableCourses={courses}
          goals={goals}
          performanceGaps={performanceGaps}
          onEnrollCourse={onEnrollCourse}
        />
      )}
    </div>
  );
}
