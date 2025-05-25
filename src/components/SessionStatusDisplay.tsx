import type { Session } from "@/types/entities.types";

interface SessionStatusDisplayProps {
    isLoading: boolean;
    error: string | null;
    session: Session | null;
    isReady: boolean;
}

export const SessionStatusDisplay = ({
    isLoading,
    error,
    session,
    isReady,
}: SessionStatusDisplayProps) => {
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

    return null; // If none of the above conditions are met, render nothing (or children)
};
