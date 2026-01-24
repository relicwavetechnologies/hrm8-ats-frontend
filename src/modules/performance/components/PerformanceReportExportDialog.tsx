import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { CalendarIcon, Download, FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { getPerformanceGoals, getPerformanceReviews } from "@/shared/lib/performanceStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { exportToExcel, exportToPDF } from "@/shared/lib/performanceReportExport";
import { toast } from "@/shared/hooks/use-toast";

interface PerformanceReportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PerformanceReportExportDialog({ open, onOpenChange }: PerformanceReportExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [reportTemplate, setReportTemplate] = useState("comprehensive");
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeReviews, setIncludeReviews] = useState(true);
  const [includeKPIs, setIncludeKPIs] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "month" | "quarter" | "year" | "custom">("year");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const employees = getEmployees();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Get data based on filters
      const goals = getPerformanceGoals();
      const reviews = getPerformanceReviews();

      // Apply filters
      let filteredGoals = goals;
      let filteredReviews = reviews;

      // Employee filter
      if (employeeFilter !== "all") {
        filteredGoals = filteredGoals.filter(g => g.employeeId === employeeFilter);
        filteredReviews = filteredReviews.filter(r => r.employeeId === employeeFilter);
      }

      // Status filter
      if (statusFilter !== "all") {
        filteredGoals = filteredGoals.filter(g => g.status === statusFilter);
        filteredReviews = filteredReviews.filter(r => r.status === statusFilter);
      }

      // Date range filter
      if (dateRange !== "all") {
        const now = new Date();
        let filterStartDate: Date;

        if (dateRange === "custom" && startDate && endDate) {
          filterStartDate = startDate;
          const filterEndDate = endDate;
          
          filteredGoals = filteredGoals.filter(g => {
            const goalDate = new Date(g.startDate);
            return goalDate >= filterStartDate && goalDate <= filterEndDate;
          });
          
          filteredReviews = filteredReviews.filter(r => {
            const reviewDate = new Date(r.createdAt);
            return reviewDate >= filterStartDate && reviewDate <= filterEndDate;
          });
        } else if (dateRange === "month") {
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filteredGoals = filteredGoals.filter(g => new Date(g.startDate) >= filterStartDate);
          filteredReviews = filteredReviews.filter(r => new Date(r.createdAt) >= filterStartDate);
        } else if (dateRange === "quarter") {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          filterStartDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          filteredGoals = filteredGoals.filter(g => new Date(g.startDate) >= filterStartDate);
          filteredReviews = filteredReviews.filter(r => new Date(r.createdAt) >= filterStartDate);
        } else if (dateRange === "year") {
          filterStartDate = new Date(now.getFullYear(), 0, 1);
          filteredGoals = filteredGoals.filter(g => new Date(g.startDate) >= filterStartDate);
          filteredReviews = filteredReviews.filter(r => new Date(r.createdAt) >= filterStartDate);
        }
      }

      const exportData = {
        goals: includeGoals ? filteredGoals : [],
        reviews: includeReviews ? filteredReviews : [],
        includeKPIs,
        includeCharts,
        template: reportTemplate,
        employees,
      };

      // Export based on format
      if (exportFormat === "pdf") {
        await exportToPDF(exportData);
      } else {
        await exportToExcel(exportData);
      }

      toast({
        title: "Export Successful",
        description: `Performance report exported as ${exportFormat.toUpperCase()}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Performance Report</DialogTitle>
          <DialogDescription>
            Configure and export performance data in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as "pdf" | "excel")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer font-normal">
                  <FileText className="h-4 w-4" />
                  PDF Document
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer font-normal">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Spreadsheet
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Report Template */}
          <div className="space-y-2">
            <Label htmlFor="template">Report Template</Label>
            <Select value={reportTemplate} onValueChange={setReportTemplate}>
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                <SelectItem value="summary">Executive Summary</SelectItem>
                <SelectItem value="goals-only">Goals Only</SelectItem>
                <SelectItem value="reviews-only">Reviews Only</SelectItem>
                <SelectItem value="detailed-kpis">Detailed KPIs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="goals" 
                  checked={includeGoals} 
                  onCheckedChange={(checked) => setIncludeGoals(checked as boolean)}
                />
                <Label htmlFor="goals" className="cursor-pointer font-normal">
                  Performance Goals
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reviews" 
                  checked={includeReviews} 
                  onCheckedChange={(checked) => setIncludeReviews(checked as boolean)}
                />
                <Label htmlFor="reviews" className="cursor-pointer font-normal">
                  Performance Reviews
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="kpis" 
                  checked={includeKPIs} 
                  onCheckedChange={(checked) => setIncludeKPIs(checked as boolean)}
                />
                <Label htmlFor="kpis" className="cursor-pointer font-normal">
                  KPI Details & Metrics
                </Label>
              </div>
              {exportFormat === "pdf" && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={includeCharts} 
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <Label htmlFor="charts" className="cursor-pointer font-normal">
                    Charts & Visualizations
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee">Filter by Employee</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger id="employee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
              <SelectTrigger id="dateRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === "custom" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
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
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || (!includeGoals && !includeReviews)}>
            {isExporting ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
