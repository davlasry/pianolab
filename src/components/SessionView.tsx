import { useParams } from "react-router-dom";
import { PlayerProvider } from "@/components/Player/context/PlayerContext.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";
import { RecordingFormModal } from "@/components/Recordings/SessionFormModal.tsx";
import { useSessionViewLogic } from "@/hooks/useSessionViewLogic";
import { SessionHeader } from "@/components/SessionHeader";
import { LinkedPiecesDisplay } from "@/components/LinkedPiecesDisplay";
import { SessionStatusDisplay } from "@/components/SessionStatusDisplay";
import { TransportTickerProvider } from "@/TransportTicker/TransportTickerProvider.tsx";

const SessionContent = () => {
    const {
        session,
        isLoading,
        isReady,
        error,
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
        <>
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="p-4">
                    <SessionHeader
                        session={session}
                        onOpenEditModal={handleOpenEditModal}
                    />
                    <LinkedPiecesDisplay
                        pieces={linkedPieces}
                        isLoading={piecesLoading}
                    />
                </div>

                <div className="flex flex-1">
                    <div className="flex flex-1">
                        <PlayerContent />
                    </div>
                </div>
            </div>

            <RecordingFormModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
                session={session}
                mode="edit"
            />
        </>
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
        <PlayerProvider>
            <TransportTickerProvider>
                <SessionContent />
            </TransportTickerProvider>
        </PlayerProvider>
    );
};
