import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase.ts";
import type { RecordingWithPieces } from "@/types/entities.types.ts";

export const useFetchRecordings = () => {
    const [recordings, setRecordings] = useState<RecordingWithPieces[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRecordings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("recordings")
                .select(
                    `
                      *,
                      recording_pieces (
                        pieces (*)
                      )
                    `,
                )
                .order("created_at", { ascending: false });
            console.log("data =====>", data);

            if (error) throw error;

            setRecordings(data || []);
        } catch (error) {
            console.error("Error fetching recordings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecordings();
    }, [fetchRecordings]);

    return { recordings, loading, refresh: fetchRecordings };
};
