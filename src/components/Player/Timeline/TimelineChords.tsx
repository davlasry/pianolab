import type { RefObject } from "react";
import { useEffect, useState, useLayoutEffect } from "react";
import type { Chord } from "@/components/Player/hooks/useChordProgression";
import { TimelineChord } from "@/components/Player/Timeline/TimelineChord.tsx";

export interface IEnrichedChord extends Chord {
    originalStartTime: number;
    originalDuration: number;
    originalIndex: number;
}

interface Props {
    totalDuration: number;
    chordProgression: Chord[];
    isEditMode?: boolean;
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    timelineRef: RefObject<HTMLDivElement | null>;
    currentTime?: number;
}

export const TimelineChords = ({
    totalDuration,
    chordProgression,
    isEditMode = true,
    onChordUpdate = () => {},
    timelineRef,
}: Props) => {
    const [pxPerUnit, setPxPerUnit] = useState(1);

    const computeScale = () => {
        if (timelineRef.current && totalDuration > 0) {
            setPxPerUnit(timelineRef.current.offsetWidth / totalDuration);
        }
    };

    useLayoutEffect(computeScale, [totalDuration, timelineRef.current]);
    /* keep it responsive */
    useEffect(() => {
        window.addEventListener("resize", computeScale);
        return () => window.removeEventListener("resize", computeScale);
    }, []);

    const enrichedChords: IEnrichedChord[] = chordProgression.map((chord) => {
        return {
            ...chord,
            originalStartTime: chord.startTime,
            originalDuration: chord.duration,
            originalIndex: chordProgression.findIndex(
                (c) => c.startTime === chord.startTime,
            ),
        };
    });

    if (totalDuration <= 0) return null;

    return (
        <div
            data-component="TimelineChords"
            ref={timelineRef}
            className="relative w-full flex-grow"
        >
            {enrichedChords.map((chord, i) => (
                <TimelineChord
                    key={i}
                    i={i}
                    chord={chord}
                    pxPerUnit={pxPerUnit}
                    isEditMode={isEditMode}
                    onChordUpdate={onChordUpdate}
                />
            ))}
        </div>
    );
};
