import { useState, useEffect, useRef, useCallback } from "react";
import {
    CustomPlayer,
    type Chord,
    type TransportState,
    type MidiNote,
    type PlayerConfig,
} from "@/lib/CustomPlayer";

interface UseCustomPlayerOptions extends PlayerConfig {
    onTimeUpdate?: (time: number) => void;
    onNoteOn?: (note: MidiNote) => void;
    onNoteOff?: (note: MidiNote) => void;
    onChordChange?: (chord: Chord) => void;
}

interface UseCustomPlayerReturn {
    // State
    transportState: TransportState;
    currentTime: number;
    duration: number;
    playbackRate: number;
    activeNotes: MidiNote[];
    activeChord: string;
    midiOutputs: WebMidi.MIDIOutput[];
    isPlayerReady: boolean;

    // Actions
    loadMedia: (
        audioUrl: string,
        midiUrl: string,
    ) => Promise<{ audioDuration: number; midiNotes: MidiNote[] } | void>;
    setChordProgression: (chords: Chord[]) => void;
    setMidiOutput: (outputId: string) => void;
    setPlaybackRate: (rate: number) => void;
    setVolume: (volume: number) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (time: number) => void;
}

/**
 * React hook for the CustomPlayer
 * Provides state and methods for controlling audio and MIDI playback
 */
export const useCustomPlayer = (
    options: UseCustomPlayerOptions = {},
): UseCustomPlayerReturn => {
    // Create refs to hold player and callbacks
    const playerRef = useRef<CustomPlayer | null>(null);
    const callbacksRef = useRef({
        onTimeUpdate: options.onTimeUpdate,
        onNoteOn: options.onNoteOn,
        onNoteOff: options.onNoteOff,
        onChordChange: options.onChordChange,
    });

    // Update callbacks ref when options change
    useEffect(() => {
        callbacksRef.current = {
            onTimeUpdate: options.onTimeUpdate,
            onNoteOn: options.onNoteOn,
            onNoteOff: options.onNoteOff,
            onChordChange: options.onChordChange,
        };
    }, [
        options.onTimeUpdate,
        options.onNoteOn,
        options.onNoteOff,
        options.onChordChange,
    ]);

    // State
    const [transportState, setTransportState] =
        useState<TransportState>("stopped");
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRateState] = useState(1);
    const [activeNotes, setActiveNotes] = useState<MidiNote[]>([]);
    const [activeChord, setActiveChord] = useState("");
    const [midiOutputs, setMidiOutputs] = useState<WebMidi.MIDIOutput[]>([]);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Initialize player
    useEffect(() => {
        const player = new CustomPlayer({
            debugMode: options.debugMode,
            visualizationFPS: options.visualizationFPS,
        });

        playerRef.current = player;

        // Initialize the player
        player.initialize().then(() => {
            setIsPlayerReady(true);

            // Get available MIDI outputs
            setMidiOutputs(player.getAvailableMidiOutputs());

            // Add event listeners

            // Time update listener
            player.addTimeListener((time) => {
                setCurrentTime(time);
                callbacksRef.current.onTimeUpdate?.(time);
            });

            // Note listeners
            player.addNoteListener((note) => {
                if (note.velocity > 0) {
                    // Note on
                    setActiveNotes((notes) => {
                        // Avoid duplicates by first removing any existing notes with the same MIDI value
                        const filteredNotes = notes.filter(
                            (n) => n.midi !== note.midi,
                        );
                        return [...filteredNotes, note];
                    });
                    callbacksRef.current.onNoteOn?.(note);
                } else {
                    // Note off
                    setActiveNotes((notes) =>
                        notes.filter((n) => n.midi !== note.midi),
                    );
                    callbacksRef.current.onNoteOff?.(note);
                }
            });

            // Chord listener
            player.addChordListener((chord) => {
                setActiveChord(chord.label);
                callbacksRef.current.onChordChange?.(chord);
            });

            // Transport state change listeners
            const updateTransportState = () => {
                const newState = player.transportState;
                setTransportState(newState);

                // Clear active notes when stopping or pausing
                if (newState === "stopped" || newState === "paused") {
                    setActiveNotes([]);
                }
            };

            player.transport.on("start", updateTransportState);
            player.transport.on("pause", updateTransportState);
            player.transport.on("stop", updateTransportState);
        });

        // Cleanup on unmount
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [options.debugMode, options.visualizationFPS]);

    // Load media
    const loadMedia = useCallback(async (audioUrl: string, midiUrl: string) => {
        if (!playerRef.current) return;

        try {
            const result = await playerRef.current.loadMedia(audioUrl, midiUrl);

            // Make sure we have a valid duration
            if (
                playerRef.current &&
                typeof playerRef.current.duration === "number"
            ) {
                setDuration(playerRef.current.duration);
            } else {
                // Fallback to the result's audioDuration if available
                if (result && "audioDuration" in result) {
                    setDuration(result.audioDuration);
                } else {
                    // Last resort fallback
                    console.warn(
                        "Could not determine media duration, using default value",
                    );
                    setDuration(0); // Will be updated later when the player loads
                }
            }

            return result;
        } catch (error) {
            console.error("Error loading media:", error);
            throw error;
        }
    }, []);

    // Set chord progression
    const setChordProgression = useCallback((chords: Chord[]) => {
        if (!playerRef.current) return;
        playerRef.current.setChordProgression(chords);
    }, []);

    // Set MIDI output
    const setMidiOutput = useCallback((outputId: string) => {
        if (!playerRef.current) return;
        playerRef.current.setMidiOutput(outputId);
    }, []);

    // Set playback rate
    const setPlaybackRate = useCallback((rate: number) => {
        if (!playerRef.current) return;
        playerRef.current.setPlaybackRate(rate);
        setPlaybackRateState(rate);
    }, []);

    // Set volume
    const setVolume = useCallback((volume: number) => {
        if (!playerRef.current) return;
        playerRef.current.setVolume(volume);
    }, []);

    // Transport controls
    const play = useCallback(() => {
        if (!playerRef.current) return;
        playerRef.current.play();
    }, []);

    const pause = useCallback(() => {
        if (!playerRef.current) return;
        playerRef.current.pause();
    }, []);

    const stop = useCallback(() => {
        if (!playerRef.current) return;
        playerRef.current.stop();
    }, []);

    const seek = useCallback((time: number) => {
        if (!playerRef.current) return;
        playerRef.current.seek(time);
    }, []);

    return {
        // State
        transportState,
        currentTime,
        duration,
        playbackRate,
        activeNotes,
        activeChord,
        midiOutputs,
        isPlayerReady,

        // Actions
        loadMedia,
        setChordProgression,
        setMidiOutput,
        setPlaybackRate,
        setVolume,
        play,
        pause,
        stop,
        seek,
    };
};
