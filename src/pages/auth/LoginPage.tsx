/**
 * Login Page
 * User authentication page
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/app/providers/AuthContext';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { VerificationEmailCard } from '@/modules/auth/components/VerificationEmailCard';
import { authService } from '@/shared/lib/authService';
//@ts-expect-error
import logoLight from "@/assets/logo-light.png";
//@ts-expect-error
import logoDark from "@/assets/logo-dark.png";
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

const LAST_VERIFICATION_KEY = 'hrm8LastVerification';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);



  const pendingEmailParam = searchParams.get('pendingEmail');
  const verificationSuccess = searchParams.get('verified') === 'true';
  const verificationEmail = searchParams.get('email') || defaultEmail;

  useEffect(() => {
    if (defaultEmail) {
      setValue('email', defaultEmail);
    }
  }, [defaultEmail, setValue]);

  useEffect(() => {
    if (pendingEmailParam && !verificationSuccess) {
      setPendingVerificationEmail(pendingEmailParam);
      reset({ email: pendingEmailParam, password: '' });
    }
  }, [pendingEmailParam, reset, verificationSuccess]);

  useEffect(() => {
    if (verificationSuccess) {
      setPendingVerificationEmail(null);
    }
  }, [verificationSuccess]);

  const clearPendingVerification = useCallback(() => {
    setPendingVerificationEmail(null);
    const currentEmail = pendingVerificationEmail || defaultEmail || '';
    reset({ email: currentEmail, password: '' });

    if (pendingEmailParam) {
      const params = new URLSearchParams(searchParams);
      params.delete('pendingEmail');
      const nextSearch = params.toString();
      navigate(nextSearch ? `/login?${nextSearch}` : '/login', { replace: true });
    }
  }, [defaultEmail, navigate, pendingEmailParam, pendingVerificationEmail, reset, searchParams]);

  useEffect(() => {
    const processVerificationSignal = (rawValue: string | null) => {
      if (!rawValue) {
        return;
      }

      try {
        const payload = JSON.parse(rawValue) as { email?: string };
        if (!payload?.email) {
          return;
        }

        localStorage.removeItem(LAST_VERIFICATION_KEY);
        if (pendingVerificationEmail) {
          clearPendingVerification();
        } else {
          reset({ email: payload.email, password: '' });
        }

        const params = new URLSearchParams(searchParams);
        params.set('verified', 'true');
        params.set('email', payload.email);
        params.delete('pendingEmail');
        navigate(`/login?${params.toString()}`, { replace: true });
      } catch {
        // Ignore malformed payloads
      }
    };

    processVerificationSignal(localStorage.getItem(LAST_VERIFICATION_KEY));

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_VERIFICATION_KEY && event.newValue) {
        processVerificationSignal(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearPendingVerification, navigate, pendingVerificationEmail, reset, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    if (!result.success && result.pendingVerification) {
      setPendingVerificationEmail(result.pendingVerification.email);
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;
    const response = await authService.resendVerification(pendingVerificationEmail);
    if (!response.success) {
      throw new Error(response.error || 'Failed to resend verification email.');
    }
  };

  return (
    <AuthLayout>
      <div className="lg:hidden mb-8 flex justify-center">
        <Link to="/" className="inline-block">
          <img
            src={logoLight}
            alt="HRM8"
            className="h-8 dark:hidden"
            style={{
              filter:
                'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)',
            }}
          />
          <img
            src={logoDark}
            alt="HRM8"
            className="h-8 hidden dark:block opacity-100"
            style={{
              filter:
                'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)',
            }}
          />
        </Link>
      </div>

      {pendingVerificationEmail ? (
        <VerificationEmailCard
          email={pendingVerificationEmail}
          backLabel="Back to login"
          onBack={clearPendingVerification}
          onResend={handleResendVerification}
          autoResend
          watchVerification
          onVerified={(verifiedEmail) => {
            if (verifiedEmail) {
              reset({ email: verifiedEmail, password: '' });
            }
            clearPendingVerification();
            const params = new URLSearchParams(searchParams);
            params.set('verified', 'true');
            if (verifiedEmail) {
              params.set('email', verifiedEmail);
            } else {
              params.delete('email');
            }
            params.delete('pendingEmail');
            navigate(`/login?${params.toString()}`, { replace: true });
          }}
        />
      ) : (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-3 pb-6">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-base mt-2">Enter your credentials to access your account</CardDescription>
            </div>
            {verificationSuccess && (
              <Alert className="mt-4 bg-success/10 border-success/20 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">Company verified</AlertTitle>
                <AlertDescription className="text-sm">
                  {verificationEmail
                    ? `Great! You can now sign in as ${verificationEmail}.`
                    : 'Great! You can now sign in with your company credentials.'}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="h-11"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-sm text-center text-muted-foreground space-y-2">
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register your company
                </Link>
              </div>
              <div>
                Employee?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Request access
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </AuthLayout>
  );
}



