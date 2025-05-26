import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface UploadOptions {
    file: File;
    bucket?: string; // Now optional since we're not using Supabase buckets
    folder?: string;
    fileName?: string;
    fileType?: "audio" | "midi" | "other";
}

export const useUploadFile = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadToS3 = async (
        file: File,
        fileType: "audio" | "midi" | "other" = "other",
    ) => {
        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        try {
            // Create a unique file name
            const fileExt = file.name.split(".").pop();
            const uniqueFileName = `${uuidv4()}.${fileExt}`;

            // Determine the S3 bucket URL based on file type
            let s3BucketUrl = import.meta.env.VITE_S3_BUCKET_URL || "";

            // Use different bucket for audio files
            if (fileType === "audio") {
                s3BucketUrl =
                    import.meta.env.VITE_AUDIO_BUCKET_URL ||
                    import.meta.env.VITE_S3_BUCKET_URL ||
                    "";
            }

            // Construct the final URL
            const url = `${s3BucketUrl}${uniqueFileName}`;

            // Upload progress simulation (actual progress tracking would require a different API)
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    const nextProgress = prev + 10;
                    return nextProgress > 90 ? 90 : nextProgress;
                });
            }, 300);

            // Perform the upload
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error(
                    `Upload failed with status: ${response.status}`,
                );
            }

            // Set progress to 100% when done
            setUploadProgress(100);

            // Return the URL where the file can be accessed
            // For S3, this is typically the URL without the query parameters
            const publicUrl = url.split("?")[0];
            return publicUrl;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to upload file to S3";
            setUploadError(errorMessage);
            console.error("S3 upload error:", errorMessage);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const uploadFile = async (
        options: UploadOptions,
    ): Promise<string | null> => {
        const { file, fileType = "other" } = options;

        if (!file) return null;

        // Now we always use direct S3 upload for all files
        return uploadToS3(file, fileType);
    };

    return { uploadFile, isUploading, uploadError, uploadProgress };
};
