import { useState } from "react";
import { supabase } from "@/supabase.ts";
import type { Piece } from "@/types/entities.types.ts";

export const useUpdatePiece = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updatePiece = async (id: string, updates: Partial<Piece>) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("pieces")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to update piece";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updatePiece, isLoading, error };
};
