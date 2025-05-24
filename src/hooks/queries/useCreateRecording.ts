import { useState } from "react";
import { supabase } from "@/supabase.ts";
import type { InsertRecording } from "@/types/entities.types.ts";

export const useCreateRecording = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRecording = async (session: InsertRecording) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("sessions")
                .insert(session)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create session";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createRecording, isLoading, error };
};
