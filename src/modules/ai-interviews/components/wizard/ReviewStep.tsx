import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { format } from 'date-fns';

interface ReviewStepProps {
  data: any;
}

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Review Interview Details</CardTitle>
          <CardDescription>Please confirm all details before scheduling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Candidate</p>
            <p className="text-lg">{data.candidateName}</p>
            <p className="text-sm text-muted-foreground">{data.candidateEmail}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Position</p>
            <p className="text-lg">{data.jobTitle}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Interview Mode</p>
            <p className="text-lg capitalize">{data.interviewMode}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Question Strategy</p>
            <p className="text-lg capitalize">{data.questionSource?.replace('-', ' ')}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Scheduled For</p>
            <p className="text-lg">
              {data.scheduledDate ? format(new Date(data.scheduledDate), 'PPpp') : 'Not set'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
