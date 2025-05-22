import { useParams } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";
import { usePlayerContext } from "@/context/PlayerContext.tsx";

const RecordingContent = () => {
    const { isLoading, recording, isReady, error } = usePlayerContext();

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
            <h1 className="text-2xl font-bold mb-4 px-4">
                {recording.performer
                    ? `${recording.performer}'s Recording`
                    : "Recording"}
                {recording.key && ` in ${recording.key}`}
            </h1>
            <PlayerContent />
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
