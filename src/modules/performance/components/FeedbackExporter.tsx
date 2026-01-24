import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { getCandidateFeedback, calculateConsensusMetrics } from '@/shared/lib/collaborativeFeedbackService';

interface FeedbackExporterProps {
  candidateId: string;
  candidateName: string;
}

export const FeedbackExporter: React.FC<FeedbackExporterProps> = ({ candidateId, candidateName }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [includeRatings, setIncludeRatings] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeConsensus, setIncludeConsensus] = useState(true);
  const [includeActivity, setIncludeActivity] = useState(false);

  const handleExport = () => {
    // Simulate export
    const feedback = getCandidateFeedback(candidateId);
    const consensus = calculateConsensusMetrics(candidateId);

    const exportData = {
      candidate: {
        id: candidateId,
        name: candidateName,
      },
      exportDate: new Date().toISOString(),
      feedback: includeRatings ? feedback : [],
      consensus: includeConsensus ? consensus : null,
      format,
    };

    // In real implementation, this would generate and download the file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${candidateName.replace(/\s+/g, '-')}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: `Feedback exported as ${format.toUpperCase()}`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Feedback</DialogTitle>
          <DialogDescription>
            Export feedback data for {candidateName} in your preferred format
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF Report
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Spreadsheet
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  JSON Data
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ratings"
                  checked={includeRatings}
                  onCheckedChange={(checked) => setIncludeRatings(checked as boolean)}
                />
                <Label htmlFor="ratings" className="cursor-pointer">
                  Individual ratings and scores
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comments"
                  checked={includeComments}
                  onCheckedChange={(checked) => setIncludeComments(checked as boolean)}
                />
                <Label htmlFor="comments" className="cursor-pointer">
                  Comments and feedback
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consensus"
                  checked={includeConsensus}
                  onCheckedChange={(checked) => setIncludeConsensus(checked as boolean)}
                />
                <Label htmlFor="consensus" className="cursor-pointer">
                  Consensus metrics
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activity"
                  checked={includeActivity}
                  onCheckedChange={(checked) => setIncludeActivity(checked as boolean)}
                />
                <Label htmlFor="activity" className="cursor-pointer">
                  Activity history
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
