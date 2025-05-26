// TransportTickerProvider.tsx
import { useEffect, type PropsWithChildren } from "react";
import * as Tone from "tone";
import { transportTicker } from "./transportTicker";

export function TransportTickerProvider({ children }: PropsWithChildren) {
    useEffect(() => {
        let raf: number;

        const tick = () => {
            transportTicker.set(Tone.getTransport().seconds);
            raf = requestAnimationFrame(tick);
        };

        // keep RAF in sync with Transport’s state
        const start = () => {
            if (!raf) raf = requestAnimationFrame(tick);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
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
