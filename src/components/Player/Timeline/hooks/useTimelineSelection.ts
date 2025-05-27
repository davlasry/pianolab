import { useState, useCallback } from "react";
import * as Tone from "tone";

interface UseTimelineSelectionProps {
    duration: number;
    onSeek: (time: number) => void;
}

interface UseTimelineSelectionReturn {
    selectionStart: number | null;
    selectionEnd: number | null;
    handleSetStartAtPlayhead: () => void;
    handleSetEndTime: (time: number) => void;
    handleSubmitSelection: () => void;
    handleResetSelection: () => void;
    isSelectionComplete: boolean;
    isCreatingLoop: boolean;
}

export function useTimelineSelection({
    duration,
    onSeek,
}: UseTimelineSelectionProps): UseTimelineSelectionReturn {
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
    const [isCreatingLoop, setIsCreatingLoop] = useState(false);

    const handleSetStartAtPlayhead = useCallback(() => {
        const currentTime = Tone.getTransport().seconds;
        console.log("currentTime =====>", currentTime);
        if (currentTime >= 0 && currentTime <= duration) {
            setSelectionStart(currentTime);
            setSelectionEnd(null); // Reset end when starting new loop
            setIsCreatingLoop(true); // Enter loop creation mode
            onSeek(currentTime);
        }
    }, [duration, onSeek]);

    const handleSetEndTime = useCallback(
        (time: number) => {
            if (selectionStart !== null && time >= 0 && time <= duration) {
                setSelectionEnd(time);
            }
        },
        [duration, selectionStart],
    );

    const handleSubmitSelection = useCallback(() => {
        if (selectionStart !== null) {
            // Use current time as end if no end is set yet
            const currentTime = Tone.getTransport().seconds;
            const finalEnd = selectionEnd !== null ? selectionEnd : currentTime;
            
            // Ensure start is always less than end
            const start = Math.min(selectionStart, finalEnd);
            const end = Math.max(selectionStart, finalEnd);
            console.log("Selection:", { start, end });

            // Finalize the selection but keep it visible
            setSelectionEnd(end);
            setIsCreatingLoop(false); // Exit loop creation mode
        }
    }, [selectionStart, selectionEnd]);

    const handleResetSelection = useCallback(() => {
        setSelectionStart(null);
        setSelectionEnd(null);
        setIsCreatingLoop(false);
    }, []);

    return {
        selectionStart,
        selectionEnd,
        handleSetStartAtPlayhead,
        handleSetEndTime,
        handleSubmitSelection,
        handleResetSelection,
        isSelectionComplete: isCreatingLoop,
        isCreatingLoop,
    };
}
