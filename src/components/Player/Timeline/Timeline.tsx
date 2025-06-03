import { type Ref, forwardRef, useRef, useImperativeHandle } from "react";
import {
    useActiveChordIndex,
    useSelectedChordIndices,
} from "@/stores/chordsStore.ts";
import { Playhead } from "@/components/Player/Timeline/Playhead";
import { TimelineChords } from "@/components/Player/Timeline/TimelineChords";
import { useTimelineClick } from "@/components/Player/Timeline/hooks/useTimelineClick";
import { useInitialScrollPosition } from "@/components/Player/Timeline/hooks/useInitialScrollPosition";
import { useTimelineScroll } from "@/components/Player/Timeline/hooks/useTimelineScroll";
import { useTimelineShortcuts } from "@/components/Player/Timeline/hooks/useTimelineShortcuts";
import { useTimelineWheel } from "@/components/Player/Timeline/hooks/useTimelineWheel";
import { TimelineSelection } from "@/components/Player/Timeline/TimelineSelection";
import { TimelineZoomControls } from "@/components/Player/Timeline/TimelineZoomControls";
import { useTimelineZoom } from "@/components/Player/Timeline/useTimelineZoom";
import { ZoomableContainer } from "@/components/Player/Timeline/ZoomableContainer";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";
import type { TransportState } from "@/components/Player/hooks/useTransportState";

export interface TimelineHandle {
    scrollToBeginning: () => void;
    scrollToTime: (time: number, center?: boolean) => void;
    resetZoom: () => void;
}

export interface TimelineProps {
    duration: number;
    height?: number;
    onSeek: (newTime: number) => void;
    transportState?: TransportState;
}

const Timeline = (
    { duration, onSeek, transportState }: TimelineProps,
    ref: Ref<TimelineHandle>,
) => {
    const barRef = useRef<HTMLDivElement>(null);
    const { outerRef, containerRef, scrollToTime, scrollToBeginning } =
        useTimelineScroll(duration);

    const { zoomLevel, handleZoomChange, resetZoom } =
        useTimelineZoom(outerRef);

    // Get only the needed loop state values from PlayerContext
    const { selectionStart, selectionEnd, handleSetEndTime, isCreatingLoop } =
        usePlayerContext();

    const selectedChordIndices = useSelectedChordIndices();
    const activeChordIndex = useActiveChordIndex();

    // Setup all keyboard shortcuts
    useTimelineShortcuts({
        selectedChordIndices,
        activeChordIndex,
    });

    // Use initial scroll position hook to center playhead on mount
    useInitialScrollPosition({
        duration,
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
        duration,
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
                    {/*<TimelineTicks totalDuration={duration} />*/}
                    <TimelineChords
                        totalDuration={duration}
                        isEditMode={true}
                        timelineRef={containerRef}
                        zoomLevel={zoomLevel}
                    />

                    <TimelineSelection
                        selectionStart={selectionStart}
                        selectionEnd={selectionEnd}
                        duration={duration}
                        timelineRef={containerRef}
                        transportState={transportState}
                        onSetEndTime={handleSetEndTime}
                        isCreatingLoop={isCreatingLoop}
                        zoomLevel={zoomLevel}
                    />

                    <Playhead
                        duration={duration}
                        transportState={transportState}
                        barRef={barRef}
                        containerRef={containerRef}
                        outerRef={outerRef}
                        zoomLevel={zoomLevel}
                    />
                </ZoomableContainer>
            </div>
        </div>
    );
};

export default forwardRef(Timeline);
