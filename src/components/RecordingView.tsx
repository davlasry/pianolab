import { useParams } from "react-router-dom";
import { PlayerProvider, usePlayerContext } from "@/context/PlayerContext.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, Music } from "lucide-react";
import { RecordingFormModal } from "@/components/Recordings/RecordingFormModal.tsx";
import { supabase } from "@/supabase.ts";
import type { Piece } from "@/types/entities.types.ts";

const RecordingContent = () => {
    const { isLoading, recording, isReady, error } = usePlayerContext();
    const { recordingId } = useParams();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [linkedPieces, setLinkedPieces] = useState<Piece[]>([]);
    const [piecesLoading, setPiecesLoading] = useState(true);

    useEffect(() => {
        const fetchLinkedPieces = async () => {
            if (recordingId) {
                setPiecesLoading(true);
                try {
                    // Fetch piece_ids linked to the recording
                    const {
                        data: recordingPiecesData,
                        error: recordingPiecesError,
                    } = await supabase
                        .from("recording_pieces")
                        .select("piece_id")
                        .eq("recording_id", recordingId);

                    if (recordingPiecesError) throw recordingPiecesError;

                    if (recordingPiecesData && recordingPiecesData.length > 0) {
                        const pieceIds = recordingPiecesData.map(
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

        if (recordingId) {
            fetchLinkedPieces();
        }
    }, [recordingId]);

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    // Handle successful edit
    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        // Reload the page to show updated recording data
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-pulse text-lg">
                    Loading recording details...
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

    if (!recording) {
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
                    {recording.performer
                        ? `"${recording.performer}'s Recording"`
                        : "Recording"}
                    {recording.key && ` in ${recording.key}`}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center px-4 mb-4">
                <h1 className="text-2xl font-bold">
                    {recording.name ||
                        (recording.performer
                            ? `${recording.performer}'s Recording`
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

            {/* Display Linked Pieces - MOVED & RESTYLED */}
            {piecesLoading ? (
                <div className="px-4 mb-4 text-sm text-gray-500">
                    <p>Loading linked pieces...</p>
                </div>
            ) : linkedPieces.length > 0 ? (
                <div className="px-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                        <Music className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />{" "}
                        Linked Pieces:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {linkedPieces.map((piece) => (
                            <div
                                key={piece.id}
                                className="bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full shadow-sm"
                            >
                                {piece.name}
                                {piece.composer && (
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                        ({piece.composer})
                                    </span>
                                )}
                            </div>
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
                recording={recording}
                mode="edit"
            />
        </div>
    );
};

export const RecordingView = () => {
    const { recordingId } = useParams();

    if (!recordingId) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">No recording ID provided.</div>
                <div className="mt-2">
                    Please go back to the recordings list and select a
                    recording.
                </div>
            </div>
        );
    }

    return (
        <div>
            <PlayerProvider>
                <RecordingContent />
            </PlayerProvider>
        </div>
    );
};
