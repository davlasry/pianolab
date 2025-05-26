import { useEffect, useRef } from "react";
import * as Tone from "tone";
import type { TransportState } from "@/components/Player/hooks/useTransportState.ts";

export function useProgressLoop(
    transportState: TransportState | undefined,
    duration: number,
    onFrame: (percentage: number) => void,
) {
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        // stop/skip loop unless the transport is actively running
        if (transportState !== "started" || !duration) {
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
            return;
        }

        const tick = () => {
            const position = Tone.getTransport().seconds;
            onFrame(Math.min(position / duration, 1));
            rafId.current = requestAnimationFrame(tick);
        };

        rafId.current = requestAnimationFrame(tick);

        return () => {
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
        };
    }, [transportState, duration, onFrame]);
}
