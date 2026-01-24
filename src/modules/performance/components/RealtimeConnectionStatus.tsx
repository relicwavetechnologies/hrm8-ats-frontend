import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeConnectionStatusProps {
  isConnected: boolean;
}

export const RealtimeConnectionStatus: React.FC<RealtimeConnectionStatusProps> = ({
  isConnected,
}) => {
  return (
    <Badge
      variant={isConnected ? 'default' : 'destructive'}
      className="animate-pulse"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          Live Updates Active
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Disconnected
        </>
      )}
    </Badge>
  );
};
