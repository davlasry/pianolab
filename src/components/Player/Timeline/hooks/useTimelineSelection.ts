import { useState, useCallback, useEffect } from "react";
import * as Tone from "tone";
import { useTransportTime } from "@/TransportTicker/transportTicker";
import type { TransportState } from "@/components/Player/hooks/useTransportState";

interface UseTimelineSelectionProps {
    duration: number;
    onSeek: (time: number) => void;
    transportState?: TransportState;
}

interface UseTimelineSelectionReturn {
    selectionStart: number | null;
    selectionEnd: number | null;
    handleSetStartAtPlayhead: () => void;
    handleSetEndTime: (time: number) => void;
    handleSubmitSelection: () => void;
    handleResetSelection: () => void;
    isSelectionComplete: boolean;
    isCreatingLoop: boolean;
    // Loop functionality
    activeLoop: { start: number; end: number } | null;
    isLoopActive: boolean;
    toggleLoop: () => void;
}

export function useTimelineSelection({
    duration,
    onSeek,
    transportState,
}: UseTimelineSelectionProps): UseTimelineSelectionReturn {
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
    const [isCreatingLoop, setIsCreatingLoop] = useState(false);
    const [activeLoop, setActiveLoop] = useState<{
        start: number;
        end: number;
    } | null>(null);
    const [isLoopActive, setIsLoopActive] = useState(false);

    // Get current transport time for loop monitoring
    const currentTime = useTransportTime();

    // Loop monitoring effect - this is the "separate loop monitoring effect"
    useEffect(() => {
        // Only monitor if loop is active and player is playing
        if (!isLoopActive || !activeLoop || transportState !== "started") {
            return;
        }

        // Check if current time has reached or passed the loop end
        if (currentTime >= activeLoop.end) {
            console.log(
                `Loop detected: currentTime (${currentTime}) >= loop end (${activeLoop.end}), seeking to start (${activeLoop.start})`,
            );
            // We've reached the end of the loop - jump back to start
            onSeek(activeLoop.start);
        }
    }, [currentTime, isLoopActive, activeLoop, transportState, onSeek]);

    const handleSetStartAtPlayhead = useCallback(() => {
        const currentTime = Tone.getTransport().seconds;
        console.log("currentTime =====>", currentTime);
        if (currentTime >= 0 && currentTime <= duration) {
            setSelectionStart(currentTime);
            setSelectionEnd(null); // Reset end when starting new loop
            setIsCreatingLoop(true); // Enter loop creation mode
            // Deactivate any existing loop when starting a new one
            setIsLoopActive(false);
            setActiveLoop(null);
            onSeek(currentTime);
        }
    }, [duration, onSeek]);

    const handleSetEndTime = useCallback(
        (time: number) => {
            if (selectionStart !== null && time >= 0 && time <= duration) {
                setSelectionEnd(time);
            }
        },
        [duration, selectionStart],
    );

    const handleSubmitSelection = useCallback(() => {
        if (selectionStart !== null) {
            // Use current time as end if no end is set yet
            const currentTime = Tone.getTransport().seconds;
            const finalEnd = selectionEnd !== null ? selectionEnd : currentTime;

            // Ensure start is always less than end
            const start = Math.min(selectionStart, finalEnd);
            const end = Math.max(selectionStart, finalEnd);

            // Finalize the selection but keep it visible
            setSelectionEnd(end);
            setIsCreatingLoop(false); // Exit loop creation mode

            // Activate the loop and seek to start
            const loopData = { start, end };
            setActiveLoop(loopData);
            setIsLoopActive(true);
            onSeek(start); // Seek to loop start
        }
    }, [selectionStart, selectionEnd, onSeek]);

    const handleResetSelection = useCallback(() => {
        setSelectionStart(null);
        setSelectionEnd(null);
        setIsCreatingLoop(false);
        setActiveLoop(null);
        setIsLoopActive(false);
    }, []);

    const toggleLoop = useCallback(() => {
        if (activeLoop) {
            setIsLoopActive((prev) => {
                const newState = !prev;
                if (newState) {
                    onSeek(activeLoop.start);
                }
                return newState;
            });
        }
    }, [activeLoop, onSeek]);

    return {
        selectionStart,
        selectionEnd,
        handleSetStartAtPlayhead,
        handleSetEndTime,
        handleSubmitSelection,
        handleResetSelection,
        isSelectionComplete: isCreatingLoop,
        isCreatingLoop,
        // Loop functionality
        activeLoop,
        isLoopActive,
        toggleLoop,
    };
}
