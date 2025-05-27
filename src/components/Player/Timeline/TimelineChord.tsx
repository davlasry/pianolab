import { cn } from "@/lib/utils.ts";
import type { IEnrichedChord } from "@/components/Player/Timeline/TimelineChords.tsx";
import DraggableResizableBlock from "@/components/shared/DraggableResizableBlock.tsx";
import { useTransportTime } from "@/TransportTicker/transportTicker.ts";

interface Props {
    chord: IEnrichedChord;
    isEditMode: boolean;
    pxPerUnit: number;
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    i: number; // index for key
}

export const TimelineChord = ({
    chord,
    isEditMode,
    pxPerUnit,
    onChordUpdate,
    i,
}: Props) => {
    const currentTime = useTransportTime();

    const isCurrentChord =
        currentTime !== undefined &&
        currentTime >= chord.startTime &&
        currentTime < chord.startTime + chord.duration;

    if (!chord.label) return null; // Skip empty chords

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
                "absolute top-4 bottom-0 z-10 flex flex-col items-center justify-center rounded-2xl p-2 transition-colors duration-200",
                isCurrentChord
                    ? "border border-zinc-600 bg-primary"
                    : "border border-foreground/20 bg-accent/40 hover:bg-accent",
                isEditMode && "group",
                isEditMode && "cursor-move",
            )}
            draggingClassName="ring-2 ring-white/30"
        >
            <div
                className={cn(
                    "text-2xl",
                    isCurrentChord
                        ? "text-white"
                        : "text-primary-foreground/50",
                )}
            >
                {chord.label}
            </div>
        </DraggableResizableBlock>
    );
};
