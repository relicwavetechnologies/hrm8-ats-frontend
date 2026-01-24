export interface Offer {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  salary: number;
  currency: string;
  salaryPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  startDate: string;
  benefits: string[];
  additionalTerms?: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  sentDate?: string;
  responseDate?: string;
  expiryDate?: string;
  rejectionReason?: string;
  negotiationNotes?: string[];
  approvals: OfferApproval[];
  documents: OfferDocument[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferApproval {
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp?: string;
}

export interface OfferDocument {
  id: string;
  name: string;
  type: 'offer_letter' | 'contract' | 'benefits_summary' | 'other';
  url: string;
  uploadedAt: string;
}

// Mock data
const mockOffers: Offer[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'c1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.j@email.com',
    salary: 135000,
    currency: 'USD',
    salaryPeriod: 'annual',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    benefits: [
      'Health Insurance',
      '401(k) Matching',
      'Unlimited PTO',
      'Remote Work Options',
      'Professional Development Budget',
    ],
    status: 'pending',
    sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvals: [
      {
        approverId: 'a1',
        approverName: 'John Doe',
        approverRole: 'Hiring Manager',
        status: 'approved',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        approverId: 'a2',
        approverName: 'Jane Smith',
        approverRole: 'HR Director',
        status: 'approved',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    documents: [
      {
        id: 'd1',
        name: 'Offer Letter.pdf',
        type: 'offer_letter',
        url: '#',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdBy: 'u1',
    createdByName: 'Admin User',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Product Manager',
    candidateId: 'c3',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.r@email.com',
    salary: 145000,
    currency: 'USD',
    salaryPeriod: 'annual',
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    benefits: [
      'Health Insurance',
      '401(k) Matching',
      'Equity Package',
      'Flexible Hours',
    ],
    status: 'accepted',
    sentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    responseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvals: [
      {
        approverId: 'a1',
        approverName: 'John Doe',
        approverRole: 'Hiring Manager',
        status: 'approved',
        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    documents: [],
    createdBy: 'u1',
    createdByName: 'Admin User',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getOffers(filters?: {
  jobId?: string;
  candidateId?: string;
  status?: Offer['status'];
}): Offer[] {
  let filtered = [...mockOffers];

  if (filters?.jobId) {
    filtered = filtered.filter((o) => o.jobId === filters.jobId);
  }
  if (filters?.candidateId) {
    filtered = filtered.filter((o) => o.candidateId === filters.candidateId);
  }
  if (filters?.status) {
    filtered = filtered.filter((o) => o.status === filters.status);
  }

  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createOffer(
  offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>
): Offer {
  const newOffer: Offer = {
    ...offer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockOffers.push(newOffer);
  return newOffer;
}

export function updateOffer(
  id: string,
  updates: Partial<Offer>
): Offer | null {
  const index = mockOffers.findIndex((o) => o.id === id);
  if (index === -1) return null;

  mockOffers[index] = {
    ...mockOffers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockOffers[index];
}

export function acceptOffer(id: string): Offer | null {
  return updateOffer(id, {
    status: 'accepted',
    responseDate: new Date().toISOString(),
  });
}

export function rejectOffer(id: string, reason?: string): Offer | null {
  return updateOffer(id, {
    status: 'rejected',
    responseDate: new Date().toISOString(),
    rejectionReason: reason,
  });
}

export function withdrawOffer(id: string): Offer | null {
  return updateOffer(id, { status: 'withdrawn' });
}

export function addNegotiationNote(id: string, note: string): Offer | null {
  const offer = mockOffers.find((o) => o.id === id);
  if (!offer) return null;

  const notes = [...(offer.negotiationNotes || []), note];
  return updateOffer(id, { negotiationNotes: notes });
}

export function getOfferStats(jobId?: string) {
  const offers = jobId ? getOffers({ jobId }) : mockOffers;

  return {
    total: offers.length,
    pending: offers.filter((o) => o.status === 'pending').length,
    accepted: offers.filter((o) => o.status === 'accepted').length,
    rejected: offers.filter((o) => o.status === 'rejected').length,
    withdrawn: offers.filter((o) => o.status === 'withdrawn').length,
    acceptanceRate: offers.length > 0
      ? Math.round((offers.filter((o) => o.status === 'accepted').length / offers.length) * 100)
      : 0,
  };
}
import jsPDF from 'jspdf';
import { OfferLetter } from '@/shared/types/offer';

export function generateOfferPDF(offer: OfferLetter): void {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Employment Offer Letter', 105, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Candidate Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Information', 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${offer.candidateName}`, 20, 58);
  doc.text(`Email: ${offer.candidateEmail}`, 20, 64);
  
  // Position Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Position Details', 20, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Position: ${offer.jobTitle}`, 20, 88);
  doc.text(`Employment Type: ${offer.offerType}`, 20, 94);
  doc.text(`Start Date: ${new Date(offer.startDate).toLocaleDateString()}`, 20, 100);
  
  // Compensation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Compensation', 20, 116);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Salary: ${offer.salaryCurrency} ${offer.salary.toLocaleString()} per ${offer.salaryPeriod}`, 20, 124);
  
  if (offer.bonusStructure) {
    doc.text(`Bonus: ${offer.bonusStructure}`, 20, 130);
  }
  
  // Work Arrangement
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Work Details', 20, 146);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Location: ${offer.workLocation}`, 20, 154);
  doc.text(`Arrangement: ${offer.workArrangement}`, 20, 160);
  
  if (offer.probationPeriod) {
    doc.text(`Probation Period: ${offer.probationPeriod} months`, 20, 166);
  }
  
  if (offer.vacationDays) {
    doc.text(`Vacation Days: ${offer.vacationDays} days per year`, 20, 172);
  }
  
  // Benefits
  if (offer.benefits && offer.benefits.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Benefits', 20, 188);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let yPos = 196;
    offer.benefits.forEach((benefit, index) => {
      doc.text(`• ${benefit}`, 25, yPos);
      yPos += 6;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
  
  // Custom Message
  if (offer.customMessage) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Information', 20, 230);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitMessage = doc.splitTextToSize(offer.customMessage, 170);
    doc.text(splitMessage, 20, 238);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This offer is contingent upon successful completion of background checks and reference verification.', 105, 280, { align: 'center' });
  
  // Download
  doc.save(`Offer_Letter_${offer.candidateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
