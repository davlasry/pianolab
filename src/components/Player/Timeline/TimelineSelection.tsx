import type { RefObject } from "react";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { useTransportTime } from "@/TransportTicker/transportTicker";
import type { TransportState } from "@/components/Player/hooks/useTransportState";

interface TimelineSelectionProps {
    selectionStart: number | null;
    selectionEnd: number | null;
    duration: number;
    timelineRef: RefObject<HTMLDivElement | null>;
    transportState?: TransportState;
    onSetEndTime?: (time: number) => void;
    isCreatingLoop?: boolean;
    zoomLevel?: number;
}

export function TimelineSelection({
    selectionStart,
    selectionEnd,
    duration,
    timelineRef,
    transportState,
    onSetEndTime,
    isCreatingLoop = false,
    zoomLevel,
}: TimelineSelectionProps) {
    const [pxPerUnit, setPxPerUnit] = useState(1);
    const currentTime = useTransportTime();
    const prevTransportState = useRef<TransportState | undefined>(
        transportState,
    );

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
        const wasPlaying = prevTransportState.current === "started";
        const isNowStopped =
            transportState === "stopped" || transportState === "paused";

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

        prevTransportState.current = transportState;
    }, [
        transportState,
        selectionStart,
        selectionEnd,
        currentTime,
        onSetEndTime,
        isCreatingLoop,
    ]);

    if (selectionStart === null) return null;

    // If we have a selection start and the player is playing, use current time as end
    const isPlaying = transportState === "started";
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
