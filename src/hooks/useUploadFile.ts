import { useState } from "react";
import { supabase } from "src/supabase.ts";
import { v4 as uuidv4 } from "uuid";

interface UploadOptions {
    file: File;
    bucket: string;
    folder?: string;
    fileName?: string;
}

export const useUploadFile = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
        try {
            // Check if bucket exists
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.some(
                (bucket) => bucket.name === bucketName,
            );

            if (!bucketExists) {
                // Create the bucket if it doesn't exist
                const { error } = await supabase.storage.createBucket(
                    bucketName,
                    {
                        public: true, // Make the bucket public
                    },
                );

                if (error) throw error;
            }

            return true;
        } catch (err) {
            console.error("Error ensuring bucket exists:", err);
            return false;
        }
    };

    const uploadToS3 = async (file: File) => {
        const fileName = encodeURIComponent(file.name);
        const url = `${import.meta.env.VITE_S3_BUCKET_URL}${fileName}`;

        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file,
        });

        console.log("Upload successful:", { url });
        return url;
    };

    const uploadFile = async (
        options: UploadOptions,
    ): Promise<string | null> => {
        const { file, bucket, folder = "", fileName } = options;

        if (!file) return null;

        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        try {
            // Ensure the bucket exists
            const bucketExists = await ensureBucketExists(bucket);
            if (!bucketExists) {
                throw new Error(`Failed to create or access bucket: ${bucket}`);
            }

            // Create a unique file name
            const fileExt = file.name.split(".").pop();
            const finalFileName = fileName || `${uuidv4()}.${fileExt}`;
            const filePath = folder
                ? `${folder}/${finalFileName}`
                : finalFileName;

            // Upload file to Supabase Storage
            const { error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: "3600",
                    // contentType: "audio/midi",
                    upsert: false,
                });

            if (error) throw error;

            // Update progress to 100% when upload is complete
            setUploadProgress(100);

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to upload file";
            setUploadError(errorMessage);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading, uploadError, uploadProgress, uploadToS3 };
};
