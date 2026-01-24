import React, { useState, useMemo } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { Button } from '@/shared/components/ui/button';
import { QuestionBankPreviewDialog } from '@/components/assessments/QuestionBankPreviewDialog';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { QuestionBankDialog } from '@/components/assessments/QuestionBankDialog';
import { QuestionBankItem, DifficultyLevel, QuestionType } from '@/shared/types/questionBank';
import {
  getQuestionBankItems,
  saveQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  getQuestionBankStats,
  getAllCategories,
  getAllTags,
} from '@/shared/lib/assessments/mockQuestionBankStorage';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Search,
  FileQuestion,
  TrendingUp,
  BarChart3,
  Award,
  X,
  Eye,
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { WarningConfirmationDialog } from '@/shared/components/ui/warning-confirmation-dialog';

export default function QuestionBank() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionBankItem[]>(getQuestionBankItems());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const stats = useMemo(() => getQuestionBankStats(), [questions]);
  const categories = useMemo(() => ['all', ...getAllCategories()], [questions]);
  const tags = useMemo(() => ['all', ...getAllTags()], [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        searchTerm === '' ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory =
        selectedCategory === 'all' || q.category.includes(selectedCategory);
      
      const matchesDifficulty =
        selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      
      const matchesType = selectedType === 'all' || q.type === selectedType;
      
      const matchesTag = selectedTag === 'all' || q.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesType && matchesTag;
    });
  }, [questions, searchTerm, selectedCategory, selectedDifficulty, selectedType, selectedTag]);

  const handleSaveQuestion = (questionData: Partial<QuestionBankItem>) => {
    if (selectedQuestion) {
      updateQuestion(
        selectedQuestion.id,
        questionData,
        'Updated via dialog',
        'current-user'
      );
      toast({
        title: 'Question Updated',
        description: 'The question has been successfully updated.',
      });
    } else {
      const newQuestion: QuestionBankItem = {
        id: `q-${Date.now()}`,
        ...questionData,
        version: 1,
        versionHistory: [
          {
            version: 1,
            text: questionData.text!,
            updatedBy: 'current-user',
            updatedAt: new Date().toISOString(),
            changeNotes: 'Initial version',
          },
        ],
        usageStats: {
          totalUses: 0,
          assessmentCount: 0,
        },
        createdBy: 'current-user',
        createdByName: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as QuestionBankItem;

      saveQuestion(newQuestion);
      toast({
        title: 'Question Created',
        description: 'The question has been successfully created.',
      });
    }

    setQuestions(getQuestionBankItems());
    setSelectedQuestion(undefined);
  };

  const handleEditQuestion = (question: QuestionBankItem) => {
    setSelectedQuestion(question);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setQuestionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (questionToDelete) {
      deleteQuestion(questionToDelete);
      setQuestions(getQuestionBankItems());
      toast({
        title: 'Question Deleted',
        description: 'The question has been successfully deleted.',
      });
    }
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleDuplicateQuestion = (id: string) => {
    const duplicated = duplicateQuestion(id);
    if (duplicated) {
      setQuestions(getQuestionBankItems());
      toast({
        title: 'Question Duplicated',
        description: 'The question has been successfully duplicated.',
      });
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'hard':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const getTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      'multiple-choice': 'Multiple Choice',
      'single-choice': 'Single Choice',
      'true-false': 'True/False',
      'text-short': 'Short Text',
      'text-long': 'Long Text',
      'coding': 'Coding',
      'video-response': 'Video',
      'file-upload': 'File Upload',
    };
    return labels[type];
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedType !== 'all' ||
    selectedTag !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
    setSelectedTag('all');
  };

  return (
    <DashboardPageLayout
      title="Question Bank"
      subtitle="Create, organize, and reuse assessment questions with version control"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewDialogOpen(true)}
            disabled={questions.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Assessment
          </Button>
          <Button onClick={() => { setSelectedQuestion(undefined); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Questions"
            value={stats.totalQuestions}
            change=""
            icon={<FileQuestion className="h-6 w-6" />}
            variant="neutral"
          />
          <EnhancedStatCard
            title="Active Questions"
            value={stats.activeQuestions}
            change=""
            icon={<TrendingUp className="h-6 w-6" />}
            variant="primary"
          />
          <EnhancedStatCard
            title="Total Uses"
            value={stats.totalUses}
            change=""
            icon={<BarChart3 className="h-6 w-6" />}
            variant="success"
          />
          <EnhancedStatCard
            title="Avg Pass Rate"
            value={`${Math.round(stats.averagePassRate)}%`}
            change=""
            icon={<Award className="h-6 w-6" />}
            variant="warning"
          />
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="single-choice">Single Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="text-short">Short Text</SelectItem>
                <SelectItem value="text-long">Long Text</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag === 'all' ? 'All Tags' : tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Showing {filteredQuestions.length} of {questions.length} questions
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Questions Table */}
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Pass Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-2">{question.text}</p>
                      <div className="flex flex-wrap gap-1">
                        {question.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{question.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getTypeLabel(question.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.category.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {question.category.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{question.category.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{question.usageStats.totalUses} uses</p>
                      <p className="text-xs text-muted-foreground">
                        {question.usageStats.assessmentCount} assessments
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {question.usageStats.passRate || 0}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.isActive ? 'default' : 'secondary'}>
                      {question.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateQuestion(question.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(question.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No questions found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Create your first question to get started'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => { setSelectedQuestion(undefined); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Question
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <QuestionBankDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveQuestion}
        question={selectedQuestion}
      />

      <WarningConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        isProcessing={false}
      />

      <QuestionBankPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        questions={filteredQuestions}
      />
    </DashboardPageLayout>
  );
}
