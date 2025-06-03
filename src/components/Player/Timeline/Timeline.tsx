import { type Ref, forwardRef } from "react";
import {
    useActiveChordIndex,
    useSelectedChordIndices,
} from "@/stores/chordsStore.ts";
import {
    useTransportTime,
    useProgressPercent,
} from "@/TransportTicker/transportTicker";
import { useTimelineShortcuts } from "@/components/Player/Timeline/hooks/useTimelineShortcuts";
import { usePlayerContext } from "@/components/Player/context/PlayerContext";
import type { TransportState } from "@/components/Player/hooks/useTransportState";
import SharedTimeline, {
    type TimelineHandle,
} from "@/components/Player/Timeline/SharedTimeline";

export interface TimelineProps {
    duration: number;
    height?: number;
    onSeek: (newTime: number) => void;
    transportState?: TransportState;
}

/**
 * Timeline component that uses the shared UI components with regular Player-specific logic
 */
const Timeline = (
    { duration, onSeek, transportState }: TimelineProps,
    ref: Ref<TimelineHandle>,
) => {
    // Use the transport ticker for reactive time updates
    const currentTime = useTransportTime();

    // Get the progress percentage for playhead positioning
    const percentComplete = useProgressPercent(duration);

    // Get only the needed loop state values from PlayerContext
    const { selectionStart, selectionEnd, handleSetEndTime, isCreatingLoop } =
        usePlayerContext();

    // Map Player states to shared props
    const isPlaying = transportState === "started";

    // Get chord state for shortcuts
    const selectedChordIndices = useSelectedChordIndices();
    const activeChordIndex = useActiveChordIndex();

    return (
        <SharedTimeline
            ref={ref}
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            percentComplete={percentComplete}
            selectionStart={selectionStart}
            selectionEnd={selectionEnd}
            onSeek={onSeek}
            onSetEndTime={handleSetEndTime}
            isCreatingLoop={isCreatingLoop}
            useShortcuts={useTimelineShortcuts}
            selectedChordIndices={selectedChordIndices}
            activeChordIndex={activeChordIndex}
        />
    );
};

export default forwardRef(Timeline);
