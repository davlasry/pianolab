import { Button } from "@/components/ui/button";

interface TimelineSelectionControlsProps {
    onSetStartAtPlayhead: () => void;
    onSubmitSelection: () => void;
    onResetSelection: () => void;
    selectionStart: number | null;
    isSelectionComplete: boolean;
}

export function TimelineSelectionControls({
    onSetStartAtPlayhead,
    onSubmitSelection,
    onResetSelection,
    selectionStart,
    isSelectionComplete,
}: TimelineSelectionControlsProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={
                    selectionStart === null
                        ? onSetStartAtPlayhead
                        : onSubmitSelection
                }
                variant="secondary"
                disabled={selectionStart !== null && !isSelectionComplete}
            >
                {selectionStart === null ? "Start Loop" : "End Loop"}
            </Button>

            {selectionStart !== null && (
                <Button onClick={onResetSelection} variant="outline">
                    Reset
                </Button>
            )}
        </div>
    );
}
