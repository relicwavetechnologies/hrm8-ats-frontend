import { useState, useEffect } from 'react';
import { signupRequestService, SignupRequest } from '@/shared/lib/signupRequestService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { Check, X, Clock, Mail, User } from 'lucide-react';
import { format } from 'date-fns';

export function SignupRequestsList() {
    const [requests, setRequests] = useState<SignupRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await signupRequestService.getPendingSignupRequests();
            if (response.success && response.data) {
                setRequests(response.data);
            } else {
                throw new Error(response.error || 'Failed to fetch requests');
            }
        } catch (error) {
            console.error('Failed to fetch signup requests:', error);
            toast({
                title: 'Error',
                description: 'Failed to load signup requests',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const response = await signupRequestService.approveSignupRequest(id);
            if (response.success) {
                toast({
                    title: 'Approved',
                    description: 'Employee access request has been approved.',
                });
                fetchRequests();
            } else {
                throw new Error(response.error || 'Failed to approve request');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to approve request',
                variant: 'destructive',
            });
        }
    };

    const handleReject = async (id: string) => {
        try {
            const response = await signupRequestService.rejectSignupRequest(id);
            if (response.success) {
                toast({
                    title: 'Rejected',
                    description: 'Employee access request has been rejected.',
                });
                fetchRequests();
            } else {
                throw new Error(response.error || 'Failed to reject request');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to reject request',
                variant: 'destructive',
            });
        }
    };

    const formatDate = (dateValue: any) => {
        try {
            if (!dateValue) return 'N/A';
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, 'PPP p');
        } catch (error) {
            return 'N/A';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No pending requests</h3>
                <p className="text-muted-foreground">All employee access requests have been cleared.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request: any) => (
                <Card key={request.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="font-semibold flex items-center gap-2">
                                    {request.name}
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4">
                                        {request.status || 'Pending'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    {request.email}
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    Requested on {formatDate(request.createdAt || request.created_at)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(request.id)}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 sm:flex-none"
                                onClick={() => handleApprove(request.id)}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
