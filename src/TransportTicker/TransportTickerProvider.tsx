// TransportTickerProvider.tsx
import { useEffect, type PropsWithChildren } from "react";
import * as Tone from "tone";
import { transportTicker } from "./transportTicker";

export function TransportTickerProvider({ children }: PropsWithChildren) {
    useEffect(() => {
        let raf: number;
        let timeoutId: number;
        let isPlaying = false;

        const tick = () => {
            transportTicker.set(Tone.getTransport().seconds);
            
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

        // keep RAF in sync with Transport’s state
        const start = () => {
            isPlaying = true;
            if (!raf) raf = requestAnimationFrame(tick);
        };
        const stop = () => {
            isPlaying = false;
            cancelAnimationFrame(raf);
            clearTimeout(timeoutId);
            raf = 0;
            timeoutId = 0;
        };

        Tone.getTransport().on("start", start);
        Tone.getTransport().on("pause", stop);
        Tone.getTransport().on("stop", stop);

        if (Tone.Transport.state === "started") {
            start();
        }

        return () => {
            stop();
            Tone.getTransport().off("start", start);
            Tone.getTransport().off("pause", stop);
            Tone.getTransport().off("stop", stop);
        };
    }, []);

    return <>{children}</>;
}
