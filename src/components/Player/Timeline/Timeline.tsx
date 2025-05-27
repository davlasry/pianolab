import type { MouseEvent, WheelEvent, Ref } from "react";
import {
    forwardRef,
    useRef,
    useImperativeHandle,
    useCallback,
    useEffect,
} from "react";
import { useTimelineZoom } from "@/components/Player/Timeline/useTimelineZoom";
import { useThrottle } from "@/components/Player/Timeline/useThrottle";
import { ZoomableContainer } from "@/components/Player/Timeline/ZoomableContainer";
import { Playhead } from "@/components/Player/Timeline/Playhead";
import { TimelineChords } from "@/components/Player/Timeline/TimelineChords";
import { TimelineZoomControls } from "@/components/Player/Timeline/TimelineZoomControls";
import { TimelineSelection } from "@/components/Player/Timeline/TimelineSelection";
import { TimelineSelectionControls } from "@/components/Player/Timeline/TimelineSelectionControls";
import { useTimelineSelection } from "@/components/Player/Timeline/hooks/useTimelineSelection";
import type { TransportState } from "@/components/Player/hooks/useTransportState";
import { useChordProgressionState } from "@/components/Player/hooks/useChordProgression";

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
    { duration, onSeek, transportState }: TimelineProps,
    ref: Ref<TimelineHandle>,
) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    const { zoomLevel, updateZoom, resetZoom } = useTimelineZoom();

    // Use a ref to store the current zoom level for the throttled wheel handler
    const zoomLevelRef = useRef(zoomLevel);

    // Update the ref whenever zoomLevel changes
    useEffect(() => {
        zoomLevelRef.current = zoomLevel;
    }, [zoomLevel]);

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
    } = useTimelineSelection({
        duration,
        onSeek,
        transportState,
    });

    const {
        chordProgression,
        updateChordTime,
        insertChordAtIndex,
        activeChordIndex,
        setActiveChord,
        deleteActiveChord,
    } = useChordProgressionState();

    // Handle keyboard events for chord deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                deleteActiveChord();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [deleteActiveChord]);

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
        const newZoom = Math.max(1, zoomLevelRef.current - e.deltaY * 0.005);
        updateZoom(newZoom);
    }, 50);

    // Click → seek and set end time
    const onClick = useCallback(
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
            if (isCreatingLoop) {
                handleSetEndTime(time);
            }

            if (barRef.current) {
                const x = percent * containerRef.current.scrollWidth;
                barRef.current.style.transform = `translateX(${x}px)`;
            }
        },
        [duration, onSeek, handleSetEndTime, isCreatingLoop],
    );

    return (
        <div className="relative flex flex-col gap-2">
            <TimelineSelectionControls
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
                    onWheel={onWheel}
                    onClick={onClick}
                >
                    {/*<TimelineTicks totalDuration={duration} />*/}
                    <TimelineChords
                        totalDuration={duration}
                        chordProgression={chordProgression}
                        isEditMode={true}
                        onChordUpdate={updateChordTime}
                        timelineRef={containerRef}
                        onInsertChord={insertChordAtIndex}
                        activeChordIndex={activeChordIndex}
                        onChordSelect={setActiveChord}
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
