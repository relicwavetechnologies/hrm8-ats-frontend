import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Separator } from '@/shared/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AssessmentComment,
  AssessmentRating,
  AssessmentDecision,
  RatingCategory,
  DecisionType,
} from '@/shared/types/assessmentCollaboration';
import {
  getAssessmentComments,
  addAssessmentComment,
  updateAssessmentComment,
  deleteAssessmentComment,
  getAssessmentRatings,
  addAssessmentRating,
  getAssessmentDecisions,
  addAssessmentDecision,
  getAssessmentActivities,
  getCollaborationSummary,
} from '@/shared/lib/assessments/mockCollaborationStorage';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Clock,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/hooks/use-toast';

interface AssessmentCollaborationProps {
  assessmentId: string;
}

const ratingCategories: { value: RatingCategory; label: string }[] = [
  { value: 'technical-skills', label: 'Technical Skills' },
  { value: 'problem-solving', label: 'Problem Solving' },
  { value: 'communication', label: 'Communication' },
  { value: 'cultural-fit', label: 'Cultural Fit' },
  { value: 'overall', label: 'Overall Assessment' },
];

const decisionTypes: { value: DecisionType; label: string; icon: any; color: string }[] = [
  { value: 'proceed', label: 'Proceed to Next Stage', icon: ThumbsUp, color: 'text-success' },
  { value: 'maybe', label: 'Maybe - Needs Discussion', icon: HelpCircle, color: 'text-warning' },
  { value: 'reject', label: 'Reject', icon: ThumbsDown, color: 'text-destructive' },
  { value: 'pending', label: 'Pending Review', icon: Clock, color: 'text-muted-foreground' },
];

export function AssessmentCollaboration({ assessmentId }: AssessmentCollaborationProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<AssessmentComment[]>([]);
  const [ratings, setRatings] = useState<AssessmentRating[]>([]);
  const [decisions, setDecisions] = useState<AssessmentDecision[]>([]);
  const [summary, setSummary] = useState(getCollaborationSummary(assessmentId));
  
  const [newComment, setNewComment] = useState('');
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const loadData = () => {
    setComments(getAssessmentComments(assessmentId));
    setRatings(getAssessmentRatings(assessmentId));
    setDecisions(getAssessmentDecisions(assessmentId));
    setSummary(getCollaborationSummary(assessmentId));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addAssessmentComment(assessmentId, newComment, replyToComment || undefined);
    setNewComment('');
    setReplyToComment(null);
    loadData();
    
    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted.',
    });
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) return;
    
    updateAssessmentComment(commentId, editContent);
    setEditingComment(null);
    setEditContent('');
    loadData();
    
    toast({
      title: 'Comment Updated',
      description: 'Your comment has been updated.',
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteAssessmentComment(commentId);
    loadData();
    
    toast({
      title: 'Comment Deleted',
      description: 'The comment has been removed.',
    });
  };

  const handleAddRating = (category: RatingCategory, score: number, comment?: string) => {
    addAssessmentRating(assessmentId, category, score, comment);
    loadData();
    
    toast({
      title: 'Rating Submitted',
      description: `Your ${category} rating has been recorded.`,
    });
  };

  const handleAddDecision = (decision: DecisionType, reasoning: string) => {
    if (!reasoning.trim()) {
      toast({
        title: 'Reasoning Required',
        description: 'Please provide reasoning for your decision.',
        variant: 'destructive',
      });
      return;
    }
    
    addAssessmentDecision(assessmentId, decision, reasoning);
    loadData();
    
    toast({
      title: 'Decision Recorded',
      description: 'Your assessment decision has been saved.',
    });
  };

  const renderComment = (comment: AssessmentComment, isReply: boolean = false) => {
    const replies = comments.filter((c) => c.parentId === comment.id);
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className={cn('space-y-2', isReply && 'ml-12')}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {comment.userName.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{comment.userName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.isEdited && (
                <Badge variant="outline" className="text-xs">Edited</Badge>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToComment(comment.id)}
                    className="h-7 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
        
        {replies.length > 0 && (
          <div className="space-y-2">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.totalComments}</div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.totalRatings}</div>
            <div className="text-xs text-muted-foreground">Ratings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {summary.decisions.proceed + summary.decisions.maybe + summary.decisions.reject}
            </div>
            <div className="text-xs text-muted-foreground">Decisions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.collaborators.length}</div>
            <div className="text-xs text-muted-foreground">Reviewers</div>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="comments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({summary.totalComments})
            </TabsTrigger>
            <TabsTrigger value="ratings">
              <Star className="h-4 w-4 mr-2" />
              Ratings
            </TabsTrigger>
            <TabsTrigger value="decisions">
              <TrendingUp className="h-4 w-4 mr-2" />
              Decisions
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team ({summary.collaborators.length})
            </TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              {replyToComment && (
                <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
                  <span className="text-sm">
                    Replying to comment...
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToComment(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              <div className="flex gap-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this assessment..."
                  rows={3}
                />
                <Button onClick={handleAddComment} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {topLevelComments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Start the discussion!</p>
                </div>
              ) : (
                topLevelComments.map((comment) => renderComment(comment))
              )}
            </div>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="space-y-4">
            <RatingsPanel
              assessmentId={assessmentId}
              ratings={ratings}
              summary={summary}
              onRatingSubmit={handleAddRating}
            />
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <DecisionsPanel
              assessmentId={assessmentId}
              decisions={decisions}
              summary={summary}
              onDecisionSubmit={handleAddDecision}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <TeamPanel collaborators={summary.collaborators} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

// Ratings Panel Component
function RatingsPanel({
  assessmentId,
  ratings,
  summary,
  onRatingSubmit,
}: {
  assessmentId: string;
  ratings: AssessmentRating[];
  summary: any;
  onRatingSubmit: (category: RatingCategory, score: number, comment?: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<RatingCategory>('overall');
  const [score, setScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const handleSubmit = () => {
    if (score === 0) return;
    onRatingSubmit(selectedCategory, score, ratingComment);
    setScore(0);
    setRatingComment('');
  };

  return (
    <div className="space-y-6">
      {/* Average Ratings */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ratingCategories.map((cat) => {
          const avg = summary.averageRatings[cat.value];
          return (
            <Card key={cat.value} className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {avg > 0 ? avg.toFixed(1) : '-'}
              </div>
              <div className="text-xs text-muted-foreground">{cat.label}</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-3 w-3',
                      star <= Math.round(avg) ? 'fill-warning text-warning' : 'text-muted'
                    )}
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Add Rating */}
      <div className="space-y-4">
        <h4 className="font-semibold">Submit Your Rating</h4>
        
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as RatingCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ratingCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Score</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0.5 focus-visible:ring-0"
                onClick={() => setScore(star)}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    star <= score ? 'fill-warning text-warning' : 'text-muted hover:text-warning'
                  )}
                />
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Comment (Optional)</Label>
          <Textarea
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Add additional context for your rating..."
            rows={2}
          />
        </div>

        <Button onClick={handleSubmit} disabled={score === 0}>
          Submit Rating
        </Button>
      </div>

      <Separator />

      {/* Ratings List */}
      <div className="space-y-3">
        <h4 className="font-semibold">All Ratings</h4>
        {ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No ratings submitted yet.
          </p>
        ) : (
          ratings.map((rating) => (
            <div key={rating.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {rating.userName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{rating.userName}</span>
                  <Badge variant="outline" className="text-xs">
                    {ratingCategories.find((c) => c.value === rating.category)?.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-3 w-3',
                        star <= rating.score ? 'fill-warning text-warning' : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                {rating.comment && (
                  <p className="text-sm text-muted-foreground">{rating.comment}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Decisions Panel Component
function DecisionsPanel({
  assessmentId,
  decisions,
  summary,
  onDecisionSubmit,
}: {
  assessmentId: string;
  decisions: AssessmentDecision[];
  summary: any;
  onDecisionSubmit: (decision: DecisionType, reasoning: string) => void;
}) {
  const [selectedDecision, setSelectedDecision] = useState<DecisionType>('pending');
  const [reasoning, setReasoning] = useState('');

  const handleSubmit = () => {
    onDecisionSubmit(selectedDecision, reasoning);
    setReasoning('');
  };

  return (
    <div className="space-y-6">
      {/* Decision Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold">{summary.decisions.proceed}</div>
          <div className="text-xs text-muted-foreground">Proceed</div>
        </Card>
        <Card className="p-4 text-center">
          <HelpCircle className="h-8 w-8 text-warning mx-auto mb-2" />
          <div className="text-2xl font-bold">{summary.decisions.maybe}</div>
          <div className="text-xs text-muted-foreground">Maybe</div>
        </Card>
        <Card className="p-4 text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <div className="text-2xl font-bold">{summary.decisions.reject}</div>
          <div className="text-xs text-muted-foreground">Reject</div>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold">{summary.decisions.pending}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </Card>
      </div>

      <Separator />

      {/* Submit Decision */}
      <div className="space-y-4">
        <h4 className="font-semibold">Submit Your Decision</h4>
        
        <RadioGroup value={selectedDecision} onValueChange={(v) => setSelectedDecision(v as DecisionType)}>
          {decisionTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="flex items-center gap-2 flex-1 cursor-pointer">
                  <Icon className={cn('h-4 w-4', type.color)} />
                  {type.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="space-y-2">
          <Label>Reasoning *</Label>
          <Textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain your decision..."
            rows={4}
          />
        </div>

        <Button onClick={handleSubmit} disabled={!reasoning.trim()}>
          Submit Decision
        </Button>
      </div>

      <Separator />

      {/* Decisions List */}
      <div className="space-y-3">
        <h4 className="font-semibold">Team Decisions</h4>
        {decisions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No decisions recorded yet.
          </p>
        ) : (
          decisions.map((decision) => {
            const decisionType = decisionTypes.find((t) => t.value === decision.decision);
            const Icon = decisionType?.icon;
            
            return (
              <div key={decision.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {decision.userName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{decision.userName}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {Icon && <Icon className={cn('h-3 w-3', decisionType?.color)} />}
                      {decisionType?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Team Panel Component
function TeamPanel({ collaborators }: { collaborators: any[] }) {
  return (
    <div className="space-y-3">
      {collaborators.map((collab) => (
        <div key={collab.userId} className="flex items-center gap-3 p-3 border rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {collab.userName.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{collab.userName}</div>
            <div className="text-xs text-muted-foreground">{collab.userEmail}</div>
            <div className="flex gap-2 mt-1">
              {collab.hasCommented && (
                <Badge variant="outline" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Commented
                </Badge>
              )}
              {collab.hasRated && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Rated
                </Badge>
              )}
              {collab.hasDecided && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Decided
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
