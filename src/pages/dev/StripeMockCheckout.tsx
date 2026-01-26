/**
 * Mock Stripe Checkout Page
 * Simulates Stripe payment flow for development
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';

export default function StripeMockCheckout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const sessionId = searchParams.get('session_id');
    const amount = searchParams.get('amount');
    const amountDollars = amount ? (parseInt(amount) / 100).toFixed(2) : '0.00';

    const handlePayment = async () => {
        setProcessing(true);

        try {
            // Call backend to process payment and credit wallet
            const response = await fetch('/api/integrations/stripe/mock-payment-success', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    sessionId,
                    amount: parseInt(amount || '0'),
                }),
            });

            if (!response.ok) {
                throw new Error('Payment processing failed');
            }

            setProcessing(false);
            setCompleted(true);

            // Redirect back to subscriptions page after 2 seconds
            setTimeout(() => {
                navigate('/subscriptions?success=true');
            }, 2000);
        } catch (error) {
            console.error('Mock payment error:', error);
            setProcessing(false);
            navigate('/subscriptions?canceled=true');
        }
    };

    const handleCancel = () => {
        navigate('/subscriptions?canceled=true');
    };

    if (completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-gray-900">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                        <CardDescription>
                            Your payment of ${amountDollars} has been processed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            Redirecting you back...
                        </p>
                        <div className="flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-sm font-medium text-muted-foreground">Mock Stripe Checkout</span>
                    </div>
                    <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
                    <CardDescription>
                        This is a simulated payment page for development
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Amount Display */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            ${amountDollars}
                        </p>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Session ID</span>
                            <span className="font-mono text-xs">{sessionId?.substring(0, 20)}...</span>
                        </div>
                    </div>

                    {/* Mock Card Details */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Mock Card</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">•••• •••• •••• 4242</span>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <span className="text-muted-foreground">Exp: 12/34</span>
                                <span className="text-muted-foreground">CVC: •••</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full"
                            size="lg"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Pay ${amountDollars}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            disabled={processing}
                            variant="outline"
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Dev Notice */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            🔧 Development Mode - No real payment will be processed
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
