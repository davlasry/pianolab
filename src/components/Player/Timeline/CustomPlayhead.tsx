import { useCallback, useEffect, useState } from "react";
import type { TransportState } from "@/lib/CustomPlayer";
import { useCustomProgressPercent } from "@/CustomTransportTicker/customTransportTicker";
import { useTimelineStore } from "@/stores/timelineStore";

const SCROLL_THRESHOLD = 0.95;
const LEFT_MARGIN_RATIO = 0.1;

interface CustomPlayheadProps {
    duration: number;
    transportState?: TransportState;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    outerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
    currentTime?: number;
}

export function CustomPlayhead({
    duration = 100,
    transportState,
    barRef,
    containerRef,
    outerRef,
    zoomLevel,
    currentTime = 0,
}: CustomPlayheadProps) {
    // Ensure valid values
    const validDuration = Math.max(1, duration);
    const validCurrentTime =
        typeof currentTime === "number" && !isNaN(currentTime)
            ? currentTime
            : 0;

    const [outerWidth, setOuterWidth] = useState(0);

    // Use our custom progress percent hook instead of the Tone.js one
    const percent = useCustomProgressPercent(validDuration);

    // Keep track of container width via ResizeObserver
    useEffect(() => {
        if (!outerRef.current) return;
        const ro = new ResizeObserver((entries) => {
            setOuterWidth(entries[0].contentRect.width);
        });
        ro.observe(outerRef.current);
        return () => ro.disconnect();
    }, [outerRef]);

    // Scroll logic
    const scrollIfNeeded = useCallback(
        (pct: number) => {
            // Get the current state directly from the store
            const currentAutoScroll =
                useTimelineStore.getState().isAutoScrollEnabled;

            if (
                !currentAutoScroll ||
                transportState !== "playing" || // Note: "playing" not "started" for CustomPlayer
                !outerRef.current ||
                !containerRef.current ||
                !barRef.current
            ) {
                return;
            }

            // Get the bar's position relative to the visible container
            const outerRect = outerRef.current.getBoundingClientRect();
            const barRect = barRef.current.getBoundingClientRect();

            // Calculate the bar's right edge position relative to the container
            const barRightEdge = barRect.left - outerRect.left + barRect.width;
            const containerRightThreshold = outerRect.width * SCROLL_THRESHOLD;

            // Only scroll if the bar is approaching the right threshold
            if (barRightEdge >= containerRightThreshold) {
                const leftMargin = outerWidth * LEFT_MARGIN_RATIO;
                const target =
                    pct * containerRef.current.scrollWidth - leftMargin;
                outerRef.current.scrollLeft = Math.max(0, target);
            }
        },
        [outerWidth, transportState, containerRef, outerRef, barRef],
    );

    // Drive playhead animation + scrolling
    useEffect(() => {
        if (barRef.current && containerRef.current) {
            // Calculate base width without zoom
            const baseWidth = containerRef.current.scrollWidth / zoomLevel;
            // Apply zoom to the position calculation
            const x = percent * baseWidth * zoomLevel;
            barRef.current.style.transform = `translateX(${x}px)`;
        }
        scrollIfNeeded(percent);
    }, [barRef, containerRef, percent, scrollIfNeeded, zoomLevel]);

    return (
        <div
            ref={barRef}
            className="absolute top-0 bottom-0 z-20 w-px bg-white"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={validDuration}
            aria-valuenow={validCurrentTime}
            aria-label="Playback position"
            tabIndex={0}
        />
    );
}
