import {
    createContext,
    useContext,
    useCallback,
    type ReactNode,
    useEffect,
    useState,
    useRef,
} from "react";
import { usePlayer } from "@/components/Player/hooks/usePlayer.ts";
import {
    useMidiNotes,
    type Note,
} from "@/components/Player/hooks/useMidiNotes.ts";
import { Midi } from "@tonejs/midi";
import { useParams } from "react-router-dom";
import { useFetchRecording } from "@/hooks/queries/useFetchRecording.ts";

// Create a type for our context based on what usePlayer returns
type PlayerContextType = ReturnType<typeof usePlayer> & {
    notes: Note[];
    loadMidi: (url?: string) => Promise<Midi>;
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
    const { recordingId } = useParams();
    const [isReady, setReady] = useState(false);
    const { notes, loadMidi: originalLoadMidi, setHand } = useMidiNotes();
    const player = usePlayer(notes);
    const {
        recording,
        loading: isLoadingRecording,
        error,
    } = useFetchRecording(recordingId);

    // Track if we've already loaded assets for this recording
    const assetsLoadedForIdRef = useRef<string | null>(null);

    // Memoize the loadMidi function to maintain a stable reference
    const loadMidi = useCallback(
        (url?: string) => {
            return originalLoadMidi(url);
        },
        [originalLoadMidi],
    );

    // Memoize the loadAudio function to maintain a stable reference
    const loadAudio = useCallback(
        (url?: string) => {
            return player.loadAudio(url);
        },
        [player.loadAudio],
    );

    useEffect(() => {
        // Skip if recording is not loaded yet
        if (!recording) return;

        // Skip if we've already loaded assets for this recording
        if (assetsLoadedForIdRef.current === recording.id) return;

        let isMounted = true;
        console.log("Loading assets for recording:", recording.id);

        const loadAssets = async () => {
            try {
                // Prepare URLs or use null values if not available
                const audioUrl = recording.audio_url || undefined;
                const midiUrl = recording.midi_url || undefined;

                console.log("Audio URL:", audioUrl);
                console.log("MIDI URL:", midiUrl);

                // Load MIDI first, then audio (not in parallel to avoid race conditions)
                if (midiUrl) {
                    await loadMidi(midiUrl);
                }

                if (audioUrl) {
                    await loadAudio(audioUrl);
                }

                if (isMounted) {
                    assetsLoadedForIdRef.current = recording.id;
                    setReady(true);
                    console.log(
                        "Assets loaded successfully for recording:",
                        recording.id,
                    );
                }
            } catch (error) {
                console.error("Failed to load assets:", error);
            }
        };

        loadAssets();

        return () => {
            isMounted = false;
        };
    }, [recording, loadMidi, loadAudio]);

    // Combine player and notes values into a single context value
    const contextValue: PlayerContextType = {
        ...player,
        loadAudio,
        notes,
        loadMidi,
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
