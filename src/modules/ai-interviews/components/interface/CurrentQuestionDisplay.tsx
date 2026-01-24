import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Bot, HelpCircle } from 'lucide-react';
import type { InterviewQuestion } from '@/shared/types/aiInterview';
import { motion } from 'framer-motion';

interface CurrentQuestionDisplayProps {
  question: InterviewQuestion;
  isAISpeaking?: boolean;
}

const CATEGORY_COLORS = {
  technical: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  behavioral: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  situational: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  cultural: 'bg-green-500/10 text-green-700 dark:text-green-300',
  experience: 'bg-pink-500/10 text-pink-700 dark:text-pink-300'
};

export function CurrentQuestionDisplay({ question, isAISpeaking = false }: CurrentQuestionDisplayProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <motion.div
              animate={isAISpeaking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex-shrink-0"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            </motion.div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={CATEGORY_COLORS[question.category]}>
                  {question.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Question #{question.order}
                </span>
              </div>

              <p className="text-lg font-medium leading-relaxed">
                {question.question}
              </p>

              {question.rationale && (
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{question.rationale}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
