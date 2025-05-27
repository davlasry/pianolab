import { Button } from "@/components/ui/button";

interface TimelineSelectionControlsProps {
    onSetStartAtPlayhead: () => void;
    onSubmitSelection: () => void;
    onResetSelection: () => void;
    selectionStart: number | null;
    isSelectionComplete: boolean;
    isCreatingLoop: boolean;
}

export function TimelineSelectionControls({
    onSetStartAtPlayhead,
    onSubmitSelection,
    onResetSelection,
    selectionStart,
    isSelectionComplete,
    isCreatingLoop,
}: TimelineSelectionControlsProps) {
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

            {selectionStart !== null && (
                <Button onClick={onResetSelection} variant="outline">
                    Reset
                </Button>
            )}
        </div>
    );
}
