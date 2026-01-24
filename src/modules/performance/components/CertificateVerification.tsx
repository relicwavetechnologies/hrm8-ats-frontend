import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { ShieldCheck, Search, CheckCircle2, XCircle, Calendar, User } from 'lucide-react';
import { verifyCertificate } from '@/shared/lib/certificateStorage';
import type { Certificate } from '@/shared/types/performance';

export function CertificateVerification() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [verificationCode, setVerificationCode] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-verify if code is in URL
  useEffect(() => {
    if (urlCode) {
      setVerificationCode(urlCode);
      verifyCode(urlCode);
    }
  }, [urlCode]);

  const verifyCode = (code: string) => {
    if (!code) return;

    setIsVerifying(true);
    setNotFound(false);
    
    setTimeout(() => {
      const cert = verifyCertificate(code.toUpperCase());
      if (cert) {
        setCertificate(cert);
      } else {
        setNotFound(true);
        setCertificate(null);
      }
      setIsVerifying(false);
    }, 500);
  };

  const handleVerify = () => {
    verifyCode(verificationCode);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Certificate</CardTitle>
          <CardDescription>
            Enter the verification code to validate certificate authenticity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="XXXX-XXXX-XXXX"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="font-mono uppercase"
              />
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !verificationCode}
              >
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          </div>

          {certificate && (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle className="text-lg">Valid Certificate</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{certificate.title}</h3>
                  <p className="text-sm text-muted-foreground">{certificate.description}</p>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Issued To</p>
                      <p className="text-sm text-muted-foreground">{certificate.employeeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Issue Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {certificate.expiryDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Expiry Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(certificate.expiryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {certificate.certificateData.courseName && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Course Details</p>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {certificate.certificateData.courseName}
                      </p>
                      {certificate.certificateData.score && (
                        <p className="text-sm">
                          Score: <span className="font-medium">{certificate.certificateData.score}%</span>
                        </p>
                      )}
                      {certificate.certificateData.hours && (
                        <p className="text-sm text-muted-foreground">
                          {certificate.certificateData.hours} hours
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Issuer</p>
                  <p className="text-sm text-muted-foreground">{certificate.issuer}</p>
                  <p className="text-sm text-muted-foreground">{certificate.issuerSignature}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {notFound && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Certificate Not Found</p>
                    <p className="text-sm">
                      The verification code you entered is invalid or the certificate does not exist.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Certificate Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Our certificate verification system ensures the authenticity of all issued certificates.
            Each certificate contains a unique verification code that can be used to confirm its validity.
          </p>
          <p>
            If you have received a certificate, you can find the verification code at the bottom of the PDF document.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
