/**
 * Verify Company Page
 * Handles email verification flow when user clicks verification link
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
// import { OnboardingWizardContent } from '@/pages/OnboardingWizard'; // TODO: Extract onboarding module

const PENDING_VERIFICATION_KEY = 'hrm8PendingVerification';

type VerificationState = 'verifying' | 'success' | 'error' | 'onboarding';

export default function VerifyCompany() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyCompany, isAuthenticated } = useAuth();
  const [state, setState] = useState<VerificationState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const lastVerificationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token')?.trim();
    const companyId = searchParams.get('companyId')?.trim();

    if (!token || !companyId) {
      setState('error');
      setErrorMessage('Invalid verification link. Missing token or company ID.');
      return;
    }

    const getPendingCredentials = (): { email: string; password: string } | null => {
      const sources = [
        sessionStorage.getItem(PENDING_VERIFICATION_KEY),
        localStorage.getItem(PENDING_VERIFICATION_KEY),
      ];

      for (const rawValue of sources) {
        if (!rawValue) continue;
        try {
          const parsed = JSON.parse(rawValue) as { email: string; password: string };
          if (parsed.email && parsed.password) {
            return parsed;
          }
        } catch {
          // Ignore malformed payloads
        }
      }

      return null;
    };

    const credentials = getPendingCredentials();

    // Perform verification
    const verificationKey = `${token}:${companyId}`;
    if (lastVerificationKeyRef.current === verificationKey) {
      return;
    }

    const performVerification = async () => {
      lastVerificationKeyRef.current = verificationKey;
      try {
        const result = await verifyCompany(
          token, 
          companyId, 
          credentials?.email, 
          credentials?.password
        );
        
        if (result.success) {
          // If needsPassword is false/undefined, it means a session was created automatically
          // or login succeeded. Show onboarding flow inline.
          if (result.needsPassword === false || result.needsPassword === undefined) {
            // Session was created automatically or login succeeded, show success then transition to onboarding
            setState('success');
            // Wait a moment to show success state, then transition to onboarding
            setTimeout(() => {
              setState('onboarding');
            }, 2000);
          } else {
            // No session created and no credentials, redirect to login with email
            setState('success');
            setTimeout(() => {
              navigate(`/login?email=${encodeURIComponent(result.email || '')}&verified=true`);
            }, 2000);
          }
        } else {
          setState('error');
          setErrorMessage(result.error || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        setState('error');
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'An error occurred during verification. Please try again.'
        );
      }
    };

    performVerification();
  }, [searchParams, verifyCompany, navigate]);

  // Show onboarding wizard inline after verification success
  if (state === 'onboarding') {
    // Wait for authentication to be ready
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  Preparing your onboarding...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // TODO: Show onboarding wizard after extraction
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verification Successful</CardTitle>
            <CardDescription>Your email has been verified.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/home')} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {state === 'verifying' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Verifying your company</CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your email address
              </CardDescription>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Company verified!</CardTitle>
              <CardDescription className="text-center">
                Your company has been verified successfully
              </CardDescription>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Verification failed</CardTitle>
              <CardDescription className="text-center">
                We couldn't verify your company
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {state === 'verifying' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This should only take a moment...
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Setting up your onboarding experience...
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive flex-1">{errorMessage}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The verification link has expired (links expire after 24 hours)</li>
                  <li>The link has already been used</li>
                  <li>The link is invalid or corrupted</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {state === 'error' && (
            <>
              <Button
                className="w-full"
                onClick={() => navigate('/register')}
              >
                Register again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Go to login
              </Button>
            </>
          )}
          {state === 'success' && (
            <div className="text-sm text-center text-muted-foreground">
              Redirecting you to complete onboarding...
            </div>
          )}
          {state !== 'error' && (
            <div className="text-sm text-center text-muted-foreground">
              Need help?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Contact support
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

