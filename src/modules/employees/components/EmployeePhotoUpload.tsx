import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Camera, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { ImageCropDialog } from './ImageCropDialog';

interface EmployeePhotoUploadProps {
  photo?: string;
  name: string;
  onPhotoChange: (photo: string | undefined) => void;
}

export function EmployeePhotoUpload({ photo, name, onPhotoChange }: EmployeePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validateAndProcessFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToCrop(result);
        setCropDialogOpen(true);
        setIsLoading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload photo');
      setIsLoading(false);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    onPhotoChange(croppedImage);
    toast.success('Photo uploaded successfully');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await validateAndProcessFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await validateAndProcessFile(file);
  };

  const handleRemovePhoto = () => {
    onPhotoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Photo removed');
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-24 w-24 shrink-0">
        <AvatarImage src={photo} alt={name} />
        <AvatarFallback className="text-xl">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
            "hover:border-primary hover:bg-accent/50",
            isDragging && "border-primary bg-accent border-solid",
            isLoading && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={cn(
              "rounded-full p-3 transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              {isDragging ? (
                <Upload className="h-6 w-6 text-primary" />
              ) : (
                <Camera className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium">
                {isDragging ? 'Drop photo here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {photo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePhoto();
              }}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Photo
            </Button>
          )}
        </div>
      </div>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
