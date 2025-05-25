import { useState } from "react";
import { supabase } from "@/supabase.ts";
import type { Session } from "@/types/entities.types.ts";

export const useUpdateSession = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateRecording = async (id: string, updates: Partial<Session>) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("sessions")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to update session";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateRecording, isLoading, error };
};
