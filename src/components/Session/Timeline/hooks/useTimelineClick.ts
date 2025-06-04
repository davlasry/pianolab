import { useCallback } from "react";
import type { MouseEvent } from "react";

interface UseTimelineClickProps {
    containerRef: { current: HTMLDivElement };
    duration: number;
    onSeek: (time: number) => void;
    isCreatingLoop?: boolean;
    onSetEndTime?: (time: number) => void;
}

export const useTimelineClick = ({
    containerRef,
    duration,
    onSeek,
    isCreatingLoop,
    onSetEndTime,
}: UseTimelineClickProps) => {
    return useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            // Check if we clicked on a chord block or any of its children
            const target = e.target as HTMLElement;
            const isChordClick = target.closest(
                '[data-component="DraggableResizableBlock"]',
            );
            if (isChordClick) return;

            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const time = percent * duration;

            if (!Number.isFinite(time) || time < 0) return;

            // Always seek to clicked position
            onSeek(time);

            // Only set end time if we're actively creating a loop
            if (isCreatingLoop && onSetEndTime) {
                onSetEndTime(time);
            }
        },
        [containerRef, duration, onSeek, isCreatingLoop, onSetEndTime],
    );
};
