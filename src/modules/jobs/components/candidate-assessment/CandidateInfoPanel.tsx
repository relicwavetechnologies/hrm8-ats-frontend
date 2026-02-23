import React, { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Application } from '@/shared/types/application';
import { AIMatchBadge } from '@/modules/applications/components/AIMatchBadge';
import {
  FileText, Brain, Mail, Phone, MapPin, Calendar,
  Briefcase, GraduationCap, AlertTriangle, CheckCircle2,
  DollarSign, Users, Sparkles, Download, Eye, Star,
  Flag, Bell, BellOff, Linkedin, Globe, Tag,
} from 'lucide-react';
import { format, isValid, parseISO, formatDistanceToNow } from 'date-fns';
import { applicationService } from '@/modules/applications/lib/applicationService';

interface CandidateInfoPanelProps {
  application: Application;
  jobTitle: string;
}

function formatDateSafe(dateInput: string | Date | undefined | null, formatStr: string = 'MMM dd, yyyy'): string | null {
  if (!dateInput) return null;
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (isValid(date)) return format(date, formatStr);
    const fallback = new Date(dateInput as string);
    if (isValid(fallback)) return format(fallback, formatStr);
  } catch { /* ignore */ }
  return null;
}

function formatTimeAgo(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'Just now';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (isValid(date)) return formatDistanceToNow(date, { addSuffix: true });
    const fallback = new Date(dateInput as string);
    if (isValid(fallback)) return formatDistanceToNow(fallback, { addSuffix: true });
  } catch { /* ignore */ }
  return 'Just now';
}

const STATUS_COLORS: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  screening: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  interview: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  offer: 'bg-green-500/10 text-green-700 dark:text-green-400',
  hired: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
  withdrawn: 'bg-muted text-muted-foreground',
};

export function CandidateInfoPanel({ application, jobTitle }: CandidateInfoPanelProps) {
  const [rating, setRating] = useState((application as any).rating || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [resumeContentLoading, setResumeContentLoading] = useState(false);

  const candidate = application.candidate;
  const parsedResume = application.parsedResume;
  const aiAnalysis = application.aiAnalysis;

  const candidateName =
    application.candidateName ||
    (candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown');

  const initials = candidateName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalExperience =
    parsedResume?.workHistory?.reduce((acc, job) => {
      try {
        const start = new Date(job.startDate);
        const end = job.endDate ? new Date(job.endDate) : new Date();
        if (isValid(start) && isValid(end)) return acc + (end.getTime() - start.getTime());
      } catch { /* skip */ }
      return acc;
    }, 0) || 0;
  const yearsOfExperience = Math.floor(totalExperience / (1000 * 60 * 60 * 24 * 365));

  const keySkills = parsedResume?.skills?.slice(0, 8) || [];
  const strengths = aiAnalysis?.strengths || [];
  const concerns = aiAnalysis?.concerns || [];
  const recommendation = aiAnalysis?.recommendation || 'pending';

  useEffect(() => {
    let cancelled = false;
    const fetchResumeContent = async () => {
      if (!application?.id) return;
      setResumeContentLoading(true);
      try {
        const response = await applicationService.getApplicationResume(application.id);
        if (!cancelled && response.success && response.data?.content) {
          setResumeContent(String(response.data.content));
        } else if (!cancelled) {
          setResumeContent('');
        }
      } catch {
        if (!cancelled) setResumeContent('');
      } finally {
        if (!cancelled) setResumeContentLoading(false);
      }
    };
    fetchResumeContent();
    return () => { cancelled = true; };
  }, [application?.id]);

  // Default-open sections
  const defaultOpen = ['key-facts', 'resume'];
  if (aiAnalysis?.overallScore || application.aiMatchScore) defaultOpen.push('ai-review');

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full flex flex-col">

        {/* ── Candidate Avatar + Name Header ─────────────────── */}
        <div className="px-4 py-3 border-b bg-background flex-shrink-0">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 border-2 border-primary/20 flex-shrink-0 mt-0.5">
              <AvatarImage src={application.candidatePhoto || application.candidate?.photo} />
              <AvatarFallback className="text-base bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h2 className="text-sm font-semibold leading-snug truncate">{candidateName}</h2>
                {(application.aiMatchScore || aiAnalysis?.overallScore) && (
                  <AIMatchBadge score={aiAnalysis?.overallScore || application.aiMatchScore!} size="sm" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Applied for <span className="font-medium text-foreground">{jobTitle}</span>
              </p>

              {/* Status + Stage badges */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge className={`${STATUS_COLORS[application.status] || STATUS_COLORS.applied} text-[10px] py-0 border-0`}>
                  {application.status}
                </Badge>
                {application.stage && (
                  <Badge variant="outline" className="text-[10px] py-0">
                    {application.stage}
                  </Badge>
                )}
                {isPriority && (
                  <Badge variant="destructive" className="gap-1 text-[10px] py-0">
                    <Flag className="h-2.5 w-2.5" /> Priority
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ── Contact row (compact icons) ──────────────────── */}
          <div className="flex items-center gap-2 mt-3">
            {application.candidateEmail && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`mailto:${application.candidateEmail}`}
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{application.candidateEmail}</TooltipContent>
              </Tooltip>
            )}
            {application.candidatePhone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`tel:${application.candidatePhone}`}
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{application.candidatePhone}</TooltipContent>
              </Tooltip>
            )}
            {application.linkedInUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={application.linkedInUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">LinkedIn Profile</TooltipContent>
              </Tooltip>
            )}
            {application.portfolioUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={application.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Portfolio</TooltipContent>
              </Tooltip>
            )}

            <div className="flex items-center gap-0.5 ml-auto">
              {/* Location / Applied */}
              {(application.candidateCity || application.candidateCountry) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-7 w-7 rounded-md bg-muted">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {[application.candidateCity, application.candidateCountry].filter(Boolean).join(', ')}
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center h-7 w-7 rounded-md bg-muted">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Applied {formatTimeAgo(application.appliedDate)}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* ── Quick Actions (rating + set + follow) ───────── */}
          <div className="flex items-center mt-2.5 gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="h-6 w-5 flex items-center justify-center">
                  <Star
                    className={`h-3.5 w-3.5 transition-colors ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/40 hover:text-yellow-400'}`}
                  />
                </button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-4 mx-1" />

            <Button
              variant={isPriority ? 'default' : 'ghost'}
              size="sm"
              className="h-6 px-2 text-[10px] gap-1"
              onClick={() => setIsPriority(!isPriority)}
            >
              <Flag className="h-3 w-3" />
              {isPriority ? 'Priority' : 'Set'}
            </Button>

            <Button
              variant={isFollowing ? 'default' : 'ghost'}
              size="sm"
              className="h-6 px-2 text-[10px] gap-1"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>

        {/* ── Accordion Sections ─────────────────────────────── */}
        <ScrollArea className="flex-1">
          <Accordion type="multiple" defaultValue={defaultOpen} className="px-2 pb-4">

            {/* Key Facts */}
            <AccordionItem value="key-facts" className="border-b-0 mt-1">
              <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Key Facts
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-1 px-1 space-y-2">
                {yearsOfExperience > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/40 text-xs">
                    <Briefcase className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <div>
                      <span className="font-medium">{yearsOfExperience}+ yrs experience</span>
                      {parsedResume?.workHistory?.[0]?.role && (
                        <span className="text-muted-foreground"> · {parsedResume.workHistory[0].role}</span>
                      )}
                    </div>
                  </div>
                )}
                {keySkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-1">
                    {keySkills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} className="text-[10px] bg-primary/10 text-primary border-0 py-0">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                )}
                {strengths.length > 0 && (
                  <ul className="px-1 space-y-1">
                    {strengths.slice(0, 2).map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Resume */}
            {application.resumeUrl && (
              <AccordionItem value="resume" className="border-b-0 mt-1">
                <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Resume
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-1 px-1">
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="outline" className="flex-1 text-xs h-7"
                      onClick={() => window.open(application.resumeUrl, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button
                      size="sm" variant="outline" className="flex-1 text-xs h-7"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = application.resumeUrl!;
                        a.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
                        a.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* AI Review */}
            {(aiAnalysis || application.aiMatchScore) && (
              <AccordionItem value="ai-review" className="border-b-0 mt-1">
                <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                  <span className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    AI Review
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-1 px-1 space-y-3">
                  {/* Score bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Match Score</span>
                      <span className="text-sm font-bold text-primary">
                        {aiAnalysis?.overallScore || application.aiMatchScore || 0}%
                      </span>
                    </div>
                    <Progress value={aiAnalysis?.overallScore || application.aiMatchScore || 0} className="h-1.5" />
                  </div>

                  {/* Recommendation */}
                  {aiAnalysis?.recommendation && (
                    <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1.5">
                      <span className="text-xs text-muted-foreground">Recommendation</span>
                      <Badge
                        variant={recommendation.includes('no_hire') ? 'destructive' : recommendation === 'maybe' ? 'secondary' : 'default'}
                        className="text-[10px] py-0"
                      >
                        {String(aiAnalysis.recommendation).replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  )}

                  {/* Summary */}
                  {(aiAnalysis?.summary || aiAnalysis?.detailedAnalysis?.overallAssessment) && (
                    <p className="text-xs text-muted-foreground leading-relaxed px-1">
                      {aiAnalysis.summary || aiAnalysis.detailedAnalysis?.overallAssessment}
                    </p>
                  )}

                  {/* Score breakdown */}
                  {aiAnalysis?.scores && (
                    <div className="space-y-1.5 px-1">
                      {Object.entries(aiAnalysis.scores).map(([key, value]) => (
                        <div key={key} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="capitalize text-muted-foreground">{key}</span>
                            <span className="font-medium">{Number(value || 0)}%</span>
                          </div>
                          <Progress value={Number(value || 0)} className="h-1" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Concerns */}
                  {concerns.length > 0 && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-2 py-2 space-y-1">
                      <p className="text-[10px] font-semibold text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Concerns
                      </p>
                      {concerns.slice(0, 2).map((c, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground line-clamp-2">• {c}</p>
                      ))}
                    </div>
                  )}

                  {/* Cultural fit */}
                  {aiAnalysis?.culturalFit && (
                    <div className="px-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> Cultural Fit
                        </span>
                        <span className="text-sm font-bold text-primary">{aiAnalysis.culturalFit.score || 0}%</span>
                      </div>
                      <Progress value={aiAnalysis.culturalFit.score || 0} className="h-1.5" />
                    </div>
                  )}

                  {/* Compensation */}
                  {aiAnalysis?.salaryBenchmark && (
                    <div className="px-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3 inline mr-1" />
                      {aiAnalysis.salaryBenchmark.marketRange || 'Market data unavailable'}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Skills */}
            {keySkills.length > 0 && (
              <AccordionItem value="skills" className="border-b-0 mt-1">
                <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    Skills
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-1 px-2">
                  <div className="flex flex-wrap gap-1">
                    {keySkills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] py-0">{skill.name}</Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Experience */}
            {parsedResume?.workHistory && parsedResume.workHistory.length > 0 && (
              <AccordionItem value="experience" className="border-b-0 mt-1">
                <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    Experience {yearsOfExperience > 0 && `(${yearsOfExperience}+ yrs)`}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-1 px-2 space-y-3">
                  {parsedResume.workHistory.slice(0, 3).map((job, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium">{job.role || job.title || 'Experience'}</p>
                      <p className="text-[11px] text-muted-foreground">{job.company}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {job.startDate} – {job.endDate || 'Present'}
                      </p>
                    </div>
                  ))}
                  {parsedResume.workHistory.length > 3 && (
                    <p className="text-[11px] text-muted-foreground">
                      +{parsedResume.workHistory.length - 3} more positions
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Education */}
            {parsedResume?.education && parsedResume.education.length > 0 && (
              <AccordionItem value="education" className="border-b-0 mt-1">
                <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    Education
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-1 px-2 space-y-2">
                  {parsedResume.education.slice(0, 2).map((edu, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium">{edu.degree || edu.field || 'Degree'}</p>
                      <p className="text-[11px] text-muted-foreground">{edu.institution}</p>
                      {(edu.endDate || edu.graduationDate) && (
                        <p className="text-[11px] text-muted-foreground">{edu.endDate || edu.graduationDate}</p>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Tags */}
            {application.tags && application.tags.length > 0 && (
              <AccordionItem value="tags" className="border-b-0 mt-1">
                <AccordionTrigger className="text-xs font-semibold py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    Tags
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-1 px-2">
                  <div className="flex flex-wrap gap-1">
                    {application.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0">{tag}</Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

          </Accordion>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
