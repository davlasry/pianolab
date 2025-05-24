import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import { useProgressLoop } from "@/components/Player/Timeline/useProgressLoop";
import type { TransportState } from "@/components/Player/hooks/useTransportState";

const SCROLL_THRESHOLD = 0.95;
const LEFT_MARGIN_RATIO = 0.1;

interface PlayheadProps {
    duration: number;
    transportState?: TransportState;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    outerRef: React.RefObject<HTMLDivElement | null>;
}

export function Playhead({
    duration,
    transportState,
    barRef,
    containerRef,
    outerRef,
}: PlayheadProps) {
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
            if (
                transportState === "started" &&
                outerRef.current &&
                containerRef.current &&
                barRef.current
            ) {
                // Get the bar's position relative to the visible container
                const outerRect = outerRef.current.getBoundingClientRect();
                const barRect = barRef.current.getBoundingClientRect();

                // Calculate the bar's right edge position relative to the container
                const barRightEdge =
                    barRect.left - outerRect.left + barRect.width;
                const containerRightThreshold =
                    outerRect.width * SCROLL_THRESHOLD;

                // Only scroll if the bar is approaching the right threshold
                if (barRightEdge >= containerRightThreshold) {
                    const leftMargin = outerWidth * LEFT_MARGIN_RATIO;
                    const target =
                        pct * containerRef.current.scrollWidth - leftMargin;
                    outerRef.current.scrollLeft = Math.max(0, target);
                }
            }
        },
        [outerWidth, transportState, containerRef, outerRef, barRef],
    );

    // Drive playhead animation + scrolling
    useProgressLoop(transportState, duration, (pct) => {
        if (barRef.current && containerRef.current) {
            const totalWidth = containerRef.current.scrollWidth;
            const x = pct * totalWidth;
            barRef.current.style.transform = `translateX(${x}px)`;
        }
        scrollIfNeeded(pct);
    });

    return (
        <div
            ref={barRef}
            className="absolute top-0 bottom-0 w-px bg-red-400"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={Tone.getTransport().seconds}
            aria-label="Playback position"
            tabIndex={0}
        />
    );
}
