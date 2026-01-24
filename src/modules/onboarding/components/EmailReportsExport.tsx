import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { getSentEmails, getScheduledEmails } from "@/shared/lib/scheduledEmails";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { FileText, Download, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportType = 'summary' | 'detailed' | 'performance' | 'scheduled';
type DateRange = '7days' | '30days' | '90days' | 'custom';

export function EmailReportsExport() {
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  const sentEmails = useMemo(() => getSentEmails(), []);
  const scheduledEmails = useMemo(() => getScheduledEmails(), []);

  const getDateRange = () => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (dateRange) {
      case '7days':
        start = startOfDay(subDays(end, 6));
        break;
      case '30days':
        start = startOfDay(subDays(end, 29));
        break;
      case '90days':
        start = startOfDay(subDays(end, 89));
        break;
      case 'custom':
        start = customStartDate ? startOfDay(customStartDate) : startOfDay(subDays(end, 29));
        return { start, end: customEndDate ? endOfDay(customEndDate) : end };
      default:
        start = startOfDay(subDays(end, 29));
    }

    return { start, end };
  };

  const filteredEmails = useMemo(() => {
    const { start, end } = getDateRange();
    return sentEmails.filter(email => {
      if (!email.sentAt) return false;
      const sentDate = new Date(email.sentAt);
      return sentDate >= start && sentDate <= end;
    });
  }, [sentEmails, dateRange, customStartDate, customEndDate]);

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const { start, end } = getDateRange();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Email Campaign Report', 14, 20);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 28);
      doc.text(`Period: ${format(start, 'PPP')} - ${format(end, 'PPP')}`, 14, 34);
      
      let yPosition = 45;

      if (reportType === 'summary' || reportType === 'detailed') {
        // Summary Statistics
        const total = filteredEmails.length;
        const delivered = filteredEmails.filter(e => e.deliveryStatus === 'delivered').length;
        const opened = filteredEmails.filter(e => e.openedAt).length;
        const clicked = filteredEmails.filter(e => e.clickedAt).length;
        
        const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0';
        const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0';
        const clickRate = delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : '0';

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 10;

        const summaryData = [
          ['Total Emails Sent', total.toString()],
          ['Delivered', `${delivered} (${deliveryRate}%)`],
          ['Opened', `${opened} (${openRate}%)`],
          ['Clicked', `${clicked} (${clickRate}%)`],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      if (reportType === 'detailed') {
        // Detailed Email List
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Email Details', 14, yPosition);
        yPosition += 10;

        const emailData = filteredEmails.slice(0, 50).map(email => [
          email.emailType,
          email.sentAt ? format(new Date(email.sentAt), 'MMM dd, yyyy') : 'N/A',
          email.recipientCount.toString(),
          email.deliveryStatus || 'N/A',
          email.openedAt ? 'Yes' : 'No',
          email.clickedAt ? 'Yes' : 'No',
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Type', 'Sent Date', 'Recipients', 'Status', 'Opened', 'Clicked']],
          body: emailData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      if (reportType === 'performance') {
        // Template Performance
        const templateMap = new Map<string, { sent: number; opened: number; clicked: number }>();
        
        filteredEmails.forEach(email => {
          if (!templateMap.has(email.emailType)) {
            templateMap.set(email.emailType, { sent: 0, opened: 0, clicked: 0 });
          }
          const stats = templateMap.get(email.emailType)!;
          stats.sent++;
          if (email.openedAt) stats.opened++;
          if (email.clickedAt) stats.clicked++;
        });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Template Performance', 14, yPosition);
        yPosition += 10;

        const performanceData = Array.from(templateMap.entries()).map(([type, stats]) => [
          type,
          stats.sent.toString(),
          `${((stats.opened / stats.sent) * 100).toFixed(1)}%`,
          `${((stats.clicked / stats.sent) * 100).toFixed(1)}%`,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Template Type', 'Sent', 'Open Rate', 'Click Rate']],
          body: performanceData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      if (reportType === 'scheduled') {
        // Scheduled Emails
        const pendingScheduled = scheduledEmails.filter(e => e.status === 'pending');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Scheduled Emails', 14, yPosition);
        yPosition += 10;

        if (pendingScheduled.length > 0) {
          const scheduledData = pendingScheduled.map(email => [
            email.emailType,
            format(new Date(email.scheduledFor), 'MMM dd, yyyy HH:mm'),
            email.recipientCount.toString(),
            email.status,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Type', 'Scheduled For', 'Recipients', 'Status']],
            body: scheduledData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
          });
        } else {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text('No scheduled emails found.', 14, yPosition);
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `email-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      toast.success('Report generated successfully', {
        description: `${fileName} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    const { start, end } = getDateRange();
    const csv = [
      ['Email Type', 'Sent Date', 'Recipients', 'Delivery Status', 'Opened', 'Clicked', 'Open Date', 'Click Date'],
      ...filteredEmails.map(email => [
        email.emailType,
        email.sentAt ? format(new Date(email.sentAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
        email.recipientCount,
        email.deliveryStatus || 'N/A',
        email.openedAt ? 'Yes' : 'No',
        email.clickedAt ? 'Yes' : 'No',
        email.openedAt ? format(new Date(email.openedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
        email.clickedAt ? format(new Date(email.clickedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Email Report</CardTitle>
          <CardDescription>
            Create detailed reports of your email campaigns with customizable date ranges and metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Configuration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Email List</SelectItem>
                  <SelectItem value="performance">Template Performance</SelectItem>
                  <SelectItem value="scheduled">Scheduled Emails</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Preview Stats */}
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Report Preview</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="font-semibold">
                      {format(getDateRange().start, 'MMM dd')} - {format(getDateRange().end, 'MMM dd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emails Included</p>
                    <p className="font-semibold">{filteredEmails.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Report Type</p>
                    <p className="font-semibold capitalize">{reportType.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={generatePDFReport} 
              disabled={isGenerating || filteredEmails.length === 0}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate PDF Report'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredEmails.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>

          {filteredEmails.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No emails found in the selected date range. Try adjusting your filters.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Report Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>What's included in each report type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold">Summary Report</p>
                <p className="text-sm text-muted-foreground">
                  High-level overview with key metrics: total sent, delivery rate, open rate, and click rate.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold">Detailed Email List</p>
                <p className="text-sm text-muted-foreground">
                  Complete list of all emails with dates, recipients, delivery status, and engagement data.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold">Template Performance</p>
                <p className="text-sm text-muted-foreground">
                  Comparison of different email templates showing open rates and click rates for each.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold">Scheduled Emails</p>
                <p className="text-sm text-muted-foreground">
                  Overview of all pending scheduled emails with dates and recipient counts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
