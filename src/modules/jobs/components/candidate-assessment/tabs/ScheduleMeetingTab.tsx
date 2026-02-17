import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Calendar, Clock, Video, Phone, Building2, Users, AlertCircle, ChevronDown, Check, Circle, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Application } from '@/shared/types/application';
import { DateTimePicker } from '@/shared/components/ui/date-time-picker';
import {
  meetingTemplates,
  durationOptions,
  getMeetingTypeIcon,
  getMeetingTypeColor,
  type MeetingType,
} from '@/shared/lib/meetingTemplates';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { History } from 'lucide-react';
import { AvailabilityGrid } from './AvailabilityGrid';

interface ScheduleMeetingTabProps {
  application: Application;
}

interface Interview {
  id: string;
  scheduled_date: string;
  duration: number;
  type: MeetingType;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  meeting_link?: string;
  notes?: string;
  created_at: string;
}

interface HiringTeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  roleDetails: Array<{ id: string; name: string }>;
}

type PhoneCallMode = 'meet' | 'self';

function getStatusColor(status: Interview['status']): string {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'COMPLETED':
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-700 border-red-200';
    case 'RESCHEDULED':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    case 'NO_SHOW':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

function getMeetingIcon(type: MeetingType) {
  switch (type) {
    case 'VIDEO':
      return Video;
    case 'PHONE':
      return Phone;
    case 'IN_PERSON':
      return Building2;
    case 'PANEL':
      return Users;
    default:
      return Calendar;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ScheduleMeetingTab({ application }: ScheduleMeetingTabProps) {
  const [selectedType, setSelectedType] = useState<MeetingType>('VIDEO');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState<string>('45');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMember[]>([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [interviewerPopoverOpen, setInterviewerPopoverOpen] = useState(false);
  const [phoneCallMode, setPhoneCallMode] = useState<PhoneCallMode>('meet');
  const [calendarStatuses, setCalendarStatuses] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const candidateName = application.candidateName || 'Candidate';

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ interviews: Interview[] }>(
          `/api/applications/${application.id}/interviews`
        );
        if (response.success && response.data?.interviews) {
          setInterviews(response.data.interviews);
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [application.id]);

  // Fetch hiring team
  useEffect(() => {
    const fetchHiringTeam = async () => {
      let jobId = application.jobId || (application as any).job?.id;
      if (!jobId) return;

      try {
        const response = await apiClient.get<HiringTeamMember[]>(
          `/api/jobs/${jobId}/team`
        );
        if (response.success && response.data) {
          setHiringTeam(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch hiring team:', error);
      }
    };

    fetchHiringTeam();
  }, [application.jobId, (application as any).job?.id]);

  // Fetch calendar connection status for all hiring team members
  useEffect(() => {
    const fetchCalendarStatuses = async () => {
      if (hiringTeam.length === 0) return;
      try {
        const response = await apiClient.post<{ [userId: string]: { connected: boolean } }>(
          '/api/auth/google/interviewers-status',
          { interviewerIds: hiringTeam.map((m) => m.userId) }
        );
        if (response.success && response.data) {
          const statuses: Record<string, boolean> = {};
          for (const [userId, status] of Object.entries(response.data)) {
            statuses[userId] = (status as { connected: boolean }).connected;
          }
          setCalendarStatuses(statuses);
        }
      } catch {
        // Non-fatal — silently fail
      }
    };

    fetchCalendarStatuses();
  }, [hiringTeam]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = meetingTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedType(template.type);
      setSelectedDuration(template.duration.toString());
      toast({
        title: 'Template loaded',
        description: `"${template.name}" template applied`,
      });
    }
  };

  const toggleInterviewer = (userId: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const useMeetLink =
    selectedType === 'VIDEO' || (selectedType === 'PHONE' && phoneCallMode === 'meet');

  const handleSchedule = async () => {
    if (!selectedDate) {
      toast({
        title: 'Date required',
        description: 'Please select a date and time for the meeting',
        variant: 'destructive',
      });
      return;
    }

    setIsScheduling(true);

    try {
      const response = await apiClient.post<{ interview: Interview }>(
        `/api/applications/${application.id}/interviews`,
        {
          scheduledDate: selectedDate.toISOString(),
          duration: parseInt(selectedDuration),
          type: selectedType,
          notes: notes.trim() || undefined,
          interviewerIds: selectedInterviewers,
          useMeetLink,
        }
      );

      if (response.success && response.data?.interview) {
        toast({
          title: 'Meeting scheduled!',
          description: `${selectedType} meeting scheduled with ${candidateName}`,
        });
        setInterviews((prev) => [response.data.interview, ...prev]);
        // Reset form
        setSelectedDate(undefined);
        setNotes('');
        setSelectedTemplate('');
        setSelectedInterviewers([]);
      } else {
        throw new Error(response.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      toast({
        title: 'Failed to schedule meeting',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const selectedMemberDetails = hiringTeam.filter((m) => selectedInterviewers.includes(m.userId));

  return (
    <div className="flex flex-col h-full space-y-2 py-2 overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex-shrink-0">Schedule:</span>
          <div className="bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 truncate border border-primary/20">
            <Calendar className="h-2.5 w-2.5 text-primary" />
            <span className="text-[10px] font-bold text-primary truncate">{candidateName}</span>
          </div>
        </div>
        <Button
          onClick={handleSchedule}
          disabled={!selectedDate || isScheduling}
          className="h-7 px-3 text-[11px] font-bold shadow-sm"
          size="sm"
        >
          {isScheduling ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>Schedule</span>
            </div>
          )}
        </Button>
      </div>

      {/* Toolbar 1: Templates & History */}
      <div className="flex items-center gap-2 px-1 border-b pb-1">
        <div className="flex-1 max-w-[160px]">
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="text-[11px] h-7 bg-transparent border-none hover:bg-muted/50 p-0 px-2 [&>span]:truncate">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Video className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Meeting Presets" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {meetingTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <span className="text-[11px]">{template.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-muted-foreground/20" />

        {/* History Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-[11px] hover:bg-muted/50">
              <History className="h-3.5 w-3.5" />
              Upcoming
              {interviews.length > 0 && (
                <Badge variant="secondary" className="px-1 h-3.5 min-w-[14px] text-[9px]">
                  {interviews.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-muted" side="bottom" align="end">
            <div className="p-3 border-b bg-muted/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scheduled Interviews</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-2">
                {isLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : interviews.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No meetings scheduled</div>
                ) : (
                  interviews.map((interview) => {
                    const Icon = getMeetingIcon(interview.type);
                    return (
                      <div key={interview.id} className="p-2.5 bg-muted/20 rounded border text-[11px] space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold uppercase text-[9px]">{interview.type}</span>
                          </div>
                          <Badge variant="outline" className={`text-[8px] h-3.5 px-1 ${getStatusColor(interview.status)}`}>{interview.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{format(new Date(interview.scheduled_date), 'MMM d, yyyy • h:mm a')}</span>
                        </div>
                        {interview.notes && <p className="text-muted-foreground italic text-[10px] bg-muted/30 p-1.5 rounded truncate">{interview.notes}</p>}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 min-h-0 px-1 pb-1 flex flex-col space-y-3 overflow-y-auto">
        {/* Type & Duration */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Type</label>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as MeetingType)}>
              <SelectTrigger className="text-[11px] h-8 bg-muted/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO"><div className="flex items-center gap-2 px-1"><Video className="h-3.5 w-3.5" /><span>Video Call</span></div></SelectItem>
                <SelectItem value="PHONE"><div className="flex items-center gap-2 px-1"><Phone className="h-3.5 w-3.5" /><span>Phone Call</span></div></SelectItem>
                <SelectItem value="IN_PERSON"><div className="flex items-center gap-2 px-1"><Building2 className="h-3.5 w-3.5" /><span>In-Person</span></div></SelectItem>
                <SelectItem value="PANEL"><div className="flex items-center gap-2 px-1"><Users className="h-3.5 w-3.5" /><span>Panel</span></div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Duration</label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="text-[11px] h-8 bg-muted/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}><span className="text-[11px] px-1">{option.label}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PHONE: Meet or Handle Yourself toggle */}
        {selectedType === 'PHONE' && (
          <div className="bg-muted/30 rounded-lg p-2.5 border space-y-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" /> Phone Call Setup
            </label>
            <RadioGroup
              value={phoneCallMode}
              onValueChange={(v) => setPhoneCallMode(v as PhoneCallMode)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="meet" id="phone-meet" className="h-3 w-3" />
                <Label htmlFor="phone-meet" className="text-[11px] cursor-pointer">Use Google Meet</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="self" id="phone-self" className="h-3 w-3" />
                <Label htmlFor="phone-self" className="text-[11px] cursor-pointer">Handle ourselves</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Date Time Picker */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Date & Time</label>
          <DateTimePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Pick date & time"
            disabled={isScheduling}
            className="w-full h-8 px-3 text-[11px] bg-muted/20"
          />
        </div>

        {/* Interviewers Multi-Select */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Interviewers</label>
          <Popover open={interviewerPopoverOpen} onOpenChange={setInterviewerPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-8 justify-between text-[11px] bg-muted/20 border-input font-normal"
              >
                <span className="truncate">
                  {selectedInterviewers.length === 0
                    ? 'Select interviewers'
                    : `${selectedInterviewers.length} selected`}
                </span>
                <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 shadow-lg" align="start">
              <div className="p-2 border-b">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hiring Team</p>
              </div>
              <ScrollArea className="max-h-52">
                <div className="p-1">
                  {hiringTeam.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-4">No team members found</p>
                  ) : (
                    hiringTeam.map((member) => {
                      const isSelected = selectedInterviewers.includes(member.userId);
                      const isConnected = calendarStatuses[member.userId] ?? false;
                      const roleNames = member.roleDetails.map((r) => r.name).join(', ') || 'Member';

                      return (
                        <div
                          key={member.userId}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleInterviewer(member.userId)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleInterviewer(member.userId)}
                            className="h-3.5 w-3.5 flex-shrink-0"
                          />
                          {/* Avatar */}
                          <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-primary">{getInitials(member.name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate">{member.name}</p>
                            <p className="text-[9px] text-muted-foreground truncate">{roleNames}</p>
                          </div>
                          {/* Calendar connection dot */}
                          <div
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={isConnected ? 'Calendar connected' : 'Calendar not connected'}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {selectedInterviewers.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-6 text-[10px] text-muted-foreground"
                    onClick={() => setSelectedInterviewers([])}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Selected interviewer chips */}
          {selectedMemberDetails.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedMemberDetails.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5"
                >
                  <div className="h-3.5 w-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-primary">{getInitials(m.name)}</span>
                  </div>
                  <span className="text-[9px] font-medium text-primary">{m.name.split(' ')[0]}</span>
                  {!calendarStatuses[m.userId] && (
                    <span className="text-[8px] text-amber-600" title="Calendar not connected">⚠</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability Grid — shown when interviewers selected and date chosen */}
        {selectedInterviewers.length > 0 && useMeetLink && (
          <AvailabilityGrid
            interviewers={hiringTeam
              .filter((m) => selectedInterviewers.includes(m.userId))
              .map((m) => ({ userId: m.userId, name: m.name }))}
            proposedTime={selectedDate}
            duration={parseInt(selectedDuration)}
          />
        )}

        {/* Notes */}
        <div className="flex-1 flex flex-col space-y-1 min-h-0">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Internal Notes</label>
          <Textarea
            placeholder="Any special instructions for the interviewers?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 resize-none text-[11px] leading-relaxed p-3 focus-visible:ring-primary/20 min-h-[60px]"
            disabled={isScheduling}
          />
        </div>
      </div>
    </div>
  );
}
