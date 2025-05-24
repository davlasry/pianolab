import { useState } from "react";
import { supabase } from "@/supabase.ts";

export const useDeleteSession = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteRecording = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from("sessions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to delete session";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteRecording, isLoading, error };
};
