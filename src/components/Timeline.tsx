import { useEffect, useRef } from "react";
import * as Tone from "tone";

export function Timeline({
    duration,
    length,
    height = 80,
}: {
    duration?: number; // preferred – pass player.buffer.duration
    length?: number;
    height?: number;
}) {
    const barRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Derive a sensible length if none provided
        let total =
            duration ??
            length ??
            (typeof Tone.getTransport().loopEnd === "number" &&
            Tone.getTransport().loop
                ? Tone.Time(Tone.getTransport().loopEnd).toSeconds()
                : Tone.getTransport().seconds);
        if (!total || total <= 0) total = 1; // avoid divide‑by‑zero
        console.log("total =====>", total);

        let rafId: number;
        const tick = () => {
            const pos = Tone.getTransport().seconds;
            console.log("pos =====>", pos);
            const pct = Math.min(pos / total, 1); // clamp 0‑1
            if (barRef.current && containerRef.current) {
                barRef.current.style.left = `${pct * 100}%`;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [duration, length]);

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-muted overflow-hidden bg-blue-500"
            style={{ height }}
        >
            {/* play‑head */}
            <div
                ref={barRef}
                className="absolute top-0 bottom-0 w-0.5 bg-rose-200"
                style={{ translate: "0 0" }}
            />
        </div>
    );
}
