import type { WheelEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
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
    const [zoomLevel, setZoomLevel] = useState(1);

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

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const newZoom = Math.max(1, zoomLevel + e.deltaY * -0.001);
        setZoomLevel(newZoom);
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Simple approach: calculate percentage based on visible area only
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;

        const total = resolveTotal();
        const newTime = pct * total;

        if (Number.isFinite(newTime) && newTime >= 0) {
            onSeek(newTime);

            // Update progress bar position directly
            if (barRef.current) {
                barRef.current.style.left = `${pct * 100}%`;
            }
        }
    };

    return (
        <div className="relative w-full overflow-x-auto bg-muted">
            <div
                ref={containerRef}
                onWheel={handleWheel}
                onClick={handleClick}
                className="relative w-full bg-muted overflow-hidden bg-blue-500"
                style={{
                    height,
                    width: `${100 * zoomLevel}%`,
                    minWidth: "100%",
                }}
            >
                <div
                    ref={barRef}
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-200"
                    style={{ translate: "0 0" }}
                />
            </div>
        </div>
    );
}
