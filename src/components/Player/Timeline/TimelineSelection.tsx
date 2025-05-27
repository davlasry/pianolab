import type { RefObject } from "react";
import { useEffect, useState, useLayoutEffect } from "react";

interface TimelineSelectionProps {
    selectionStart: number | null;
    selectionEnd: number | null;
    duration: number;
    timelineRef: RefObject<HTMLDivElement | null>;
}

export function TimelineSelection({
    selectionStart,
    selectionEnd,
    duration,
    timelineRef,
}: TimelineSelectionProps) {
    const [pxPerUnit, setPxPerUnit] = useState(1);

    const computeScale = () => {
        if (timelineRef.current && duration > 0) {
            setPxPerUnit(timelineRef.current.offsetWidth / duration);
        }
    };

    useLayoutEffect(computeScale, [duration, timelineRef.current]);
    /* keep it responsive */
    useEffect(() => {
        window.addEventListener("resize", computeScale);
        return () => window.removeEventListener("resize", computeScale);
    }, []);

    if (selectionStart === null) return null;

    const leftPx = selectionStart * pxPerUnit;
    const widthPx =
        selectionEnd !== null ? (selectionEnd - selectionStart) * pxPerUnit : 2;

    return (
        <div
            className="absolute top-0 bottom-0 bg-primary/20"
            style={{
                left: `${leftPx}px`,
                width: `${widthPx}px`,
            }}
        />
    );
}
