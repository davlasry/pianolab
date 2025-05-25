import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import type { Piece } from "@/types/entities.types";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";

export const useSessionViewLogic = () => {
    const { session, isLoading, isReady, error } = usePlayerContext();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [linkedPieces, setLinkedPieces] = useState<Piece[]>([]);
    const [piecesLoading, setPiecesLoading] = useState(true);

    useEffect(() => {
        const fetchLinkedPieces = async () => {
            if (sessionId) {
                setPiecesLoading(true);
                try {
                    const {
                        data: sessionPiecesData,
                        error: sessionPiecesError,
                    } = await supabase
                        .from("session_pieces")
                        .select("piece_id")
                        .eq("session_id", sessionId);

                    if (sessionPiecesError) throw sessionPiecesError;

                    if (sessionPiecesData && sessionPiecesData.length > 0) {
                        const pieceIds = sessionPiecesData.map(
                            (rp) => rp.piece_id,
                        );
                        const { data: piecesData, error: piecesError } =
                            await supabase
                                .from("pieces")
                                .select("*")
                                .in("id", pieceIds);

                        if (piecesError) throw piecesError;
                        setLinkedPieces(piecesData || []);
                    } else {
                        setLinkedPieces([]);
                    }
                } catch (e) {
                    console.error("Error fetching linked pieces:", e);
                    setLinkedPieces([]);
                } finally {
                    setPiecesLoading(false);
                }
            }
        };

        if (sessionId) {
            fetchLinkedPieces();
        }
    }, [sessionId]);

    const handleOpenEditModal = () => setIsEditModalOpen(true);
    const handleCloseEditModal = () => setIsEditModalOpen(false);
    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        window.location.reload(); // Consider if there's a better way than a full reload
    };

    return {
        session,
        isLoading,
        isReady,
        error,
        sessionId,
        isEditModalOpen,
        linkedPieces,
        piecesLoading,
        handleOpenEditModal,
        handleCloseEditModal,
        handleEditSuccess,
    };
};
