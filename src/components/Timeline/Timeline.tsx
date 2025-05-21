import type { WheelEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { debounce } from "lodash-es";
import { chordProgression } from "src/hooks/useChordProgression.ts";
import { TimelineTicks } from "@/components/Timeline/TimelineTicks.tsx";

const STORAGE_KEY = "timeline-zoom-level";
const DEBOUNCE_MS = 300;
const SCROLL_THRESHOLD = 0.9; // Start scrolling when bar is at 90% of visible width
const LEFT_MARGIN_RATIO = 0.1; // Position bar at 10% from the left edge after scrolling

// Format seconds to mm:ss format
export const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

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
    const outerContainerRef = useRef<HTMLDivElement>(null);

    const [zoomLevel, setZoomLevel] = useState(1);
    const [totalDuration, setTotalDuration] = useState(0);

    // Load saved zoom level on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setZoomLevel(parseFloat(saved));
            }
        } catch (error) {
            console.error("Failed to load zoom level:", error);
        }
    }, []);

    // Create debounced save function
    const debouncedSave = useRef(
        debounce((zoom: number) => {
            try {
                localStorage.setItem(STORAGE_KEY, zoom.toString());
            } catch (error) {
                console.error("Failed to save zoom level:", error);
            }
        }, DEBOUNCE_MS),
    ).current;

    // Update zoom level and trigger debounced save
    const updateZoom = (newZoom: number) => {
        setZoomLevel(newZoom);
        debouncedSave(newZoom);
    };

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

        setTotalDuration(total);

        let rafId: number;
        const tick = () => {
            const pos = Tone.getTransport().seconds;
            const pct = Math.min(pos / total, 1); // clamp 0‑1

            if (
                barRef.current &&
                containerRef.current &&
                outerContainerRef.current
            ) {
                // Update progress bar position
                barRef.current.style.left = `${pct * 100}%`;

                // Auto-scroll if progress bar is near the right edge of visible area
                const outerRect =
                    outerContainerRef.current.getBoundingClientRect();
                const barRect = barRef.current.getBoundingClientRect();

                // Get the right edge position of the bar and container
                const barRightEdge = barRect.left + barRect.width;
                const containerRightThreshold =
                    outerRect.left + outerRect.width * SCROLL_THRESHOLD;

                // If bar is approaching right edge, scroll to follow it
                if (barRightEdge >= containerRightThreshold) {
                    // Calculate how much to scroll
                    // Position the bar at LEFT_MARGIN_RATIO from the left edge
                    const leftMargin = outerRect.width * LEFT_MARGIN_RATIO;
                    const scrollPos =
                        pct * containerRef.current.scrollWidth - leftMargin;
                    outerContainerRef.current.scrollLeft = Math.max(
                        0,
                        scrollPos,
                    );
                }
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
        updateZoom(newZoom);
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

    // Render chord markers on the timeline
    const renderChords = () => {
        if (totalDuration <= 0) return null;

        return chordProgression.map((chord, index) => {
            if (!chord.chord) return null; // Skip empty chords

            const percent = (chord.time / totalDuration) * 100;

            return (
                <div
                    key={`chord-${index}`}
                    className="absolute top-1/2 transform -translate-y-1/2"
                    style={{ left: `${percent}%` }}
                >
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        {chord.chord}
                    </div>
                </div>
            );
        });
    };

    // Clean up the debounced function
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    return (
        <div className="relative">
            {/* Fixed position zoom controls */}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10 text-xs">
                <span className="bg-black/20 px-2 py-1 rounded">
                    {Math.round(zoomLevel * 100)}%
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        updateZoom(1);
                    }}
                    className="bg-black/20 hover:bg-black/30 px-2 py-1 rounded"
                >
                    Reset
                </button>
            </div>

            {/* Scrollable timeline container */}
            <div
                ref={outerContainerRef}
                className="relative w-full overflow-x-auto bg-muted"
            >
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
                    <TimelineTicks totalDuration={totalDuration} />
                    {renderChords()}

                    <div
                        ref={barRef}
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-200"
                        style={{ translate: "0 0" }}
                    />
                </div>
            </div>
        </div>
    );
}
