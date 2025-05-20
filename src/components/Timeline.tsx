import { useEffect, useRef } from "react";
import * as Tone from "tone";

export function Timeline({
    duration,
    length,
    height = 80,
    onSeek,
}: {
    duration?: number; // preferred – pass player.buffer.duration
    length?: number;
    height?: number;
    onSeek: (newTime: number) => void; // callback to seek
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
            // const total = resolveTotal();
            const pos = Tone.getTransport().seconds;
            const pct = Math.min(pos / total, 1); // clamp 0‑1
            if (barRef.current && containerRef.current) {
                barRef.current.style.left = `${pct * 100}%`;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [duration, length]);

    const resolveTotal = () => {
        const loopLen =
            Tone.getTransport().loop && Tone.getTransport().loopEnd
                ? Tone.Time(Tone.getTransport().loopEnd).toSeconds()
                : 0;
        return duration ?? length ?? loopLen;
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left; // px from left edge
        const pct = clickX / rect.width; // 0‑1
        const total = resolveTotal();
        const newTime = pct * total;

        // Jump Transport; if negative / NaN guard
        if (Number.isFinite(newTime) && newTime >= 0) {
            onSeek(newTime); // jump to new time
        }
    };

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className="relative w-full bg-muted overflow-hidden bg-blue-500"
            style={{ height }}
        >
            <div
                ref={barRef}
                className="absolute top-0 bottom-0 w-0.5 bg-rose-200"
                style={{ translate: "0 0" }}
            />
        </div>
    );
}
