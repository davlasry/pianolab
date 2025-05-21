import { useState } from "react";
import { supabase } from "src/supabase.ts";
import type { InsertPiece } from "src/types/entities.types.ts";

export const useCreatePiece = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPiece = async (piece: InsertPiece) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("pieces")
                .insert(piece)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create piece";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createPiece, isLoading, error };
};
