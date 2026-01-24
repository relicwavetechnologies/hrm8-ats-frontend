import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useState } from 'react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ASSESSMENT_PRICING, calculateTotalCost } from '@/shared/lib/assessments/pricingConstants';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Clock, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';
import type { AssessmentType, AssessmentProvider } from '@/shared/types/assessment';
import { saveAssessment } from '@/shared/lib/mockAssessmentStorage';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/shared/hooks/use-toast';
import { addDays } from 'date-fns';
import { Progress } from '@/shared/components/ui/progress';

interface AssessmentInvitationWizardProps {
  open: boolean;
  onClose: () => void;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  onComplete?: () => void;
}

export function AssessmentInvitationWizard({
  open,
  onClose,
  candidateId,
  candidateName: prefilledName,
  candidateEmail: prefilledEmail,
  onComplete,
}: AssessmentInvitationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<AssessmentType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AssessmentProvider>('testgorilla');
  const [passThreshold, setPassThreshold] = useState(70);
  const [expiryDays, setExpiryDays] = useState(7);
  const [customInstructions, setCustomInstructions] = useState('');
  const [candidateName, setCandidateName] = useState(prefilledName || '');
  const [candidateEmail, setCandidateEmail] = useState(prefilledEmail || '');

  const toggleType = (type: AssessmentType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleComplete = () => {
    if (!candidateName || !candidateEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide candidate name and email",
        variant: "destructive",
      });
      return;
    }

    if (selectedTypes.length === 0) {
      toast({
        title: "No Assessment Selected",
        description: "Please select at least one assessment type",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const expiryDate = addDays(now, expiryDays);

    selectedTypes.forEach(type => {
      const assessment = {
        id: uuidv4(),
        candidateId: candidateId || uuidv4(),
        candidateName,
        candidateEmail,
        assessmentType: type,
        provider: selectedProvider,
        status: 'pending-invitation' as const,
        invitedBy: 'user-1',
        invitedByName: 'Current User',
        invitedDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        passThreshold,
        remindersSent: 0,
        cost: ASSESSMENT_PRICING[type].cost,
        paymentStatus: 'pending' as const,
        invitationToken: uuidv4(),
        notes: customInstructions,
        country: 'United States',
        region: 'North America',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      saveAssessment(assessment);
    });

    toast({
      title: "Assessment Invitations Created",
      description: `${selectedTypes.length} assessment${selectedTypes.length > 1 ? 's' : ''} ready to send to ${candidateName}`,
    });

    onComplete?.();
    onClose();
  };

  const stepTitles = [
    'Select Candidate',
    'Choose Assessment Types',
    'Configure Settings',
    'Review & Send'
  ];

  const canProceed = () => {
    if (currentStep === 0) return candidateName && candidateEmail;
    if (currentStep === 1) return selectedTypes.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < stepTitles.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate name"
                disabled={!!prefilledName}
              />
            </div>
            <div>
              <Label htmlFor="candidateEmail">Candidate Email</Label>
              <Input
                id="candidateEmail"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="Enter candidate email"
                disabled={!!prefilledEmail}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {Object.values(ASSESSMENT_PRICING).map((assessment) => {
                const Icon = assessment.icon;
                return (
                  <Card
                    key={assessment.type}
                    className={`cursor-pointer transition-all ${
                      selectedTypes.includes(assessment.type)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleType(assessment.type)}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <Checkbox
                        checked={selectedTypes.includes(assessment.type)}
                        onCheckedChange={() => toggleType(assessment.type)}
                      />
                      <Icon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium transition-colors duration-500">{assessment.name}</h4>
                          <span className="text-sm font-medium transition-colors duration-500">${assessment.cost}</span>
                        </div>
                        <p className="text-sm text-muted-foreground transition-colors duration-500">
                          {assessment.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground transition-colors duration-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assessment.duration} min
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {selectedTypes.length > 0 && (
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium transition-colors duration-500">Total Cost:</span>
                    <span className="text-xl font-bold transition-colors duration-500">
                      ${calculateTotalCost(selectedTypes)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as AssessmentProvider)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testgorilla">TestGorilla</SelectItem>
                  <SelectItem value="vervoe">Vervoe</SelectItem>
                  <SelectItem value="criteria">Criteria Corp</SelectItem>
                  <SelectItem value="harver">Harver</SelectItem>
                  <SelectItem value="shl">SHL</SelectItem>
                  <SelectItem value="codility">Codility</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="passThreshold">Pass Threshold (%)</Label>
              <Input
                id="passThreshold"
                type="number"
                min="0"
                max="100"
                value={passThreshold}
                onChange={(e) => setPassThreshold(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="expiryDays">Expiry (days)</Label>
              <Input
                id="expiryDays"
                type="number"
                min="1"
                max="30"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add any special instructions for the candidate..."
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card className="transition-[background,border-color,box-shadow,color] duration-500">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Candidate</p>
                  <p className="text-sm text-muted-foreground transition-colors duration-500">
                    {candidateName} ({candidateEmail})
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Selected Assessments</p>
                  <ul className="text-sm text-muted-foreground space-y-1 transition-colors duration-500">
                    {selectedTypes.map(type => (
                      <li key={type} className="flex justify-between">
                        <span className="capitalize">{ASSESSMENT_PRICING[type].name}</span>
                        <span>${ASSESSMENT_PRICING[type].cost}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium transition-colors duration-500">
                    <span>Total Cost</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {calculateTotalCost(selectedTypes)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Settings</p>
                  <p className="text-sm text-muted-foreground transition-colors duration-500">
                    Provider: {selectedProvider} • Pass Threshold: {passThreshold}% • Expires in {expiryDays} days
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border bg-muted p-4 transition-[background,border-color,box-shadow,color] duration-500">
              <p className="text-sm text-muted-foreground transition-colors duration-500">
                By clicking "Send Invitation", assessment invitations will be sent to the candidate via email.
                The candidate will have {expiryDays} days to complete the assessments.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Candidate to Assessment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium transition-colors duration-500">
                Step {currentStep + 1} of {stepTitles.length}: {stepTitles[currentStep]}
              </span>
              <span className="text-muted-foreground transition-colors duration-500">
                {Math.round(((currentStep + 1) / stepTitles.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentStep + 1) / stepTitles.length) * 100} />
          </div>

          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handleBack}
          >
            {currentStep === 0 ? 'Cancel' : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </>
            )}
          </Button>
          <Button
            onClick={currentStep === stepTitles.length - 1 ? handleComplete : handleNext}
            disabled={!canProceed()}
          >
            {currentStep === stepTitles.length - 1 ? 'Send Invitation' : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
