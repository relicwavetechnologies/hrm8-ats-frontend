import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Download, FileText, Table, Eye, Save, FolderOpen } from "lucide-react";
import { exportToCSV, ExportOptions } from "@/utils/exportHelpers";
import { ExportPreviewDialog } from "./ExportPreviewDialog";
import { ExportTemplateDialog } from "./ExportTemplateDialog";
import { ExportTemplateManager } from "./ExportTemplateManager";
import { ExportTemplate } from "@/shared/lib/exportTemplateStorage";
import { useToast } from "@/shared/hooks/use-toast";

interface ExportButtonProps {
  data: any[];
  filename: string;
  fields?: string[];
  currencyFields?: string[];
  showPreview?: boolean;
  showTemplates?: boolean;
  availableFields?: string[];
}

export function ExportButton({ 
  data, 
  filename, 
  fields, 
  currencyFields,
  showPreview = true,
  showTemplates = true,
  availableFields
}: ExportButtonProps) {
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [manageTemplatesOpen, setManageTemplatesOpen] = useState(false);
  const [currentFields, setCurrentFields] = useState<string[] | undefined>(fields);
  const [currentCurrencyFields, setCurrentCurrencyFields] = useState<string[] | undefined>(currencyFields);

  // Get available fields from data if not provided
  const fieldsList = availableFields || (data.length > 0 ? Object.keys(data[0]) : []);

  const handleExportCSV = () => {
    try {
      let exportData = data;
      if (currentFields) {
        exportData = data.map(item => {
          const filtered: any = {};
          currentFields.forEach(field => {
            filtered[field] = item[field];
          });
          return filtered;
        });
      }
      
      const options: ExportOptions = {
        currencyFields: currentCurrencyFields
      };
      
      exportToCSV(exportData, filename, options);
      
      toast({
        title: "Export Successful",
        description: `${filename} exported as CSV with your currency format preference`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSaveTemplate = () => {
    setSaveTemplateOpen(true);
  };

  const handleManageTemplates = () => {
    setManageTemplatesOpen(true);
  };

  const handleTemplateSelect = (template: ExportTemplate) => {
    setCurrentFields(template.fields);
    setCurrentCurrencyFields(template.currencyFields);
    
    toast({
      title: "Template Applied",
      description: `Using "${template.name}" configuration`,
    });
  };

  const handleExportJSON = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `${filename} exported as JSON`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background z-50">
          {showPreview && (
            <DropdownMenuItem onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview & Export
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleExportCSV}>
            <Table className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            <FileText className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          
          {showTemplates && fieldsList.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManageTemplates}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Templates
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={data}
        filename={filename}
        fields={currentFields}
        currencyFields={currentCurrencyFields}
      />

      {showTemplates && fieldsList.length > 0 && (
        <>
          <ExportTemplateDialog
            open={saveTemplateOpen}
            onOpenChange={setSaveTemplateOpen}
            availableFields={fieldsList}
          />

          <ExportTemplateManager
            open={manageTemplatesOpen}
            onOpenChange={setManageTemplatesOpen}
            availableFields={fieldsList}
            onTemplateSelect={handleTemplateSelect}
          />
        </>
      )}
    </>
  );
}
