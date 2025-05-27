import { cn } from "@/lib/utils.ts";
import type { IEnrichedChord } from "@/components/Player/Timeline/TimelineChords.tsx";
import DraggableResizableBlock from "@/components/shared/DraggableResizableBlock.tsx";
import { useTransportTime } from "@/TransportTicker/transportTicker.ts";

interface Props {
    chord: IEnrichedChord;
    isEditMode: boolean;
    pxPerUnit: number;
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    onInsertChord: (index: number, side: "before" | "after") => void;
    i: number; // index for key
}

export const TimelineChord = ({
    chord,
    isEditMode,
    pxPerUnit,
    onChordUpdate,
    onInsertChord,
    i,
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
            onChange={(id: number | string, start: number, duration: number) =>
                onChordUpdate(id as number, duration, start)
            }
            className={cn(
                "group absolute top-4 bottom-0 z-10 flex flex-col items-center justify-center rounded-2xl p-2",
                isCurrentChord
                    ? "border border-zinc-600 bg-primary"
                    : "border border-foreground/20 bg-accent/40 hover:bg-accent",
                isEditMode && "cursor-move",
            )}
            draggingClassName="ring-2 ring-white/30"
        >
            {isEditMode && (
                <button
                    onClick={handleAddAfter}
                    className="pointer-events-auto absolute top-1/2 right-0 z-30 flex h-6 w-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-lg text-white opacity-100 group-hover:opacity-100 hover:bg-blue-600"
                    data-interactive-child="true"
                    title="Add chord after"
                >
                    +
                </button>
            )}
            <div
                className={cn(
                    "text-2xl",
                    isCurrentChord
                        ? "text-white"
                        : "text-primary-foreground/50",
                )}
            >
                {chord.label || (isEditMode && "Empty")}
            </div>
        </DraggableResizableBlock>
    );
};
