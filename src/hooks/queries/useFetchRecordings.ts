import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase.ts";
import type { Recording } from "@/types/entities.types.ts";

export const useFetchRecordings = () => {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRecordings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("recordings")
                .select("*")
                .order("created_at", { ascending: false });

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
