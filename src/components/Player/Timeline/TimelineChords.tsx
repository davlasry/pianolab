import type { DragEvent, RefObject } from "react";
import type { Chord } from "@/components/Player/hooks/useChordProgression";
import { TimelineChord } from "@/components/Player/Timeline/TimelineChord.tsx";
import { useDragTimelineChord } from "@/components/Player/Timeline/hooks/useDragTimelineChord.ts";

export interface IEnrichedChord extends Chord {
    originalStartTime: number;
    originalDuration: number;
    originalIndex: number;
}

interface Props {
    totalDuration: number;
    chordProgression: Chord[];
    isCurrentChord: boolean;
    isEditMode?: boolean;
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    timelineRef: RefObject<HTMLDivElement | null>;
}

export const TimelineChords = ({
    totalDuration,
    chordProgression,
    isCurrentChord,
    isEditMode = true,
    onChordUpdate = () => {},
    timelineRef,
}: Props) => {
    const { dragChord, isDragging, handleChordMouseDown, enrichedChords } =
        useDragTimelineChord({
            isEditMode,
            onChordUpdate,
            totalDuration,
            timelineRef,
            chordProgression,
        });

    if (totalDuration <= 0) return null;

    const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData("application/reactflow", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    return enrichedChords.map((chord, index) => {
        return (
            <TimelineChord
                key={index}
                index={index}
                chord={chord}
                isCurrentChord={isCurrentChord}
                totalDuration={totalDuration}
                handleDragStart={handleDragStart}
                dragChord={dragChord}
                isDragging={isDragging}
                isEditMode={isEditMode}
                handleChordMouseDown={handleChordMouseDown}
            ></TimelineChord>
        );
    });
};
