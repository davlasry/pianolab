import { useEffect, useRef, useState } from "react";
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";
import { extractYouTubeVideoId } from "@/utils/youtubeUtils";
import {
    useYouTubeActions,
    useYouTubeIsVisible,
    useYouTubeUrl,
    useYouTubeVideoId,
} from "@/stores/youtubeStore";
import { transportTicker } from "@/TransportTicker/transportTicker";
import { useTransportState } from "@/components/Session/hooks/useTransportState";
import * as Tone from "tone";
import { cn } from "@/lib/utils";

// Define a type for the YouTube player instance
interface YouTubePlayerInstance {
    destroy: () => void;
    loadVideoById: (videoId: string) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

// Define size variants
type YouTubePlayerSize = "small" | "medium" | "large";

// Size configuration map
const sizeClasses: Record<YouTubePlayerSize, string> = {
    small: "max-w-xs", // 320px
    medium: "max-w-md", // 448px
    large: "max-w-xl", // 576px
};

// Extend Window interface to include dynamic properties
declare global {
    interface Window {
        __ytSeekHandler?: (time: number) => void;
        [key: string]: unknown;
    }
}

interface YouTubePlayerProps {
    size?: YouTubePlayerSize;
    className?: string;
}

export function YouTubePlayer({
    size = "small",
    className,
}: YouTubePlayerProps = {}) {
    const playerRef = useRef<HTMLDivElement>(null);
    const ytPlayerInstanceRef = useRef<YouTubePlayerInstance | null>(null);
    const syncIntervalRef = useRef<number | null>(null);
    const lastSyncTimeRef = useRef<number>(0);
    const isSeeking = useRef<boolean>(false);
    const seekHandlerRef = useRef<((time: number) => void) | null>(null);
    const handlerNameRef = useRef<string>(`__ytSeekHandler_${Date.now()}`);

    const { status } = useYouTubeAPI();
    const url = useYouTubeUrl();
    const storedVideoId = useYouTubeVideoId();
    const isVisible = useYouTubeIsVisible();
    const { setPlayer, setVideoId, setIsReady } = useYouTubeActions();

    const [error, setError] = useState<string | null>(null);
    const { transportState } = useTransportState();

    // Extract video ID from URL in an effect instead of during render
    useEffect(() => {
        if (url) {
            const extractedId = extractYouTubeVideoId(url);
            if (extractedId !== storedVideoId) {
                setVideoId(extractedId);
            }
        }
    }, [url, storedVideoId, setVideoId]);

    // Initialize YouTube player when API is ready and videoId is available
    useEffect(() => {
        if (
            status === "ready" &&
            storedVideoId &&
            playerRef.current &&
            !ytPlayerInstanceRef.current
        ) {
            try {
                // Check if YT API is properly loaded
                if (!window.YT || !window.YT.Player) {
                    console.error("YouTube API not fully loaded");
                    setError(
                        "YouTube API failed to load properly. Please refresh the page.",
                    );
                    return;
                }

                // Create the player instance
                const player = new window.YT.Player(playerRef.current, {
                    videoId: storedVideoId,
                    height: "100%",
                    width: "100%",
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        disablekb: 1,
                        enablejsapi: 1,
                        fs: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                    },
                    events: {
                        onReady: (event: { target: YouTubePlayerInstance }) => {
                            // Verify the player has the required methods
                            const target = event.target;
                            if (
                                !target ||
                                typeof target.getCurrentTime !== "function"
                            ) {
                                console.error(
                                    "YouTube player missing required methods",
                                );
                                setError(
                                    "YouTube player initialization failed. Please refresh.",
                                );
                                return;
                            }

                            // Store the player instance
                            ytPlayerInstanceRef.current = target;
                            setPlayer(target);
                            setIsReady(true);
                            setError(null);
                        },
                        onError: (event: { data: number }) => {
                            console.error("YouTube Player Error:", event);
                            setError(
                                "Failed to load video. It may be unavailable or restricted.",
                            );
                            setIsReady(false);
                        },
                        onStateChange: () => {
                            // Handle state changes if needed
                        },
                    },
                });

                // If onReady doesn't fire within 5 seconds, show an error
                const timeoutId = setTimeout(() => {
                    if (!ytPlayerInstanceRef.current) {
                        console.error(
                            "YouTube player initialization timed out",
                        );
                        setError(
                            "YouTube player failed to initialize. Please try again.",
                        );
                        try {
                            // Try to clean up the player
                            if (
                                player &&
                                typeof player.destroy === "function"
                            ) {
                                player.destroy();
                            }
                        } catch (err) {
                            console.error(
                                "Error cleaning up timed out player:",
                                err,
                            );
                        }
                    }
                }, 5000);

                // Clear the timeout if the component unmounts
                return () => {
                    clearTimeout(timeoutId);
                };
            } catch (err) {
                console.error("Failed to initialize YouTube player:", err);
                setError("Failed to initialize YouTube player");
            }
        }

        return () => {
            if (ytPlayerInstanceRef.current) {
                try {
                    if (
                        typeof ytPlayerInstanceRef.current.destroy ===
                        "function"
                    ) {
                        ytPlayerInstanceRef.current.destroy();
                    }
                } catch (err) {
                    console.error("Error destroying YouTube player:", err);
                }
                ytPlayerInstanceRef.current = null;
                setPlayer(null);
                setIsReady(false);
            }
        };
    }, [status, storedVideoId, setPlayer, setIsReady]);

    // Handle video ID changes after initial setup
    useEffect(() => {
        if (
            ytPlayerInstanceRef.current &&
            storedVideoId &&
            status === "ready"
        ) {
            try {
                // Check if the method exists before calling it
                if (
                    typeof ytPlayerInstanceRef.current.loadVideoById ===
                    "function"
                ) {
                    ytPlayerInstanceRef.current.loadVideoById(storedVideoId);
                    setIsReady(true);
                } else {
                    console.error(
                        "YouTube player is missing loadVideoById method. Recreating player...",
                    );
                    // Destroy and recreate the player
                    if (
                        typeof ytPlayerInstanceRef.current.destroy ===
                        "function"
                    ) {
                        ytPlayerInstanceRef.current.destroy();
                    }
                    ytPlayerInstanceRef.current = null;
                    // Player will be recreated by the other useEffect
                }
            } catch (err) {
                console.error("Error loading video:", err);
                setError("Failed to load video. Please try again.");
            }
        }
    }, [storedVideoId, status, setIsReady]);

    // Sync with transport state
    useEffect(() => {
        const player = ytPlayerInstanceRef.current;
        if (!player) return;

        const stopSync = () => {
            if (syncIntervalRef.current) {
                window.clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };

        const startSync = () => {
            stopSync(); // Clear any existing interval

            // Update transportTicker based on YouTube time
            syncIntervalRef.current = window.setInterval(() => {
                try {
                    if (
                        player &&
                        typeof player.getCurrentTime === "function" &&
                        !isSeeking.current
                    ) {
                        const currentTime = player.getCurrentTime();

                        // Only update if time has changed to avoid unnecessary updates
                        if (
                            Math.abs(currentTime - lastSyncTimeRef.current) >
                            0.1
                        ) {
                            lastSyncTimeRef.current = currentTime;
                            transportTicker.set(currentTime);
                            Tone.getTransport().seconds = currentTime;
                        }
                    }
                } catch (err) {
                    console.error("Error syncing with YouTube player:", err);
                    stopSync(); // Stop sync on error to prevent console spam
                }
            }, 250); // Update 4 times per second
        };

        try {
            switch (transportState) {
                case "started":
                    if (
                        typeof player.getPlayerState === "function" &&
                        player.getPlayerState() !== 1
                    ) {
                        // 1 = playing
                        if (typeof player.playVideo === "function") {
                            player.playVideo();
                        }
                    }
                    startSync();
                    break;
                case "paused":
                    if (
                        typeof player.getPlayerState === "function" &&
                        player.getPlayerState() === 1
                    ) {
                        // 1 = playing
                        if (typeof player.pauseVideo === "function") {
                            player.pauseVideo();
                        }
                    }
                    stopSync();
                    break;
                case "stopped":
                    if (typeof player.pauseVideo === "function") {
                        player.pauseVideo();
                    }
                    if (typeof player.seekTo === "function") {
                        player.seekTo(0, true);
                    }
                    transportTicker.set(0);
                    Tone.getTransport().seconds = 0;
                    stopSync();
                    break;
            }
        } catch (err) {
            console.error("Error controlling YouTube player:", err);
        }

        return stopSync;
    }, [transportState]);

    // Handle seeking from transport - fix the redefine property error
    useEffect(() => {
        // Create the seek handler function
        const handleSeek = (time: number) => {
            try {
                if (
                    ytPlayerInstanceRef.current &&
                    typeof ytPlayerInstanceRef.current.seekTo === "function"
                ) {
                    isSeeking.current = true;
                    ytPlayerInstanceRef.current.seekTo(time, true);
                    lastSyncTimeRef.current = time;

                    // Reset the seeking flag after seeking is complete
                    setTimeout(() => {
                        isSeeking.current = false;
                    }, 200);
                }
            } catch (err) {
                console.error("Error seeking YouTube player:", err);
                isSeeking.current = false;
            }
        };

        // Store the handler in ref
        seekHandlerRef.current = handleSeek;
        const handlerName = handlerNameRef.current;

        // Make the handler available globally using a simple property assignment
        try {
            // Use simple property assignment instead of Object.defineProperty
            window[handlerName] = handleSeek;
            window.__ytSeekHandler = handleSeek;
        } catch (err) {
            console.error("Error setting up YouTube seek handler:", err);
        }

        return () => {
            // Clean up
            try {
                if (handlerName in window) {
                    window[handlerName] = undefined;
                    // Using delete is problematic in some browsers, so just set to undefined
                }

                // Clear the global reference if it's still our handler
                if (window.__ytSeekHandler === handleSeek) {
                    window.__ytSeekHandler = undefined;
                }
            } catch (err) {
                console.error("Error cleaning up YouTube seek handler:", err);
            }
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden rounded-md",
                sizeClasses[size],
                "aspect-video bg-black",
                "mx-auto", // Center horizontally
                error ? "border-2 border-red-500" : "",
                className,
            )}
        >
            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-red-500">
                    {error}
                </div>
            ) : status !== "ready" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
                    Loading YouTube player...
                </div>
            ) : null}
            <div ref={playerRef} className="h-full w-full" />
        </div>
    );
}
