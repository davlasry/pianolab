import { useEffect, useRef } from "react";
import * as Tone from "tone";

export function Timeline({
    length,
    height = 80,
}: {
    length?: number;
    height?: number;
}) {
    const barRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Derive a sensible length if none provided
        let total =
            length ??
            (typeof Tone.getTransport().loopEnd === "number" &&
            Tone.getTransport().loop
                ? (Tone.getTransport().loopEnd as number)
                : Tone.getTransport().seconds);
        if (!total || total <= 0) total = 1; // avoid divide‑by‑zero
        console.log("total =====>", total);

        let rafId: number;
        const tick = () => {
            const pos = Tone.getTransport().seconds;
            console.log("pos =====>", pos);
            const pct = Math.min(pos / total, 1); // clamp 0‑1
            console.log("pct =====>", pct);
            if (barRef.current && containerRef.current) {
                barRef.current.style.transform = `translateX(${pct * 100}%)`;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [length]);

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-muted rounded-2xl overflow-hidden"
            style={{ height }}
        >
            {/* play‑head */}
            <div
                ref={barRef}
                className="absolute top-0 bottom-0 w-0.5 bg-primary"
                style={{ translate: "0 0" }}
            />
        </div>
    );
}
