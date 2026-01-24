import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SelectCandidateStep } from './SelectCandidateStep';
import { SelectInterviewModeStep } from './SelectInterviewModeStep';
import { ConfigureQuestionsStep } from './ConfigureQuestionsStep';
import { ScheduleStep } from './ScheduleStep';
import { ReviewStep } from './ReviewStep';
import type { InterviewMode, QuestionSource } from '@/shared/types/aiInterview';
import { saveAIInterviewSession } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/shared/hooks/use-toast';

interface WizardData {
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle?: string;
  interviewMode?: InterviewMode;
  questionSource?: QuestionSource;
  selectedQuestions?: string[];
  scheduledDate?: string;
}

export function AIInterviewWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Pre-populate with data from location state if available
  const prefilledData = location.state as Partial<WizardData> | null;
  const [wizardData, setWizardData] = useState<WizardData>(prefilledData || {});

  const steps = [
    { title: 'Select Candidate', description: 'Choose who to interview' },
    { title: 'Interview Mode', description: 'Choose format' },
    { title: 'Configure Questions', description: 'Set up questions' },
    { title: 'Schedule', description: 'Pick date and time' },
    { title: 'Review', description: 'Confirm details' },
  ];

  const updateData = (data: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const session = {
      id: uuidv4(),
      candidateId: wizardData.candidateId!,
      candidateName: wizardData.candidateName!,
      candidateEmail: wizardData.candidateEmail!,
      jobId: wizardData.jobId!,
      jobTitle: wizardData.jobTitle!,
      status: 'scheduled' as const,
      scheduledDate: wizardData.scheduledDate!,
      interviewMode: wizardData.interviewMode!,
      questionSource: wizardData.questionSource!,
      questions: [],
      currentQuestionIndex: 0,
      transcript: [],
      invitationToken: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    saveAIInterviewSession(session);
    toast({ title: 'Interview scheduled', description: 'Invitation will be sent to candidate' });
    navigate('/ai-interviews');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return wizardData.candidateId && wizardData.jobId;
      case 1: return wizardData.interviewMode;
      case 2: return wizardData.questionSource;
      case 3: return wizardData.scheduledDate;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Schedule AI Interview</CardTitle>
          <CardDescription>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-primary text-primary-foreground' :
                  index === currentStep ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs mt-2 text-center">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && <SelectCandidateStep data={wizardData} onUpdate={updateData} />}
            {currentStep === 1 && <SelectInterviewModeStep data={wizardData} onUpdate={updateData} />}
            {currentStep === 2 && <ConfigureQuestionsStep data={wizardData} onUpdate={updateData} />}
            {currentStep === 3 && <ScheduleStep data={wizardData} onUpdate={updateData} />}
            {currentStep === 4 && <ReviewStep data={wizardData} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => navigate('/ai-interviews')} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Check className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
