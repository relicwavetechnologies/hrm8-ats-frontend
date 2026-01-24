import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Upload, FileSpreadsheet, Download, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Employee } from '@/shared/types/employee';
import { saveEmployee, getEmployees } from '@/shared/lib/employeeStorage';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportRow {
  data: Partial<Employee>;
  status: 'pending' | 'success' | 'error';
  error?: string;
  rowNumber: number;
}

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': 'EMP001',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@company.com',
        'Phone': '+1 (555) 123-4567',
        'Date of Birth': '1990-01-15',
        'Gender': 'male',
        'Job Title': 'Software Engineer',
        'Department': 'Engineering',
        'Location': 'San Francisco, CA',
        'Employment Type': 'full-time',
        'Status': 'active',
        'Hire Date': '2023-01-15',
        'Start Date': '2023-01-15',
        'Salary': '85000',
        'Currency': 'USD',
        'Pay Frequency': 'annually',
        'Address': '123 Main St',
        'City': 'San Francisco',
        'State': 'CA',
        'Postal Code': '94102',
        'Country': 'United States',
        'Manager Name': 'Jane Smith',
        'Emergency Contact Name': 'Mary Doe',
        'Emergency Contact Phone': '+1 (555) 987-6543',
        'Emergency Contact Relationship': 'Spouse',
        'Photo URL': 'https://example.com/photo.jpg',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');
    
    // Set column widths
    const colWidths = Object.keys(template[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'employee_import_template.xlsx');
    toast.success('Template downloaded successfully');
  };

  const parseFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const employees = getEmployees();
      const parsedData: ImportRow[] = jsonData.map((row: any, index) => {
        const employee: Partial<Employee> = {
          
          employeeId: row['Employee ID'] || '',
          firstName: row['First Name'] || '',
          lastName: row['Last Name'] || '',
          email: row['Email'] || '',
          phone: row['Phone'] || '',
          dateOfBirth: row['Date of Birth'] || '',
          gender: (row['Gender'] || 'prefer-not-to-say') as any,
          jobTitle: row['Job Title'] || '',
          department: row['Department'] || '',
          location: row['Location'] || '',
          employmentType: (row['Employment Type'] || 'full-time') as any,
          status: (row['Status'] || 'active') as any,
          hireDate: row['Hire Date'] || '',
          startDate: row['Start Date'] || '',
          salary: parseFloat(row['Salary']) || 0,
          currency: row['Currency'] || 'USD',
          payFrequency: (row['Pay Frequency'] || 'annually') as any,
          address: row['Address'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          postalCode: row['Postal Code'] || '',
          country: row['Country'] || '',
          managerName: row['Manager Name'] || '',
          emergencyContactName: row['Emergency Contact Name'] || '',
          emergencyContactPhone: row['Emergency Contact Phone'] || '',
          emergencyContactRelationship: row['Emergency Contact Relationship'] || '',
          avatar: row['Photo URL'] || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'bulk-import',
        };

        // Check for duplicates
        const isDuplicateId = employees.some(emp => emp.employeeId === employee.employeeId);
        const isDuplicateEmail = employees.some(emp => emp.email === employee.email);

        let warning = '';
        if (isDuplicateId) warning = 'Duplicate Employee ID';
        else if (isDuplicateEmail) warning = 'Duplicate Email';

        return {
          data: employee,
          status: (isDuplicateId || isDuplicateEmail) ? 'error' : 'pending' as const,
          error: warning,
          rowNumber: index + 2,
        };
      });

      setImportData(parsedData);
      
      const duplicates = parsedData.filter(r => r.status === 'error').length;
      if (duplicates > 0) {
        toast.warning(`Parsed ${parsedData.length} records. ${duplicates} duplicates detected.`);
      } else {
        toast.success(`Parsed ${parsedData.length} employee records`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse file. Please check the format.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please select a valid Excel or CSV file');
      return;
    }

    parseFile(file);
    event.target.value = ''; // Reset input
  };

  const validateEmployee = (employee: Partial<Employee>): string | null => {
    if (!employee.employeeId) return 'Employee ID is required';
    if (!employee.firstName) return 'First name is required';
    if (!employee.lastName) return 'Last name is required';
    if (!employee.email) return 'Email is required';
    if (!employee.email?.includes('@')) return 'Invalid email format';
    if (!employee.phone) return 'Phone is required';
    if (!employee.jobTitle) return 'Job title is required';
    if (!employee.department) return 'Department is required';
    if (!employee.location) return 'Location is required';
    return null;
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    const updatedData = [...importData];

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i];
      
      // Validate
      const validationError = validateEmployee(row.data);
      if (validationError) {
        row.status = 'error';
        row.error = validationError;
        errorCount++;
        continue;
      }

      try {
        // Save employee
        saveEmployee(row.data as Employee);
        row.status = 'success';
        successCount++;
      } catch (error) {
        row.status = 'error';
        row.error = error instanceof Error ? error.message : 'Failed to save employee';
        errorCount++;
      }

      // Update UI every 10 records or at the end
      if (i % 10 === 0 || i === updatedData.length - 1) {
        setImportData([...updatedData]);
      }
    }

    setIsImporting(false);
    setImportComplete(true);

    if (errorCount === 0) {
      toast.success(`Successfully imported ${successCount} employees!`);
      onSuccess();
    } else {
      toast.warning(`Imported ${successCount} employees. ${errorCount} failed.`);
    }
  };

  const handleClose = () => {
    setImportData([]);
    setImportComplete(false);
    onOpenChange(false);
  };

  const successCount = importData.filter(r => r.status === 'success').length;
  const errorCount = importData.filter(r => r.status === 'error').length;
  const pendingCount = importData.filter(r => r.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Employees
          </DialogTitle>
          <DialogDescription>
            Import multiple employee records from Excel or CSV files
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="preview" disabled={importData.length === 0}>
              Preview ({importData.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Download the template file to see the required format. Fill in your employee data and upload it back.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="bulk-upload"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Excel (.xlsx, .xls) or CSV files
                  </p>
                </label>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">Tips for successful import:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use the template to ensure correct column names</li>
                  <li>Required fields: Employee ID, Name, Email, Phone, Job Title, Department, Location</li>
                  <li>Photo URL field accepts direct image URLs</li>
                  <li>Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
                  <li>Valid statuses: active, on-leave, notice-period, inactive</li>
                  <li>Valid employment types: full-time, part-time, contract, intern, casual</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {importData.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      Pending: {pendingCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Success: {successCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      Errors: {errorCount}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-4 space-y-2">
                {importData.map((row, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      row.status === 'success'
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                        : row.status === 'error'
                        ? 'bg-destructive/10 border-destructive/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {row.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {row.status === 'error' && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      {row.status === 'pending' && (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {row.data.firstName} {row.data.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {row.data.email} • {row.data.employeeId}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {row.data.jobTitle} - {row.data.department}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Row {row.rowNumber}
                        </span>
                      </div>
                      {row.error && (
                        <p className="text-sm text-destructive mt-2">{row.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importComplete ? 'Close' : 'Cancel'}
          </Button>
          {!importComplete && importData.length > 0 && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {importData.length} Employee{importData.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
