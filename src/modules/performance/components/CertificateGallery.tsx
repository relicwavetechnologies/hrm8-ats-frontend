import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Award, Download, Share2, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import type { Certificate } from '@/shared/types/performance';
import { getCertificates } from '@/shared/lib/certificateStorage';
import { getCertificateTemplate } from '@/shared/lib/certificateStorage';
import { downloadCertificate, previewCertificate } from './CertificateGenerator';
import { CertificateSocialShare } from './CertificateSocialShare';
import { toast } from 'sonner';
import { getEmployeeById } from '@/shared/lib/employeeStorage';

interface CertificateGalleryProps {
  employeeId: string;
}

export function CertificateGallery({ employeeId }: CertificateGalleryProps) {
  const [certificates] = useState<Certificate[]>(getCertificates(employeeId));
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [certificateToShare, setCertificateToShare] = useState<Certificate | null>(null);
  
  const employee = getEmployeeById(employeeId);
  const employeePhotoUrl = employee?.avatar;

  const handlePreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    const template = getCertificateTemplate('template-1');
    if (template) {
      const url = previewCertificate(certificate, template);
      setPreviewUrl(url);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    const template = getCertificateTemplate('template-1');
    if (template) {
      downloadCertificate(certificate, template);
      toast.success('Certificate downloaded successfully!');
    }
  };

  const handleShare = (certificate: Certificate) => {
    setCertificateToShare(certificate);
    setShareDialogOpen(true);
  };

  const getCertificateTypeLabel = (type: Certificate['type']) => {
    switch (type) {
      case 'course': return 'Course Completion';
      case 'certification': return 'Professional Certification';
      case 'skill-mastery': return 'Skill Mastery';
      case 'program-completion': return 'Program Completion';
      default: return type;
    }
  };

  const getCertificateTypeColor = (type: Certificate['type']) => {
    switch (type) {
      case 'course': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'certification': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'skill-mastery': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'program-completion': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Award className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No Certificates Yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Complete courses and earn certifications to build your professional credentials gallery.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <Card key={cert.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Award className="h-10 w-10 text-primary" />
                <Badge className={getCertificateTypeColor(cert.type)} variant="secondary">
                  {getCertificateTypeLabel(cert.type)}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-4">{cert.title}</CardTitle>
              <CardDescription className="line-clamp-2">{cert.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cert.certificateData.courseName && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Course:</span>{' '}
                    <span className="font-medium">{cert.certificateData.courseName}</span>
                  </div>
                )}
                
                {cert.certificateData.score && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{cert.certificateData.score}% Score</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(cert.issueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handlePreview(cert)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(cert)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(cert)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCertificate?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[600px] border rounded-lg"
                title="Certificate Preview"
              />
            )}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => selectedCertificate && handleDownload(selectedCertificate)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedCertificate && handleShare(selectedCertificate)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Share Dialog */}
      <CertificateSocialShare
        certificate={certificateToShare}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        employeePhotoUrl={employeePhotoUrl}
      />
    </>
  );
}
