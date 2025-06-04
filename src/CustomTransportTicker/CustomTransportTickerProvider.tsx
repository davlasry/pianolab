import { useEffect, type PropsWithChildren } from "react";
import { useCustomPlayerContext } from "@/components/Session/context/CustomPlayerContext";
import { customTransportTicker } from "./customTransportTicker";

export function CustomTransportTickerProvider({ children }: PropsWithChildren) {
    const { currentTime, transportState } = useCustomPlayerContext();

    useEffect(() => {
        let raf: number;
        let timeoutId: number;
        const isPlaying = transportState === "playing";

        const tick = () => {
            customTransportTicker.set(currentTime);
            
            if (isPlaying) {
                // Use RAF for smooth 60fps when playing
                raf = requestAnimationFrame(tick);
            } else {
                // Reduced frequency when paused (still update for seek operations)
                timeoutId = window.setTimeout(() => {
                    raf = requestAnimationFrame(tick);
                }, 100); // 10fps when paused
            }
        };

        // keep RAF in sync with Transport's state
        const start = () => {
            if (!raf) raf = requestAnimationFrame(tick);
        };

        const stop = () => {
            cancelAnimationFrame(raf);
            clearTimeout(timeoutId);
            raf = 0;
            timeoutId = 0;
        };

        // Start/stop ticker based on transport state
        if (isPlaying) {
            start();
        } else {
            stop();
        }

        return () => {
            stop();
        };
    }, [currentTime, transportState]);

    return <>{children}</>;
}
