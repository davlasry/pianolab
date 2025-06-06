import { useParams } from "react-router-dom";
import {
    PlayerProvider,
    usePlayerContext,
} from "@/components/Session/context/PlayerContext.tsx";
import { SessionContent } from "@/components/Session/SessionContent.tsx";
import { RecordingFormModal } from "@/components/Sessions/SessionFormModal.tsx";
import { useSessionViewLogic } from "@/hooks/useSessionViewLogic.ts";
import { SessionStatusDisplay } from "@/components/SessionStatusDisplay.tsx";
import { TransportTickerProvider } from "@/TransportTicker/TransportTickerProvider.tsx";
import { KeyboardShortcutProvider } from "@/shortcuts/KeyboardShortcuts.tsx";
import { useSetSessionId } from "@/stores/sessionStore.ts";
import { useEffect } from "react";
import { TopNavbar } from "@/components/Session/TopNavbar/TopNavbar.tsx";

const _SessionView = () => {
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
        <div className="flex h-screen flex-col">
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
                linkedPieces={linkedPieces}
                piecesLoading={piecesLoading}
            />

            <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
                <div className="flex flex-1">
                    <SessionContent />
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
                    <_SessionView />
                </KeyboardShortcutProvider>
            </TransportTickerProvider>
        </PlayerProvider>
    );
};
