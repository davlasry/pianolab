import { cn } from "@/lib/utils.ts";
import type { Chord } from "@/stores/chordsStore.ts";
import DraggableResizableBlock from "@/components/shared/DraggableResizableBlock.tsx";
import { useTransportTime } from "@/TransportTicker/transportTicker.ts";
import { Button } from "@/components/ui/button";

interface Props {
    chord: Chord;
    isEditMode: boolean;
    pxPerUnit: number;
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    onChordUpdateLive?: (
        index: number,
        duration: number,
        startTime: number,
    ) => void;
    onDragStart?: () => void;
    onInsertChord: (index: number, side: "before" | "after") => void;
    i: number; // index for key
    isSelected?: boolean;
    onSelect?: () => void;
}

export const TimelineChord = ({
    chord,
    isEditMode,
    pxPerUnit,
    onChordUpdate,
    onChordUpdateLive,
    onDragStart,
    onInsertChord,
    i,
    isSelected = false,
    onSelect,
}: Props) => {
    const currentTime = useTransportTime();

    const isCurrentChord =
        currentTime !== undefined &&
        currentTime >= chord.startTime &&
        currentTime < chord.startTime + chord.duration;

    if (!chord.label && !isEditMode) return null; // Skip empty chords unless in edit mode

    const handleAddAfter = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onInsertChord(i, "after");
    };

    const handleChordClick = () => {
        onSelect?.();
    };

    return (
        <DraggableResizableBlock
            key={i}
            id={i} /* index is fine as id here */
            start={chord.startTime} /* unit-agnostic */
            duration={chord.duration}
            pixelsPerUnit={pxPerUnit}
            minDuration={0.25}
            onCommit={(id: number | string, start: number, duration: number) =>
                onChordUpdate(id as number, duration, start)
            }
            onChange={
                onChordUpdateLive
                    ? (id: number | string, start: number, duration: number) =>
                          onChordUpdateLive(id as number, duration, start)
                    : undefined
            }
            onDragStart={onDragStart ? () => onDragStart() : undefined}
            onClick={handleChordClick}
            className={cn(
                "group z-10 flex flex-col items-center justify-center rounded-2xl p-2",
                isCurrentChord
                    ? "border border-zinc-600 bg-primary"
                    : isSelected
                      ? "border-2 border-blue-500 bg-accent/60 hover:bg-accent"
                      : "border border-foreground/20 bg-accent/40 hover:bg-accent",
                isEditMode && "cursor-move",
            )}
            draggingClassName="ring-2 ring-white/30"
        >
            {isEditMode && (
                <Button
                    onClick={handleAddAfter}
                    className="pointer-events-auto absolute -top-7 left-full z-30 -translate-x-1/2 opacity-0 group-hover:opacity-100"
                    size="icon"
                    variant="secondary"
                    data-interactive-child="true"
                    title="Add chord after"
                >
                    +
                </Button>
            )}
            <div
                className={cn(
                    "text-2xl",
                    isCurrentChord
                        ? "text-white"
                        : "text-primary-foreground/50",
                )}
            >
                {chord.label || (isEditMode && "?")}
            </div>
        </DraggableResizableBlock>
    );
};
