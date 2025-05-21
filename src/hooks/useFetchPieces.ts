import { useState, useEffect } from "react";
import { supabase } from "src/supabase.ts";
import type { Piece } from "src/types/entities.types.ts";

export const useFetchPieces = () => {
    const [pieces, setPieces] = useState<Piece[]>([]);

    async function fetchPieces() {
        const { data, error } = await supabase
            .from("pieces")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("pieces =====>", data);
        setPieces(data);
    }

    useEffect(() => {
        fetchPieces();
    }, []);

    return { pieces };
};
