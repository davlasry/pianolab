import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase.ts";
import type { RecordingWithPieces } from "@/types/entities.types.ts";

export const useFetchSessions = () => {
    const [sessions, setSessions] = useState<RecordingWithPieces[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("sessions")
                .select(
                    `
                      *,
                      session_pieces (
                        pieces (*)
                      )
                    `,
                )
                .order("created_at", { ascending: false });

            if (error) throw error;

            setSessions(data || []);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return { sessions, loading, refresh: fetchSessions };
};
