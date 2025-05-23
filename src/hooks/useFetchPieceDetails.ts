import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import type { Piece, Recording } from "@/types/entities.types";

interface UseFetchPieceDetailsResult {
    piece: Piece | null;
    recordings: Recording[];
    loading: boolean;
}

export const useFetchPieceDetails = (
    pieceId: string | undefined,
): UseFetchPieceDetailsResult => {
    const [piece, setPiece] = useState<Piece | null>(null);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPieceAndRecordings = async () => {
            if (!pieceId) return;

            try {
                const { data, error } = await supabase
                    .from("pieces")
                    .select(
                        `
                      *,
                      recording_pieces (
                        recordings (*)
                      )
                    `,
                    )
                    .eq("id", pieceId)
                    .single();

                if (error) throw error;

                // data.recording_pieces is an array of { recordings: Recording }
                setPiece(data);
                setRecordings(
                    data.recording_pieces.map(
                        (rp: { recordings: Recording }) => rp.recordings,
                    ),
                );
            } catch (error) {
                console.error("Error fetching piece + recordings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPieceAndRecordings();
    }, [pieceId]);

    return { piece, recordings, loading };
};
