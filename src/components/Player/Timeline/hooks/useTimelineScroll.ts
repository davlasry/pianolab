import { useCallback, useRef, type RefObject } from 'react';

export interface TimelineScrollHandle {
    scrollToTime: (time: number, center?: boolean) => void;
    scrollToBeginning: () => void;
    outerRef: RefObject<HTMLDivElement>;
    containerRef: RefObject<HTMLDivElement>;
}

export const useTimelineScroll = (duration: number): TimelineScrollHandle => {
    const outerRef = useRef<HTMLDivElement>(null) as { current: HTMLDivElement };
    const containerRef = useRef<HTMLDivElement>(null) as { current: HTMLDivElement };

    const scrollToTime = useCallback((time: number, center = false) => {
        if (!outerRef.current || !containerRef.current) return;
        
        // Ensure time is within valid range
        const clampedTime = Math.max(0, Math.min(time, duration));
        const pct = clampedTime / duration;
        const totalWidth = containerRef.current.scrollWidth;
        const targetPosition = pct * totalWidth;
        
        if (center) {
            const viewportWidth = outerRef.current.clientWidth;
            let scrollPosition = Math.max(0, targetPosition - (viewportWidth / 2));
            const maxScroll = totalWidth - viewportWidth;
            scrollPosition = Math.min(scrollPosition, maxScroll > 0 ? maxScroll : 0);
            outerRef.current.scrollLeft = scrollPosition;
        } else {
            const margin = outerRef.current.clientWidth * 0.1;
            outerRef.current.scrollLeft = Math.max(0, targetPosition - margin);
        }
    }, [duration]);

    const scrollToBeginning = useCallback(() => {
        if (outerRef.current) outerRef.current.scrollLeft = 0;
    }, []);

    return {
        outerRef,
        containerRef,
        scrollToTime,
        scrollToBeginning
    };
};
