import { useState } from "react";
import { supabase } from "src/supabase.ts";

export const useDeletePiece = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePiece = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from("pieces")
                .delete()
                .eq("id", id);

            if (error) throw error;

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to delete piece";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deletePiece, isLoading, error };
}; 