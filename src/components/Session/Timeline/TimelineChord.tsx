import { cn } from "@/lib/utils.ts";
import type { Chord } from "@/stores/chordsStore.ts";
import { useChordsActions } from "@/stores/chordsStore.ts";
import DraggableResizableBlock from "@/components/shared/DraggableResizableBlock.tsx";
import { useTransportTime } from "@/TransportTicker/transportTicker.ts";
import { Button } from "@/components/ui/button";

interface Props {
    chord: Chord;
    isEditMode: boolean;
    pxPerUnit: number;
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
    onChordUpdateLive,
    onDragStart,
    onInsertChord,
    i,
    isSelected = false,
    onSelect,
}: Props) => {
    const currentTime = useTransportTime();
    const { updateChordTime, extendChordToBoundary, toggleChordSelection } =
        useChordsActions();

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

    const handleChordClick = (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
            // Cmd+click (Mac) or Ctrl+click (Windows/Linux) for multi-selection
            toggleChordSelection(i);
        } else {
            onSelect?.();
        }
    };

    const handleChordHandleDoubleClick = (
        chordId: string | number,
        side: "left" | "right",
    ) => {
        const chordIndex = chordId as number;
        extendChordToBoundary(chordIndex, side);
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
                updateChordTime(id as number, duration, start)
            }
            onChange={
                onChordUpdateLive
                    ? (id: number | string, start: number, duration: number) =>
                          onChordUpdateLive(id as number, duration, start)
                    : undefined
            }
            onDragStart={onDragStart ? () => onDragStart() : undefined}
            onClick={(e) => handleChordClick(e)}
            onHandleDoubleClick={handleChordHandleDoubleClick}
            className={cn(
                "group absolute top-8 bottom-1 z-10 flex flex-col items-center justify-center rounded-lg p-2.5 shadow-sm transition-colors duration-150 ease-in-out",
                isCurrentChord && isSelected
                    ? "bg-primary text-primary-foreground ring-1 ring-white/70 ring-inset"
                    : isCurrentChord
                      ? "border border-primary/70 bg-primary text-primary-foreground"
                      : isSelected
                        ? "bg-card text-primary ring-1 ring-primary ring-inset"
                        : "border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground",
                isEditMode && "cursor-grab",
            )}
            draggingClassName="z-20 opacity-75 shadow-lg ring-2 ring-ring"
        >
            {isEditMode && (
                <Button
                    onClick={handleAddAfter}
                    className="pointer-events-auto absolute top-1.5 right-1.5 z-20 opacity-0 transition-opacity group-hover:opacity-100"
                    size="icon"
                    variant="ghost"
                    data-interactive-child="true"
                    title="Add chord after"
                >
                    +
                </Button>
            )}
            <div
                className={cn(
                    "truncate text-sm font-medium",
                    isCurrentChord
                        ? "text-primary-foreground"
                        : isSelected
                          ? "text-primary"
                          : "text-card-foreground",
                )}
            >
                {chord.label}
            </div>
            {isEditMode && !chord.label && (
                <div className="mt-0.5 text-base font-normal text-muted-foreground">
                    ?
                </div>
            )}
        </DraggableResizableBlock>
    );
};
