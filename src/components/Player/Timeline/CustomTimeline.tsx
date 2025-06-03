import { type Ref, forwardRef, useRef, useImperativeHandle } from "react";
import {
    useActiveChordIndex,
    useSelectedChordIndices,
} from "@/stores/chordsStore.ts";
import { CustomPlayhead } from "@/components/Player/Timeline/CustomPlayhead";
import { TimelineChords } from "@/components/Player/Timeline/TimelineChords";
import { useTimelineClick } from "@/components/Player/Timeline/hooks/useTimelineClick";
import { useInitialScrollPosition } from "@/components/Player/Timeline/hooks/useInitialScrollPosition";
import { useTimelineScroll } from "@/components/Player/Timeline/hooks/useTimelineScroll";
import { useCustomTimelineShortcuts } from "@/components/Player/Timeline/hooks/useCustomTimelineShortcuts";
import { useTimelineWheel } from "@/components/Player/Timeline/hooks/useTimelineWheel";
import { CustomTimelineSelection } from "@/components/Player/Timeline/CustomTimelineSelection";
import { TimelineZoomControls } from "@/components/Player/Timeline/TimelineZoomControls";
import { useTimelineZoom } from "@/components/Player/Timeline/useTimelineZoom";
import { ZoomableContainer } from "@/components/Player/Timeline/ZoomableContainer";
import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";
import type { TransportState } from "@/lib/CustomPlayer";

export interface TimelineHandle {
    scrollToBeginning: () => void;
    scrollToTime: (time: number, center?: boolean) => void;
    resetZoom: () => void;
}

export interface TimelineProps {
    duration: number;
    currentTime?: number;
    height?: number;
    onSeek: (newTime: number) => void;
    transportState?: TransportState;
}

const CustomTimeline = (
    { duration = 0, onSeek, transportState, currentTime = 0 }: TimelineProps,
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

    // Get loop state from custom player context
    const { selectionStart, isCreatingLoop } = useCustomPlayerContext();
    // End time is the current time when creating a loop
    const selectionEnd = isCreatingLoop ? currentTime : null;

    // Function to handle setting end time (for compatibility with TimelineSelection)
    const handleSetEndTime = () => {
        // This is handled differently in CustomPlayerContext
        // The CustomPlayerContext's handleSubmitSelection handles this
    };

    const selectedChordIndices = useSelectedChordIndices();
    const activeChordIndex = useActiveChordIndex();

    // Setup all keyboard shortcuts
    useCustomTimelineShortcuts({
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
        barRef,
        duration: validDuration,
        onSeek,
        isCreatingLoop,
        onSetEndTime: handleSetEndTime,
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

                    <CustomTimelineSelection
                        selectionStart={selectionStart}
                        selectionEnd={selectionEnd}
                        duration={validDuration}
                        timelineRef={containerRef}
                        transportState={transportState}
                        onSetEndTime={handleSetEndTime}
                        isCreatingLoop={isCreatingLoop}
                        zoomLevel={zoomLevel}
                    />

                    <CustomPlayhead
                        duration={validDuration}
                        transportState={transportState}
                        barRef={barRef}
                        containerRef={containerRef}
                        outerRef={outerRef}
                        zoomLevel={zoomLevel}
                        currentTime={currentTime}
                    />
                </ZoomableContainer>
            </div>
        </div>
    );
};

export default forwardRef(CustomTimeline);
