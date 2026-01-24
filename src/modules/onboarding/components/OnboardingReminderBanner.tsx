import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/shared/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const ONBOARDING_SKIP_KEY = 'hrm8OnboardingSkipUntil';

const isOnboardingSnoozed = (): boolean => {
  const skipUntilRaw = localStorage.getItem(ONBOARDING_SKIP_KEY);
  if (!skipUntilRaw) {
    return false;
  }
  const skipUntil = new Date(skipUntilRaw).getTime();
  if (Number.isNaN(skipUntil) || skipUntil < Date.now()) {
    localStorage.removeItem(ONBOARDING_SKIP_KEY);
    return false;
  }
  return true;
};

export function OnboardingReminderBanner() {
  const { profileSummary, snoozeOnboardingReminder } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSnoozed, setIsSnoozed] = useState(() => isOnboardingSnoozed());

  // Check snooze status periodically and on storage changes
  useEffect(() => {
    const checkSnooze = () => {
      setIsSnoozed(isOnboardingSnoozed());
    };
    
    checkSnooze();
    const interval = setInterval(checkSnooze, 60000); // Check every minute
    
    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ONBOARDING_SKIP_KEY) {
        checkSnooze();
      }
    };
    
    // Check when window regains focus (user returns to tab)
    const handleFocus = () => {
      checkSnooze();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (!profileSummary || profileSummary.status === 'COMPLETED' || isSnoozed) {
    return null;
  }

  const handleRemindLater = () => {
    snoozeOnboardingReminder();
    setIsSnoozed(true);
    toast({
      title: 'We will remind you again soon',
      description: 'Onboarding reminders are snoozed for 12 hours.',
    });
  };

  const handleContinue = () => {
    if (location.pathname !== '/company-profile') {
      navigate('/company-profile');
    }
  };

  return (
    <Card className={cn(
      "relative shadow-sm",
      "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border border-border/50",
      "p-4 mt-4 mb-4 mx-4 rounded-lg"
    )}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={cn(
            "rounded-full flex items-center justify-center w-10 h-10 flex-none",
            "bg-warning/10 text-warning"
          )}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">Complete your company profile</h3>
            <div className="text-sm text-muted-foreground leading-5">
              Finish onboarding to unlock job posting, billing, and branding features. You are{' '}
              <Badge 
                variant="outline" 
                className="h-6 px-2 text-xs inline-flex items-center rounded-full bg-warning/10 text-warning border-warning/20"
              >
                {profileSummary.completionPercentage}% done
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            size="sm" 
            onClick={handleContinue}
            className="whitespace-nowrap"
          >
            Continue setup
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemindLater}
            className="whitespace-nowrap"
          >
            Remind me later
          </Button>
        </div>
      </div>
    </Card>
  );
}


