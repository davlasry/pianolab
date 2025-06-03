import { useEffect, useState, useCallback } from "react";
import { useCustomPlayer } from "@/hooks/useCustomPlayer";
import { useCustomPlayerStore } from "@/stores/customPlayerStore";
import { PlaybackRateSelector } from "@/components/Player/Controls/PlaybackRateSelector";
import type { Chord } from "@/lib/CustomPlayer";
import { Keyboard } from "@/components/Player/Keyboard/components/Keyboard";
import { customKeyboard } from "@/components/Player/Keyboard/components/CustomKeyboard";

interface CustomPlayerComponentProps {
    audioUrl: string;
    midiUrl: string;
    chordProgression?: Chord[];
    className?: string;
}

export function CustomPlayerComponent({
    audioUrl,
    midiUrl,
    chordProgression = [],
    className = "",
}: CustomPlayerComponentProps) {
    // Get global playback rate from store
    const { playbackRate } = useCustomPlayerStore();

    // Local state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize custom player
    const {
        transportState,
        currentTime,
        duration,
        activeNotes,
        activeChord,
        isPlayerReady,
        loadMedia,
        setChordProgression,
        setPlaybackRate,
        play,
        pause,
        stop,
        seek,
    } = useCustomPlayer({
        debugMode: process.env.NODE_ENV === "development",
        visualizationFPS: 30,
        onNoteOn: (note) => {
            console.log("Note on:", note.midi);
        },
        onChordChange: (chord) => {
            console.log("Chord change:", chord.label);
        },
    });

    // Format time as mm:ss
    const formatTime = useCallback((time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    // Handle playback controls
    const handlePlay = useCallback(() => {
        if (transportState === "playing") {
            pause();
        } else {
            play();
        }
    }, [transportState, play, pause]);

    const handleStop = useCallback(() => {
        stop();
    }, [stop]);

    const handleSeek = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            seek(parseFloat(e.target.value));
        },
        [seek],
    );

    // Load media when component mounts and player is ready
    useEffect(() => {
        if (isPlayerReady) {
            setIsLoading(true);
            setError(null);

            loadMedia(audioUrl, midiUrl)
                .then(() => {
                    setIsLoading(false);

                    // Set chord progression if provided
                    if (chordProgression.length > 0) {
                        setChordProgression(chordProgression);
                    }
                })
                .catch((err) => {
                    setIsLoading(false);
                    setError("Failed to load media: " + err.message);
                });
        }
    }, [
        isPlayerReady,
        audioUrl,
        midiUrl,
        chordProgression,
        loadMedia,
        setChordProgression,
    ]);

    // Sync playback rate with global store
    useEffect(() => {
        setPlaybackRate(playbackRate);
    }, [playbackRate, setPlaybackRate]);

    return (
        <div className={`rounded-lg border p-4 shadow-sm ${className}`}>
            <div className="flex flex-col gap-4">
                {/* Player info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">
                            {isLoading
                                ? "Loading..."
                                : transportState === "playing"
                                  ? "Playing"
                                  : "Paused"}
                        </h3>
                        {activeChord && (
                            <div className="rounded bg-primary/10 px-2 py-1 text-sm font-medium">
                                Current chord: {activeChord}
                            </div>
                        )}
                    </div>
                    <PlaybackRateSelector />
                </div>

                {/* Time display */}
                <div className="text-sm text-gray-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Progress bar */}
                <div className="relative pt-1">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                        disabled={isLoading || duration === 0}
                        aria-label="Playback position"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handlePlay}
                        className="rounded-full bg-primary p-3 text-primary-foreground hover:bg-primary/90"
                        disabled={isLoading}
                        aria-label={
                            transportState === "playing" ? "Pause" : "Play"
                        }
                    >
                        {transportState === "playing" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={handleStop}
                        className="rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        disabled={isLoading || transportState === "stopped"}
                        aria-label="Stop"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                        </svg>
                    </button>
                </div>

                {/* Keyboard visualization */}
                <div className="my-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <Keyboard
                        activeNotes={activeNotes.map((note) => ({
                            midi: note.midi,
                            hand: (note.hand === "L" ? "left" : "right") as
                                | "left"
                                | "right",
                        }))}
                        activeChord={activeChord}
                        components={customKeyboard}
                        height={160}
                        keyRange={[48, 84]}
                        interactive={false}
                    />
                </div>

                {/* Active notes */}
                <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Active Notes</h4>
                    <div className="flex flex-wrap gap-2">
                        {activeNotes.length === 0 ? (
                            <span className="text-sm text-gray-500">
                                No active notes
                            </span>
                        ) : (
                            activeNotes.map((note) => (
                                <span
                                    key={note.id}
                                    className="rounded bg-accent px-2 py-1 text-xs font-medium"
                                >
                                    {note.midi}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
