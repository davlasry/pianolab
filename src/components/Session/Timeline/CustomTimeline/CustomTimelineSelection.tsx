import type { RefObject } from "react";
import type { TransportState } from "@/lib/CustomPlayer";
import { SharedTimelineSelection } from "@/components/Session/Timeline/Shared/SharedTimelineSelection.tsx";

interface CustomTimelineSelectionProps {
    selectionStart: number | null;
    selectionEnd: number | null;
    duration: number;
    timelineRef: RefObject<HTMLDivElement | null>;
    transportState?: TransportState;
    onSetEndTime?: (time: number) => void;
    isCreatingLoop?: boolean;
    zoomLevel?: number;
}

export function CustomTimelineSelection({
    selectionStart,
    selectionEnd,
    duration,
    timelineRef,
    transportState,
    onSetEndTime,
    isCreatingLoop = false,
    zoomLevel,
}: CustomTimelineSelectionProps) {
    // In the CustomTimelineSelection, currentTime is passed via selectionEnd if isCreatingLoop is true
    const currentTime =
        isCreatingLoop && selectionEnd !== null ? selectionEnd : 0;
    const isPlaying = transportState === "playing";

    return (
        <SharedTimelineSelection
            selectionStart={selectionStart}
            selectionEnd={selectionEnd}
            currentTime={currentTime}
            duration={duration}
            timelineRef={timelineRef}
            isPlaying={isPlaying}
            onSetEndTime={onSetEndTime}
            isCreatingLoop={isCreatingLoop}
            zoomLevel={zoomLevel}
        />
    );
}
