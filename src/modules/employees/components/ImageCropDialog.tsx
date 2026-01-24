import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Loader2 } from 'lucide-react';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
}

const ASPECT_RATIOS = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  'free': undefined,
};

export function ImageCropDialog({ open, onOpenChange, imageSrc, onCropComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspectRatio, setAspectRatio] = useState<keyof typeof ASPECT_RATIOS>('1:1');
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset crop when image changes
  useEffect(() => {
    if (open) {
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10,
      });
      setCompletedCrop(null);
    }
  }, [open, imageSrc]);

  const handleAspectRatioChange = (value: keyof typeof ASPECT_RATIOS) => {
    setAspectRatio(value);
    
    // Update crop to match new aspect ratio
    if (value !== 'free' && imgRef.current) {
      const { width, height } = imgRef.current;
      const newAspect = ASPECT_RATIOS[value];
      
      if (newAspect) {
        const newCrop: Crop = {
          unit: '%',
          width: 80,
          height: 80 / newAspect,
          x: 10,
          y: 10,
        };
        
        // Adjust if crop exceeds image bounds
        if (newCrop.height > 80) {
          newCrop.height = 80;
          newCrop.width = 80 * newAspect;
        }
        
        setCrop(newCrop);
      }
    }
  };

  const getCroppedImg = async (): Promise<string> => {
    if (!imgRef.current || !completedCrop) {
      return imageSrc;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to cropped area
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(imageSrc);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!completedCrop) {
      onCropComplete(imageSrc);
      onOpenChange(false);
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg();
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Crop Photo</DialogTitle>
          <DialogDescription>
            Adjust the crop area and aspect ratio for the employee photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="min-w-[100px]">Aspect Ratio:</Label>
            <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="4:3">Portrait (4:3)</SelectItem>
                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                <SelectItem value="free">Free Form</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[400px]">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIOS[aspectRatio]}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-full max-h-[500px] object-contain"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const aspect = ASPECT_RATIOS[aspectRatio];
                  
                  if (aspect) {
                    const width = 80;
                    const height = width / aspect;
                    
                    setCrop({
                      unit: '%',
                      width,
                      height: Math.min(height, 80),
                      x: 10,
                      y: 10,
                    });
                  }
                }}
              />
            </ReactCrop>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Drag the corners to adjust the crop area</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Save Photo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
