import { useState } from "react";
import { supabase } from "src/supabase.ts";

export const useDeleteRecording = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteRecording = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from("recordings")
                .delete()
                .eq("id", id);

            if (error) throw error;

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to delete recording";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteRecording, isLoading, error };
}; 