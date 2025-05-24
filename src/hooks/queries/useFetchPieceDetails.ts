import { useEffect, useState } from "react";
import { supabase } from "@/supabase.ts";
import type { Piece, Recording } from "@/types/entities.types.ts";

interface UseFetchPieceDetailsResult {
    piece: Piece | null;
    sessions: Recording[];
    loading: boolean;
}

export const useFetchPieceDetails = (
    pieceId: string | undefined,
): UseFetchPieceDetailsResult => {
    const [piece, setPiece] = useState<Piece | null>(null);
    const [sessions, setSessions] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPieceAndSessions = async () => {
            if (!pieceId) return;

            try {
                const { data, error } = await supabase
                    .from("pieces")
                    .select(
                        `
                      *,
                      session_pieces (
                        sessions (*)
                      )
                    `,
                    )
                    .eq("id", pieceId)
                    .single();

                if (error) throw error;

                // data.session_pieces is an array of { sessions: Recording }
                setPiece(data);
                setSessions(
                    data.session_pieces.map(
                        (rp: { sessions: Recording }) => rp.sessions,
                    ),
                );
            } catch (error) {
                console.error("Error fetching piece + sessions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPieceAndSessions();
    }, [pieceId]);

    return { piece, sessions, loading };
};
