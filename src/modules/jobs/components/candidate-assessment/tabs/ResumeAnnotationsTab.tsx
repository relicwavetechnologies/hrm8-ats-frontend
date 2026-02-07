import { useEffect, useState } from 'react';
import { ResumeAnnotations } from '../ResumeAnnotations';
import { applicationService } from '@/shared/lib/applicationService';
import { Loader2, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ResumeAnnotationsTabProps {
  candidateId: string; // Note: This is actually the application ID in the current usage
}

export function ResumeAnnotationsTab({ candidateId }: ResumeAnnotationsTabProps) {
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeId, setResumeId] = useState<string>('');
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!candidateId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch resume using application ID
        const response = await applicationService.getApplicationResume(candidateId);
        
        if (response.success && response.data) {
          setResumeUrl(response.data.fileUrl || '');
          setResumeId(response.data.id);
          if (response.data.content) {
            setResumeText(response.data.content);
          } else {
            setError('Resume content is not available for text annotations.');
          }
        } else {
          setError('Failed to load resume.');
        }
      } catch (err) {
        console.error('Error loading resume:', err);
        setError('An error occurred while loading the resume.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="p-4 rounded-full bg-muted text-muted-foreground">
          <FileText className="h-8 w-8" /> 
        </div>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        {resumeUrl && (
          <Button variant="outline" asChild>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Original Resume
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (!resumeText) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <p>No resume text available for annotation.</p>
        <p className="text-xs mt-2">Resume ID: {resumeId || 'None'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-2 rounded text-xs font-mono text-muted-foreground mb-4">
        DEBUG: Resume ID: {resumeId} | Length: {resumeText.length} chars
      </div>
      <ResumeAnnotations
        candidateId={resumeId}
        resumeText={resumeText}
      />
    </div>
  );
}
