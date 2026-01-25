import { useEffect } from 'react';
import { useWebSocket } from '@/app/providers/WebSocketContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Handles global notifications from WebSocket
 * Should be mounted once at the top level (e.g. in DashboardPageLayout or App)
 */
export function GlobalNotificationHandler() {
    const { onMessage } = useWebSocket();
    const navigate = useNavigate();

    useEffect(() => {
        // Register handler for 'notification' message type
        const unsubscribe = onMessage('notification', (payload: any) => {
            // Allow suppression of notifications for current conversation if handled elsewhere
            // But for general alerts like Job Published, we always show

            if (payload.type === 'JOB_PUBLISHED') {
                toast.success(payload.title || 'Job Published', {
                    description: payload.message,
                    action: payload.actionUrl ? {
                        label: 'View',
                        onClick: () => navigate(payload.actionUrl)
                    } : undefined,
                    duration: 5000,
                });
            }

            // Handle other types
            if (payload.type === 'NEW_APPLICATION') {
                toast.info(payload.title || 'New Application', {
                    description: payload.message,
                    action: payload.actionUrl ? {
                        label: 'View',
                        onClick: () => navigate(payload.actionUrl)
                    } : undefined,
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [onMessage, navigate]);

    return null;
}
