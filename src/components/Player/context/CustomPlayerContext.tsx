import { createContext, useContext, type ReactNode } from "react";
import { useCustomPlayer } from "@/hooks/useCustomPlayer";
import { useFetchSession } from "@/hooks/queries/useFetchSession";
import { useState, useEffect, useCallback } from "react";
import type { Chord, MidiNote } from "@/lib/CustomPlayer";
import { useParams } from "react-router-dom";

// Create a type for our context based on what useCustomPlayer returns
type CustomPlayerContextType = ReturnType<typeof useCustomPlayer> & {
    session: ReturnType<typeof useFetchSession>["session"];
    isLoading: boolean;
    error: string | null;

    // Timeline loop controls
    activeLoop: { start: number; end: number } | null;
    isLoopActive: boolean;
    isCreatingLoop: boolean;
    selectionStart: number | null;
    isSelectionComplete: boolean;
    toggleLoop: () => void;
    handleSetStartAtPlayhead: () => void;
    handleSubmitSelection: () => void;
    handleResetSelection: () => void;
};

// Create the context with a default value
export const CustomPlayerContext =
    createContext<CustomPlayerContextType | null>(null);

// Provider component
export const CustomPlayerProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { sessionId } = useParams<{ sessionId: string }>();
    const {
        session,
        loading: sessionLoading,
        error: sessionError,
    } = useFetchSession(sessionId);

    // Timeline loop state
    const [activeLoop, setActiveLoop] = useState<{
        start: number;
        end: number;
    } | null>(null);
    const [isLoopActive, setIsLoopActive] = useState(false);
    const [isCreatingLoop, setIsCreatingLoop] = useState(false);
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [isSelectionComplete, setIsSelectionComplete] = useState(false);

    const customPlayer = useCustomPlayer({
        debugMode: process.env.NODE_ENV === "development",
        visualizationFPS: 30,
    });

    // Load media when session is available
    useEffect(() => {
        if (!customPlayer.isPlayerReady || !session || sessionLoading) return;

        const loadSessionMedia = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                // Default audio and MIDI files (fallbacks)
                const defaultAudioUrl = "/pianolab/body_and_soul.mp3";
                const defaultMidiUrl = "/pianolab/sample.mid";

                // Load audio and MIDI files
                const result = await customPlayer.loadMedia(
                    session.audio_url || defaultAudioUrl,
                    session.midi_url || defaultMidiUrl,
                );

                // Verify we have valid audio duration
                if (
                    !result ||
                    typeof result.audioDuration !== "number" ||
                    isNaN(result.audioDuration)
                ) {
                    console.warn(
                        "Invalid audio duration received, using fallback",
                    );
                }

                // Parse and set chord progression if available
                if (session.chords) {
                    try {
                        const chordsData =
                            typeof session.chords === "string"
                                ? JSON.parse(session.chords)
                                : session.chords;

                        customPlayer.setChordProgression(chordsData as Chord[]);
                    } catch (err) {
                        console.error("Error parsing chords:", err);
                    }
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Error loading media:", err);
                setLoadError((err as Error).message || "Failed to load media");
                setIsLoading(false);
            }
        };

        loadSessionMedia();
    }, [
        customPlayer.isPlayerReady,
        session,
        sessionLoading,
        customPlayer.loadMedia,
        customPlayer.setChordProgression,
    ]);

    // Timeline loop control functions
    const handleSetStartAtPlayhead = useCallback(() => {
        setSelectionStart(customPlayer.currentTime);
        setIsCreatingLoop(true);
        setIsSelectionComplete(false);
    }, [customPlayer.currentTime]);

    const handleSubmitSelection = useCallback(() => {
        if (
            selectionStart !== null &&
            customPlayer.currentTime > selectionStart
        ) {
            setActiveLoop({
                start: selectionStart,
                end: customPlayer.currentTime,
            });
            setIsLoopActive(true);
            setIsCreatingLoop(false);
            setIsSelectionComplete(true);

            // Apply loop in the player
            if (customPlayer.seek) {
                customPlayer.seek(selectionStart);
            }
        }
    }, [selectionStart, customPlayer.currentTime, customPlayer.seek]);

    const handleResetSelection = useCallback(() => {
        setSelectionStart(null);
        setIsCreatingLoop(false);
        setIsSelectionComplete(false);
    }, []);

    const toggleLoop = useCallback(() => {
        setIsLoopActive((prev) => !prev);

        if (activeLoop && !isLoopActive) {
            // Entering loop mode - seek to start position
            if (customPlayer.seek) {
                customPlayer.seek(activeLoop.start);
            }
        }
    }, [activeLoop, isLoopActive, customPlayer.seek]);

    // Effect to handle looping logic
    useEffect(() => {
        if (!isLoopActive || !activeLoop) return;

        const checkLoopBoundary = () => {
            if (customPlayer.currentTime >= activeLoop.end) {
                customPlayer.seek(activeLoop.start);
            }
        };

        // Check every 100ms if we need to loop
        const intervalId = setInterval(checkLoopBoundary, 100);

        return () => clearInterval(intervalId);
    }, [isLoopActive, activeLoop, customPlayer.currentTime, customPlayer.seek]);

    // Combine player and notes values into a single context value
    const contextValue: CustomPlayerContextType = {
        ...customPlayer,
        session,
        isLoading: isLoading || sessionLoading,
        error: loadError || sessionError,

        // Timeline loop controls
        activeLoop,
        isLoopActive,
        isCreatingLoop,
        selectionStart,
        isSelectionComplete,
        toggleLoop,
        handleSetStartAtPlayhead,
        handleSubmitSelection,
        handleResetSelection,
    };

    return (
        <CustomPlayerContext.Provider value={contextValue}>
            {children}
        </CustomPlayerContext.Provider>
    );
};

// Custom hook to use the context
export const useCustomPlayerContext = () => {
    const context = useContext(CustomPlayerContext);
    if (!context) {
        throw new Error(
            "useCustomPlayerContext must be used within a CustomPlayerProvider",
        );
    }
    return context;
};
