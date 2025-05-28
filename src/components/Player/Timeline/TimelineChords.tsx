import type { RefObject } from "react";
import { useEffect, useState, useLayoutEffect } from "react";
import type { Chord } from "@/stores/chordsStore.ts";
import { TimelineChord } from "@/components/Player/Timeline/TimelineChord.tsx";
import {
    useChordProgression,
    useActiveChordIndex,
    useChordsActions,
} from "@/stores/chordsStore.ts";

interface Props {
    totalDuration: number;
    isEditMode?: boolean;
    timelineRef: RefObject<HTMLDivElement | null>;
    currentTime?: number;
    zoomLevel?: number;
}

export const TimelineChords = ({
    totalDuration,
    isEditMode = true,
    timelineRef,
    zoomLevel,
}: Props) => {
    const [pxPerUnit, setPxPerUnit] = useState(1);
    const chordProgression = useChordProgression();
    const activeChordIndex = useActiveChordIndex();
    const {
        updateChordTime,
        updateChordTimeLive,
        insertChordAtIndex,
        setActiveChord,
        addChordAtEnd,
        createChordSnapshot,
    } = useChordsActions();

    const computeScale = () => {
        if (timelineRef.current && totalDuration > 0) {
            setPxPerUnit(timelineRef.current.offsetWidth / totalDuration);
        }
    };

    useLayoutEffect(computeScale, [totalDuration, zoomLevel, timelineRef]);
    /* keep it responsive */
    useEffect(() => {
        window.addEventListener("resize", computeScale);
        return () => window.removeEventListener("resize", computeScale);
    }, []);

    if (totalDuration <= 0) return null;

    const handleDragStart = () => {
        createChordSnapshot();
    };

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
                    onChordUpdate={updateChordTime}
                    onChordUpdateLive={updateChordTimeLive}
                    onInsertChord={insertChordAtIndex}
                    onDragStart={handleDragStart}
                    isSelected={activeChordIndex === i}
                    onSelect={() => setActiveChord(i)}
                />
            ))}
            {isEditMode && (
                <TimelineChord
                    key="add-placeholder"
                    i={chordProgression.length}
                    chord={addPlaceholderChord}
                    pxPerUnit={pxPerUnit}
                    isEditMode={true}
                    onChordUpdate={updateChordTime}
                    onChordUpdateLive={updateChordTimeLive}
                    onInsertChord={insertChordAtIndex}
                    onDragStart={handleDragStart}
                    onSelect={addChordAtEnd}
                />
            )}
        </div>
    );
};
