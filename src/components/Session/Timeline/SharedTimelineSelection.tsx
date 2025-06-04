import type { RefObject } from "react";
import { useEffect, useState, useLayoutEffect, useRef } from "react";

interface SharedTimelineSelectionProps {
    selectionStart: number | null;
    selectionEnd: number | null;
    currentTime: number;
    duration: number;
    timelineRef: RefObject<HTMLDivElement | null>;
    isPlaying: boolean;
    onSetEndTime?: (time: number) => void;
    isCreatingLoop?: boolean;
    zoomLevel?: number;
}

/**
 * A shared timeline selection component that can be used by both player implementations.
 * This component is UI-only and receives all its state and handlers as props.
 */
export function SharedTimelineSelection({
    selectionStart,
    selectionEnd,
    currentTime,
    duration,
    timelineRef,
    isPlaying,
    onSetEndTime,
    isCreatingLoop = false,
    zoomLevel,
}: SharedTimelineSelectionProps) {
    const [pxPerUnit, setPxPerUnit] = useState(1);
    const prevIsPlaying = useRef<boolean>(isPlaying);

    const computeScale = () => {
        if (timelineRef.current && duration > 0) {
            setPxPerUnit(timelineRef.current.offsetWidth / duration);
        }
    };

    useLayoutEffect(computeScale, [duration, timelineRef.current, zoomLevel]);

    /* keep it responsive */
    useEffect(() => {
        window.addEventListener("resize", computeScale);
        return () => window.removeEventListener("resize", computeScale);
    }, []);

    // Auto-finalize selection when transport stops/pauses
    useEffect(() => {
        const wasPlaying = prevIsPlaying.current;
        const isNowStopped = !isPlaying;

        if (
            wasPlaying &&
            isNowStopped &&
            selectionStart !== null &&
            selectionEnd === null &&
            isCreatingLoop &&
            onSetEndTime
        ) {
            // Finalize the selection with current time
            onSetEndTime(currentTime);
        }

        prevIsPlaying.current = isPlaying;
    }, [
        isPlaying,
        selectionStart,
        selectionEnd,
        currentTime,
        onSetEndTime,
        isCreatingLoop,
    ]);

    if (selectionStart === null) return null;

    // If we have a selection start and the player is playing, use current time as end
    const effectiveEnd =
        isPlaying && selectionEnd === null ? currentTime : selectionEnd;

    const leftPx = selectionStart * pxPerUnit;
    const widthPx =
        effectiveEnd !== null
            ? Math.max(0, (effectiveEnd - selectionStart) * pxPerUnit)
            : 2;

    return (
        <div
            className="absolute top-0 bottom-0 bg-primary/20"
            style={{
                left: `${leftPx}px`,
                width: `${widthPx}px`,
            }}
        />
    );
}
