import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUpdateSession } from "@/hooks/queries/useUpdateSession";

export const useYouTubeUrlPersistence = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { updateRecording } = useUpdateSession();

    // Save YouTube URL to database
    const saveYouTubeUrl = useCallback(
        async (url: string | null) => {
            if (!sessionId) return;

            try {
                await updateRecording(sessionId, {
                    youtube_url: url,
                });
            } catch (error) {
                console.error("Failed to save YouTube URL:", error);
            }
        },
        [sessionId, updateRecording],
    );

    return { saveYouTubeUrl };
};