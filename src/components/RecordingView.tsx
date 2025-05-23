import { useParams } from "react-router-dom";
import { PlayerProvider, usePlayerContext } from "@/context/PlayerContext.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";
import { RecordingFormModal } from "@/components/Recordings/RecordingFormModal.tsx";

const RecordingContent = () => {
    const { isLoading, recording, isReady, error } = usePlayerContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
