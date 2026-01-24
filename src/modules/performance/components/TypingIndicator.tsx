import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { TypingUser } from '@/shared/hooks/useTypingIndicator';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  section?: 'ratings' | 'comments' | 'decision';
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, section }) => {
  const filteredUsers = section 
    ? typingUsers.filter(u => u.section === section)
    : typingUsers;

  if (filteredUsers.length === 0) return null;

  const displayText = filteredUsers.length === 1
    ? `${filteredUsers[0].userName} is typing...`
    : `${filteredUsers.length} people are typing...`;

  return (
    <Badge variant="secondary" className="animate-pulse">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      {displayText}
    </Badge>
  );
};
