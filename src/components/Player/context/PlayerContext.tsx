import { createContext, useContext, type ReactNode } from "react";
import { usePlayer } from "@/components/Player/hooks/usePlayer.ts";
import {
    useMidiNotes,
    type Note,
} from "@/components/Player/hooks/useMidiNotes.ts";
import { useFetchRecording } from "@/hooks/queries/useFetchRecording.ts";
import { useFilesLoader } from "@/components/Player/hooks/useFilesLoader.ts";

// Create a type for our context based on what usePlayer returns
type PlayerContextType = ReturnType<typeof usePlayer> & {
    notes: Note[];
    setHand: (id: string, hand: "L" | "R" | null) => void;
    isReady: boolean;
    recording: ReturnType<typeof useFetchRecording>["recording"];
    isLoading: boolean;
    error: string | null;
};

// Create the context with a default value
export const PlayerContext = createContext<PlayerContextType | null>(null);

// Provider component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const { notes, parseMidi, setHand } = useMidiNotes();
    const player = usePlayer(notes);
    const { loadAudio, isLoadingRecording, isReady, error, recording } =
        useFilesLoader({ parseMidi, loadAudio: player.loadAudio });

    // Combine player and notes values into a single context value
    const contextValue: PlayerContextType = {
        ...player,
        loadAudio,
        notes,
        setHand,
        isReady,
        recording,
        isLoading: isLoadingRecording,
        error,
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
