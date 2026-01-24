import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { authService } from '@/shared/lib/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Loader2, ShieldCheck } from 'lucide-react';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setStatus('loading');
    setError(null);
    const response = await authService.requestPasswordReset(data.email);

    if (!response.success) {
      setError(response.error || 'Something went wrong. Please try again.');
      setStatus('error');
      return;
    }

    setStatus('success');
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
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Forgot password</CardTitle>
          <CardDescription className="text-base">
            Enter the email associated with your account and we&apos;ll send you reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <Alert className="bg-success/10 border-success/20 text-success">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Check your inbox</AlertTitle>
              <AlertDescription>
                If an account exists for that email address, you&apos;ll receive a reset link shortly.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="h-11"
                  {...register('email')}
                  disabled={status === 'loading'}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full h-11 text-base" disabled={status === 'loading'}>
                {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {status === 'loading' ? 'Sending reset link...' : 'Send reset link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-sm text-center text-muted-foreground pt-4">
          <span>
            Remembered your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to login
            </Link>
          </span>
          <span>
            Need help?{' '}
            <a href="mailto:support@hrm8.com" className="text-primary hover:underline font-medium">
              Contact support
            </a>
          </span>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}


