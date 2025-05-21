import { useState, useEffect, useCallback } from "react";
import { supabase } from "src/supabase.ts";
import type { Piece } from "src/types/entities.types.ts";

export const useFetchPieces = () => {
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPieces = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("pieces")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setPieces(data || []);
        } catch (error) {
            console.error("Error fetching pieces:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPieces();
    }, [fetchPieces]);

    return { pieces, loading, refresh: fetchPieces };
};
