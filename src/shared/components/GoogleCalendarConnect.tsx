import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, CheckCircle, Calendar, ExternalLink } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';

interface GoogleCalendarStatus {
  connected: boolean;
  email?: string;
}

interface GoogleCalendarConnectProps {
  /** Compact mode shows a small badge-style indicator instead of a full button */
  compact?: boolean;
  /** Optional callback when status changes */
  onStatusChange?: (connected: boolean) => void;
}

export function GoogleCalendarConnect({ compact = false, onStatusChange }: GoogleCalendarConnectProps) {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Check for redirect from Google OAuth
    const params = new URLSearchParams(window.location.search);
    const googleCalendarParam = params.get('google_calendar');
    if (googleCalendarParam === 'connected') {
      fetchStatus();
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('google_calendar');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<GoogleCalendarStatus>('/api/auth/google/status');
      if (response.success && response.data) {
        setStatus(response.data);
        onStatusChange?.(response.data.connected);
      }
    } catch {
      setStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/google/connect';
  };

  if (isLoading) {
    if (compact) {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (status?.connected) {
    if (compact) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1 text-[10px] px-1.5 py-0.5">
          <CheckCircle className="h-2.5 w-2.5" />
          Connected
        </Badge>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1.5">
          <CheckCircle className="h-3.5 w-3.5" />
          Google Calendar Connected
          {status.email && (
            <span className="text-muted-foreground font-normal">({status.email})</span>
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground"
          onClick={handleConnect}
        >
          Reconnect
        </Button>
      </div>
    );
  }

  if (compact) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-dashed gap-1 text-[10px] px-1.5 py-0.5 cursor-pointer hover:bg-muted/50"
        onClick={handleConnect}
      >
        <Calendar className="h-2.5 w-2.5" />
        Not connected
      </Badge>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleConnect} className="gap-2">
      <Calendar className="h-4 w-4" />
      Connect Google Calendar
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
}
