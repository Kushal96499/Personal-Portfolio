import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using placeholder values.');
}

// Use placeholder values if env vars are missing to prevent app crash
export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
);

// Storage bucket name
const STORAGE_BUCKET = 'portfolio-assets';

/**
 * Upload an image to Supabase Storage
 * @param folder - Folder path within the bucket (e.g., 'blogs', 'projects')
 * @param file - File to upload
 * @param fileName - Optional custom file name (auto-generated if not provided)
 * @returns Public URL of the uploaded image
 */
export const uploadImage = async (
    folder: string,
    file: File,
    fileName?: string
): Promise<string> => {
    try {
        // Generate unique file name if not provided
        const timestamp = Date.now();
        const sanitizedName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${folder}/${timestamp}_${sanitizedName}`;

        // Upload file
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - Full public URL of the image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split(`/object/public/${STORAGE_BUCKET}/`);

        if (pathParts.length < 2) {
            throw new Error('Invalid image URL');
        }

        const filePath = pathParts[1];

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw error - image might already be deleted
    }
};

/**
 * Get public URL for a file in storage
 * @param filePath - Path to file within the bucket
 * @returns Public URL
 */
export const getPublicUrl = (filePath: string): string => {
    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return publicUrl;
};
