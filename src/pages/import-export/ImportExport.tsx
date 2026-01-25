import { useState } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/shared/components/layouts/AtsPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Upload,
  Download,
  Users,
  Briefcase,
  FileSpreadsheet,
  History,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ImportWizard } from "@/shared/components/import-export/ImportWizard";
import { exportToExcel, exportToCSV, ImportField } from "@/shared/lib/importExportService";
import { useToast } from "@/shared/hooks/use-toast";

export default function ImportExport() {
  const { toast } = useToast();
  const [importType, setImportType] = useState<'candidates' | 'jobs' | null>(null);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  const handleStartImport = (type: 'candidates' | 'jobs') => {
    setImportType(type);
    setImportWizardOpen(true);
  };

  const handleImport = async (
    data: any[],
    mapping: ImportField[],
    duplicateAction: 'skip' | 'update' | 'create'
  ) => {
    // Transform data based on mapping
    const transformedData = data.map((row) => {
      const transformed: any = {};
      mapping.forEach((field) => {
        if (field.sourceColumn && row[field.sourceColumn]) {
          let value = row[field.sourceColumn];
          if (field.transform) {
            value = field.transform(value);
          }
          transformed[field.targetField] = value;
        }
      });
      return transformed;
    });

    // In a real app, this would save to database
    // Simulate import delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleExportCandidates = (format: 'excel' | 'csv') => {
    // Mock candidate data
    const candidates = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-0123',
        location: 'New York',
        currentRole: 'Software Engineer',
        experience: 5,
        skills: ['React', 'TypeScript', 'Node.js'],
      },
    ];

    const fields = ['name', 'email', 'phone', 'location', 'currentRole', 'experience', 'skills'];

    if (format === 'excel') {
      exportToExcel(candidates, fields, 'candidates');
    } else {
      exportToCSV(candidates, fields, 'candidates');
    }

    toast({
      title: "Export completed",
      description: `Candidates exported to ${format.toUpperCase()}`,
    });
  };

  const handleExportJobs = (format: 'excel' | 'csv') => {
    // Mock job data
    const jobs = [
      {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        description: 'We are looking for a senior engineer...',
        salaryMin: 120000,
        salaryMax: 180000,
        workArrangement: 'hybrid',
      },
    ];

    const fields = [
      'title',
      'department',
      'location',
      'employmentType',
      'experienceLevel',
      'description',
      'salaryMin',
      'salaryMax',
      'workArrangement',
    ];

    if (format === 'excel') {
      exportToExcel(jobs, fields, 'jobs');
    } else {
      exportToCSV(jobs, fields, 'jobs');
    }

    toast({
      title: "Export completed",
      description: `Jobs exported to ${format.toUpperCase()}`,
    });
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Import & Export"
          subtitle="Bulk import and export candidates and jobs"
        />

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList>
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Import Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Bulk import candidate profiles from CSV or Excel files with intelligent
                    field mapping and duplicate detection.
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Field mapping wizard
                    </li>
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Duplicate detection
                    </li>
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Data validation
                    </li>
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Preview before import
                    </li>
                  </ul>
                  <Button onClick={() => handleStartImport('candidates')} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Import Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Bulk import job postings from CSV or Excel files with automatic
                    validation and error reporting.
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Field mapping wizard
                    </li>
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Duplicate detection
                    </li>
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Data validation
                    </li>
                    <li className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Preview before import
                    </li>
                  </ul>
                  <Button onClick={() => handleStartImport('jobs')} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Export Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Export all candidate data to CSV or Excel format for backup or analysis.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExportCandidates('excel')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportCandidates('csv')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Export Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Export all job postings to CSV or Excel format for backup or sharing.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExportJobs('excel')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportJobs('csv')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Import History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No import history yet</p>
                  <p className="text-sm">Your import operations will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {importType && (
          <ImportWizard
            open={importWizardOpen}
            onOpenChange={setImportWizardOpen}
            type={importType}
            existingData={[]}
            onImport={handleImport}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
