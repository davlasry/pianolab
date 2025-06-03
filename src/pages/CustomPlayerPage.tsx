import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { RecordingFormModal } from "@/components/Recordings/SessionFormModal";
import { SessionStatusDisplay } from "@/components/SessionStatusDisplay";
import { LinkedPiecesDisplay } from "@/components/LinkedPiecesDisplay";
import { CustomPlayerContent } from "@/components/Player/CustomPlayerContent";
import { CustomPlayerProvider } from "@/components/Player/context/CustomPlayerContext";
import { CustomTransportTickerProvider } from "@/CustomTransportTicker/CustomTransportTickerProvider";
import { KeyboardShortcutProvider } from "@/shortcuts/KeyboardShortcuts";
import { useSetSessionId } from "@/stores/sessionStore";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";
import { useCustomPlayerViewLogic } from "@/hooks/useCustomPlayerViewLogic";

const CustomPlayerPageContent = () => {
    const {
        isPlayerReady,
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
    } = useCustomPlayerContext();

    const {
        isLoading,
        isEditModalOpen,
        linkedPieces,
        piecesLoading,
        handleOpenEditModal,
        handleCloseEditModal,
        handleEditSuccess,
    } = useCustomPlayerViewLogic();

    if (isLoading || error || !session || !isPlayerReady) {
        return (
            <SessionStatusDisplay
                isLoading={isLoading}
                error={error}
                session={session}
                isReady={isPlayerReady}
            />
        );
    }

    return (
        <div className="flex h-full flex-col">
            <TopNavbar
                sessionTitle={`${session.name || "Untitled Session"} (Custom Player)`}
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

            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="px-4">
                    <LinkedPiecesDisplay
                        pieces={linkedPieces}
                        isLoading={piecesLoading}
                    />
                </div>

                <div className="flex flex-1">
                    <CustomPlayerContent />
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

export default function CustomPlayerPage() {
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
        <CustomPlayerProvider>
            <CustomTransportTickerProvider>
                <KeyboardShortcutProvider>
                    <CustomPlayerPageContent />
                </KeyboardShortcutProvider>
            </CustomTransportTickerProvider>
        </CustomPlayerProvider>
    );
}
