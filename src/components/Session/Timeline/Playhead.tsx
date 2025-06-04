import { useProgressPercent } from "@/TransportTicker/transportTicker.ts";
import { SharedPlayhead } from "@/components/Session/Timeline/Shared/SharedPlayhead.tsx";
import * as Tone from "tone";

interface PlayheadProps {
    duration: number;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
}

export function Playhead({
    duration,
    barRef,
    containerRef,
    zoomLevel,
}: PlayheadProps) {
    const percent = useProgressPercent(duration);
    const currentTime = Tone.getTransport().seconds;

    return (
        <SharedPlayhead
            duration={duration}
            currentTime={currentTime}
            percent={percent}
            barRef={barRef}
            containerRef={containerRef}
            zoomLevel={zoomLevel}
        />
    );
}
