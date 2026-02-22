import React, { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { Upload, FileText, ChevronRight, X, Loader2, CheckCircle2 } from 'lucide-react';

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

            {/* Upload Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleChooseFile}
                className={cn(
                    "relative border border-dashed rounded-md p-6 text-center cursor-pointer transition-all duration-200",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-foreground/40",
                    isUploading && "pointer-events-none",
                    uploadComplete && "border-green-500/60 bg-green-50/40"
                )}
            >
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="space-y-2">
                        <Loader2 className="h-7 w-7 text-primary mx-auto animate-spin" />
                        <p className="text-sm font-medium">Processing document...</p>
                        <p className="text-xs text-muted-foreground">Extracting details with AI</p>
                    </div>
                ) : uploadComplete ? (
                    <div className="space-y-2">
                        <CheckCircle2 className="h-7 w-7 text-green-600 mx-auto" />
                        <p className="text-sm font-medium">Document analyzed successfully</p>
                        <p className="text-xs text-muted-foreground">Key fields are prefilled</p>
                    </div>
                ) : selectedFile ? (
                    <div className="space-y-2">
                        <FileText className="h-7 w-7 text-foreground mx-auto" />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                            }}
                            className="text-xs text-muted-foreground h-7"
                        >
                            <X className="h-4 w-4 mr-1" /> Choose different file
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Upload className="h-7 w-7 text-muted-foreground mx-auto" />
                        <p className="text-sm font-medium">Drag and drop job description</p>
                        <p className="text-xs text-muted-foreground">
                            Supports PDF, Word, or Text files
                        </p>
                        <Button variant="outline" className="mt-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); handleChooseFile(); }}>
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
                    className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                    Skip and enter details manually <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};
