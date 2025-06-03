import { useParams } from "react-router-dom";
import { PlayerProvider } from "@/components/Player/context/PlayerContext.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";
import { RecordingFormModal } from "@/components/Recordings/SessionFormModal.tsx";
import { useSessionViewLogic } from "@/hooks/useSessionViewLogic";
import { LinkedPiecesDisplay } from "@/components/LinkedPiecesDisplay";
import { SessionStatusDisplay } from "@/components/SessionStatusDisplay";
import { TransportTickerProvider } from "@/TransportTicker/TransportTickerProvider.tsx";
import { KeyboardShortcutProvider } from "@/shortcuts/KeyboardShortcuts.tsx";
import { useSetSessionId } from "@/stores/sessionStore";
import { useEffect } from "react";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";
import { YouTubePlayer } from "@/components/Player/YouTubePlayer";
import { YouTubeUrlInput } from "@/components/Player/YouTubeUrlInput";
import { useYouTubeIsVisible } from "@/stores/youtubeStore";

const SessionContent = () => {
    const {
        isReady,
        error,
        session,
        activeLoop,
        toggleLoop,
        handleSetStartAtPlayhead,
        handleSubmitSelection,
        handleResetSelection,
        selectionStart,
        isCreatingLoop,
        isSelectionComplete,
        isLoopActive,
    } = usePlayerContext();

    const {
        isLoading,
        isEditModalOpen,
        linkedPieces,
        piecesLoading,
        handleOpenEditModal,
        handleCloseEditModal,
        handleEditSuccess,
    } = useSessionViewLogic();

    const isYouTubeVisible = useYouTubeIsVisible();

    if (isLoading || error || !session || !isReady) {
        return (
            <SessionStatusDisplay
                isLoading={isLoading}
                error={error}
                session={session}
                isReady={isReady}
            />
        );
    }

    return (
        <div className="flex h-full flex-col">
            <TopNavbar
                sessionTitle={session.name || "Untitled Session"}
                onEdit={handleOpenEditModal}
                onSetStartAtPlayhead={handleSetStartAtPlayhead}
                onSubmitSelection={handleSubmitSelection}
                onResetSelection={handleResetSelection}
                selectionStart={selectionStart}
                isSelectionComplete={isSelectionComplete}
                isCreatingLoop={isCreatingLoop}
                activeLoop={activeLoop}
                isLoopActive={isLoopActive}
                onToggleLoop={toggleLoop}
            />

            {/*<div className="flex flex-1 flex-col overflow-hidden">*/}
            <div className="flex flex-1 flex-col">
                <div className="px-4">
                    <LinkedPiecesDisplay
                        pieces={linkedPieces}
                        isLoading={piecesLoading}
                    />
                </div>

                {/* YouTube URL Input */}
                <div className="my-2 px-4">
                    <YouTubeUrlInput compact={true} />
                </div>

                {/* YouTube Player (conditional rendering) */}
                {isYouTubeVisible && (
                    <div className="mb-2 px-4">
                        <YouTubePlayer size="small" />
                    </div>
                )}

                <div className="flex flex-1">
                    <PlayerContent />
                </div>
            </div>

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
    const setSessionId = useSetSessionId();

    // Update session ID in the store whenever it changes
    useEffect(() => {
        setSessionId(sessionId || null);

        // Clean up session ID when component unmounts
        return () => {
            setSessionId(null);
        };
    }, [sessionId, setSessionId]);

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
        <PlayerProvider>
            <TransportTickerProvider>
                <KeyboardShortcutProvider>
                    <SessionContent />
                </KeyboardShortcutProvider>
            </TransportTickerProvider>
        </PlayerProvider>
    );
};
