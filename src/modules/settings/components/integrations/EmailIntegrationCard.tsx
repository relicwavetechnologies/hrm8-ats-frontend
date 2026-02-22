import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Mail, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { apiClient } from "@/shared/lib/api";
import { BrandIconPlate, GmailBrandIcon } from "@/modules/settings/components/integrations/BrandIcons";
import {
  connectEmailProvider,
  disconnectEmailIntegration,
  syncEmails,
  getEmailIntegration,
  type EmailProvider,
} from "@/shared/lib/integrations/emailIntegrationService";

interface EmailIntegrationCardProps {
  provider: EmailProvider;
  name: string;
  description: string;
}

interface GmailStatus {
  connected: boolean;
  email?: string;
  connectedAt?: string;
}

export function EmailIntegrationCard({ provider, name, description }: EmailIntegrationCardProps) {
  const { toast } = useToast();
  const [integration, setIntegration] = useState(getEmailIntegration(provider));
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(provider === 'gmail');

  useEffect(() => {
    if (provider === 'gmail') {
      // Check Gmail connection status from backend
      checkGmailStatus();
    }
  }, [provider]);

  const checkGmailStatus = async () => {
    try {
      const response = await apiClient.get<GmailStatus>('/api/auth/google/status');
      if (response.success && response.data) {
        setGmailStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (provider === 'gmail') {
      // Use real Google OAuth flow
      window.location.href = '/api/auth/google/connect?redirect_from=integrations';
    } else {
      // Fallback to mock for other providers
      setIsConnecting(true);
      try {
        await connectEmailProvider(provider);
        setIntegration(getEmailIntegration(provider));
        toast({
          title: "Connected successfully",
          description: `${name} has been connected`,
        });
      } catch (error) {
        toast({
          title: "Connection failed",
          description: "Failed to connect to " + name,
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      // Call backend to disconnect
      const response = await apiClient.post('/api/auth/google/disconnect', {});
      if (response.success) {
        setGmailStatus({ connected: false });
        toast({
          title: "Disconnected",
          description: "Gmail has been disconnected",
        });
      }
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect Gmail",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectEmailIntegration(provider);
    setIntegration(undefined);
    toast({
      title: "Disconnected",
      description: `${name} has been disconnected`,
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncEmails(provider);
      setIntegration(getEmailIntegration(provider));
      toast({
        title: "Sync completed",
        description: `Emails synced from ${name}`,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync emails",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Use gmailStatus for Gmail, integration for others
  const isConnected = provider === 'gmail' ? gmailStatus?.connected : integration?.connected;
  const connectedEmail = provider === 'gmail' ? gmailStatus?.email : integration?.email;
  const connectedDate = provider === 'gmail' ? gmailStatus?.connectedAt : integration?.connectedAt;

  if (provider === 'gmail' && isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center animate-pulse">
                {provider === 'gmail' ? (
                  <BrandIconPlate className="h-9 w-9">
                    <GmailBrandIcon className="h-5 w-5 opacity-95" />
                  </BrandIconPlate>
                ) : (
                  <Mail className="h-6 w-6 opacity-50" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              {provider === 'gmail' ? (
                <BrandIconPlate className="h-9 w-9">
                  <GmailBrandIcon className="h-5 w-5" />
                </BrandIconPlate>
              ) : (
                <Mail className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {name}
                {isConnected && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="text-sm space-y-1">
              {connectedEmail && (
                <p className="text-muted-foreground">
                  Email: <span className="text-foreground">{connectedEmail}</span>
                </p>
              )}
              {connectedDate && (
                <p className="text-muted-foreground">
                  Connected: {new Date(connectedDate).toLocaleDateString()}
                </p>
              )}
              {provider !== 'gmail' && integration?.lastSync && (
                <p className="text-muted-foreground">
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {provider !== 'gmail' && (
                <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={provider === 'gmail' ? handleDisconnectGmail : handleDisconnect}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your {name} account to send emails and sync communications with candidates.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : `Connect ${name}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
