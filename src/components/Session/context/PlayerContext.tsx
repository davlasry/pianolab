import { createContext, useContext, type ReactNode } from "react";
import { usePlayer } from "@/components/Session/hooks/usePlayer.ts";
import {
    useMidiNotes,
    type Note,
} from "@/components/Session/hooks/useMidiNotes.ts";
import { useFetchSession } from "@/hooks/queries/useFetchSession.ts";
import { useFilesLoader } from "@/components/Session/hooks/useFilesLoader.ts";
import { useTimelineLoop } from "@/components/Session/Timeline/hooks/useTimelineLoop";
import { useTransportState } from "@/components/Session/hooks/useTransportState";

// Create a type for our context based on what usePlayer returns
type PlayerContextType = ReturnType<typeof usePlayer> & {
    notes: Note[];
    setHand: (id: string, hand: "L" | "R" | null) => void;
    isReady: boolean;
    session: ReturnType<typeof useFetchSession>["session"];
    isLoading: boolean;
    error: string | null;
} & ReturnType<typeof useTimelineLoop>;

// Create the context with a default value
export const PlayerContext = createContext<PlayerContextType | null>(null);

// Provider component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const { notes, parseMidi, setHand } = useMidiNotes();
    const player = usePlayer(notes);
    const { loadAudio, isLoadingRecording, isReady, error, session } =
        useFilesLoader({ parseMidi, loadAudio: player.loadAudio });
    const { transportState } = useTransportState();

    const loopControls = useTimelineLoop({
        duration: player.audioDuration,
        onSeek: player.seek,
        transportState,
    });

    // Combine player and notes values into a single context value
    const contextValue: PlayerContextType = {
        ...player,
        loadAudio,
        notes,
        setHand,
        isReady,
        session,
        isLoading: isLoadingRecording,
        error,
        ...loopControls,
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
};

// Custom hook to use the context
export const usePlayerContext = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error(
            "usePlayerContext must be used within a PlayerProvider",
        );
    }
    return context;
};
