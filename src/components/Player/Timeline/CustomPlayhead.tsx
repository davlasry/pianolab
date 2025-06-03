import type { TransportState } from "@/lib/CustomPlayer";
import { useCustomProgressPercent } from "@/CustomTransportTicker/customTransportTicker";
import { SharedPlayhead } from "@/components/Player/Timeline/SharedPlayhead";

interface CustomPlayheadProps {
    duration: number;
    transportState?: TransportState;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    outerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
    currentTime?: number;
}

export function CustomPlayhead({
    duration = 100,
    transportState,
    barRef,
    containerRef,
    outerRef,
    zoomLevel,
    currentTime = 0,
}: CustomPlayheadProps) {
    // Ensure valid values
    const validDuration = Math.max(1, duration);
    const validCurrentTime =
        typeof currentTime === "number" && !isNaN(currentTime)
            ? currentTime
            : 0;

    // Use our custom progress percent hook instead of the Tone.js one
    const percent = useCustomProgressPercent(validDuration);

    // Map the transport state to a boolean for the shared component
    const isPlaying = transportState === "playing";

    return (
        <SharedPlayhead
            duration={validDuration}
            isPlaying={isPlaying}
            currentTime={validCurrentTime}
            percent={percent}
            barRef={barRef}
            containerRef={containerRef}
            outerRef={outerRef}
            zoomLevel={zoomLevel}
        />
    );
}
