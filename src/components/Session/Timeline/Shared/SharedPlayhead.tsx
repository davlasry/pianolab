import { useCallback, useEffect, useState } from "react";
import { useTimelineStore } from "@/stores/timelineStore.ts";

const SCROLL_THRESHOLD = 0.95;
const LEFT_MARGIN_RATIO = 0.1;

interface SharedPlayheadProps {
    duration: number;
    isPlaying: boolean;
    percent: number;
    currentTime: number;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    outerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
}

/**
 * A shared playhead component that can be used by both player implementations.
 * This component is UI-only and receives all its state and refs as props.
 */
export function SharedPlayhead({
    duration,
    isPlaying,
    percent,
    currentTime,
    barRef,
    containerRef,
    outerRef,
    zoomLevel,
}: SharedPlayheadProps) {
    const [outerWidth, setOuterWidth] = useState(0);

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
                !isPlaying ||
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
        [outerWidth, isPlaying, containerRef, outerRef, barRef],
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
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-label="Playback position"
            tabIndex={0}
        />
    );
}
