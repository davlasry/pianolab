import { useCallback, useRef, type RefObject } from "react";

export interface TimelineScrollHandle {
    scrollToTime: (time: number, center?: boolean) => void;
    scrollToBeginning: () => void;
    outerRef: RefObject<HTMLDivElement>;
    containerRef: RefObject<HTMLDivElement>;
}

export const useTimelineScroll = (duration: number): TimelineScrollHandle => {
    const outerRef = useRef<HTMLDivElement>(null) as {
        current: HTMLDivElement;
    };
    const containerRef = useRef<HTMLDivElement>(null) as {
        current: HTMLDivElement;
    };

    const scrollToTime = useCallback(
        (time: number, center = false) => {
            if (!outerRef.current || !containerRef.current) return;

            // Only scroll if center is explicitly requested (for initial load)
            if (center) {
                // Ensure time is within valid range
                const clampedTime = Math.max(0, Math.min(time, duration));
                const pct = clampedTime / duration;
                const totalWidth = containerRef.current.scrollWidth;
                const targetPosition = pct * totalWidth;

                const viewportWidth = outerRef.current.clientWidth;
                let scrollPosition = Math.max(
                    0,
                    targetPosition - viewportWidth / 2,
                );
                const maxScroll = totalWidth - viewportWidth;
                scrollPosition = Math.min(
                    scrollPosition,
                    maxScroll > 0 ? maxScroll : 0,
                );
                outerRef.current.scrollLeft = scrollPosition;
            }
            // If center=false, don't scroll at all - let the playhead stay where the user clicked
        },
        [duration],
    );

    const scrollToBeginning = useCallback(() => {
        if (outerRef.current) outerRef.current.scrollLeft = 0;
    }, []);

    return {
        outerRef,
        containerRef,
        scrollToTime,
        scrollToBeginning,
    };
};
