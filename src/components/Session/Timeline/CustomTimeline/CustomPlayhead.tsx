import { useCustomProgressPercent } from "@/CustomTransportTicker/customTransportTicker.ts";
import { SharedPlayhead } from "@/components/Session/Timeline/Shared/SharedPlayhead.tsx";

interface CustomPlayheadProps {
    duration: number;
    barRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    zoomLevel: number;
    currentTime?: number;
}

export function CustomPlayhead({
    duration = 100,
    barRef,
    containerRef,
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

    return (
        <SharedPlayhead
            duration={validDuration}
            currentTime={validCurrentTime}
            percent={percent}
            barRef={barRef}
            containerRef={containerRef}
            zoomLevel={zoomLevel}
        />
    );
}
