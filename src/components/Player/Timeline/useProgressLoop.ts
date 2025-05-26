import { useEffect, useRef } from "react";
import type { TransportState } from "@/components/Player/hooks/useTransportState.ts";
import { usePlayerContext } from "@/components/Player/context/PlayerContext.tsx";

export function useProgressLoop(
    transportState: TransportState | undefined,
    duration: number,
    onFrame: (percentage: number) => void,
) {
    const { getTransport } = usePlayerContext();
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
            const position = getTransport().seconds;
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
    }, [transportState, duration, onFrame, getTransport]);
}
