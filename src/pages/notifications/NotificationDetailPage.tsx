import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { CandidatePageLayout } from '@/app/layouts/CandidatePageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import {
    Bell,
    ArrowLeft,
    Calendar,
    Briefcase,
    Mail,
    Clock,
    ExternalLink,
    AlertCircle,
    Info,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/app/providers/AuthContext';
import { useCandidateAuth } from '@/app/providers/AuthContext' // TODO: Remove candidate auth;

// Icon mapping for notification types
const TYPE_ICONS: Record<string, React.ElementType> = {
    NEW_APPLICATION: Mail,
    APPLICATION_STATUS_CHANGED: Briefcase,
    INTERVIEW_SCHEDULED: Calendar,
    JOB_ASSIGNED: Bell,
    SUBSCRIPTION_PURCHASED: Info,
    SYSTEM_ANNOUNCEMENT: Bell,
    JOB_CREATED: Briefcase,
    default: Bell,
};

// Color mapping for notification types
const TYPE_COLORS: Record<string, string> = {
    NEW_APPLICATION: 'text-blue-500 bg-blue-500/10',
    APPLICATION_STATUS_CHANGED: 'text-purple-500 bg-purple-500/10',
    INTERVIEW_SCHEDULED: 'text-green-500 bg-green-500/10',
    JOB_ASSIGNED: 'text-orange-500 bg-orange-500/10',
    SUBSCRIPTION_PURCHASED: 'text-yellow-500 bg-yellow-500/10',
    SYSTEM_ANNOUNCEMENT: 'text-gray-500 bg-gray-500/10',
    JOB_CREATED: 'text-blue-500 bg-blue-500/10',
    default: 'text-primary bg-primary/10',
};

export default function NotificationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [notification, setNotification] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated: isAuth } = useAuth();
    const { isAuthenticated: isCandidateAuth } = useCandidateAuth();

    // Determine layout based on current path
    const isCandidatePath = location.pathname.startsWith('/candidate');
    const Layout = isCandidatePath ? CandidatePageLayout : DashboardPageLayout;

    useEffect(() => {
        if (id) {
            fetchNotification();
        }
    }, [id]);

    const fetchNotification = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/notifications/${id}`);
            if (response.success && response.data) {
                const data = response.data as any;
                setNotification(data);

                // Mark as read if not already
                if (!data.read) {
                    await apiClient.patch(`/api/notifications/${id}/read`);
                }
            } else {
                setError('Notification not found');
            }
        } catch (err) {
            console.error('Failed to fetch notification:', err);
            setError('Failed to load notification details');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (isCandidatePath) {
            navigate('/candidate/notifications');
        } else {
            navigate('/notifications');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="p-6 space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (error || !notification) {
        return (
            <Layout>
                <div className="p-6 space-y-6">
                    <Button variant="ghost" onClick={handleBack} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Notifications
                    </Button>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{error || 'Notification Not Found'}</h2>
                        <p className="text-muted-foreground mb-6">The notification you are looking for does not exist or you do not have permission to view it.</p>
                        <Button onClick={handleBack}>Return to List</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const Icon = TYPE_ICONS[notification.type] || TYPE_ICONS.default;
    const colorClass = TYPE_COLORS[notification.type] || TYPE_COLORS.default;

    return (
        <Layout>
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    {notification.actionUrl && (
                        <Button onClick={() => navigate(notification.actionUrl)}>
                            View Related Resource
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <Card className="overflow-hidden border-t-4 border-t-primary">
                    <CardHeader className="bg-muted/30 pb-8">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${colorClass}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                                        {notification.type.replace(/_/g, ' ')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <CardTitle className="text-2xl mb-1">{notification.title}</CardTitle>
                                <CardDescription className="text-base text-foreground/80">
                                    {notification.message}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Detailed Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Received Date</p>
                                    <p className="text-sm font-medium">{format(new Date(notification.createdAt), 'PPPP p')}</p>
                                </div>
                                {notification.read_at && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Read Date</p>
                                        <p className="text-sm font-medium">{format(new Date(notification.read_at), 'PPPP p')}</p>
                                    </div>
                                )}
                                {notification.recipient_type && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Notification Category</p>
                                        <p className="text-sm font-medium">{notification.recipient_type}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {notification.data && Object.keys(notification.data).length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Internal Data</h3>
                                    <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-auto max-h-60">
                                        <pre>{JSON.stringify(notification.data, null, 2)}</pre>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end pt-4">
                            <p className="text-xs text-muted-foreground">
                                Notification ID: <span className="font-mono">{notification.id}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
