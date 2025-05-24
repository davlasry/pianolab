import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/supabase.ts";
import type { Recording } from "@/types/entities.types.ts";

export const useFetchSession = (sessionId: string | undefined) => {
    const [session, setRecording] = useState<Recording | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to track if we've already loaded this session to prevent infinite loops
    const loadedRecordingIdRef = useRef<string | null>(null);

    const fetchRecording = useCallback(async () => {
        if (!sessionId) {
            setError("No session ID provided");
            return null;
        }

        // Skip if we've already loaded this session
        if (loadedRecordingIdRef.current === sessionId) {
            console.log("Recording already loaded, skipping fetch");
            return session;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("Fetching session with ID:", sessionId);

            const { data, error } = await supabase
                .from("sessions")
                .select("*")
                .eq("id", sessionId)
                .single();

            if (error) throw error;

            // Update our ref to indicate we've loaded this session
            loadedRecordingIdRef.current = sessionId;

            console.log("Recording fetched successfully:", data);
            setRecording(data);
            return data;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to fetch session";
            setError(errorMessage);
            console.error("Error fetching session:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        // Only fetch if the session ID changes
        if (sessionId !== loadedRecordingIdRef.current) {
            fetchRecording();
        }
    }, [fetchRecording, sessionId]);

    return { session, loading, error, refresh: fetchRecording };
};
