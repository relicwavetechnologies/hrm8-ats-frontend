import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Separator } from '@/shared/components/ui/separator';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface CustomReportBuilderProps {
  onGenerateReport: (config: ReportConfig) => void;
}

export interface ReportConfig {
  title: string;
  description: string;
  format: 'pdf' | 'excel' | 'json';
  sections: {
    overview: boolean;
    individualFeedback: boolean;
    aiAnalysis: boolean;
    teamComparison: boolean;
    biasDetection: boolean;
    recommendations: boolean;
    statistics: boolean;
    charts: boolean;
  };
  includeRawData: boolean;
  anonymize: boolean;
}

export const CustomReportBuilder = ({ onGenerateReport }: CustomReportBuilderProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Custom Feedback Report',
    description: '',
    format: 'pdf',
    sections: {
      overview: true,
      individualFeedback: true,
      aiAnalysis: true,
      teamComparison: true,
      biasDetection: true,
      recommendations: true,
      statistics: false,
      charts: true,
    },
    includeRawData: false,
    anonymize: false,
  });

  const handleSectionChange = (section: keyof ReportConfig['sections'], checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: checked,
      },
    }));
  };

  const handleGenerate = () => {
    const selectedCount = Object.values(config.sections).filter(Boolean).length;
    
    if (selectedCount === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please select at least one section to include in the report.",
        variant: "destructive",
      });
      return;
    }

    onGenerateReport(config);
    toast({
      title: "Report Generated",
      description: `Custom report "${config.title}" has been created successfully.`,
    });
  };

  const sectionOptions = [
    { key: 'overview', label: 'Executive Overview', description: 'High-level summary and key metrics' },
    { key: 'individualFeedback', label: 'Individual Feedback', description: 'Detailed feedback from each reviewer' },
    { key: 'aiAnalysis', label: 'AI Analysis', description: 'Sentiment, bias detection, and insights' },
    { key: 'teamComparison', label: 'Team Comparison', description: 'Compare feedback across reviewers' },
    { key: 'biasDetection', label: 'Bias Detection Details', description: 'Comprehensive bias analysis' },
    { key: 'recommendations', label: 'Recommendations', description: 'Action items and next steps' },
    { key: 'statistics', label: 'Statistical Analysis', description: 'Detailed metrics and trends' },
    { key: 'charts', label: 'Charts & Visualizations', description: 'Graphs and visual data' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Report Builder</h3>
        <p className="text-sm text-muted-foreground">
          Configure and generate a customized feedback report
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-title">Report Title</Label>
            <Input
              id="report-title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter report title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description (Optional)</Label>
            <Textarea
              id="report-description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a description for this report"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Format</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={config.format}
            onValueChange={(value) => setConfig(prev => ({ ...prev, format: value as any }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="cursor-pointer">
                PDF Document (Best for sharing)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel" className="cursor-pointer">
                Excel Workbook (Best for data analysis)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="cursor-pointer">
                JSON (Best for integration)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Sections</CardTitle>
          <CardDescription>Select which sections to include in the report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionOptions.map((option) => (
            <div key={option.key} className="flex items-start space-x-3">
              <Checkbox
                id={option.key}
                checked={config.sections[option.key as keyof ReportConfig['sections']]}
                onCheckedChange={(checked) => 
                  handleSectionChange(option.key as keyof ReportConfig['sections'], checked as boolean)
                }
              />
              <div className="grid gap-1 leading-none">
                <Label
                  htmlFor={option.key}
                  className="text-sm font-medium cursor-pointer"
                >
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="rawData"
              checked={config.includeRawData}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, includeRawData: checked as boolean }))
              }
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="rawData" className="text-sm font-medium cursor-pointer">
                Include Raw Data
              </Label>
              <p className="text-sm text-muted-foreground">
                Append raw feedback data to the report
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="anonymize"
              checked={config.anonymize}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, anonymize: checked as boolean }))
              }
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="anonymize" className="text-sm font-medium cursor-pointer">
                Anonymize Reviewers
              </Label>
              <p className="text-sm text-muted-foreground">
                Hide reviewer names and display as "Reviewer 1", "Reviewer 2", etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setConfig({
              title: 'Custom Feedback Report',
              description: '',
              format: 'pdf',
              sections: {
                overview: true,
                individualFeedback: true,
                aiAnalysis: true,
                teamComparison: true,
                biasDetection: true,
                recommendations: true,
                statistics: false,
                charts: true,
              },
              includeRawData: false,
              anonymize: false,
            });
            toast({
              title: "Reset Complete",
              description: "Report configuration has been reset to defaults.",
            });
          }}
        >
          Reset to Defaults
        </Button>
        <Button onClick={handleGenerate} className="gap-2">
          <Download className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};
