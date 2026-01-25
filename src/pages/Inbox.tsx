import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useWebSocket } from '@/app/providers/WebSocketContext';
import { messagingService } from '@/shared/lib/messagingService';
import { ConversationList } from '@/modules/messages/components/ConversationList';
import { ConversationHeader } from '@/modules/messages/components/ConversationHeader';
import { MessageList } from '@/modules/messages/components/MessageList';
import { MessageInput } from '@/modules/messages/components/MessageInput';
import { Card } from '@/shared/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';

export default function InboxPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuth();
  const { conversations, setConversations, messages, joinConversation } = useWebSocket();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
    }
  }, [conversationId, joinConversation]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      // Use admin endpoint for HR inbox
      const response = await messagingService.getAdminConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentConversation = conversations.find(c => c.id === conversationId);
  const currentMessages = conversationId ? messages[conversationId] || [] : [];

  if (!user) {
    return null;
  }

  return (
    <DashboardPageLayout>
      <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">Manage your conversations</p>
          </div>
          <div className="flex-1 flex border rounded-lg overflow-hidden bg-background shadow-sm">
            <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-muted/10">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  currentConversationId={conversationId || null}
                  currentUserEmail={user?.email}
                  messages={messages}
                  onSelectConversation={(id) => navigate(`/messages/${id}`)}
                />
              )}
            </div>
            {conversationId && currentConversation ? (
              <div className="flex-1 bg-background flex flex-col min-w-0">
                <ConversationHeader 
                  conversation={currentConversation}
                  currentUserEmail={user.email}
                />
                <MessageList 
                  messages={currentMessages}
                  currentUserEmail={user.email}
                  viewerType="HR"
                />
                <MessageInput 
                  conversationId={conversationId}
                  conversationStatus={currentConversation.status}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/30">
                <Card className="p-8 text-center border-none shadow-none bg-transparent">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a conversation from the list to start messaging
                  </p>
                </Card>
              </div>
            )}
          </div>
      </div>
    </DashboardPageLayout>
  );
}