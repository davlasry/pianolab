import { useEffect, useRef } from "react";
import * as Tone from "tone";
import type { TransportState } from "@/components/Player/hooks/useTransportState.ts";

export function useProgressLoop(
    transportState: TransportState | undefined,
    duration: number,
    onFrame: (percentage: number) => void,
) {
    const rafId = useRef<number>(null);

    useEffect(() => {
        if (!duration) return;

        const tick = () => {
            const position = Tone.getTransport().seconds;
            const percent = Math.min(position / duration, 1);
            onFrame(percent);
            rafId.current = requestAnimationFrame(tick);
        };

        rafId.current = requestAnimationFrame(tick);
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [duration, transportState, onFrame]);
}
