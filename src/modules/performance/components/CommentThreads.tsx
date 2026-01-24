import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { getCommentThreads, addComment, addReaction, extractMentions } from '@/shared/lib/feedbackActivityService';
import { CommentThread } from '@/shared/types/feedbackActivity';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Reply, Smile } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface CommentThreadsProps {
  candidateId: string;
  feedbackId?: string;
}

const CommentComponent: React.FC<{
  comment: CommentThread;
  onReply: (parentId: string) => void;
  onReaction: (commentId: string, emoji: string) => void;
  depth?: number;
}> = ({ comment, onReply, onReaction, depth = 0 }) => {
  const commonEmojis = ['👍', '❤️', '🎯', '💡', '✅'];

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3 p-3 rounded-lg border bg-card">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>
            {comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.authorName}</span>
            <Badge variant="outline" className="text-xs">{comment.authorRole}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">
            {comment.content.split(/(@\w+\s+\w+)/).map((part, idx) => 
              part.startsWith('@') ? (
                <span key={idx} className="text-primary font-medium">
                  {part}
                </span>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            {comment.reactions.length > 0 && (
              <div className="flex gap-1">
                {Object.entries(
                  comment.reactions.reduce((acc, r) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([emoji, count]) => (
                  <Button
                    key={emoji}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => onReaction(comment.id, emoji)}
                  >
                    {emoji} {count}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex gap-0.5">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onReaction(comment.id, emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReaction={onReaction}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentThreads: React.FC<CommentThreadsProps> = ({ candidateId, feedbackId }) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [candidateId, feedbackId]);

  const loadComments = () => {
    const data = getCommentThreads(candidateId, feedbackId);
    setComments(data);
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);
    
    addComment({
      candidateId,
      feedbackId: feedbackId || 'general',
      parentCommentId: replyingTo || undefined,
      authorId: 'current-user',
      authorName: 'John Doe',
      authorRole: 'Hiring Manager',
      content: newComment,
      mentions,
    });

    setNewComment('');
    setReplyingTo(null);
    loadComments();

    toast({
      title: 'Comment posted',
      description: mentions.length > 0 ? `${mentions.join(', ')} will be notified` : undefined,
    });
  };

  const handleReaction = (commentId: string, emoji: string) => {
    addReaction(commentId, emoji, 'current-user', 'John Doe');
    loadComments();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion Thread ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment... (Use @Name to mention team members)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {replyingTo && (
                  <>
                    Replying to comment{' '}
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </p>
              <Button onClick={handleSubmit} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Start the discussion!
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentComponent
                    key={comment.id}
                    comment={comment}
                    onReply={setReplyingTo}
                    onReaction={handleReaction}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
