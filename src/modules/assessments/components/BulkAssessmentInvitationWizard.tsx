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
import { Clock, DollarSign, ArrowLeft, ArrowRight, Users } from 'lucide-react';
import type { AssessmentType, AssessmentProvider } from '@/shared/types/assessment';
import { saveAssessment } from '@/shared/lib/mockAssessmentStorage';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/shared/hooks/use-toast';
import { addDays } from 'date-fns';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { z } from 'zod';

// Validation schemas
const candidateSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
});

const assessmentSettingsSchema = z.object({
  passThreshold: z.number().min(0).max(100),
  expiryDays: z.number().min(1).max(30),
  customInstructions: z.string().max(1000),
});

interface BulkCandidate {
  id: string;
  name: string;
  email: string;
}

interface BulkAssessmentInvitationWizardProps {
  open: boolean;
  onClose: () => void;
  candidates: BulkCandidate[];
  onComplete?: () => void;
}

export function BulkAssessmentInvitationWizard({
  open,
  onClose,
  candidates,
  onComplete,
}: BulkAssessmentInvitationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<AssessmentType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AssessmentProvider>('testgorilla');
  const [passThreshold, setPassThreshold] = useState(70);
  const [expiryDays, setExpiryDays] = useState(7);
  const [customInstructions, setCustomInstructions] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const toggleType = (type: AssessmentType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const validateSettings = () => {
    try {
      assessmentSettingsSchema.parse({
        passThreshold,
        expiryDays,
        customInstructions,
      });
      setValidationErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(error.errors.map(e => e.message));
      }
      return false;
    }
  };

  const validateCandidates = () => {
    const errors: string[] = [];
    candidates.forEach((candidate, idx) => {
      try {
        candidateSchema.parse(candidate);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Candidate ${idx + 1}: ${error.errors[0].message}`);
        }
      }
    });
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors([]);
    return true;
  };

  const handleComplete = () => {
    if (!validateCandidates() || !validateSettings()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding",
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
    let createdCount = 0;

    candidates.forEach(candidate => {
      selectedTypes.forEach(type => {
        const assessment = {
          id: uuidv4(),
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
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
        createdCount++;
      });
    });

    toast({
      title: "Assessment Invitations Created",
      description: `${createdCount} assessment invitation${createdCount > 1 ? 's' : ''} created for ${candidates.length} candidate${candidates.length > 1 ? 's' : ''}`,
    });

    onComplete?.();
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedTypes([]);
    setSelectedProvider('testgorilla');
    setPassThreshold(70);
    setExpiryDays(7);
    setCustomInstructions('');
    setValidationErrors([]);
    onClose();
  };

  const stepTitles = [
    'Review Candidates',
    'Choose Assessment Types',
    'Configure Settings',
    'Review & Send'
  ];

  const canProceed = () => {
    if (currentStep === 0) return candidates.length > 0 && validateCandidates();
    if (currentStep === 1) return selectedTypes.length > 0;
    if (currentStep === 2) return validateSettings();
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

  const totalCost = calculateTotalCost(selectedTypes) * candidates.length;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Selected Candidates ({candidates.length})</h3>
            </div>
            
            {validationErrors.length > 0 && (
              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-destructive mb-2">Validation Errors:</p>
                  <ul className="text-sm text-destructive space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {candidates.map((candidate, idx) => (
                <Card key={candidate.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                    <Badge variant="outline">{idx + 1}</Badge>
                  </CardContent>
                </Card>
              ))}
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium transition-colors duration-500">Cost per candidate:</span>
                      <span className="font-bold transition-colors duration-500">
                        ${calculateTotalCost(selectedTypes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium transition-colors duration-500">Number of candidates:</span>
                      <span className="font-bold transition-colors duration-500">
                        {candidates.length}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between">
                      <span className="font-semibold transition-colors duration-500">Total Cost:</span>
                      <span className="text-xl font-bold transition-colors duration-500">
                        ${totalCost}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {validationErrors.length > 0 && (
              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-destructive mb-2">Validation Errors:</p>
                  <ul className="text-sm text-destructive space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

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
              <p className="text-xs text-muted-foreground mt-1">Must be between 0-100</p>
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
              <p className="text-xs text-muted-foreground mt-1">Must be between 1-30 days</p>
            </div>

            <div>
              <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add any special instructions for the candidates..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customInstructions.length}/1000 characters
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card className="transition-[background,border-color,box-shadow,color] duration-500">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Candidates</p>
                  <p className="text-sm text-muted-foreground transition-colors duration-500">
                    {candidates.length} candidate{candidates.length > 1 ? 's' : ''} selected
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Selected Assessments</p>
                  <ul className="text-sm text-muted-foreground space-y-1 transition-colors duration-500">
                    {selectedTypes.map(type => (
                      <li key={type} className="flex justify-between">
                        <span className="capitalize">{ASSESSMENT_PRICING[type].name}</span>
                        <span>${ASSESSMENT_PRICING[type].cost} × {candidates.length}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium transition-colors duration-500">
                    <span>Total Cost</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {totalCost}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTypes.length} assessment{selectedTypes.length > 1 ? 's' : ''} × {candidates.length} candidate{candidates.length > 1 ? 's' : ''}
                  </p>
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
                By clicking "Send Invitations", assessment invitations will be sent to all {candidates.length} candidate{candidates.length > 1 ? 's' : ''} via email.
                Each candidate will have {expiryDays} days to complete the assessments.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Assessment Invitation</DialogTitle>
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
            onClick={currentStep === 0 ? handleClose : handleBack}
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
            {currentStep === stepTitles.length - 1 ? 'Send Invitations' : (
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
