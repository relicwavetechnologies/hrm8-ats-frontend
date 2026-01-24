/**
 * Register Page
 * Company registration page
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Loader2, Search, Eye, EyeOff, Building2, Globe, Users } from 'lucide-react';
import { VerificationEmailCard } from '@/modules/auth/components/VerificationEmailCard';
import { authService } from '@/shared/lib/authService';
//@ts-expect-error
import logoLight from "@/assets/logo-light.png";
//@ts-expect-error
import logoDark from "@/assets/logo-dark.png";
import countries from 'world-countries';

const LAST_VERIFICATION_KEY = 'hrm8LastVerification';

// Sort countries alphabetically by name
const sortedCountries = countries
  .map((country) => ({
    name: country.name.common,
    code: country.cca2,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));


const registerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyWebsite: z.string().url('Invalid website URL'),
  adminFirstName: z.string().min(2, 'First name must be at least 2 characters'),
  adminLastName: z.string().min(2, 'Last name must be at least 2 characters'),
  adminEmail: z.string().email('Invalid business email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  countryOrRegion: z.string().min(2, 'Country or region is required'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms & Conditions and Privacy Policy',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { registerCompany, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const handleExternalVerification = useCallback(
    (verifiedEmail?: string) => {
      if (!verifiedEmail) {
        return;
      }

      setEmailSent(false);
      setSentToEmail(verifiedEmail);
      reset();
      navigate(
        `/login?verified=true&email=${encodeURIComponent(verifiedEmail)}`,
        { replace: true }
      );
    },
    [navigate, reset]
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);



  useEffect(() => {
    const verified = searchParams.get('verified') === 'true';
    const verifiedEmail = searchParams.get('email');

    if (verified) {
      setEmailSent(false);
      if (verifiedEmail) {
        reset({
          companyName: '',
          companyWebsite: '',
          adminEmail: verifiedEmail,
          adminFirstName: '',
          adminLastName: '',
          countryOrRegion: '',
          password: '',
          acceptTerms: false,
        });
      } else {
        reset();
      }
    }
  }, [searchParams, reset]);

  useEffect(() => {
    const processLastVerification = (rawValue: string | null) => {
      if (!rawValue) {
        return;
      }

      try {
        const payload = JSON.parse(rawValue) as { email?: string };
        if (payload?.email) {
          handleExternalVerification(payload.email);
          localStorage.removeItem(LAST_VERIFICATION_KEY);
        }
      } catch {
        // Ignore malformed payloads
      }
    };

    processLastVerification(localStorage.getItem(LAST_VERIFICATION_KEY));

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_VERIFICATION_KEY && event.newValue) {
        processLastVerification(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [handleExternalVerification]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render register form if authenticated
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const result = await registerCompany(data as any);
    setIsLoading(false);

    if (result.success) {
      if (result.verificationRequired) {
        // Show email sent confirmation
        setEmailSent(true);
        setSentToEmail(result.email || data.adminEmail);
      } else {
        // Auto-verified, navigate to home
        navigate('/home');
      }
    }
  };

  // Show email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 space-y-4">
        <div className="w-full max-w-md">
          <VerificationEmailCard
            email={sentToEmail}
            backLabel="Back to registration"
            onBack={() => {
              setEmailSent(false);
              reset();
              navigate('/register', { replace: true });
            }}
            watchVerification
            onVerified={(verifiedEmail) => {
              handleExternalVerification(verifiedEmail);
            }}
            onResend={async () => {
              const response = await authService.resendVerification(sentToEmail);
              if (!response.success) {
                throw new Error(response.error || 'Failed to resend verification email.');
              }
            }}
          />
          <div className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link
              to={`/login?pendingEmail=${encodeURIComponent(sentToEmail)}`}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link to="/" className="inline-block mb-12">
              <img
                src={logoLight}
                alt="HRM8"
                className="h-10 dark:hidden"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <img
                src={logoDark}
                alt="HRM8"
                className="h-10 hidden dark:block"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Start your HR journey</h1>
                <p className="text-lg text-white/90">
                  Join thousands of companies managing their talent with HRM8
                </p>
              </div>
              <div className="space-y-4 pt-8">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Complete HR Suite</p>
                    <p className="text-sm text-white/80">Recruitment, onboarding, and management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Global Reach</p>
                    <p className="text-sm text-white/80">Built for companies worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Team Collaboration</p>
                    <p className="text-sm text-white/80">Seamless workflows and integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-white/80">
            <p>© {new Date().getFullYear()} HRM8. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-xl py-4">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" className="inline-block">
              <img
                src={logoLight}
                alt="HRM8"
                className="h-8 dark:hidden"
                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)' }}
              />
              <img
                src={logoDark}
                alt="HRM8"
                className="h-8 hidden dark:block opacity-100"
                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)' }}
              />
            </Link>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="space-y-2 pb-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Register your company</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Create a new company account to get started
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Inc."
                    className="h-10"
                    {...register('companyName')}
                    disabled={isLoading}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite" className="text-sm font-medium">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://www.example.com"
                    className="h-10"
                    {...register('companyWebsite')}
                    disabled={isLoading}
                  />
                  {errors.companyWebsite && (
                    <p className="text-sm text-destructive">{errors.companyWebsite.message}</p>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName" className="text-sm font-medium">Admin First Name</Label>
                    <Input
                      id="adminFirstName"
                      placeholder="John"
                      className="h-10"
                      {...register('adminFirstName')}
                      disabled={isLoading}
                    />
                    {errors.adminFirstName && (
                      <p className="text-sm text-destructive">{errors.adminFirstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminLastName" className="text-sm font-medium">Admin Last Name</Label>
                    <Input
                      id="adminLastName"
                      placeholder="Doe"
                      className="h-10"
                      {...register('adminLastName')}
                      disabled={isLoading}
                    />
                    {errors.adminLastName && (
                      <p className="text-sm text-destructive">{errors.adminLastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-sm font-medium">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    className="h-10"
                    {...register('adminEmail')}
                    disabled={isLoading}
                  />
                  {errors.adminEmail && (
                    <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        disabled={isLoading}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryOrRegion" className="text-sm font-medium">Country / Region</Label>
                    <Controller
                      control={control}
                      name="countryOrRegion"
                      render={({ field }) => {
                        const filteredCountries = countrySearch
                          ? sortedCountries.filter((country) =>
                            country.name.toLowerCase().includes(countrySearch.toLowerCase())
                          )
                          : sortedCountries;

                        return (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setCountrySearch('');
                            }}
                            onOpenChange={(open) => {
                              if (!open) {
                                setCountrySearch('');
                              }
                            }}
                            value={field.value || undefined}
                            disabled={isLoading}
                          >
                            <SelectTrigger id="countryOrRegion" className="h-10">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <div className="sticky top-0 z-10 bg-popover p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search countries..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="pl-8 h-9"
                                  />
                                </div>
                              </div>
                              <div className="max-h-[250px] overflow-y-auto">
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((country) => (
                                    <SelectItem key={country.code} value={country.name}>
                                      {country.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    No countries found
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                    {errors.countryOrRegion && (
                      <p className="text-sm text-destructive">{errors.countryOrRegion.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-md border p-3">
                  <Controller
                    control={control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <Checkbox
                        id="register-acceptTerms"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        disabled={isLoading}
                      />
                    )}
                  />
                  <div className="space-y-1 text-sm">
                    <Label htmlFor="register-acceptTerms" className="text-sm font-medium leading-none">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        Privacy Policy
                      </a>
                    </Label>
                    {errors.acceptTerms && (
                      <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 text-base" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-4">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

