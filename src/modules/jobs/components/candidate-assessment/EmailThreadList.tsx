import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Mail, Loader2, RefreshCw, Plus, Inbox, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { GmailThread } from '@/shared/lib/gmailThreadService';

interface EmailThreadListProps {
  threads: GmailThread[];
  loading: boolean;
  gmailConnected: boolean;
  onThreadClick: (thread: GmailThread) => void;
  onCompose: () => void;
  onRefresh: () => void;
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export function EmailThreadList({
  threads,
  loading,
  gmailConnected,
  onThreadClick,
  onCompose,
  onRefresh,
}: EmailThreadListProps) {
  // Determine if last message in thread is inbound
  const isLastMessageInbound = (thread: GmailThread) => {
    const lastMsg = thread.messages[thread.messages.length - 1];
    return lastMsg?.isInbound ?? false;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Email Threads</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" className="gap-1.5" onClick={onCompose}>
              <Plus className="h-4 w-4" />
              Compose New
            </Button>
          </div>
        </div>
      </div>

      {/* Gmail not connected banner */}
      {!gmailConnected && (
        <div className="mx-4 mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Gmail not connected</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Connect your Google account in Settings to see email threads and candidate replies.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs border-amber-300 dark:border-amber-700"
              onClick={() => { window.location.href = '/api/auth/google/connect'; }}
            >
              Connect Google Account
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm">Loading email threads...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">No email threads yet</p>
              <p className="text-xs mt-1">Send an email to start a conversation</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onCompose}>
                <Plus className="h-4 w-4" />
                Compose Email
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => {
                const inbound = isLastMessageInbound(thread);
                return (
                  <Card
                    key={thread.threadId}
                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onThreadClick(thread)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Direction indicator */}
                      <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full ${
                        inbound
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          : 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                      }`}>
                        {inbound ? (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{thread.subject}</p>
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                            {thread.messageCount}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {thread.snippet}
                        </p>
                      </div>

                      {/* Date */}
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">
                        {formatRelativeDate(thread.lastMessageDate)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
