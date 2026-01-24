import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { FileText, Download, Mail, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  frequency: string;
  lastGenerated?: string;
  icon: React.ReactNode;
}

interface RPOReportsGeneratorProps {
  contractId: string;
}

export function RPOReportsGenerator({ contractId }: RPOReportsGeneratorProps) {
  const [selectedReport, setSelectedReport] = useState('');
  const [reportFrequency, setReportFrequency] = useState('weekly');

  // Mock data - will be replaced with real data later
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'performance',
      name: 'Performance Summary',
      description: 'Comprehensive overview of placements, metrics, and KPIs',
      frequency: 'Weekly',
      lastGenerated: '2 days ago',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'consultant',
      name: 'Consultant Activity Report',
      description: 'Individual consultant performance and workload analysis',
      frequency: 'Monthly',
      lastGenerated: '1 week ago',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'sla',
      name: 'SLA Compliance Report',
      description: 'Service level agreement tracking and compliance status',
      frequency: 'Monthly',
      lastGenerated: '3 days ago',
      icon: <Target className="h-5 w-5" />
    },
    {
      id: 'pipeline',
      name: 'Pipeline Status Report',
      description: 'Current placement pipeline and forecasted completions',
      frequency: 'Weekly',
      lastGenerated: '1 day ago',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    toast({
      title: 'Report Generated',
      description: 'Your report has been generated and is ready for download.',
    });
  };

  const handleScheduleReport = (reportId: string) => {
    toast({
      title: 'Report Scheduled',
      description: `Report will be automatically generated ${reportFrequency}.`,
    });
  };

  const handleEmailReport = (reportId: string) => {
    toast({
      title: 'Report Sent',
      description: 'Report has been emailed to the client.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Generation</CardTitle>
          <CardDescription>Generate and send reports to clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={reportFrequency} onValueChange={setReportFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => selectedReport && handleGenerateReport(selectedReport)}
              disabled={!selectedReport}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate & Download
            </Button>
            <Button 
              onClick={() => selectedReport && handleEmailReport(selectedReport)}
              disabled={!selectedReport}
              variant="outline"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email to Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {reportTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Frequency:</span>
                  <Badge variant="outline">{template.frequency}</Badge>
                </div>
                {template.lastGenerated && (
                  <span className="text-muted-foreground">
                    Last: {template.lastGenerated}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => handleGenerateReport(template.id)}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button 
                  onClick={() => handleEmailReport(template.id)}
                  size="sm"
                  variant="outline"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
                <Button 
                  onClick={() => handleScheduleReport(template.id)}
                  size="sm"
                  variant="outline"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Performance Summary - Week 45', date: '2 days ago', type: 'PDF', size: '2.4 MB' },
              { name: 'SLA Compliance - October', date: '3 days ago', type: 'PDF', size: '1.8 MB' },
              { name: 'Consultant Activity - Q4', date: '1 week ago', type: 'PDF', size: '3.2 MB' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.date} • {report.type} • {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
