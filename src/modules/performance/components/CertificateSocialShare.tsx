import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Share2, Download, Linkedin, Twitter, Link2, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { Certificate } from '@/shared/types/performance';
import { getCertificateTemplate } from '@/shared/lib/certificateStorage';
import { generateCertificateImage } from '@/shared/lib/certificateImageGenerator';
import { toast } from 'sonner';

interface CertificateSocialShareProps {
  certificate: Certificate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeePhotoUrl?: string;
}

export function CertificateSocialShare({ certificate, open, onOpenChange, employeePhotoUrl }: CertificateSocialShareProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!certificate) return;
    
    setIsGenerating(true);
    try {
      const template = getCertificateTemplate('template-1') || {
        id: 'professional',
        name: 'Professional',
        type: 'professional',
        layout: 'landscape' as const,
        colors: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#fbbf24'
        }
      };
      
      // Generate image with employee photo if available
      const url = await generateCertificateImage(certificate, template, employeePhotoUrl);
      setImageUrl(url);
      toast.success('Certificate image generated!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate certificate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLinkedInShare = () => {
    if (!certificate) return;
    
    const text = `🎓 I'm excited to share that I've earned: ${certificate.title}\n\n${certificate.description}`;
    const url = certificate.credentialUrl;
    
    // LinkedIn share URL
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
    
    toast.success('Opening LinkedIn share dialog...');
  };

  const handleTwitterShare = () => {
    if (!certificate) return;
    
    const text = `🎓 Just earned: ${certificate.title}!\n\nVerify: ${certificate.credentialUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=600');
    toast.success('Opening Twitter share dialog...');
  };

  const handleCopyLink = () => {
    if (!certificate) return;
    
    navigator.clipboard.writeText(certificate.credentialUrl);
    toast.success('Certificate link copied to clipboard!');
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) {
      await generateImage();
      return;
    }

    // Download the image
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `certificate-${certificate?.verificationCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Certificate image downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Achievement
          </DialogTitle>
          <DialogDescription>
            Share your certificate on social media or download it as an image
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="image">Download Image</TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-3">
              {/* LinkedIn Share */}
              <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={handleLinkedInShare}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-[#0077B5] p-3">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Share on LinkedIn</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your achievement with your professional network
                    </p>
                  </div>
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Twitter Share */}
              <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={handleTwitterShare}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-[#1DA1F2] p-3">
                    <Twitter className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Share on Twitter</h4>
                    <p className="text-sm text-muted-foreground">
                      Tweet about your new certification
                    </p>
                  </div>
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Copy Link */}
              <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={handleCopyLink}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-muted p-3">
                    <Link2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Copy Link</h4>
                    <p className="text-sm text-muted-foreground">
                      Copy verification link to share anywhere
                    </p>
                  </div>
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>

            {certificate && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Verification Link:</p>
                <code className="text-xs bg-background p-2 rounded block break-all">
                  {certificate.credentialUrl}
                </code>
              </div>
            )}
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-4">
              {!imageUrl ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h4 className="font-semibold mb-2">Generate Social Media Image</h4>
                    <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                      Create a high-quality image of your certificate perfect for sharing on social media platforms
                    </p>
                    <Button onClick={generateImage} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img 
                      src={imageUrl} 
                      alt="Certificate preview" 
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleDownloadImage} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                    <Button variant="outline" onClick={generateImage} disabled={isGenerating}>
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Regenerate'
                      )}
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <p className="font-medium mb-1">Tips for social media:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>LinkedIn: Best for professional achievements and career updates</li>
                      <li>Twitter: Share with relevant hashtags like #Learning #Certificate</li>
                      <li>Instagram: Use the image in your story or post</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
