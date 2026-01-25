import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { SUBSCRIPTION_TIERS, type SubscriptionTier, HRMS_ADDON } from "@/lib/subscriptionConfig";
import { calculateMonthlyCost } from "@/lib/moduleAccessControl";
import { Check, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface SubscriptionUpgradeWizardProps {
  open: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier, hrmsEnabled: boolean, hrmsEmployeeCount: number, addons: string[]) => void;
}

export function SubscriptionUpgradeWizard({
  open,
  onClose,
  currentTier,
  onUpgrade
}: SubscriptionUpgradeWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(currentTier);
  const [hrmsEnabled, setHrmsEnabled] = useState(false);
  const [hrmsEmployeeCount, setHrmsEmployeeCount] = useState(50);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const availableTiers: SubscriptionTier[] = ['small', 'medium', 'large', 'enterprise'];
  
  const addons = [
    { id: 'assessments', name: 'Skills Assessments', price: 99 },
    { id: 'reference-checking', name: 'Reference Checking', price: 79 },
    { id: 'video-interviewing', name: 'Video Interviewing', price: 149 }
  ];

  const calculateTotal = () => {
    let total = calculateMonthlyCost(selectedTier, {
      atsEnabled: true,
      hrmsEnabled,
      hrmsEmployeeCount: hrmsEnabled ? hrmsEmployeeCount : undefined,
      enabledAddons: selectedAddons
    });
    
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    
    return total;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    onUpgrade(selectedTier, hrmsEnabled, hrmsEmployeeCount, selectedAddons);
    toast({
      title: "Subscription Updated!",
      description: `Successfully upgraded to ${SUBSCRIPTION_TIERS[selectedTier].name}`,
    });
    onClose();
    setStep(1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-sm text-muted-foreground">Select the subscription tier that fits your needs</p>
            </div>
            <RadioGroup value={selectedTier} onValueChange={(value) => setSelectedTier(value as SubscriptionTier)}>
              {availableTiers.map(tier => {
                const tierConfig = SUBSCRIPTION_TIERS[tier];
                return (
                  <div key={tier} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={tier} id={tier} />
                    <Label htmlFor={tier} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{tierConfig.name}</p>
                          <p className="text-sm text-muted-foreground">{tierConfig.maxOpenJobs} open jobs</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${tierConfig.monthlyFee}</p>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Add HRMS Module</h3>
              <p className="text-sm text-muted-foreground">Manage employees with our HR Management System</p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="hrms"
                    checked={hrmsEnabled}
                    onCheckedChange={(checked) => setHrmsEnabled(checked as boolean)}
                  />
                  <Label htmlFor="hrms" className="cursor-pointer">
                    <p className="font-semibold">Enable HRMS</p>
                    <p className="text-sm text-muted-foreground">${HRMS_ADDON.pricePerEmployee}/employee/month</p>
                  </Label>
                </div>
                {hrmsEnabled && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              
              {hrmsEnabled && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="employee-count">Number of Employees</Label>
                  <Input
                    id="employee-count"
                    type="number"
                    min={HRMS_ADDON.minimumEmployees}
                    step={HRMS_ADDON.minimumEmployees}
                    value={hrmsEmployeeCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const rounded = Math.max(HRMS_ADDON.minimumEmployees, Math.ceil(value / HRMS_ADDON.minimumEmployees) * HRMS_ADDON.minimumEmployees);
                      setHrmsEmployeeCount(rounded);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum {HRMS_ADDON.minimumEmployees} employees, billed in increments of {HRMS_ADDON.minimumEmployees}
                  </p>
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <p className="text-sm font-semibold">HRMS Cost: ${hrmsEmployeeCount * HRMS_ADDON.pricePerEmployee}/month</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Add-on Services</h3>
              <p className="text-sm text-muted-foreground">Enhance your platform with premium features</p>
            </div>
            
            <div className="space-y-3">
              {addons.map(addon => (
                <div key={addon.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddons([...selectedAddons, addon.id]);
                          } else {
                            setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                          }
                        }}
                      />
                      <Label htmlFor={addon.id} className="cursor-pointer">
                        <p className="font-semibold">{addon.name}</p>
                        <p className="text-sm text-muted-foreground">${addon.price}/month</p>
                      </Label>
                    </div>
                    {selectedAddons.includes(addon.id) && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        const total = calculateTotal();
        const selectedTierConfig = SUBSCRIPTION_TIERS[selectedTier];
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Review Your Selection</h3>
              <p className="text-sm text-muted-foreground">Confirm your upgrade details</p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Subscription Plan</span>
                <span className="font-semibold">{selectedTierConfig.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Base Cost</span>
                <span>${selectedTierConfig.monthlyFee}/month</span>
              </div>
              
              {hrmsEnabled && (
                <>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm">HRMS Module</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{hrmsEmployeeCount} employees</span>
                      <span className="text-sm">${hrmsEmployeeCount * HRMS_ADDON.pricePerEmployee}/month</span>
                    </div>
                  </div>
                </>
              )}
              
              {selectedAddons.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-sm font-semibold mb-2">Add-ons</p>
                  {selectedAddons.map(addonId => {
                    const addon = addons.find(a => a.id === addonId);
                    return addon ? (
                      <div key={addonId} className="flex justify-between text-sm">
                        <span>{addon.name}</span>
                        <span>${addon.price}/month</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total}/month</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upgrade Subscription</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? onClose : handleBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <Check className="h-4 w-4 mr-2" />
              Complete Upgrade
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
