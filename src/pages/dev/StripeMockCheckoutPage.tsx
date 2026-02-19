import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Loader2, CheckCircle2, AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { apiClient } from '@/shared/lib/api';

export default function StripeMockCheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get params from initial redirect URL
    const sessionId = searchParams.get('session_id');
    const amountTotal = parseInt(searchParams.get('amount') || '0', 10);
    const amountDollars = (amountTotal / 100).toFixed(2);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock form state
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [expiry, setExpiry] = useState('12/25');
    const [cvc, setCvc] = useState('123');
    const [name, setName] = useState('Mock Test User');

    useEffect(() => {
        if (!sessionId) {
            setError('Missing session_id');
        }
    }, [sessionId]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call backend to trigger success
            const response = await apiClient.post('/api/integrations/stripe/mock-payment-success', {
                sessionId,
                amount: amountTotal,
            });

            if (!response.success) {
                throw new Error(response.error || 'Payment simulation failed');
            }

            setSuccess(true);

            // Wait shortly then redirect
            setTimeout(() => {
                navigate('/subscriptions?subscription_success=true');
            }, 2000);

        } catch (err: any) {
            console.error('Payment failed', err);
            setError(err.message || 'Payment simulation failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md border-green-200 bg-green-50 dark:bg-green-900/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-fit">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-green-700 dark:text-green-400">Payment Successful!</CardTitle>
                        <CardDescription>
                            Your mock transaction was processed successfully.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            You will be redirected back to the application shortly...
                        </p>
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-green-600" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 font-sans">
            <div className="w-full max-w-md space-y-4">

                {/* Stripe-like Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 font-bold text-2xl text-slate-800 dark:text-slate-100">
                        <div className="bg-[#635BFF] text-white p-1.5 rounded">S</div>
                        <span>Stripe <span className="text-muted-foreground font-normal text-sm uppercase tracking-wider ml-1">Test Mode</span></span>
                    </div>
                </div>

                <Card className="border-t-4 border-t-[#635BFF] shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg text-gray-500 font-normal">Amount to pay</CardTitle>
                                <div className="text-3xl font-bold mt-1">${amountDollars}</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                <CreditCard className="h-6 w-6 text-gray-500" />
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            Simulating checkout for Session: <span className="font-mono text-xs">{sessionId?.substring(0, 16)}...</span>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-700 dark:text-amber-400 text-sm font-semibold">Test Mode</AlertTitle>
                            <AlertDescription className="text-amber-600 dark:text-amber-500 text-xs">
                                This is a mock payment page. No real money will be charged.
                            </AlertDescription>
                        </Alert>

                        <form onSubmit={handlePayment} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    defaultValue="mock_user@example.com"
                                    className="focus-visible:ring-[#635BFF]"
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="card">Card Information</Label>
                                    <div className="relative">
                                        <Input
                                            id="card"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            className="pl-10 font-mono focus-visible:ring-[#635BFF]"
                                        />
                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry</Label>
                                        <Input
                                            id="expiry"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            className="font-mono focus-visible:ring-[#635BFF]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input
                                            id="cvc"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            className="font-mono focus-visible:ring-[#635BFF]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name on card</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="focus-visible:ring-[#635BFF]"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 font-medium mt-2">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[#635BFF] hover:bg-[#5349E0] h-11 text-lg mt-4 shadow-md transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Pay ${amountDollars}
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-gray-50 dark:bg-gray-900/50 flex justify-center py-4 border-t">
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Powered by <strong>Stripe Mock</strong></span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
