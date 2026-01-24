import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { CandidateAvatar } from './CandidateAvatar';
import { CandidateStatusBadge } from './CandidateStatusBadge';
import { AIInterviewScoreBadge } from './AIInterviewScoreBadge';
import { CandidateFeedbackTab } from './CandidateFeedbackTab';
import { AIInterviewsTab } from './AIInterviewsTab';
import { ApplicationsTab } from './ApplicationsTab';
import { NotesTab } from './NotesTab';
import { HistoryTab } from './HistoryTab';
import { DocumentManager } from './DocumentManager';
import { BackgroundChecksTab } from './BackgroundChecksTab';
import { AssessmentsTab } from './AssessmentsTab';
import { Candidate } from '@/shared/types/entities';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  FileText, 
  MessageSquare,
  User,
  History,
  Star,
  FolderOpen,
  ShieldCheck,
  ClipboardCheck,
  Video
} from 'lucide-react';
import { format } from 'date-fns';

interface CandidateDetailViewProps {
  candidate: Candidate;
}

export function CandidateDetailView({ candidate }: CandidateDetailViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/candidates')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates
        </Button>
      </div>

      {/* Candidate Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <CandidateAvatar 
                name={candidate.name} 
                photo={candidate.photo}
                size="lg"
              />
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">{candidate.name}</h1>
                <p className="text-lg text-muted-foreground">{candidate.position}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <CandidateStatusBadge status={candidate.status} />
                  <AIInterviewScoreBadge candidateId={candidate.id} />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${candidate.email}`} className="hover:underline">
                    {candidate.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${candidate.phone}`} className="hover:underline">
                    {candidate.phone}
                  </a>
                </div>
                {candidate.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.location}, {candidate.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.experience} experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied {format(candidate.appliedDate, 'PPP')}</span>
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate(`/candidates/${candidate.id}/edit`)}>
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/ai-interviews/schedule', { 
                  state: { 
                    candidateId: candidate.id,
                    candidateName: candidate.name,
                    candidateEmail: candidate.email
                  } 
                })}
              >
                <Video className="h-4 w-4 mr-2" />
                Schedule AI Interview
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">
            <User className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-interviews">
            <Video className="h-4 w-4 mr-2" />
            AI Interviews
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="applications">
            <Briefcase className="h-4 w-4 mr-2" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="background-checks">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Checks
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FolderOpen className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience Level</p>
                  <p className="text-sm">{candidate.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Work Arrangement</p>
                  <p className="text-sm">{candidate.workArrangement}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Source</p>
                  <p className="text-sm">{candidate.source}</p>
                </div>
                {candidate.availabilityDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Availability Date</p>
                    <p className="text-sm">{format(candidate.availabilityDate, 'PPP')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {candidate.tags && candidate.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Interviews Tab */}
        <TabsContent value="ai-interviews">
          <AIInterviewsTab 
            candidateId={candidate.id}
            candidateName={candidate.name}
            candidateEmail={candidate.email}
          />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <CandidateFeedbackTab 
            candidateId={candidate.id}
            candidateName={candidate.name}
          />
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <ApplicationsTab candidateId={candidate.id} />
        </TabsContent>

        {/* Background Checks Tab */}
        <TabsContent value="background-checks">
          <BackgroundChecksTab 
            candidateId={candidate.id}
            candidateName={candidate.name}
            candidateEmail={candidate.email}
          />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <AssessmentsTab 
            candidateId={candidate.id}
            candidateName={candidate.name}
            candidateEmail={candidate.email}
          />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <DocumentManager candidateId={candidate.id} />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <NotesTab candidateId={candidate.id} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <HistoryTab candidateId={candidate.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
