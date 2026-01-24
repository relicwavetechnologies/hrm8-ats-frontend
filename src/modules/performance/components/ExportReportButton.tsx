import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { CandidateComparison } from '@/shared/types/collaborativeFeedback';

interface ExportReportButtonProps {
  data: CandidateComparison[];
  filename?: string;
}

export function ExportReportButton({ data, filename = 'candidate-comparison' }: ExportReportButtonProps) {
  const { toast } = useToast();

  const exportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, `${filename}.json`);
    toast({
      title: 'Exported as JSON',
      description: 'Report has been downloaded successfully.',
    });
  };

  const exportCSV = () => {
    const headers = [
      'Candidate Name',
      'Job Title',
      'Average Score',
      'Agreement Level',
      'Total Feedback',
      'Hire Votes',
      'No Hire Votes',
      'Abstain Votes',
      'Recommendation',
    ].join(',');

    const rows = data.map(comp => [
      comp.candidateName,
      comp.jobTitle,
      comp.consensusMetrics.averageScore.toFixed(2),
      (comp.consensusMetrics.agreementLevel * 100).toFixed(1) + '%',
      comp.consensusMetrics.totalFeedbacks,
      comp.consensusMetrics.voteResults.hire,
      comp.consensusMetrics.voteResults.noHire,
      comp.consensusMetrics.voteResults.abstain,
      getMostCommonRecommendation(comp.consensusMetrics.recommendationDistribution),
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `${filename}.csv`);
    toast({
      title: 'Exported as CSV',
      description: 'Report has been downloaded successfully.',
    });
  };

  const exportMarkdown = () => {
    let markdown = `# Candidate Comparison Report\n\n`;
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `Total Candidates: ${data.length}\n\n`;

    data.forEach(comp => {
      markdown += `### ${comp.candidateName} - ${comp.jobTitle}\n\n`;
      markdown += `**Average Score:** ${comp.consensusMetrics.averageScore.toFixed(1)}/100\n\n`;
      markdown += `**Agreement Level:** ${(comp.consensusMetrics.agreementLevel * 100).toFixed(0)}%\n\n`;
      markdown += `**Team Feedback:** ${comp.consensusMetrics.totalFeedbacks} submissions\n\n`;
      
      markdown += `**Voting Results:**\n`;
      markdown += `- 👍 Hire: ${comp.consensusMetrics.voteResults.hire}\n`;
      markdown += `- 👎 No Hire: ${comp.consensusMetrics.voteResults.noHire}\n`;
      markdown += `- ⚪ Abstain: ${comp.consensusMetrics.voteResults.abstain}\n\n`;

      if (comp.consensusMetrics.topStrengths.length > 0) {
        markdown += `**Top Strengths:**\n`;
        comp.consensusMetrics.topStrengths.slice(0, 3).forEach(strength => {
          markdown += `- ${strength}\n`;
        });
        markdown += `\n`;
      }

      if (comp.consensusMetrics.topConcerns.length > 0) {
        markdown += `**Top Concerns:**\n`;
        comp.consensusMetrics.topConcerns.slice(0, 3).forEach(concern => {
          markdown += `- ${concern}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `${filename}.md`);
    toast({
      title: 'Exported as Markdown',
      description: 'Report has been downloaded successfully.',
    });
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMostCommonRecommendation = (dist: Record<string, number>): string => {
    const entries = Object.entries(dist);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((max, entry) => entry[1] > max[1] ? entry : max, entries[0])[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
