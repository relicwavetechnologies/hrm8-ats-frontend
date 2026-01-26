import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Progress } from "@/shared/components/ui/progress";
import { Plus, TrendingUp, TrendingDown, Minus, Target, Award, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { SkillCategory, SkillAssessment, ProficiencyLevel, RoleSkillRequirement, SkillRating } from "@/types/performance";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface SkillsAssessmentMatrixProps {
  categories: SkillCategory[];
  assessments: SkillAssessment[];
  roleRequirements: RoleSkillRequirement[];
  currentEmployeeId: string;
  onCreateAssessment: (assessment: Partial<SkillAssessment>) => void;
  onUpdateAssessment: (id: string, updates: Partial<SkillAssessment>) => void;
}

const proficiencyLevels: { value: ProficiencyLevel; label: string; color: string; score: number }[] = [
  { value: 'none', label: 'None', color: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300', score: 0 },
  { value: 'beginner', label: 'Beginner', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', score: 1 },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', score: 2 },
  { value: 'advanced', label: 'Advanced', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', score: 3 },
  { value: 'expert', label: 'Expert', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', score: 4 },
];

export function SkillsAssessmentMatrix({
  categories,
  assessments,
  roleRequirements,
  currentEmployeeId,
  onCreateAssessment,
  onUpdateAssessment,
}: SkillsAssessmentMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAssessDialogOpen, setIsAssessDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{ skill: any; categoryId: string } | null>(null);
  const [currentLevel, setCurrentLevel] = useState<ProficiencyLevel>('none');
  const [targetLevel, setTargetLevel] = useState<ProficiencyLevel>('none');
  const [notes, setNotes] = useState('');

  const myLatestAssessment = useMemo(
    () => assessments.filter(a => a.employeeId === currentEmployeeId).sort((a, b) => 
      new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    )[0],
    [assessments, currentEmployeeId]
  );

  const myRoleRequirement = useMemo(
    () => roleRequirements[0], // In real app, match by role
    [roleRequirements]
  );

  const getProficiencyColor = (level: ProficiencyLevel) => {
    return proficiencyLevels.find(p => p.value === level)?.color || proficiencyLevels[0].color;
  };

  const getProficiencyScore = (level: ProficiencyLevel) => {
    return proficiencyLevels.find(p => p.value === level)?.score || 0;
  };

  const getSkillRating = (skillId: string): SkillRating | undefined => {
    return myLatestAssessment?.skillRatings.find(r => r.skillId === skillId);
  };

  const calculateSkillGap = (currentLevel: ProficiencyLevel, requiredLevel?: ProficiencyLevel) => {
    if (!requiredLevel) return 0;
    return getProficiencyScore(requiredLevel) - getProficiencyScore(currentLevel);
  };

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'all') return categories;
    return categories.filter(c => c.id === selectedCategory);
  }, [categories, selectedCategory]);

  const skillsGaps = useMemo(() => {
    if (!myLatestAssessment || !myRoleRequirement) return [];
    
    return myRoleRequirement.requiredSkills
      .map(req => {
        const rating = myLatestAssessment.skillRatings.find(r => r.skillId === req.skillId);
        const gap = calculateSkillGap(rating?.currentLevel || 'none', req.minimumLevel);
        return {
          ...req,
          currentLevel: rating?.currentLevel || 'none',
          gap,
          priority: gap >= 2 ? 'critical' : gap === 1 ? 'high' : 'medium'
        };
      })
      .filter(g => g.gap > 0)
      .sort((a, b) => b.gap - a.gap);
  }, [myLatestAssessment, myRoleRequirement]);

  const handleStartAssessment = (skill: any, categoryId: string) => {
    const existing = getSkillRating(skill.id);
    setEditingSkill({ skill, categoryId });
    setCurrentLevel(existing?.currentLevel || 'none');
    setTargetLevel(existing?.targetLevel || 'none');
    setNotes(existing?.notes || '');
    setIsAssessDialogOpen(true);
  };

  const handleSaveRating = () => {
    if (!editingSkill) return;

    const newRating: SkillRating = {
      skillId: editingSkill.skill.id,
      skillName: editingSkill.skill.name,
      categoryId: editingSkill.categoryId,
      currentLevel,
      targetLevel: targetLevel !== 'none' ? targetLevel : undefined,
      lastAssessed: new Date().toISOString(),
      notes,
    };

    if (myLatestAssessment) {
      const updatedRatings = [...myLatestAssessment.skillRatings.filter(r => r.skillId !== editingSkill.skill.id), newRating];
      onUpdateAssessment(myLatestAssessment.id, { skillRatings: updatedRatings });
    } else {
      onCreateAssessment({
        employeeId: currentEmployeeId,
        assessmentType: 'self',
        skillRatings: [newRating],
        assessmentDate: new Date().toISOString(),
      });
    }

    setIsAssessDialogOpen(false);
    toast.success("Skill rating saved");
  };

  const getOverallProficiency = () => {
    if (!myLatestAssessment?.skillRatings.length) return 0;
    const total = myLatestAssessment.skillRatings.reduce((sum, r) => sum + getProficiencyScore(r.currentLevel), 0);
    const max = myLatestAssessment.skillRatings.length * 4;
    return (total / max) * 100;
  };

  const getTrendIcon = (trend?: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'declining': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Skills Assessment Matrix</h2>
          <p className="text-muted-foreground">Track and develop your competencies across all skill areas</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Proficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOverallProficiency().toFixed(0)}%</div>
            <Progress value={getOverallProficiency()} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skills Assessed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myLatestAssessment?.skillRatings.length || 0}</div>
            <p className="text-xs text-muted-foreground">across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillsGaps.length}</div>
            <p className="text-xs text-muted-foreground">to reach role requirements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expert Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myLatestAssessment?.skillRatings.filter(r => r.currentLevel === 'expert').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">mastered competencies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList>
          <TabsTrigger value="matrix">
            <Target className="mr-2 h-4 w-4" />
            Skills Matrix
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Skill Gaps
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team Heatmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Filter by category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {filteredCategories.map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{category.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.skills.map(skill => {
                        const rating = getSkillRating(skill.id);
                        const required = myRoleRequirement?.requiredSkills.find(r => r.skillId === skill.id);
                        const gap = required ? calculateSkillGap(rating?.currentLevel || 'none', required.minimumLevel) : 0;

                        return (
                          <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{skill.name}</p>
                                {rating?.trend && getTrendIcon(rating.trend)}
                                {gap > 0 && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                              </div>
                              {skill.description && (
                                <p className="text-sm text-muted-foreground">{skill.description}</p>
                              )}
                              {rating?.notes && (
                                <p className="text-xs text-muted-foreground italic mt-1">{rating.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {rating ? (
                                <>
                                  <Badge className={cn("min-w-[100px] justify-center", getProficiencyColor(rating.currentLevel))}>
                                    {proficiencyLevels.find(p => p.value === rating.currentLevel)?.label}
                                  </Badge>
                                  {rating.targetLevel && (
                                    <>
                                      <span className="text-muted-foreground">→</span>
                                      <Badge variant="outline" className="min-w-[100px] justify-center">
                                        Target: {proficiencyLevels.find(p => p.value === rating.targetLevel)?.label}
                                      </Badge>
                                    </>
                                  )}
                                </>
                              ) : (
                                <Badge variant="secondary">Not Assessed</Badge>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleStartAssessment(skill, category.id)}>
                                {rating ? 'Update' : 'Assess'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                Skills requiring development to meet {myRoleRequirement?.roleName} requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillsGaps.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Requirements Met!</h3>
                  <p className="text-muted-foreground">
                    You meet all skill requirements for your current role
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {skillsGaps.map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{gap.skillName}</p>
                          <Badge variant={gap.importance === 'required' ? 'destructive' : 'secondary'} className="text-xs">
                            {gap.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current: {proficiencyLevels.find(p => p.value === gap.currentLevel)?.label} → 
                          Required: {proficiencyLevels.find(p => p.value === gap.minimumLevel)?.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-600">{gap.gap}</p>
                          <p className="text-xs text-muted-foreground">levels</p>
                        </div>
                        <Button size="sm" variant="outline">Create Development Plan</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Competency Heatmap</CardTitle>
              <CardDescription>Visual overview of team skill proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border">Employee</th>
                      {categories[0]?.skills.slice(0, 5).map(skill => (
                        <th key={skill.id} className="text-left p-2 border text-xs">{skill.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.slice(0, 5).map(assessment => (
                      <tr key={assessment.id}>
                        <td className="p-2 border font-medium">{assessment.employeeName}</td>
                        {categories[0]?.skills.slice(0, 5).map(skill => {
                          const rating = assessment.skillRatings.find(r => r.skillId === skill.id);
                          const score = rating ? getProficiencyScore(rating.currentLevel) : 0;
                          const intensity = score * 25;
                          
                          return (
                            <td 
                              key={skill.id} 
                              className="p-2 border text-center"
                              style={{ 
                                backgroundColor: `hsl(var(--primary) / ${intensity}%)`,
                              }}
                            >
                              <span className="text-xs font-medium">
                                {rating ? proficiencyLevels.find(p => p.value === rating.currentLevel)?.label : '-'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assessment Dialog */}
      <Dialog open={isAssessDialogOpen} onOpenChange={setIsAssessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assess Skill: {editingSkill?.skill.name}</DialogTitle>
            <DialogDescription>Rate your current proficiency and set development targets</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Proficiency Level</Label>
              <Select value={currentLevel} onValueChange={(v) => setCurrentLevel(v as ProficiencyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Proficiency Level (Optional)</Label>
              <Select value={targetLevel} onValueChange={(v) => setTargetLevel(v as ProficiencyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context, evidence, or development plans..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssessDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRating}>Save Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
