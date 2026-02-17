/**
 * Signup Page
 * Employee signup / request access page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Loader2, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

const signupSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    businessEmail: z.string().email('Invalid business email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: 'You must accept the Terms & Conditions and Privacy Policy',
    }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { employeeSignup } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            acceptTerms: false,
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        // Extrapolate domain from email
        const companyDomain = data.businessEmail.split('@')[1];
        const result = await employeeSignup({
            firstName: data.firstName,
            lastName: data.lastName,
            businessEmail: data.businessEmail,
            password: data.password,
            acceptTerms: data.acceptTerms,
            companyDomain
        });
        setIsLoading(false);

        if (result.success) {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout>
                <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <CardTitle className="text-3xl font-bold">Request Submitted</CardTitle>
                        <CardDescription className="text-lg">
                            Your request for access has been successfully submitted to your company administrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-muted-foreground">
                            We've sent a notification to your company admin. You'll receive an email once your access has been approved.
                        </p>
                        <Button onClick={() => navigate('/login')} className="w-full h-11">
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
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
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">Request Access</CardTitle>
                    </div>
                    <CardDescription className="text-base mt-2">
                        Are you an employee? Request access to join your company on HRM8.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    className="h-11"
                                    {...register('firstName')}
                                    disabled={isLoading}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    className="h-11"
                                    {...register('lastName')}
                                    disabled={isLoading}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="businessEmail" className="text-sm font-medium">Business Email</Label>
                            <Input
                                id="businessEmail"
                                type="email"
                                placeholder="john.doe@company.com"
                                className="h-11"
                                {...register('businessEmail')}
                                disabled={isLoading}
                            />
                            {errors.businessEmail && (
                                <p className="text-sm text-destructive">{errors.businessEmail.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                We'll use your email domain to identify your company.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                    disabled={isLoading}
                                    className="h-11 pr-10"
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
                        <div className="flex items-start space-x-3 rounded-md border p-4 bg-muted/30">
                            <Controller
                                control={control}
                                name="acceptTerms"
                                render={({ field }) => (
                                    <Checkbox
                                        id="acceptTerms"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                    />
                                )}
                            />
                            <div className="space-y-1 text-sm leading-tight">
                                <Label htmlFor="acceptTerms" className="text-sm font-medium">
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
                        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Sending Request...' : 'Request Access'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have access?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                    <div className="text-xs text-center text-muted-foreground px-4">
                        Not an employee? <Link to="/register" className="text-primary hover:underline font-medium">Register your company</Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}
