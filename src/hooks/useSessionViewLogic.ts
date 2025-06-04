import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import type { Piece } from "@/types/entities.types";
import { usePlayerContext } from "@/components/Session/context/PlayerContext";

export const useSessionViewLogic = () => {
    const { session, isLoading, isReady, error } = usePlayerContext();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [linkedPieces, setLinkedPieces] = useState<Piece[]>([]);
    const [piecesLoading, setPiecesLoading] = useState(true);

    useEffect(() => {
        const fetchLinkedPieces = async () => {
            if (!sessionId) return;

            setPiecesLoading(true);
            try {
                // session_pieces.piece_id → pieces.id must be a FK
                const { data, error } = await supabase
                    .from("session_pieces")
                    .select("pieces(*)") // nested join
                    .eq("session_id", sessionId);

                if (error) throw error;

                // flatten the nested rows
                setLinkedPieces(data?.map((r) => r.pieces) ?? []);
            } catch (e) {
                console.error("Error fetching linked pieces:", e);
                setLinkedPieces([]);
            } finally {
                setPiecesLoading(false);
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
