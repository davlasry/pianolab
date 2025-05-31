import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface TimelineLoopControlsProps {
    onSetStartAtPlayhead: () => void;
    onSubmitSelection: () => void;
    onResetSelection: () => void;
    selectionStart: number | null;
    isSelectionComplete: boolean;
    isCreatingLoop: boolean;
    activeLoop: { start: number; end: number } | null;
    isLoopActive: boolean;
    onToggleLoop: () => void;
}

export function TimelineLoopControls({
    onSetStartAtPlayhead,
    onSubmitSelection,
    onResetSelection,
    selectionStart,
    isSelectionComplete,
    isCreatingLoop,
    activeLoop,
    isLoopActive,
    onToggleLoop,
}: TimelineLoopControlsProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={
                    isCreatingLoop ? onSubmitSelection : onSetStartAtPlayhead
                }
                variant="secondary"
                disabled={isCreatingLoop && !isSelectionComplete}
            >
                {isCreatingLoop ? "End Loop" : "Start Loop"}
            </Button>

            {activeLoop && (
                <Button
                    onClick={onToggleLoop}
                    variant={isLoopActive ? "default" : "outline"}
                    className={
                        isLoopActive ? "bg-green-600 hover:bg-green-700" : ""
                    }
                >
                    {isLoopActive ? "Loop On" : "Loop Off"}
                </Button>
            )}

            {selectionStart !== null && (
                <Button
                    onClick={onResetSelection}
                    variant="outline"
                    size="icon"
                >
                    <X size={14} />
                </Button>
            )}

            {activeLoop && (
                <span className="text-sm text-muted-foreground">
                    Loop: {activeLoop.start.toFixed(1)}s -{" "}
                    {activeLoop.end.toFixed(1)}s
                </span>
            )}
        </div>
    );
}
