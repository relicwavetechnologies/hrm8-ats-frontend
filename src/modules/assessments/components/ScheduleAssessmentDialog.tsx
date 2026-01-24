import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { toast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';
import { AssessmentType, AssessmentProvider } from '@/shared/types/assessment';
import { createScheduledAssessment, TIMEZONES } from '@/shared/lib/assessments/mockScheduledAssessmentStorage';
import { ASSESSMENT_PRICING } from '@/shared/lib/assessments/pricingConstants';

const formSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateEmail: z.string().email('Invalid email address'),
  jobTitle: z.string().optional(),
  assessmentType: z.string().min(1, 'Assessment type is required'),
  provider: z.string().min(1, 'Provider is required'),
  passThreshold: z.number().min(0).max(100),
  expiryDays: z.number().min(1).max(30),
  scheduledDate: z.date({ required_error: 'Scheduled date is required' }),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  customInstructions: z.string().optional(),
});

interface ScheduleAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle?: string;
}

export function ScheduleAssessmentDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
}: ScheduleAssessmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const defaultTimezone = TIMEZONES.find(tz => tz.value === userTimezone)?.value || 'America/New_York';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: candidateName || '',
      candidateEmail: candidateEmail || '',
      jobTitle: jobTitle || '',
      assessmentType: 'cognitive',
      provider: 'testgorilla',
      passThreshold: 70,
      expiryDays: 7,
      scheduledTime: '09:00',
      timezone: defaultTimezone,
      customInstructions: '',
    },
  });

  const selectedType = form.watch('assessmentType') as AssessmentType;
  const selectedProvider = form.watch('provider') as AssessmentProvider;
  const cost = ASSESSMENT_PRICING[selectedType]?.cost || 0;

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      createScheduledAssessment({
        candidateId: candidateId || `temp-${Date.now()}`,
        candidateName: values.candidateName,
        candidateEmail: values.candidateEmail,
        jobId,
        jobTitle: values.jobTitle,
        assessmentType: values.assessmentType as AssessmentType,
        provider: values.provider as AssessmentProvider,
        passThreshold: values.passThreshold,
        expiryDays: values.expiryDays,
        customInstructions: values.customInstructions,
        scheduledDate: format(values.scheduledDate, 'yyyy-MM-dd'),
        scheduledTime: values.scheduledTime,
        timezone: values.timezone,
        createdBy: 'current-user',
        createdByName: 'Current User',
        cost,
      });

      toast({
        title: 'Assessment Scheduled',
        description: `Assessment invitation scheduled for ${format(values.scheduledDate, 'PPP')} at ${values.scheduledTime} (${TIMEZONES.find(tz => tz.value === values.timezone)?.label})`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Assessment Invitation</DialogTitle>
          <DialogDescription>
            Schedule an assessment invitation to be sent automatically at a specific date and time
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Candidate Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Candidate Information</h3>
              
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="john.doe@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Senior Software Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assessment Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Assessment Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assessmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cognitive">Cognitive Ability - ${ASSESSMENT_PRICING.cognitive.cost}</SelectItem>
                          <SelectItem value="personality">Personality - ${ASSESSMENT_PRICING.personality.cost}</SelectItem>
                          <SelectItem value="technical-skills">Technical Skills - ${ASSESSMENT_PRICING['technical-skills'].cost}</SelectItem>
                          <SelectItem value="situational-judgment">Situational Judgment - ${ASSESSMENT_PRICING['situational-judgment'].cost}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="testgorilla">TestGorilla</SelectItem>
                          <SelectItem value="codility">Codility</SelectItem>
                          <SelectItem value="vervoe">Vervoe</SelectItem>
                          <SelectItem value="criteria">Criteria Corp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="passThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pass Threshold (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires In (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Schedule Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Schedule Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="time" 
                            {...field} 
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Globe className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Invitation will be sent based on this timezone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Add any special instructions for the candidate..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Cost:</span>
                <span className="text-lg font-bold text-primary">${cost}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule Assessment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
