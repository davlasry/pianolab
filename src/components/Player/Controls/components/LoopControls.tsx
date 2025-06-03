import { Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoopControlsProps {
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

const LoopControls = ({
    onSetStartAtPlayhead,
    onSubmitSelection,
    onResetSelection,
    selectionStart,
    isSelectionComplete,
    isCreatingLoop,
    activeLoop,
    isLoopActive,
    onToggleLoop,
}: LoopControlsProps) => {
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={
                    isCreatingLoop ? onSubmitSelection : onSetStartAtPlayhead
                }
                variant="secondary"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
                disabled={isCreatingLoop && !isSelectionComplete}
            >
                {isCreatingLoop ? "End Loop" : "Set Loop"}
            </Button>

            {activeLoop && (
                <Button
                    onClick={onToggleLoop}
                    variant={isLoopActive ? "default" : "outline"}
                    size="sm"
                    className={`h-8 gap-1 px-2 text-xs ${
                        isLoopActive ? "bg-primary hover:bg-primary/80" : ""
                    }`}
                >
                    <Repeat size={14} className="mr-1" />
                    <span>{isLoopActive ? "Loop On" : "Loop Off"}</span>
                </Button>
            )}

            {selectionStart !== null && (
                <Button
                    onClick={onResetSelection}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Clear loop"
                >
                    <X size={14} />
                </Button>
            )}

            {activeLoop && (
                <span className="text-xs text-muted-foreground">
                    {activeLoop.start.toFixed(1)}s - {activeLoop.end.toFixed(1)}
                    s
                </span>
            )}
        </div>
    );
};

export default LoopControls;
