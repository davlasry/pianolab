import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import type { TransportState } from "@/components/Player/hooks/useTransportState";
import { useProgressPercent } from "@/TransportTicker/transportTicker.ts";
import { useAutoScrollEnabled } from "@/stores/timelineStore";

const SCROLL_THRESHOLD = 0.95;
const LEFT_MARGIN_RATIO = 0.1;

interface PlayheadProps {
    duration: number;
    transportState?: TransportState;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    outerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
}

export function Playhead({
    duration,
    transportState,
    barRef,
    containerRef,
    outerRef,
    zoomLevel,
}: PlayheadProps) {
    const [outerWidth, setOuterWidth] = useState(0);
    const percent = useProgressPercent(duration);
    const isAutoScrollEnabled = useAutoScrollEnabled();

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
            if (
                !isAutoScrollEnabled ||
                transportState !== "started" ||
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
        [
            outerWidth,
            transportState,
            containerRef,
            outerRef,
            barRef,
            isAutoScrollEnabled,
        ],
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
            aria-valuenow={Tone.getTransport().seconds}
            aria-label="Playback position"
            tabIndex={0}
        />
    );
}
