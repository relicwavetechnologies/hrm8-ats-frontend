import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/shared/lib/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof passwordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const isTokenMissing = useMemo(() => token.trim().length === 0, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (isTokenMissing) {
      setError('Reset token is missing. Please use the link from your email.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);
    const response = await authService.resetPassword({ token, password: data.password });

    if (!response.success) {
      setError(response.error || 'Unable to reset password. Please request a new link.');
      setStatus('error');
      return;
    }

    reset();
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
          <CardTitle className="text-3xl font-bold tracking-tight">Set a new password</CardTitle>
          <CardDescription className="text-base">Choose a strong password to secure your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isTokenMissing ? (
            <Alert variant="destructive">
              <AlertTitle>Reset link invalid</AlertTitle>
              <AlertDescription>The reset link is missing or invalid. Please request a new password reset email.</AlertDescription>
            </Alert>
          ) : status === 'success' ? (
            <Alert className="bg-success/10 border-success/20 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>
                Your password has been changed. You can now{' '}
                <button type="button" onClick={() => navigate('/login')} className="underline font-semibold">
                  sign in
                </button>
                .
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  className="h-11"
                  {...register('password')}
                  disabled={status === 'loading'}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters and include uppercase, lowercase, and numeric characters.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="h-11"
                  {...register('confirmPassword')}
                  disabled={status === 'loading'}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full h-11 text-base" disabled={status === 'loading'}>
                {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {status === 'loading' ? 'Updating password...' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-sm text-center text-muted-foreground pt-4">
          <span>
            Need to try again?{' '}
            <Link to="/forgot-password" className="text-primary hover:underline font-medium">
              Request another link
            </Link>
          </span>
          <span>
            Back to{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              login
            </Link>
          </span>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}


