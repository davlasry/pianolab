import { useParams, Link } from "react-router-dom";
import {
    PlayerProvider,
    usePlayerContext,
} from "@/components/Player/context/PlayerContext.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, Music } from "lucide-react";
import { RecordingFormModal } from "@/components/Recordings/SessionFormModal.tsx";
import { supabase } from "@/supabase.ts";
import type { Piece } from "@/types/entities.types.ts";

const SessionContent = () => {
    const { isLoading, session, isReady, error } = usePlayerContext();
    const { sessionId } = useParams();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [linkedPieces, setLinkedPieces] = useState<Piece[]>([]);
    const [piecesLoading, setPiecesLoading] = useState(true);

    useEffect(() => {
        const fetchLinkedPieces = async () => {
            if (sessionId) {
                setPiecesLoading(true);
                try {
                    // Fetch piece_ids linked to the session
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
                        // Fetch details for those pieces
                        const { data: piecesData, error: piecesError } =
                            await supabase
                                .from("pieces")
                                .select(
                                    "*" /* Select all piece columns or specify needed ones */,
                                )
                                .in("id", pieceIds);

                        if (piecesError) throw piecesError;
                        setLinkedPieces(piecesData || []);
                    } else {
                        setLinkedPieces([]); // No pieces linked
                    }
                } catch (e) {
                    console.error("Error fetching linked pieces:", e);
                    setLinkedPieces([]); // Set to empty or handle error state
                } finally {
                    setPiecesLoading(false);
                }
            }
        };

        if (sessionId) {
            fetchLinkedPieces();
        }
    }, [sessionId]);

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    // Handle successful edit
    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        // Reload the page to show updated session data
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-pulse text-lg">
                    Loading session details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500">Error: {error}</div>
                <div className="mt-2">Please check the URL and try again.</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">Recording not found.</div>
                <div className="mt-2">Please check the URL and try again.</div>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="p-8 text-center">
                <div className="animate-pulse text-lg">
                    Loading audio and MIDI files...
                </div>
                <div className="mt-2 text-sm text-gray-500">
                    {session.performer
                        ? `"${session.performer}'s Recording"`
                        : "Recording"}
                    {session.key && ` in ${session.key}`}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">
                    {session.name ||
                        (session.performer
                            ? `${session.performer}'s Recording`
                            : "Recording")}
                </h1>
                <Button
                    onClick={handleOpenEditModal}
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
            </div>

            {/* Display Linked Pieces */}
            {piecesLoading ? (
                <div className="px-4 mb-4 text-sm text-gray-500">
                    <p>Loading linked pieces...</p>
                </div>
            ) : linkedPieces.length > 0 ? (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                        <Music className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />{" "}
                        Linked Pieces:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {linkedPieces.map((piece) => (
                            <Link
                                key={piece.id}
                                to={`/piece/${piece.id}`}
                                className="bg-muted hover:bg-muted/80 text-muted-foreground text-xs px-2 py-1 rounded-full shadow-sm cursor-pointer"
                            >
                                {piece.name}
                                {piece.composer && (
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                        ({piece.composer})
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="px-4 mb-4 text-sm text-gray-500">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                        <Music className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />{" "}
                        Linked Pieces:
                    </h3>
                    <p>None</p>
                </div>
            )}

            <PlayerContent />

            {/* Edit Modal */}
            <RecordingFormModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
                session={session}
                mode="edit"
            />
        </div>
    );
};

export const SessionView = () => {
    const { sessionId } = useParams();

    if (!sessionId) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">No session ID provided.</div>
                <div className="mt-2">
                    Please go back to the sessions list and select a session.
                </div>
            </div>
        );
    }

    return (
        <div>
            <PlayerProvider>
                <SessionContent />
            </PlayerProvider>
        </div>
    );
};
