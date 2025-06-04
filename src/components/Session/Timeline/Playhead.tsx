import type { TransportState } from "@/components/Session/hooks/useTransportState";
import { useProgressPercent } from "@/TransportTicker/transportTicker.ts";
import { SharedPlayhead } from "@/components/Session/Timeline/Shared/SharedPlayhead.tsx";
import * as Tone from "tone";

interface PlayheadProps {
    duration: number;
    transportState?: TransportState;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    outerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
}

export function Playhead({
    duration,
    transportState,
    barRef,
    containerRef,
    outerRef,
    zoomLevel,
}: PlayheadProps) {
    const percent = useProgressPercent(duration);
    const currentTime = Tone.getTransport().seconds;
    const isPlaying = transportState === "started";

    return (
        <SharedPlayhead
            duration={duration}
            isPlaying={isPlaying}
            currentTime={currentTime}
            percent={percent}
            barRef={barRef}
            containerRef={containerRef}
            outerRef={outerRef}
            zoomLevel={zoomLevel}
        />
    );
}
