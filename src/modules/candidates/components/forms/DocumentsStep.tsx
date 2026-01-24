import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormDescription } from '@/shared/components/ui/form';
import { FileUpload } from '@/shared/components/ui/file-upload';
import { Button } from '@/shared/components/ui/button';
import { Loader2, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromFile, parseResume } from '@/shared/lib/resumeParser';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export function DocumentsStep({ form }: { form: UseFormReturn<any> }) {
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleResumeUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setResumeFile(file);
    
    // Store file reference for later upload
    form.setValue('resumeFile', file);
  };

  const handleParseResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a resume first');
      return;
    }

    setIsParsingResume(true);
    try {
      const text = await extractTextFromFile(resumeFile);
      const parsed = await parseResume(text);

      // Auto-fill form fields from parsed resume
      if (parsed.email && !form.getValues('email')) {
        form.setValue('email', parsed.email);
      }
      if (parsed.phone && !form.getValues('phone')) {
        form.setValue('phone', parsed.phone);
      }
      if (parsed.skills.length > 0) {
        const existingSkills = form.getValues('skills') || [];
        form.setValue('skills', [...new Set([...existingSkills, ...parsed.skills])]);
      }
      if (parsed.experienceYears && !form.getValues('experienceYears')) {
        form.setValue('experienceYears', parsed.experienceYears);
      }
      if (parsed.education && !form.getValues('education')) {
        form.setValue('education', parsed.education);
      }
      if (parsed.currentPosition && !form.getValues('currentPosition')) {
        form.setValue('currentPosition', parsed.currentPosition);
      }

      toast.success('Resume parsed successfully! Check the previous steps for auto-filled information.');
    } catch (error) {
      toast.error('Failed to parse resume');
    } finally {
      setIsParsingResume(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Documents</h3>
        <p className="text-sm text-muted-foreground">Upload candidate documents (optional)</p>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Upload a resume and click "Parse Resume" to automatically extract information and fill the form!
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormItem>
          <FormLabel>Resume / CV</FormLabel>
          <FileUpload
            onFilesSelected={handleResumeUpload}
            accept=".pdf,.doc,.docx,.txt"
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
          />
          <FormDescription>
            PDF, DOC, DOCX, or TXT format (max 10MB)
          </FormDescription>
          {resumeFile && (
            <Button
              type="button"
              onClick={handleParseResume}
              disabled={isParsingResume}
              className="mt-2"
            >
              {isParsingResume ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Parse Resume with AI
                </>
              )}
            </Button>
          )}
        </FormItem>

        <FormItem>
          <FormLabel>Cover Letter</FormLabel>
          <FileUpload
            onFilesSelected={(files) => form.setValue('coverLetterFile', files[0])}
            accept=".pdf,.doc,.docx,.txt"
            maxFiles={1}
            maxSize={5 * 1024 * 1024}
          />
          <FormDescription>
            PDF, DOC, DOCX, or TXT format (max 5MB)
          </FormDescription>
        </FormItem>

        <FormItem>
          <FormLabel>Portfolio / Additional Documents</FormLabel>
          <FileUpload
            onFilesSelected={(files) => form.setValue('portfolioFiles', files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            multiple
          />
          <FormDescription>
            Up to 5 files (max 10MB each)
          </FormDescription>
        </FormItem>
      </div>

      <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-sm">
          <p className="font-medium">Documents will be uploaded after candidate creation</p>
          <p className="text-muted-foreground">You can also add more documents later from the candidate profile.</p>
        </div>
      </div>
    </div>
  );
}