import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Download, Eye, FileText, Table as TableIcon, DollarSign } from 'lucide-react';
import { exportToCSV, ExportOptions } from '@/utils/exportHelpers';
import { useCurrencyFormat } from '@/app/CurrencyFormatProvider';
import { useToast } from '@/shared/hooks/use-toast';

interface ExportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  filename: string;
  fields?: string[];
  currencyFields?: string[];
  title?: string;
  description?: string;
}

export function ExportPreviewDialog({
  open,
  onOpenChange,
  data,
  filename,
  fields,
  currencyFields,
  title = "Export Preview",
  description = "Review your data before exporting"
}: ExportPreviewDialogProps) {
  const { formatCurrency, currencyFormat } = useCurrencyFormat();
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Prepare preview data
  const previewData = data.slice(0, 10); // Show first 10 rows
  
  // Filter fields if specified
  const displayData = fields
    ? previewData.map(item => {
        const filtered: any = {};
        fields.forEach(field => {
          filtered[field] = item[field];
        });
        return filtered;
      })
    : previewData;

  // Get column names
  const columns = displayData.length > 0 ? Object.keys(displayData[0]) : [];
  
  // Format cell value for display
  const formatCellValue = (value: any, columnName: string): string => {
    if (value === null || value === undefined) return 'N/A';
    
    // Format currency fields
    if (currencyFields?.includes(columnName) && typeof value === 'number') {
      return formatCurrency(value);
    }
    
    return String(value);
  };

  const handleExport = () => {
    try {
      if (exportFormat === 'csv') {
        const options: ExportOptions = {
          currencyFields: currencyFields
        };
        
        let exportData = data;
        if (fields) {
          exportData = data.map(item => {
            const filtered: any = {};
            fields.forEach(field => {
              filtered[field] = item[field];
            });
            return filtered;
          });
        }
        
        exportToCSV(exportData, filename, options);
        
        toast({
          title: "Export Successful",
          description: `${data.length} rows exported in ${currencyFormat} format`,
        });
      } else {
        // JSON export
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
          description: `${data.length} rows exported as JSON`,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Info */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{data.length}</strong> rows
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{columns.length}</strong> columns
              </span>
            </div>
            {currencyFields && currencyFields.length > 0 && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Format: <strong>{currencyFormat === 'whole' ? 'Whole Numbers' : 'Decimals'}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Currency Fields Badge */}
          {currencyFields && currencyFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Currency fields:</span>
              {currencyFields.map(field => (
                <Badge key={field} variant="secondary" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          )}

          {/* Data Preview */}
          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-2">
                Preview (showing first {Math.min(10, data.length)} of {data.length} rows)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-xs">#</th>
                      {columns.map(col => (
                        <th key={col} className="text-left p-2 font-medium text-xs whitespace-nowrap">
                          {col}
                          {currencyFields?.includes(col) && (
                            <DollarSign className="inline h-3 w-3 ml-1 text-muted-foreground" />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b hover:bg-muted/50">
                        <td className="p-2 text-xs text-muted-foreground">{rowIndex + 1}</td>
                        {columns.map(col => (
                          <td 
                            key={col} 
                            className={`p-2 text-xs ${
                              currencyFields?.includes(col) ? 'font-mono text-right' : ''
                            }`}
                          >
                            {formatCellValue(row[col], col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 10 && (
                <div className="text-xs text-muted-foreground mt-4 text-center">
                  ... and {data.length - 10} more rows
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Format Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Export as:</span>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('csv')}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportFormat('json')}
              >
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export {data.length} Rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
