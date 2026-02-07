import React, { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Upload, FileText, ChevronRight, Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';

interface ChatDocumentUploadCardProps {
    onFileUpload: (file: File) => void;
    onSkip: () => void;
    isUploading?: boolean;
    uploadComplete?: boolean;
}

export const ChatDocumentUploadCard: React.FC<ChatDocumentUploadCardProps> = ({
    onFileUpload,
    onSkip,
    isUploading,
    uploadComplete
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            onFileUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            onFileUpload(file);
        }
    };

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Let's Create Your Job Post!</h2>
                <p className="text-muted-foreground text-base">
                    Upload a Job Description to auto-fill details, or start fresh manually.
                </p>
            </div>

            {/* Upload Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleChooseFile}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300",
                    dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/30 hover:border-primary/50",
                    isUploading && "pointer-events-none",
                    uploadComplete && "border-green-500 bg-green-50"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="space-y-3">
                        <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
                        <p className="text-base font-medium text-primary">Processing your document...</p>
                        <p className="text-sm text-muted-foreground">Extracting job details with AI</p>
                    </div>
                ) : uploadComplete ? (
                    <div className="space-y-3">
                        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                        <p className="text-base font-medium text-green-700">Document analyzed successfully!</p>
                        <p className="text-sm text-muted-foreground">We've extracted the key details for you</p>
                    </div>
                ) : selectedFile ? (
                    <div className="space-y-3">
                        <FileText className="h-10 w-10 text-primary mx-auto" />
                        <p className="text-base font-medium">{selectedFile.name}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                            }}
                            className="text-muted-foreground"
                        >
                            <X className="h-4 w-4 mr-1" /> Choose different file
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-base font-medium">Drag & drop your Job Description</p>
                        <p className="text-sm text-muted-foreground">
                            Supports PDF, Word, or Text files
                        </p>
                        <Button variant="outline" className="mt-2" onClick={(e) => { e.stopPropagation(); handleChooseFile(); }}>
                            Choose File
                        </Button>
                    </div>
                )}
            </div>

            {/* Skip Option */}
            <div className="text-center pt-2">
                <Button
                    variant="ghost"
                    onClick={onSkip}
                    disabled={isUploading}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Skip and enter details manually <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};
