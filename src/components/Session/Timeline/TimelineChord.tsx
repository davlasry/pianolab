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
                "group absolute top-8 bottom-1 z-10 flex flex-col items-center justify-center rounded-lg p-2.5 shadow-sm transition-all duration-150 ease-in-out",
                // Base LCD styling for all chords
                "bg-black border font-mono",
                // State-specific styling
                isCurrentChord && isSelected
                    ? "border-2 border-primary text-primary ring-2 ring-primary/50 ring-offset-1 ring-offset-black shadow-lg"
                    : isCurrentChord
                      ? "border-2 border-primary text-primary shadow-lg"
                      : isSelected
                        ? "border border-primary/60 text-primary/90 ring-1 ring-primary/40 ring-offset-1 ring-offset-black"
                        : "border border-primary/30 text-primary/70 hover:border-primary/50 hover:text-primary/85",
                isEditMode && "cursor-grab",
            )}
            draggingClassName="z-20 opacity-75 shadow-lg ring-2 ring-ring"
        >
            {/* LCD glow effects - different intensities based on state */}
            {isCurrentChord ? (
                /* Active chord - full LCD effects */
                <>
                    <div className="absolute -inset-1 bg-primary/25 blur-sm rounded-lg" />
                    <div className="absolute inset-0 bg-primary/8 rounded-lg" />
                    <div 
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/12 to-transparent opacity-40 rounded-lg"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, hsl(var(--primary) / 0.15) 1px, hsl(var(--primary) / 0.15) 2px)'
                        }}
                    />
                    <div className="absolute inset-1 bg-gradient-to-b from-primary/5 to-black/50 rounded-md" />
                </>
            ) : isSelected ? (
                /* Selected chord - medium LCD effects */
                <>
                    <div className="absolute -inset-0.5 bg-primary/15 blur-sm rounded-lg" />
                    <div className="absolute inset-0 bg-primary/4 rounded-lg" />
                    <div 
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent opacity-25 rounded-lg"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, hsl(var(--primary) / 0.1) 1px, hsl(var(--primary) / 0.1) 2px)'
                        }}
                    />
                </>
            ) : (
                /* Normal chord - subtle LCD effects */
                <>
                    <div className="absolute inset-0 bg-primary/2 rounded-lg" />
                    <div 
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/4 to-transparent opacity-15 rounded-lg"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.05) 2px, hsl(var(--primary) / 0.05) 3px)'
                        }}
                    />
                </>
            )}
            
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
                    "relative truncate font-mono font-bold tracking-wide",
                    isCurrentChord
                        ? "text-sm text-primary drop-shadow-[0_0_5px_hsl(var(--primary)_/_0.8)]"
                        : isSelected
                          ? "text-sm text-primary/90 drop-shadow-[0_0_3px_hsl(var(--primary)_/_0.5)]"
                          : "text-xs text-primary/70 drop-shadow-[0_0_2px_hsl(var(--primary)_/_0.3)]",
                )}
            >
                {chord.label}
            </div>
            {isEditMode && !chord.label && (
                <div className={cn(
                    "mt-0.5 font-mono font-bold",
                    isCurrentChord 
                        ? "relative text-base text-primary drop-shadow-[0_0_4px_hsl(var(--primary)_/_0.7)]"
                        : isSelected
                          ? "text-sm text-primary/80 drop-shadow-[0_0_2px_hsl(var(--primary)_/_0.4)]"
                          : "text-xs text-primary/50 drop-shadow-[0_0_1px_hsl(var(--primary)_/_0.2)]"
                )}>
                    ?
                </div>
            )}
        </DraggableResizableBlock>
    );
};
