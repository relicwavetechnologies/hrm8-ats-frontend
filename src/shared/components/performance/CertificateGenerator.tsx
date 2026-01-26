import { jsPDF } from 'jspdf';
import type { Certificate, CertificateTemplate } from '@/types/performance';

export function generateCertificatePDF(certificate: Certificate, template: CertificateTemplate): jsPDF {
  // Create PDF in landscape orientation
  const pdf = new jsPDF({
    orientation: template.layout,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = template.layout === 'landscape' ? 297 : 210;
  const pageHeight = template.layout === 'landscape' ? 210 : 297;

  // Background
  if (template.backgroundPattern === 'gradient') {
    pdf.setFillColor(template.colors.primary);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setFillColor(template.colors.secondary);
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  }

  // Border
  pdf.setDrawColor(template.colors.primary);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(template.colors.accent);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Title
  pdf.setFontSize(32);
  pdf.setTextColor(template.colors.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE', pageWidth / 2, 40, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('OF ' + certificate.description.toUpperCase(), pageWidth / 2, 52, { align: 'center' });

  // Decorative line
  pdf.setDrawColor(template.colors.accent);
  pdf.setLineWidth(1);
  pdf.line(pageWidth / 2 - 40, 58, pageWidth / 2 + 40, 58);

  // Recipient section
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This certificate is proudly presented to', pageWidth / 2, 75, { align: 'center' });

  pdf.setFontSize(28);
  pdf.setTextColor(template.colors.secondary);
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificate.employeeName, pageWidth / 2, 90, { align: 'center' });

  // Achievement details
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('helvetica', 'normal');
  const detailsY = 105;
  
  if (certificate.type === 'course' && certificate.certificateData.courseName) {
    pdf.text('For successfully completing', pageWidth / 2, detailsY, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(template.colors.primary);
    pdf.text(certificate.certificateData.courseName, pageWidth / 2, detailsY + 8, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    
    if (certificate.certificateData.score) {
      pdf.text(`with a score of ${certificate.certificateData.score}%`, pageWidth / 2, detailsY + 16, { align: 'center' });
    }
    
    if (certificate.certificateData.hours) {
      pdf.text(`Total learning time: ${certificate.certificateData.hours} hours`, pageWidth / 2, detailsY + 24, { align: 'center' });
    }
  } else {
    pdf.text('For achieving', pageWidth / 2, detailsY, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(template.colors.primary);
    pdf.text(certificate.title, pageWidth / 2, detailsY + 8, { align: 'center' });
  }

  // Date and signature section
  const signatureY = pageHeight - 50;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('helvetica', 'normal');
  
  // Date
  pdf.text('Date Issued', pageWidth / 4, signatureY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificate.issueDate.toLocaleDateString(), pageWidth / 4, signatureY + 6);
  
  // Signature
  pdf.setFont('helvetica', 'normal');
  pdf.text('Authorized By', (pageWidth / 4) * 3, signatureY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificate.issuerSignature, (pageWidth / 4) * 3, signatureY + 6);
  
  // Signature lines
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 4 - 20, signatureY + 10, pageWidth / 4 + 20, signatureY + 10);
  pdf.line((pageWidth / 4) * 3 - 20, signatureY + 10, (pageWidth / 4) * 3 + 20, signatureY + 10);

  // Verification code at bottom
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Certificate ID: ${certificate.verificationCode}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  pdf.text(`Verify at: ${certificate.credentialUrl}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  return pdf;
}

export function downloadCertificate(certificate: Certificate, template: CertificateTemplate): void {
  const pdf = generateCertificatePDF(certificate, template);
  const fileName = `${certificate.employeeName.replace(/\s+/g, '_')}_${certificate.type}_${certificate.id}.pdf`;
  pdf.save(fileName);
}

export function previewCertificate(certificate: Certificate, template: CertificateTemplate): string {
  const pdf = generateCertificatePDF(certificate, template);
  return pdf.output('dataurlstring');
}
