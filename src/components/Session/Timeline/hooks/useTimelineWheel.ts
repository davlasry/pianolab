import type { WheelEvent } from "react";
import { type RefObject } from "react";
import { useThrottle } from "@/components/Session/Timeline/TimelineZoom/useThrottle.ts";

export const useTimelineWheel = (outerRef: RefObject<HTMLDivElement>) => {
    return useThrottle((e: WheelEvent<HTMLDivElement>) => {
        // Only handle non-zoom wheel events (zoom is handled in ZoomableContainer)
        if (!e.ctrlKey && outerRef.current) {
            e.preventDefault();
            outerRef.current.scrollLeft += e.deltaX || e.deltaY / 2;
        }
    }, 50);
};
