import type { MouseEvent, WheelEvent, Ref } from "react";
import { forwardRef, useRef, useImperativeHandle, useCallback } from "react";
import { useTimelineZoom } from "@/components/Player/Timeline/useTimelineZoom";
import { useThrottle } from "@/components/Player/Timeline/useThrottle";
import { ZoomableContainer } from "@/components/Player/Timeline/ZoomableContainer";
import { Playhead } from "@/components/Player/Timeline/Playhead";
import { TimelineTicks } from "@/components/Player/Timeline/TimelineTicks";
import { TimelineChords } from "@/components/Player/Timeline/TimelineChords";
import { TimelineZoomControls } from "@/components/Player/Timeline/TimelineZoomControls";
import { TimelineSelection } from "@/components/Player/Timeline/TimelineSelection";
import { TimelineSelectionControls } from "@/components/Player/Timeline/TimelineSelectionControls";
import { useTimelineSelection } from "@/components/Player/Timeline/hooks/useTimelineSelection";
import type { TransportState } from "@/components/Player/hooks/useTransportState";

export interface TimelineHandle {
    scrollToBeginning: () => void;
    scrollToTime: (time: number) => void;
    resetZoom: () => void;
}

export interface TimelineProps {
    duration: number;
    height?: number;
    onSeek: (newTime: number) => void;
    transportState?: TransportState;
}

const Timeline = (
    { duration, height = 80, onSeek, transportState }: TimelineProps,
    ref: Ref<TimelineHandle>,
) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    const { zoomLevel, updateZoom, resetZoom } = useTimelineZoom();
    const {
        selectionStart,
        selectionEnd,
        handleSetStartAtPlayhead,
        handleSetEndTime,
        handleSubmitSelection,
        handleResetSelection,
        isSelectionComplete,
    } = useTimelineSelection({ duration, onSeek });

    // Expose imperative API
    useImperativeHandle(
        ref,
        () => ({
            scrollToBeginning: () => {
                if (outerRef.current) outerRef.current.scrollLeft = 0;
            },
            scrollToTime: (time: number) => {
                if (!outerRef.current || !containerRef.current) return;
                const pct = Math.min(Math.max(time / duration, 0), 1);
                const margin = outerRef.current.clientWidth * 0.1;
                outerRef.current.scrollLeft =
                    pct * containerRef.current.scrollWidth - margin;
            },
            resetZoom,
        }),
        [duration, resetZoom],
    );

    // Throttled wheel → zoom
    const onWheel = useThrottle((e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const newZoom = Math.max(1, zoomLevel - e.deltaY * 0.005);
        updateZoom(newZoom);
    }, 50);

    // Click → seek and set end time
    const onClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const t = pct * duration;

            if (!Number.isFinite(t) || t < 0) return;

            // Always seek to clicked position
            onSeek(t);

            // Set end time if we have a start time
            handleSetEndTime(t);

            if (barRef.current) {
                barRef.current.style.transform = `translateX(${pct * 100}%)`;
            }
        },
        [duration, onSeek, handleSetEndTime],
    );

    return (
        <div className="relative flex flex-col gap-2">
            <TimelineSelectionControls
                onSetStartAtPlayhead={handleSetStartAtPlayhead}
                onSubmitSelection={handleSubmitSelection}
                onResetSelection={handleResetSelection}
                selectionStart={selectionStart}
                isSelectionComplete={isSelectionComplete}
            />

            <div className="relative">
                <TimelineZoomControls
                    resetZoom={resetZoom}
                    zoomLevel={zoomLevel}
                />

                <ZoomableContainer
                    outerRef={outerRef}
                    innerRef={containerRef}
                    zoomLevel={zoomLevel}
                    height={height}
                    onWheel={onWheel}
                    onClick={onClick}
                >
                    <TimelineTicks totalDuration={duration} />
                    <TimelineChords totalDuration={duration} />

                    <TimelineSelection
                        selectionStart={selectionStart}
                        selectionEnd={selectionEnd}
                        duration={duration}
                    />

                    <Playhead
                        duration={duration}
                        transportState={transportState}
                        barRef={barRef}
                        containerRef={containerRef}
                        outerRef={outerRef}
                    />
                </ZoomableContainer>
            </div>
        </div>
    );
};

export default forwardRef(Timeline);
