import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/supabase.ts";
import type { Recording } from "@/types/entities.types.ts";

export const useFetchRecording = (recordingId: string | undefined) => {
    const [recording, setRecording] = useState<Recording | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to track if we've already loaded this recording to prevent infinite loops
    const loadedRecordingIdRef = useRef<string | null>(null);

    const fetchRecording = useCallback(async () => {
        if (!recordingId) {
            setError("No recording ID provided");
            return null;
        }

        // Skip if we've already loaded this recording
        if (loadedRecordingIdRef.current === recordingId) {
            console.log("Recording already loaded, skipping fetch");
            return recording;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("Fetching recording with ID:", recordingId);

            const { data, error } = await supabase
                .from("recordings")
                .select("*")
                .eq("id", recordingId)
                .single();

            if (error) throw error;

            // Update our ref to indicate we've loaded this recording
            loadedRecordingIdRef.current = recordingId;

            console.log("Recording fetched successfully:", data);
            setRecording(data);
            return data;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch recording";
            setError(errorMessage);
            console.error("Error fetching recording:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [recordingId]);

    useEffect(() => {
        // Only fetch if the recording ID changes
        if (recordingId !== loadedRecordingIdRef.current) {
            fetchRecording();
        }
    }, [fetchRecording, recordingId]);

    return { recording, loading, error, refresh: fetchRecording };
};
