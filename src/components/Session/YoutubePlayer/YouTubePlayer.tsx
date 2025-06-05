import { useEffect, useRef, useState } from "react";
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI.ts";
import { extractYouTubeVideoId } from "@/utils/youtubeUtils.ts";
import {
    useYouTubeActions,
    useYouTubeIsVisible,
    useYouTubeUrl,
    useYouTubeVideoId,
} from "@/stores/youtubeStore.ts";
import { transportTicker } from "@/TransportTicker/transportTicker.ts";
import { useTransportState } from "@/components/Session/hooks/useTransportState.ts";
import { usePlayerContext } from "@/components/Session/context/PlayerContext.tsx";
import * as Tone from "tone";
import { cn } from "@/lib/utils.ts";

// YouTube sync offset in seconds - positive value makes YouTube lag behind MIDI/chords
const YOUTUBE_SYNC_OFFSET = 0.4;

// Define a type for the YouTube player instance
interface YouTubePlayerInstance {
    destroy: () => void;
    loadVideoById: (videoId: string) => void;
    cueVideoById: (videoId: string) => void;
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
        __ytSeekHandler?: (time: number, callback?: (actualTime: number) => void) => void;
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
    const lastSeekTimeRef = useRef<number>(0);
    const lastSeekTimestampRef = useRef<number>(0);
    const seekHandlerRef = useRef<((time: number) => void) | null>(null);
    const handlerNameRef = useRef<string>(`__ytSeekHandler_${Date.now()}`);
    const lastYouTubeStateRef = useRef<number>(-1);

    const { status } = useYouTubeAPI();
    const url = useYouTubeUrl();
    const storedVideoId = useYouTubeVideoId();
    const isVisible = useYouTubeIsVisible();
    const { setPlayer, setVideoId, setIsReady } = useYouTubeActions();

    const [error, setError] = useState<string | null>(null);
    const { transportState } = useTransportState();
    const { play, pause, stop, isPlaying } = usePlayerContext();
    
    // Flag to prevent sync loops when we programmatically control YouTube
    const isUpdatingYouTubeRef = useRef<boolean>(false);
    // Flag to prevent auto-play during YouTube initialization
    const isInitializingRef = useRef<boolean>(false);
    // Store player context functions in refs to avoid stale closures
    const playerContextRef = useRef({ play, pause, stop, isPlaying });
    playerContextRef.current = { play, pause, stop, isPlaying };

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
                            // Set initialization flag to prevent auto-play
                            isInitializingRef.current = true;
                            
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
                            
                            // Sync with current transport position or transportTicker if transport is at 0
                            let syncTime = Tone.getTransport().seconds;
                            
                            // If Tone.js transport is at 0 but transportTicker has a restored position, use that
                            if (syncTime === 0) {
                                const tickerTime = transportTicker.getSnapshot();
                                if (tickerTime > 0) {
                                    Tone.getTransport().seconds = tickerTime;
                                    syncTime = tickerTime;
                                }
                            }
                            
                            if (syncTime > 0) {
                                // Apply offset to make YouTube seek ahead to compensate for lag
                                target.seekTo(Math.max(0, syncTime - YOUTUBE_SYNC_OFFSET), true);
                                lastSyncTimeRef.current = syncTime;
                            }
                            
                            // Immediately pause to prevent any auto-play
                            if (typeof target.pauseVideo === "function") {
                                target.pauseVideo();
                            }
                            
                            // Clear initialization flag quickly to allow state changes
                            setTimeout(() => {
                                isInitializingRef.current = false;
                            }, 100);
                        },
                        onError: (event: { data: number }) => {
                            console.error("YouTube Player Error:", event);
                            setError(
                                "Failed to load video. It may be unavailable or restricted.",
                            );
                            setIsReady(false);
                        },
                        onStateChange: (event: { data: number }) => {
                            // Track the YouTube state to prevent duplicate processing
                            const currentYTState = event.data;
                            const previousYTState = lastYouTubeStateRef.current;
                            lastYouTubeStateRef.current = currentYTState;

                            // Don't sync if we're programmatically updating YouTube or during initialization
                            if (isUpdatingYouTubeRef.current || isInitializingRef.current) {
                                return;
                            }

                            // Ignore if state hasn't actually changed (YouTube can fire duplicate events)
                            if (currentYTState === previousYTState) {
                                return;
                            }

                            // YouTube player states:
                            // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = video cued
                            
                            // Process state change immediately for user interactions
                            // Get current values from ref to avoid stale closures
                            const { play: currentPlay, pause: currentPause, stop: currentStop, isPlaying: currentIsPlaying } = playerContextRef.current;
                            
                            switch (currentYTState) {
                                case 1: // playing
                                    if (!currentIsPlaying) {
                                        currentPlay();
                                    }
                                    break;
                                case 2: // paused
                                    if (currentIsPlaying) {
                                        currentPause();
                                    }
                                    break;
                                case 0: // ended
                                    currentStop();
                                    break;
                            }
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
            // Only cleanup on unmount, not on dependency changes
            // This prevents the player from being destroyed and recreated unnecessarily
        };
    }, [status, storedVideoId, setPlayer, setIsReady]);

    // Separate cleanup effect that only runs on unmount
    useEffect(() => {
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
                lastYouTubeStateRef.current = -1;
            }
        };
    }, [setPlayer, setIsReady]);

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
                    // Set initialization flag when loading new video
                    isInitializingRef.current = true;
                    ytPlayerInstanceRef.current.loadVideoById(storedVideoId);
                    
                    // Immediately pause after loading
                    if (typeof ytPlayerInstanceRef.current.pauseVideo === "function") {
                        ytPlayerInstanceRef.current.pauseVideo();
                    }
                    
                    setIsReady(true);
                    
                    // Sync with current transport position after cuing new video
                    let syncTime = Tone.getTransport().seconds;
                    
                    // If Tone.js transport is at 0 but transportTicker has a position, use that
                    if (syncTime === 0) {
                        const tickerTime = transportTicker.getSnapshot();
                        if (tickerTime > 0) {
                            Tone.getTransport().seconds = tickerTime;
                            syncTime = tickerTime;
                        }
                    }
                    
                    if (syncTime > 0) {
                        // Wait a bit for video to cue before seeking
                        setTimeout(() => {
                            if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.seekTo === "function") {
                                // Apply offset to make YouTube seek ahead to compensate for lag
                                ytPlayerInstanceRef.current.seekTo(Math.max(0, syncTime - YOUTUBE_SYNC_OFFSET), true);
                                lastSyncTimeRef.current = syncTime;
                            }
                        }, 500);
                    }
                    
                    // Clear flag quickly to allow state changes
                    setTimeout(() => {
                        isInitializingRef.current = false;
                    }, 100);
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
                        // Apply offset to make YouTube appear behind MIDI/chords
                        const offsetTime = currentTime + YOUTUBE_SYNC_OFFSET;
                        const transportTime = Tone.getTransport().seconds;

                        // Check if we recently seeked (within last 5 seconds)
                        const timeSinceLastSeek = Date.now() - lastSeekTimestampRef.current;
                        const isRecentSeek = timeSinceLastSeek < 5000;
                        
                        // Only update if time has changed and we haven't recently seeked
                        const timeDiff = Math.abs(offsetTime - lastSyncTimeRef.current);
                        const transportDiff = Math.abs(offsetTime - transportTime);
                        
                        if (isRecentSeek) {
                            // Completely block sync for 5 seconds after any seek to prevent interference
                        } else if (timeDiff > 0.1 && transportDiff < 2.0) {
                            lastSyncTimeRef.current = offsetTime;
                            transportTicker.set(offsetTime);
                            Tone.getTransport().seconds = offsetTime;
                        } else if (transportDiff >= 2.0) {
                        }
                    }
                } catch (err) {
                    console.error("Error syncing with YouTube player:", err);
                    stopSync(); // Stop sync on error to prevent console spam
                }
            }, 250); // Update 4 times per second
        };

        try {
            // Ensure player methods exist before proceeding
            if (!player.getPlayerState || !player.playVideo || !player.pauseVideo) {
                console.error("YouTube player missing required methods");
                return;
            }
            
            const ytState = player.getPlayerState();
            
            let shouldSetFlag = false;
            
            switch (transportState) {
                case "started":
                    // Ensure Tone.js transport and YouTube are at the correct position before playing
                    let transportTime = Tone.getTransport().seconds;
                    
                    // If Tone.js transport is at 0 but transportTicker has a position, sync Tone.js first
                    if (transportTime === 0) {
                        const tickerTime = transportTicker.getSnapshot();
                        if (tickerTime > 0) {
                            Tone.getTransport().seconds = tickerTime;
                            transportTime = tickerTime;
                        }
                    }
                    
                    const youtubeCurrentTime = player.getCurrentTime();
                    
                    // If transport has a different position than YouTube, sync YouTube
                    if (Math.abs(transportTime - youtubeCurrentTime) > 0.5) {
                        // Apply offset to make YouTube seek ahead to compensate for lag
                        player.seekTo(Math.max(0, transportTime - YOUTUBE_SYNC_OFFSET), true);
                        lastSyncTimeRef.current = transportTime;
                    }
                    
                    // Only play if YouTube is not already playing (1) or buffering (3)
                    if (ytState !== 1 && ytState !== 3) {
                        shouldSetFlag = true;
                        isUpdatingYouTubeRef.current = true;
                        player.playVideo();
                    }
                    startSync();
                    break;
                case "paused":
                    // Only pause if YouTube is currently playing (1) or buffering (3)
                    if (ytState === 1 || ytState === 3) {
                        shouldSetFlag = true;
                        isUpdatingYouTubeRef.current = true;
                        player.pauseVideo();
                    }
                    stopSync();
                    break;
                case "stopped":
                    shouldSetFlag = true;
                    isUpdatingYouTubeRef.current = true;
                    player.pauseVideo();
                    if (typeof player.seekTo === "function") {
                        player.seekTo(0, true);
                    }
                    transportTicker.set(0);
                    Tone.getTransport().seconds = 0;
                    stopSync();
                    break;
            }
            
            // Only reset flag if we actually controlled YouTube
            if (shouldSetFlag) {
                setTimeout(() => {
                    isUpdatingYouTubeRef.current = false;
                }, 100);
            }
        } catch (err) {
            console.error("Error controlling YouTube player:", err);
            isUpdatingYouTubeRef.current = false;
        }

        return stopSync;
    }, [transportState]);

    // Handle seeking from transport - fix the redefine property error
    useEffect(() => {
        // Create the seek handler function that waits for YouTube to be ready
        const handleSeek = (time: number, callback?: (actualTime: number) => void) => {
            try {
                if (
                    ytPlayerInstanceRef.current &&
                    typeof ytPlayerInstanceRef.current.seekTo === "function"
                ) {
                    isSeeking.current = true;
                    (window as any).__ytSeeking = true; // Block TransportTickerProvider
                    const targetTime = Math.max(0, time - YOUTUBE_SYNC_OFFSET);
                    
                    // Record seek details for smart sync filtering
                    lastSeekTimeRef.current = time;
                    lastSeekTimestampRef.current = Date.now();
                    
                    // Apply offset to make YouTube seek ahead to compensate for lag
                    ytPlayerInstanceRef.current.seekTo(targetTime, true);
                    lastSyncTimeRef.current = time;

                    // Wait for YouTube to actually reach the target position
                    const waitForSeekComplete = () => {
                        if (!ytPlayerInstanceRef.current) {
                            isSeeking.current = false;
                            callback?.(time); // fallback to original time
                            return;
                        }

                        try {
                            const currentTime = ytPlayerInstanceRef.current.getCurrentTime();
                            const diff = Math.abs(currentTime - targetTime);
                            
                            if (diff < 0.3) {
                                // YouTube has reached the target, now update transport
                                const actualTransportTime = currentTime + YOUTUBE_SYNC_OFFSET;
                                isSeeking.current = false;
                                (window as any).__ytSeeking = false; // Re-enable TransportTickerProvider
                                callback?.(actualTransportTime);
                            } else {
                                // Keep waiting, check again in 50ms
                                setTimeout(waitForSeekComplete, 50);
                            }
                        } catch {
                            // Fallback on error
                            isSeeking.current = false;
                            (window as any).__ytSeeking = false;
                            callback?.(time);
                        }
                    };

                    // Start checking after a brief delay
                    setTimeout(waitForSeekComplete, 100);
                    
                    // Fallback timeout to prevent infinite waiting
                    setTimeout(() => {
                        if (isSeeking.current) {
                            isSeeking.current = false;
                            (window as any).__ytSeeking = false;
                            callback?.(time);
                        }
                    }, 2000);
                } else {
                    // No YouTube player, proceed immediately
                    callback?.(time);
                }
            } catch (err) {
                console.error("Error seeking YouTube player:", err);
                isSeeking.current = false;
                (window as any).__ytSeeking = false;
                callback?.(time);
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
