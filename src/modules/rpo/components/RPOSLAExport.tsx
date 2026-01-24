import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileDown, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface RPOSLAExportProps {
  contractId: string;
}

export function RPOSLAExport({ contractId }: RPOSLAExportProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState('pdf');
  const [period, setPeriod] = useState('last-month');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);

  const handleExport = () => {
    toast({
      title: 'Report Generated',
      description: `SLA report has been exported as ${format.toUpperCase()}`,
    });
  };

  const exportOptions = [
    {
      value: 'pdf',
      label: 'PDF Report',
      icon: FileText,
      description: 'Formatted report with charts and tables'
    },
    {
      value: 'excel',
      label: 'Excel Spreadsheet',
      icon: FileSpreadsheet,
      description: 'Raw data in spreadsheet format'
    },
    {
      value: 'csv',
      label: 'CSV Data',
      icon: FileDown,
      description: 'Comma-separated values for analysis'
    }
  ];

  const periodOptions = [
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export SLA Report</CardTitle>
          <CardDescription>Generate and download comprehensive SLA reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid gap-3">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      format === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormat(option.value)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        format === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {format === option.value && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label
                  htmlFor="charts"
                  className="text-sm font-normal cursor-pointer"
                >
                  Charts and Visualizations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={includeMetrics}
                  onCheckedChange={(checked) => setIncludeMetrics(checked as boolean)}
                />
                <Label
                  htmlFor="metrics"
                  className="text-sm font-normal cursor-pointer"
                >
                  Metrics Tables
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alerts"
                  checked={includeAlerts}
                  onCheckedChange={(checked) => setIncludeAlerts(checked as boolean)}
                />
                <Label
                  htmlFor="alerts"
                  className="text-sm font-normal cursor-pointer"
                >
                  Alert History
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trends"
                  checked={includeTrends}
                  onCheckedChange={(checked) => setIncludeTrends(checked as boolean)}
                />
                <Label
                  htmlFor="trends"
                  className="text-sm font-normal cursor-pointer"
                >
                  Historical Trends
                </Label>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full" size="lg">
            <FileDown className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Pre-configured report templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly Executive Summary
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Detailed Metrics Breakdown
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Compliance Certificate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
