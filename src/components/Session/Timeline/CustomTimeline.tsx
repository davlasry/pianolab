import { type Ref, forwardRef } from "react";
import {
    useActiveChordIndex,
    useSelectedChordIndices,
} from "@/stores/chordsStore.ts";
import {
    useCustomTransportTime,
    useCustomProgressPercent,
} from "@/CustomTransportTicker/customTransportTicker";
import { useCustomTimelineShortcuts } from "@/components/Session/Timeline/hooks/useCustomTimelineShortcuts";
import { useCustomPlayerContext } from "@/components/Session/context/CustomPlayerContext";
import type { TransportState } from "@/lib/CustomPlayer";
import SharedTimeline, {
    type TimelineHandle,
} from "@/components/Session/Timeline/SharedTimeline";

export interface TimelineProps {
    duration: number;
    currentTime?: number;
    height?: number;
    onSeek: (newTime: number) => void;
    transportState?: TransportState;
}

/**
 * CustomTimeline component that uses the shared UI components with CustomPlayer-specific logic
 */
const CustomTimeline = (
    { duration = 0, onSeek, transportState, currentTime = 0 }: TimelineProps,
    ref: Ref<TimelineHandle>,
) => {
    // Use the custom transport ticker for reactive time updates
    const reactiveTime = useCustomTransportTime();

    // Use the current time passed as prop as a fallback
    const effectiveCurrentTime =
        typeof reactiveTime === "number" &&
        !isNaN(reactiveTime) &&
        reactiveTime > 0
            ? reactiveTime
            : currentTime;

    // Get the progress percentage for playhead positioning
    const percentComplete = useCustomProgressPercent(duration);

    // Get loop state from custom player context
    const { selectionStart, isCreatingLoop, handleSubmitSelection } =
        useCustomPlayerContext();

    // End time is the current time when creating a loop
    const selectionEnd = isCreatingLoop ? effectiveCurrentTime : null;

    // Map CustomPlayer states to shared props
    const isPlaying = transportState === "playing";

    // Get chord state for shortcuts
    const selectedChordIndices = useSelectedChordIndices();
    const activeChordIndex = useActiveChordIndex();

    return (
        <SharedTimeline
            ref={ref}
            duration={duration}
            currentTime={effectiveCurrentTime}
            isPlaying={isPlaying}
            percentComplete={percentComplete}
            selectionStart={selectionStart}
            selectionEnd={selectionEnd}
            onSeek={onSeek}
            onSetEndTime={handleSubmitSelection}
            isCreatingLoop={isCreatingLoop}
            useShortcuts={useCustomTimelineShortcuts}
            selectedChordIndices={selectedChordIndices}
            activeChordIndex={activeChordIndex}
        />
    );
};

export default forwardRef(CustomTimeline);
