import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { Printer } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface PrintableFeedbackViewProps {
  feedback: TeamMemberFeedback[];
  candidateName: string;
  candidatePosition?: string;
}

export const PrintableFeedbackView = ({ 
  feedback, 
  candidateName,
  candidatePosition = 'Not specified'
}: PrintableFeedbackViewProps) => {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Select your printer or save as PDF",
    });
  };

  return (
    <div className="space-y-6">
      {/* Print Button - Hidden in print view */}
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Print-friendly content */}
      <div className="print:text-black print:bg-white">
        {/* Header */}
        <div className="text-center mb-8 print:mb-12">
          <h1 className="text-3xl font-bold mb-2 print:text-4xl">Interview Feedback Report</h1>
          <div className="text-lg text-muted-foreground print:text-gray-600">
            <div>{candidateName}</div>
            <div className="text-sm">{candidatePosition}</div>
            <div className="text-sm mt-2">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Summary Statistics */}
        <div className="mb-8 print:mb-12">
          <h2 className="text-xl font-semibold mb-4 print:text-2xl">Summary</h2>
          <div className="grid grid-cols-3 gap-4 print:gap-6">
            <div className="text-center p-4 border rounded-lg print:border-gray-300">
              <div className="text-3xl font-bold print:text-4xl">{feedback.length}</div>
              <div className="text-sm text-muted-foreground print:text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center p-4 border rounded-lg print:border-gray-300">
              <div className="text-3xl font-bold print:text-4xl">
                {(feedback.reduce((acc, f) => acc + f.overallScore, 0) / feedback.length).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground print:text-gray-600">Avg Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg print:border-gray-300">
              <div className="text-3xl font-bold print:text-4xl">
                {Math.round((feedback.filter(f => f.recommendation.includes('hire')).length / feedback.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground print:text-gray-600">Hire Rate</div>
            </div>
          </div>
        </div>

        <Separator className="my-6 print:my-8" />

        {/* Individual Feedback */}
        <div className="space-y-8 print:space-y-12">
          <h2 className="text-xl font-semibold print:text-2xl">Detailed Feedback</h2>
          
          {feedback.map((fb, index) => (
            <div key={fb.id} className="print:break-inside-avoid">
              <Card className="print:border-gray-300 print:shadow-none">
                <CardHeader className="print:pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base print:text-lg">
                        {fb.reviewerName}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground print:text-gray-600 mt-1">
                        {fb.reviewerRole}
                      </div>
                      <div className="text-xs text-muted-foreground print:text-gray-500 mt-1">
                        Submitted: {new Date(fb.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold print:text-3xl">
                          {fb.overallScore}
                        </span>
                        <span className="text-sm text-muted-foreground print:text-gray-600">/100</span>
                      </div>
                      <Badge 
                        variant={fb.recommendation.includes('hire') ? 'default' : 'secondary'}
                        className="print:border print:border-gray-300"
                      >
                        {fb.recommendation}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 print:space-y-6">
                  {fb.comments.map((comment, commentIdx) => (
                    <div key={commentIdx} className="print:break-inside-avoid">
                      <div className="font-medium text-sm mb-2 print:text-base">
                        {comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}
                      </div>
                      <div className="text-sm text-muted-foreground print:text-gray-700 pl-3 border-l-2 border-primary print:border-gray-400">
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {index < feedback.length - 1 && (
                <Separator className="my-6 print:my-8" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground print:text-gray-500 print:mt-16">
          <div>This report is confidential and for internal use only.</div>
          <div className="mt-2">
            Generated by AI-Powered Feedback System • Page <span className="print:hidden">1</span>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            @page {
              margin: 1.5cm;
            }
            
            .print\\:hidden {
              display: none !important;
            }
            
            .print\\:break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            
            .print\\:text-black {
              color: #000 !important;
            }
            
            .print\\:bg-white {
              background-color: #fff !important;
            }
          }
        `
      }} />
    </div>
  );
};
