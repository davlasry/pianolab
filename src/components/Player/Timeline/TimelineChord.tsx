import { cn } from "@/lib/utils.ts";
import type { DragChord } from "@/components/Player/Timeline/hooks/useDragTimelineChord.ts";
import type { IEnrichedChord } from "@/components/Player/Timeline/TimelineChords.tsx";

interface Props {
    chord: IEnrichedChord;
    totalDuration: number;
    isCurrentChord: boolean;
    isEditMode?: boolean;
    handleDragStart: (
        e: React.DragEvent<HTMLDivElement>,
        index: number,
    ) => void;
    handleChordMouseDown: (
        event: React.MouseEvent,
        chord: IEnrichedChord,
    ) => void;
    index: number;
    dragChord: DragChord | null;
    isDragging?: boolean;
}

export const TimelineChord = ({
    chord,
    totalDuration,
    isCurrentChord,
    isEditMode,
    handleChordMouseDown,
    index,
    dragChord,
    isDragging,
}: Props) => {
    if (!chord.label) return null; // Skip empty chords

    const isBeingDragged =
        isDragging && dragChord?.index === chord.originalIndex;

    // Calculate the width of a chord based on its duration within this row
    const getChordWidth = (chord: IEnrichedChord) => {
        return (chord.duration / totalDuration) * 100;
    };

    const width = getChordWidth(chord);
    const left = (chord.startTime / totalDuration) * 100;

    return (
        <div
            key={`chord-${index}`}
            className={cn(
                "absolute flex flex-col items-center justify-center p-2 rounded-2xl transition-colors duration-200 z-10",
                isCurrentChord
                    ? "bg-accent border border-zinc-600"
                    : "bg-accent/60 border border-zinc-800/50",
                // !chord.isEnd && "border-r-0 rounded-r-none",
                isEditMode && "group",
                isBeingDragged && "ring-2 ring-white/30",
                isEditMode && "cursor-move",
            )}
            style={{
                width: `${width}%`,
                left: `${left}%`,
                top: "20px",
                bottom: "4px",
            }}
            draggable={true}
            onMouseDown={(e) => handleChordMouseDown(e, chord)}
        >
            {chord.label}
        </div>
    );
};
