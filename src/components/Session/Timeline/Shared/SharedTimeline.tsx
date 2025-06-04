import { type Ref, forwardRef, useRef, useImperativeHandle } from "react";
import { TimelineChords } from "@/components/Session/Timeline/TimelineChords.tsx";
import { useTimelineClick } from "@/components/Session/Timeline/hooks/useTimelineClick.ts";
import { useInitialScrollPosition } from "@/components/Session/Timeline/hooks/useInitialScrollPosition.ts";
import { useTimelineScroll } from "@/components/Session/Timeline/hooks/useTimelineScroll.ts";
import { useTimelineWheel } from "@/components/Session/Timeline/hooks/useTimelineWheel.ts";
import { SharedTimelineSelection } from "@/components/Session/Timeline/Shared/SharedTimelineSelection.tsx";
import { TimelineZoomControls } from "@/components/Session/Timeline/TimelineZoom/TimelineZoomControls.tsx";
import { useTimelineZoom } from "@/components/Session/Timeline/TimelineZoom/useTimelineZoom.ts";
import { ZoomableContainer } from "@/components/Session/Timeline/TimelineZoom/ZoomableContainer.tsx";
import { SharedPlayhead } from "@/components/Session/Timeline/Shared/SharedPlayhead.tsx";

export interface TimelineHandle {
    scrollToBeginning: () => void;
    scrollToTime: (time: number, center?: boolean) => void;
    resetZoom: () => void;
}

export interface TimelineShortcutsOptions {
    selectedChordIndices: number[];
    activeChordIndex: number | null;
}

export interface SharedTimelineProps {
    duration: number;
    currentTime: number;
    isPlaying: boolean;
    selectionStart: number | null;
    selectionEnd: number | null;
    percentComplete: number;
    height?: number;
    onSeek: (newTime: number) => void;
    onSetEndTime?: (time: number) => void;
    isCreatingLoop?: boolean;
    useShortcuts: (options: TimelineShortcutsOptions) => void;
    selectedChordIndices: number[];
    activeChordIndex: number | null;
}

/**
 * A shared timeline component that can be used by both player implementations.
 * This component handles the UI and passes player-specific logic via props.
 */
const SharedTimeline = (
    {
        duration,
        currentTime,
        isPlaying,
        percentComplete,
        selectionStart,
        selectionEnd,
        onSeek,
        onSetEndTime,
        isCreatingLoop = false,
        useShortcuts,
        selectedChordIndices,
        activeChordIndex,
    }: SharedTimelineProps,
    ref: Ref<TimelineHandle>,
) => {
    // Ensure we have a valid duration
    const validDuration =
        typeof duration === "number" && !isNaN(duration) && duration > 0
            ? duration
            : 100;

    const barRef = useRef<HTMLDivElement>(null);
    const { outerRef, containerRef, scrollToTime, scrollToBeginning } =
        useTimelineScroll(validDuration);

    const { zoomLevel, handleZoomChange, resetZoom } =
        useTimelineZoom(outerRef);

    // Setup keyboard shortcuts
    useShortcuts({
        selectedChordIndices,
        activeChordIndex,
    });

    // Use initial scroll position hook to center playhead on mount
    useInitialScrollPosition({
        duration: validDuration,
        containerRef,
        scrollToTime,
    });

    // Expose imperative API
    useImperativeHandle(
        ref,
        () => ({
            scrollToBeginning,
            scrollToTime,
            resetZoom,
        }),
        [scrollToBeginning, scrollToTime, resetZoom],
    );

    // Handle wheel events for scrolling
    const onWheel = useTimelineWheel(outerRef);

    // Handle click events for seeking and setting end time
    const onClick = useTimelineClick({
        containerRef,
        duration: validDuration,
        onSeek,
        isCreatingLoop,
        onSetEndTime,
    });

    return (
        <div className="relative flex flex-col gap-2">
            <div className="relative">
                <TimelineZoomControls
                    resetZoom={resetZoom}
                    increaseZoom={() =>
                        handleZoomChange(Math.min(zoomLevel * 1.2, 20))
                    }
                    decreaseZoom={() =>
                        handleZoomChange(Math.max(zoomLevel / 1.2, 0.5))
                    }
                />

                <ZoomableContainer
                    outerRef={outerRef}
                    innerRef={containerRef}
                    zoomLevel={zoomLevel}
                    onZoomChange={handleZoomChange}
                    onWheel={onWheel}
                    onClick={onClick}
                >
                    <TimelineChords
                        totalDuration={validDuration}
                        isEditMode={true}
                        timelineRef={containerRef}
                        zoomLevel={zoomLevel}
                    />

                    <SharedTimelineSelection
                        selectionStart={selectionStart}
                        selectionEnd={selectionEnd}
                        currentTime={currentTime}
                        duration={validDuration}
                        timelineRef={containerRef}
                        isPlaying={isPlaying}
                        onSetEndTime={onSetEndTime}
                        isCreatingLoop={isCreatingLoop}
                        zoomLevel={zoomLevel}
                    />

                    <SharedPlayhead
                        duration={validDuration}
                        currentTime={currentTime}
                        percent={percentComplete}
                        barRef={barRef}
                        containerRef={containerRef}
                        zoomLevel={zoomLevel}
                    />
                </ZoomableContainer>
            </div>
        </div>
    );
};

export default forwardRef(SharedTimeline);
