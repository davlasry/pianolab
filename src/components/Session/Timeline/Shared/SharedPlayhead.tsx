import { useCallback, useEffect, useRef } from "react";
import { useTimelineStore } from "@/stores/timelineStore.ts";
import { useThrottledCallback } from "@/hooks/useThrottledCallback";

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
    const cachedDimensions = useRef({ containerWidth: 0, outerWidth: 0 });
    const lastPercent = useRef(percent);

    // Keep track of container width via ResizeObserver with caching
    useEffect(() => {
        if (!outerRef.current || !containerRef.current) return;
        
        const updateDimensions = (entries?: ResizeObserverEntry[]) => {
            const outerRect = entries?.[0]?.contentRect || outerRef.current!.getBoundingClientRect();
            const containerWidth = containerRef.current!.scrollWidth;
            
            cachedDimensions.current = {
                containerWidth,
                outerWidth: outerRect.width
            };
        };
        
        // Initial measurement
        updateDimensions();
        
        const ro = new ResizeObserver(updateDimensions);
        ro.observe(outerRef.current);
        return () => ro.disconnect();
    }, [outerRef, containerRef]);

    // Optimized scroll logic with cached dimensions
    const scrollLogic = useCallback(
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

            // Use cached dimensions to avoid expensive DOM queries
            const { containerWidth, outerWidth: cachedOuterWidth } = cachedDimensions.current;
            const currentX = pct * containerWidth * zoomLevel;
            const containerRightThreshold = cachedOuterWidth * SCROLL_THRESHOLD;
            const viewportLeft = outerRef.current.scrollLeft;
            const barRightEdge = currentX - viewportLeft;

            // Only scroll if the bar is approaching the right threshold
            if (barRightEdge >= containerRightThreshold) {
                const leftMargin = cachedOuterWidth * LEFT_MARGIN_RATIO;
                const target = currentX - leftMargin;
                outerRef.current.scrollLeft = Math.max(0, target);
            }
        },
        [isPlaying, containerRef, outerRef, barRef, zoomLevel],
    );
    
    // Throttled version for performance
    const throttledScrollCheck = useThrottledCallback(scrollLogic, 100);

    // Optimized playhead animation with CSS custom properties
    useEffect(() => {
        if (barRef.current && containerRef.current) {
            // Calculate base width without zoom
            const baseWidth = containerRef.current.scrollWidth / zoomLevel;
            // Apply zoom to the position calculation
            const x = percent * baseWidth * zoomLevel;
            
            // Use CSS custom property for better performance
            barRef.current.style.setProperty('--playhead-x', `${x}px`);
        }
        
        // Only trigger scroll check if percent actually changed significantly
        if (Math.abs(percent - lastPercent.current) > 0.001) {
            throttledScrollCheck(percent);
            lastPercent.current = percent;
        }
    }, [barRef, containerRef, percent, throttledScrollCheck, zoomLevel]);

    return (
        <div
            ref={barRef}
            className="playhead-bar absolute top-0 bottom-0 z-20 w-px bg-white"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-label="Playback position"
            tabIndex={0}
        />
    );
}
