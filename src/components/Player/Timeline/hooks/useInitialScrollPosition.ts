import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { transportTicker } from "@/TransportTicker/transportTicker";

interface UseInitialScrollPositionProps {
    duration: number;
    containerRef: RefObject<HTMLDivElement>;
    scrollToTime: (time: number, center?: boolean) => void;
}

export const useInitialScrollPosition = ({
    duration,
    containerRef,
    scrollToTime,
}: UseInitialScrollPositionProps) => {
    const [hasScrolledToInitialPosition, setHasScrolledToInitialPosition] =
        useState(false);

    useEffect(() => {
        if (hasScrolledToInitialPosition || !duration || !containerRef.current)
            return;

        const time = transportTicker.getSnapshot();
        if (time > 0 && time < duration) {
            setTimeout(() => {
                scrollToTime(time, true);
                setHasScrolledToInitialPosition(true);
            }, 300);
        }
    }, [duration, hasScrolledToInitialPosition, containerRef, scrollToTime]);
};
