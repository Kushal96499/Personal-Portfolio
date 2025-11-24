import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadImage, deleteImage } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
    label: string;
    folder: string; // Storage folder (e.g., 'blogs', 'projects')
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    onImageRemoved?: () => void;
    accept?: string;
    maxSizeMB?: number;
}

export const ImageUpload = ({
    label,
    folder,
    currentImageUrl,
    onImageUploaded,
    onImageRemoved,
    accept = 'image/*',
    maxSizeMB = 5
}: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            toast.error(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        try {
            setUploading(true);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Supabase
            const publicUrl = await uploadImage(folder, file);
            onImageUploaded(publicUrl);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!currentImageUrl) return;

        try {
            await deleteImage(currentImageUrl);
            setPreview(null);
            if (onImageRemoved) {
                onImageRemoved();
            }
            toast.success('Image removed');
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Failed to remove image');
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <div className="space-y-3">
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border border-border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        <div className="flex flex-col items-center gap-2">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Click to upload</p>
                                        <p className="text-xs text-muted-foreground">
                                            Max {maxSizeMB}MB • PNG, JPG, WEBP
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                {!preview && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                    </Button>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                Recommended: High quality images for best display
            </p>
        </div>
    );
};
