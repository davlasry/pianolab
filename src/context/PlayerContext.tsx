import {
    createContext,
    useContext,
    useCallback,
    type ReactNode,
    useEffect,
    useState,
} from "react";
import { usePlayer } from "src/hooks/usePlayer.ts";
import { useMidiNotes, type Note } from "src/hooks/useMidiNotes.ts";
import { Midi } from "@tonejs/midi";

// Create a type for our context based on what usePlayer returns
type PlayerContextType = ReturnType<typeof usePlayer> & {
    notes: Note[];
    loadMidi: () => Promise<Midi>;
    setHand: (id: string, hand: "L" | "R" | null) => void;
    isReady: boolean;
};

// Create the context with a default value
export const PlayerContext = createContext<PlayerContextType | null>(null);

// Provider component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [isReady, setReady] = useState(false);
    const { notes, loadMidi: originalLoadMidi, setHand } = useMidiNotes();
    const player = usePlayer(notes);

    // Memoize the loadMidi function to maintain a stable reference
    const loadMidi = useCallback(() => {
        return originalLoadMidi();
    }, [originalLoadMidi]);

    // Memoize the loadAudio function to maintain a stable reference
    const loadAudio = useCallback(() => {
        return player.loadAudio();
    }, [player.loadAudio]);

    useEffect(() => {
        let isMounted = true;

        const loadAssets = async () => {
            try {
                await Promise.all([loadMidi(), loadAudio()]);
                if (isMounted) {
                    setReady(true);
                }
            } catch (error) {
                console.error("Failed to load assets:", error);
            }
        };

        loadAssets();

        return () => {
            isMounted = false;
        };
    }, []);

    // Combine player and notes values into a single context value
    const contextValue: PlayerContextType = {
        ...player,
        loadAudio, // Use the memoized version
        notes,
        loadMidi, // Use the memoized version
        setHand,
        isReady,
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
