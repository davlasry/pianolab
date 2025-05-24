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
            <Button onClick={onSetStartAtPlayhead} variant="secondary">
                Set Start at Playhead
            </Button>

            {selectionStart !== null && (
                <>
                    <Button
                        onClick={onSubmitSelection}
                        disabled={!isSelectionComplete}
                        variant="default"
                    >
                        Submit Selection
                    </Button>
                    <Button onClick={onResetSelection} variant="outline">
                        Reset
                    </Button>
                </>
            )}
        </div>
    );
}
