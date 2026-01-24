import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { getRatingCriteria, saveFeedback, feedbackSchema } from '@/shared/lib/collaborativeFeedbackService';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { Plus, Trash2 } from 'lucide-react';

const formSchema = feedbackSchema;

interface CollaborativeFeedbackFormProps {
  candidateId: string;
  candidateName: string;
  applicationId?: string;
  interviewId?: string;
  onSubmitSuccess?: () => void;
}

export function CollaborativeFeedbackForm({
  candidateId,
  candidateName,
  applicationId,
  interviewId,
  onSubmitSuccess,
}: CollaborativeFeedbackFormProps) {
  const { toast } = useToast();
  const criteria = getRatingCriteria();
  const [comments, setComments] = useState<Array<{
    type: 'strength' | 'concern' | 'observation' | 'question';
    category: string;
    content: string;
    importance: 'low' | 'medium' | 'high';
  }>>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateId,
      applicationId,
      interviewId,
      reviewerId: 'current-user-id', // TODO: Get from auth
      reviewerName: 'Current User', // TODO: Get from auth
      reviewerRole: 'Team Member', // TODO: Get from auth
      ratings: criteria.map(c => ({
        criterionId: c.id,
        value: 5,
        confidence: 3,
        notes: '',
      })),
      comments: [],
      overallScore: 50,
      recommendation: 'maybe',
      confidence: 3,
    },
  });

  const addComment = () => {
    setComments([...comments, {
      type: 'observation',
      category: '',
      content: '',
      importance: 'medium',
    }]);
  };

  const removeComment = (index: number) => {
    setComments(comments.filter((_, i) => i !== index));
  };

  const updateComment = (index: number, field: string, value: any) => {
    const updated = [...comments];
    updated[index] = { ...updated[index], [field]: value };
    setComments(updated);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      saveFeedback({
        candidateId: values.candidateId,
        applicationId: values.applicationId,
        interviewId: values.interviewId,
        reviewerId: values.reviewerId,
        reviewerName: values.reviewerName,
        reviewerRole: values.reviewerRole,
        ratings: values.ratings as any,
        comments: comments as any,
        overallScore: values.overallScore,
        recommendation: values.recommendation,
        confidence: values.confidence,
      });
      toast({
        title: 'Feedback Submitted',
        description: 'Your feedback has been saved successfully.',
      });
      onSubmitSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback for {candidateName}</CardTitle>
            <CardDescription>Rate the candidate on multiple criteria and provide structured feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating Criteria */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rating Criteria</h3>
              {criteria.map((criterion, index) => (
                <div key={criterion.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{criterion.name}</h4>
                      <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      <Badge variant="secondary" className="mt-1">Weight: {criterion.weight}</Badge>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`ratings.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (1-10)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[typeof field.value === 'number' ? field.value : 5]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                            <div className="text-center text-2xl font-bold">{field.value}</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ratings.${index}.confidence`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confidence Level</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Very Low</SelectItem>
                            <SelectItem value="2">Low</SelectItem>
                            <SelectItem value="3">Medium</SelectItem>
                            <SelectItem value="4">High</SelectItem>
                            <SelectItem value="5">Very High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ratings.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes about this criterion..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Structured Comments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Structured Comments</h3>
                <Button type="button" onClick={addComment} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
              
              {comments.map((comment, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Select value={comment.type} onValueChange={(value: any) => updateComment(index, 'type', value)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="concern">Concern</SelectItem>
                          <SelectItem value="observation">Observation</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={comment.importance} onValueChange={(value: any) => updateComment(index, 'importance', value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button type="button" onClick={() => removeComment(index)} size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Category (e.g., Technical Skills, Communication)"
                    value={comment.category}
                    onChange={(e) => updateComment(index, 'category', e.target.value)}
                  />
                  
                  <Textarea
                    placeholder="Detailed comment..."
                    value={comment.content}
                    onChange={(e) => updateComment(index, 'content', e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Overall Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overall Assessment</h3>
              
              <FormField
                control={form.control}
                name="overallScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Score (0-100)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <div className="text-center text-2xl font-bold">{field.value}</div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hiring Recommendation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strong-hire">Strong Hire</SelectItem>
                        <SelectItem value="hire">Hire</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="no-hire">No Hire</SelectItem>
                        <SelectItem value="strong-no-hire">Strong No Hire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Confidence</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Very Low</SelectItem>
                        <SelectItem value="2">Low</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">High</SelectItem>
                        <SelectItem value="5">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">Submit Feedback</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
