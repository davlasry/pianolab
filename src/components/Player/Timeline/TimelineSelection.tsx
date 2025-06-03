import type { RefObject } from "react";
import type { TransportState } from "@/components/Player/hooks/useTransportState";
import { SharedTimelineSelection } from "@/components/Player/Timeline/SharedTimelineSelection";
import * as Tone from "tone";

interface TimelineSelectionProps {
    selectionStart: number | null;
    selectionEnd: number | null;
    duration: number;
    timelineRef: RefObject<HTMLDivElement | null>;
    transportState?: TransportState;
    onSetEndTime?: (time: number) => void;
    isCreatingLoop?: boolean;
    zoomLevel?: number;
}

export function TimelineSelection({
    selectionStart,
    selectionEnd,
    duration,
    timelineRef,
    transportState,
    onSetEndTime,
    isCreatingLoop = false,
    zoomLevel,
}: TimelineSelectionProps) {
    const currentTime = Tone.getTransport().seconds;
    const isPlaying = transportState === "started";

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
