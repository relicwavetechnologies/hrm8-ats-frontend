import { formatCurrency, formatCurrencyNumber } from '@/shared/lib/currencyUtils';

export interface ExportOptions {
  currencyFields?: string[];
  dateFields?: string[];
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  options?: ExportOptions
) {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        let value = row[header];

        // Format currency fields
        if (options?.currencyFields?.includes(header) && typeof value === 'number') {
          value = formatCurrency(value);
        }

        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(
  data: Record<string, unknown>[],
  title: string,
  options?: ExportOptions
) {
  // This is a placeholder for PDF export functionality
  // In a real implementation, you would use a library like jspdf
  alert('PDF export functionality requires jspdf library. CSV export is available.');
}

export function formatDataForExport(
  data: Record<string, unknown>[],
  fields: string[],
  options?: ExportOptions
) {
  return data.map(item => {
    const formatted: Record<string, unknown> = {};
    fields.forEach(field => {
      let value = item[field];

      // Format currency fields
      if (options?.currencyFields?.includes(field) && typeof value === 'number') {
        value = formatCurrency(value);
      }

      formatted[field] = value;
    });
    return formatted;
  });
}
