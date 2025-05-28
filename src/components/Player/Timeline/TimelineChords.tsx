import type { RefObject } from "react";
import { useEffect, useState, useLayoutEffect } from "react";
import type { Chord } from "@/store/chordStore";
import { TimelineChord } from "@/components/Player/Timeline/TimelineChord.tsx";

interface Props {
    totalDuration: number;
    chordProgression: Chord[];
    isEditMode?: boolean;
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    onChordUpdateLive?: (
        index: number,
        duration: number,
        startTime: number,
    ) => void;
    onDragStart?: () => void;
    onInsertChord: (index: number, side: "before" | "after") => void;
    timelineRef: RefObject<HTMLDivElement | null>;
    currentTime?: number;
    activeChordIndex?: number | null;
    onChordSelect?: (index: number | null) => void;
    zoomLevel?: number;
    onAddChordAtEnd?: () => void;
}

export const TimelineChords = ({
    totalDuration,
    chordProgression,
    isEditMode = true,
    onChordUpdate = () => {},
    onChordUpdateLive,
    onDragStart,
    onInsertChord,
    timelineRef,
    activeChordIndex,
    onChordSelect,
    zoomLevel,
    onAddChordAtEnd,
}: Props) => {
    const [pxPerUnit, setPxPerUnit] = useState(1);

    const computeScale = () => {
        if (timelineRef.current && totalDuration > 0) {
            setPxPerUnit(timelineRef.current.offsetWidth / totalDuration);
        }
    };

    useLayoutEffect(computeScale, [
        totalDuration,
        timelineRef.current,
        zoomLevel,
    ]);
    /* keep it responsive */
    useEffect(() => {
        window.addEventListener("resize", computeScale);
        return () => window.removeEventListener("resize", computeScale);
    }, []);

    if (totalDuration <= 0) return null;

    const lastChord = chordProgression[chordProgression.length - 1];
    const addPlaceholderChord: Chord = {
        label: "+",
        startTime: lastChord.startTime + lastChord.duration,
        duration: 2,
    };

    return (
        <div
            data-component="TimelineChords"
            ref={timelineRef}
            className="relative w-full flex-grow"
        >
            {chordProgression.map((chord, i) => (
                <TimelineChord
                    key={i}
                    i={i}
                    chord={chord}
                    pxPerUnit={pxPerUnit}
                    isEditMode={isEditMode}
                    onChordUpdate={onChordUpdate}
                    onChordUpdateLive={onChordUpdateLive}
                    onDragStart={onDragStart}
                    onInsertChord={onInsertChord}
                    isSelected={activeChordIndex === i}
                    onSelect={() => onChordSelect?.(i)}
                />
            ))}
            {isEditMode && onAddChordAtEnd && (
                <TimelineChord
                    key="add-placeholder"
                    i={chordProgression.length}
                    chord={addPlaceholderChord}
                    pxPerUnit={pxPerUnit}
                    isEditMode={true}
                    onChordUpdate={onChordUpdate}
                    onChordUpdateLive={onChordUpdateLive}
                    onDragStart={onDragStart}
                    onInsertChord={onInsertChord}
                    onSelect={onAddChordAtEnd}
                />
            )}
        </div>
    );
};
