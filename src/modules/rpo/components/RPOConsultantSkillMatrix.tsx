import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Target,
  Award,
  Brain
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell } from 'recharts';
import { useState } from 'react';

interface Skill {
  name: string;
  category: 'industry' | 'technology' | 'soft-skill';
  level: number; // 0-100
  required: number; // 0-100
  gap: number; // required - level
}

interface ConsultantSkills {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  skills: Skill[];
  overallCompetency: number;
}

interface TrainingRecommendation {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  currentLevel: number;
  targetLevel: number;
  courses: string[];
  estimatedTime: string;
}

export function RPOConsultantSkillMatrix() {
  const [selectedConsultant, setSelectedConsultant] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'individual'>('matrix');

  // Mock data
  const consultants: ConsultantSkills[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      specialization: 'Tech & IT',
      overallCompetency: 92,
      skills: [
        { name: 'Software Development', category: 'industry', level: 95, required: 90, gap: -5 },
        { name: 'Cloud Computing', category: 'technology', level: 88, required: 85, gap: -3 },
        { name: 'AI/ML', category: 'technology', level: 75, required: 80, gap: 5 },
        { name: 'Healthcare Tech', category: 'industry', level: 65, required: 75, gap: 10 },
        { name: 'Leadership', category: 'soft-skill', level: 90, required: 85, gap: -5 },
        { name: 'Communication', category: 'soft-skill', level: 92, required: 90, gap: -2 },
      ]
    },
    {
      id: '2',
      name: 'Michael Chen',
      specialization: 'Executive Search',
      overallCompetency: 88,
      skills: [
        { name: 'Executive Recruiting', category: 'industry', level: 95, required: 90, gap: -5 },
        { name: 'Finance Sector', category: 'industry', level: 85, required: 85, gap: 0 },
        { name: 'Stakeholder Management', category: 'soft-skill', level: 90, required: 85, gap: -5 },
        { name: 'Cloud Computing', category: 'technology', level: 60, required: 70, gap: 10 },
        { name: 'AI/ML', category: 'technology', level: 55, required: 70, gap: 15 },
        { name: 'Leadership', category: 'soft-skill', level: 88, required: 85, gap: -3 },
      ]
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      specialization: 'Healthcare',
      overallCompetency: 90,
      skills: [
        { name: 'Healthcare Tech', category: 'industry', level: 95, required: 90, gap: -5 },
        { name: 'Medical Devices', category: 'industry', level: 88, required: 85, gap: -3 },
        { name: 'Pharmaceutical', category: 'industry', level: 85, required: 80, gap: -5 },
        { name: 'Cloud Computing', category: 'technology', level: 70, required: 75, gap: 5 },
        { name: 'Communication', category: 'soft-skill', level: 92, required: 90, gap: -2 },
        { name: 'Leadership', category: 'soft-skill', level: 86, required: 85, gap: -1 },
      ]
    },
    {
      id: '4',
      name: 'David Kim',
      specialization: 'Finance',
      overallCompetency: 85,
      skills: [
        { name: 'Finance Sector', category: 'industry', level: 90, required: 85, gap: -5 },
        { name: 'Banking', category: 'industry', level: 85, required: 80, gap: -5 },
        { name: 'FinTech', category: 'technology', level: 75, required: 85, gap: 10 },
        { name: 'Cloud Computing', category: 'technology', level: 65, required: 75, gap: 10 },
        { name: 'Leadership', category: 'soft-skill', level: 82, required: 85, gap: 3 },
        { name: 'Communication', category: 'soft-skill', level: 85, required: 90, gap: 5 },
      ]
    }
  ];

  // Training recommendations
  const generateRecommendations = (consultant: ConsultantSkills): TrainingRecommendation[] => {
    const gapSkills = consultant.skills.filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap);
    
    return gapSkills.slice(0, 5).map(skill => ({
      skill: skill.name,
      priority: skill.gap >= 15 ? 'high' : skill.gap >= 8 ? 'medium' : 'low',
      currentLevel: skill.level,
      targetLevel: skill.required,
      courses: getCoursesForSkill(skill.name),
      estimatedTime: `${Math.ceil(skill.gap / 5)} weeks`
    }));
  };

  const getCoursesForSkill = (skillName: string): string[] => {
    const courseMap: Record<string, string[]> = {
      'AI/ML': ['Machine Learning Fundamentals', 'Deep Learning Specialization', 'AI in Recruitment'],
      'Cloud Computing': ['AWS Certified Solutions Architect', 'Azure Fundamentals', 'Cloud Architecture'],
      'Healthcare Tech': ['Healthcare IT Systems', 'Medical Device Regulations', 'Health Informatics'],
      'FinTech': ['Financial Technology Essentials', 'Blockchain for Finance', 'Digital Banking'],
      'Leadership': ['Executive Leadership Program', 'Team Management', 'Strategic Decision Making'],
      'Communication': ['Advanced Business Communication', 'Stakeholder Management', 'Presentation Skills']
    };
    
    return courseMap[skillName] || ['Specialized Training Program', 'Industry Certification', 'Hands-on Workshop'];
  };

  const getAllSkills = () => {
    const skillMap = new Map<string, { total: number; count: number; required: number }>();
    
    consultants.forEach(consultant => {
      consultant.skills.forEach(skill => {
        const existing = skillMap.get(skill.name) || { total: 0, count: 0, required: skill.required };
        skillMap.set(skill.name, {
          total: existing.total + skill.level,
          count: existing.count + 1,
          required: existing.required
        });
      });
    });

    return Array.from(skillMap.entries()).map(([name, data]) => ({
      name,
      avgLevel: data.total / data.count,
      required: data.required,
      gap: data.required - (data.total / data.count)
    }));
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 90) return 'hsl(142, 76%, 36%)';
    if (level >= 75) return 'hsl(217, 91%, 60%)';
    if (level >= 60) return 'hsl(48, 96%, 53%)';
    return 'hsl(0, 84%, 60%)';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default';
    return 'secondary';
  };

  const filteredConsultants = consultants.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConsultantData = consultants.find(c => c.id === selectedConsultant);
  const allSkills = getAllSkills();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Consultant Skill Matrix</h2>
          <p className="text-muted-foreground">Track expertise levels and identify skill gaps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Training Library
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Set Goals
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Competency</p>
                <p className="text-2xl font-bold">
                  {(consultants.reduce((acc, c) => acc + c.overallCompetency, 0) / consultants.length).toFixed(0)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills Tracked</p>
                <p className="text-2xl font-bold">{allSkills.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills at Target</p>
                <p className="text-2xl font-bold">
                  {allSkills.filter(s => s.gap <= 0).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Training</p>
                <p className="text-2xl font-bold">
                  {allSkills.filter(s => s.gap > 10).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matrix">Skill Matrix</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="individual">Individual Profiles</TabsTrigger>
          <TabsTrigger value="training">Training Plan</TabsTrigger>
        </TabsList>

        {/* Skill Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search consultants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Skill Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="industry">Industry Knowledge</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="soft-skill">Soft Skills</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ● Expert (90-100)
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    ● Proficient (75-89)
                  </Badge>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    ● Developing (60-74)
                  </Badge>
                  <Badge variant="outline" className="text-destructive border-destructive">
                    ● Beginner (&lt;60)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matrix Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Competency Matrix</CardTitle>
              <CardDescription>Visual representation of consultant skill levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredConsultants.map((consultant) => {
                  const displaySkills = selectedCategory === 'all' 
                    ? consultant.skills 
                    : consultant.skills.filter(s => s.category === selectedCategory);

                  return (
                    <div key={consultant.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={consultant.avatar} />
                          <AvatarFallback>{consultant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{consultant.name}</h4>
                          <p className="text-sm text-muted-foreground">{consultant.specialization}</p>
                        </div>
                        <Badge>{consultant.overallCompetency}% Overall</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displaySkills.map((skill, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{skill.name}</span>
                              <div className="flex items-center gap-1">
                                {skill.gap > 0 ? (
                                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Current</span>
                                <span className="font-medium">{skill.level}%</span>
                              </div>
                              <Progress 
                                value={skill.level} 
                                className="h-2"
                                style={{ 
                                  // @ts-ignore
                                  '--progress-background': getSkillLevelColor(skill.level) 
                                } as React.CSSProperties}
                              />
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Target: {skill.required}%</span>
                                {skill.gap > 0 && (
                                  <span className="text-yellow-600 font-medium">Gap: {skill.gap}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team-Wide Skill Gaps</CardTitle>
              <CardDescription>Skills requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={allSkills.filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium mb-1">{data.name}</p>
                          <p className="text-sm">Avg Level: {data.avgLevel.toFixed(0)}%</p>
                          <p className="text-sm">Required: {data.required}%</p>
                          <p className="text-sm text-yellow-600 font-medium">Gap: {data.gap.toFixed(0)}%</p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="gap" fill="hsl(48, 96%, 53%)" name="Skill Gap (%)" radius={[4, 4, 0, 0]}>
                    {allSkills.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.gap >= 15 ? 'hsl(0, 84%, 60%)' : 'hsl(48, 96%, 53%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Critical Gaps</CardTitle>
                <CardDescription>Skills with gaps &gt;15%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allSkills
                    .filter(s => s.gap >= 15)
                    .sort((a, b) => b.gap - a.gap)
                    .map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {skill.avgLevel.toFixed(0)}% → {skill.required}%
                          </p>
                        </div>
                        <Badge variant="destructive">{skill.gap.toFixed(0)}% Gap</Badge>
                      </div>
                    ))}
                  {allSkills.filter(s => s.gap >= 15).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No critical gaps identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
                <CardDescription>Skills exceeding targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allSkills
                    .filter(s => s.gap < 0)
                    .sort((a, b) => a.gap - b.gap)
                    .slice(0, 5)
                    .map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {skill.avgLevel.toFixed(0)}% (Target: {skill.required}%)
                          </p>
                        </div>
                        <Badge className="bg-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {Math.abs(skill.gap).toFixed(0)}% Above
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Individual Profiles Tab */}
        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedConsultantData && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Profile</CardTitle>
                  <CardDescription>Comprehensive skill assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={selectedConsultantData.skills}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" className="text-xs" />
                      <PolarRadiusAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Radar 
                        name="Current Level" 
                        dataKey="level" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3}
                      />
                      <Radar 
                        name="Required Level" 
                        dataKey="required" 
                        stroke="hsl(var(--muted-foreground))" 
                        fill="hsl(var(--muted-foreground))" 
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Development Areas</CardTitle>
                  <CardDescription>Skills needing improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedConsultantData.skills
                      .filter(s => s.gap > 0)
                      .sort((a, b) => b.gap - a.gap)
                      .map((skill, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <Badge variant={skill.gap >= 15 ? 'destructive' : skill.gap >= 8 ? 'default' : 'secondary'}>
                              {skill.gap}% Gap
                            </Badge>
                          </div>
                          <Progress value={(skill.level / skill.required) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Current: {skill.level}%</span>
                            <span>Target: {skill.required}%</span>
                          </div>
                        </div>
                      ))}
                    {selectedConsultantData.skills.filter(s => s.gap > 0).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        All skills meet or exceed targets!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Training Plan Tab */}
        <TabsContent value="training" className="space-y-6">
          {consultants.map((consultant) => {
            const recommendations = generateRecommendations(consultant);
            if (recommendations.length === 0) return null;

            return (
              <Card key={consultant.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={consultant.avatar} />
                      <AvatarFallback>{consultant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{consultant.name}</CardTitle>
                      <CardDescription>{consultant.specialization}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{rec.skill}</h4>
                            <p className="text-sm text-muted-foreground">
                              {rec.currentLevel}% → {rec.targetLevel}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(rec.priority) as any}>
                              {rec.priority} Priority
                            </Badge>
                            <Badge variant="outline">{rec.estimatedTime}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recommended Courses:</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.courses.map((course, courseIdx) => (
                              <Badge key={courseIdx} variant="secondary">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button variant="outline" className="w-full mt-3">
                          Enroll in Training
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
