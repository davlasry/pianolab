import {
    type Ref,
    useEffect,
    forwardRef,
    useRef,
    useImperativeHandle,
} from "react";
import { useTimelineZoom } from "@/components/Player/Timeline/useTimelineZoom";
import { useTimelineScroll } from "@/components/Player/Timeline/hooks/useTimelineScroll";
import { useTimelineWheel } from "@/components/Player/Timeline/hooks/useTimelineWheel";
import { useInitialScrollPosition } from "@/components/Player/Timeline/hooks/useInitialScrollPosition";
import { ZoomableContainer } from "@/components/Player/Timeline/ZoomableContainer";
import { Playhead } from "@/components/Player/Timeline/Playhead";
import { TimelineChords } from "@/components/Player/Timeline/TimelineChords";
import { TimelineZoomControls } from "@/components/Player/Timeline/TimelineZoomControls";
import { TimelineSelection } from "@/components/Player/Timeline/TimelineSelection";
import { TimelineLoopControls } from "@/components/Player/Timeline/TimelineLoopControls";
import { useTimelineLoop } from "@/components/Player/Timeline/hooks/useTimelineLoop";
import { useTimelineClick } from "@/components/Player/Timeline/hooks/useTimelineClick";
import type { TransportState } from "@/components/Player/hooks/useTransportState";
import {
    useSelectedChordIndices,
    useActiveChordIndex,
} from "@/stores/chordsStore.ts";
import { useTimelineShortcuts } from "./hooks/useTimelineShortcuts";

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

    const {
        zoomLevel,
        updateZoom,
        resetZoom: originalResetZoom,
    } = useTimelineZoom();

    // Ref to store anchor points received from ZoomableContainer
    const zoomAnchorRef = useRef<{
        contentAnchor: number;
        viewportAnchor: number;
    } | null>(null);

    // This function will be passed to ZoomableContainer's onZoomChange
    const handleZoomChangeWithAnchors = (
        newZoom: number,
        contentAnchor?: number,
        viewportAnchor?: number,
    ) => {
        if (newZoom === zoomLevel) return; // No actual change in zoom level

        if (contentAnchor !== undefined && viewportAnchor !== undefined) {
            // If anchor points are provided (i.e., zoom-to-cursor event)
            zoomAnchorRef.current = { contentAnchor, viewportAnchor };
        } else {
            // If no anchors (e.g., zoom from buttons, or if ZoomableContainer doesn't provide them)
            zoomAnchorRef.current = null;
        }
        updateZoom(newZoom); // Call the original updateZoom from your hook
    };

    // useEffect to apply scroll adjustment after zoomLevel has changed
    useEffect(() => {
        if (zoomAnchorRef.current && outerRef.current) {
            const { contentAnchor, viewportAnchor } = zoomAnchorRef.current;
            const outerElement = outerRef.current;

            // Calculate the new scrollLeft position
            const newScrollLeft = contentAnchor * zoomLevel - viewportAnchor;

            const maxScrollLeft =
                outerElement.scrollWidth - outerElement.clientWidth;
            outerElement.scrollLeft = Math.max(
                0,
                Math.min(newScrollLeft, maxScrollLeft),
            );

            // Important: Clear the anchor details after applying them
            // so normal scrolls or subsequent non-anchored zooms don't re-apply this.
            zoomAnchorRef.current = null;
        }
    }, [zoomLevel, outerRef]); // Runs when zoomLevel (from useTimelineZoom) or outerRef changes

    const resetZoom = () => {
        zoomAnchorRef.current = null; // Clear anchors on reset
        originalResetZoom(); // Call the original resetZoom from your hook
        // Optionally, reset scroll position too:
        // if (outerRef.current) {
        //     outerRef.current.scrollLeft = 0; // Or center it, etc.
        // }
    };

    const {
        selectionStart,
        selectionEnd,
        handleSetStartAtPlayhead,
        handleSetEndTime,
        handleSubmitSelection,
        handleResetSelection,
        isSelectionComplete,
        isCreatingLoop,
        activeLoop,
        isLoopActive,
        toggleLoop,
    } = useTimelineLoop({
        duration,
        onSeek,
        transportState,
    });

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
            <TimelineLoopControls
                onSetStartAtPlayhead={handleSetStartAtPlayhead}
                onSubmitSelection={handleSubmitSelection}
                onResetSelection={handleResetSelection}
                selectionStart={selectionStart}
                isSelectionComplete={isSelectionComplete}
                isCreatingLoop={isCreatingLoop}
                activeLoop={activeLoop}
                isLoopActive={isLoopActive}
                onToggleLoop={toggleLoop}
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
                    onZoomChange={handleZoomChangeWithAnchors}
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
                    />
                </ZoomableContainer>
            </div>
        </div>
    );
};

export default forwardRef(Timeline);
