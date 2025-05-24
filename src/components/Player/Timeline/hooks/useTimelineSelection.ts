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
}

export function useTimelineSelection({
    duration,
    onSeek,
}: UseTimelineSelectionProps): UseTimelineSelectionReturn {
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

    const handleSetStartAtPlayhead = useCallback(() => {
        const currentTime = Tone.getTransport().seconds;
        if (currentTime >= 0 && currentTime <= duration) {
            setSelectionStart(currentTime);
            onSeek(currentTime);
        }
    }, [duration, onSeek]);

    const handleSetEndTime = useCallback((time: number) => {
        if (selectionStart !== null && time >= 0 && time <= duration) {
            setSelectionEnd(time);
        }
    }, [duration, selectionStart]);

    const handleSubmitSelection = useCallback(() => {
        if (selectionStart !== null && selectionEnd !== null) {
            // Ensure start is always less than end
            const start = Math.min(selectionStart, selectionEnd);
            const end = Math.max(selectionStart, selectionEnd);
            console.log('Selection:', { start, end });
            
            // Reset selection
            setSelectionStart(null);
            setSelectionEnd(null);
        }
    }, [selectionStart, selectionEnd]);

    const handleResetSelection = useCallback(() => {
        setSelectionStart(null);
        setSelectionEnd(null);
    }, []);

    return {
        selectionStart,
        selectionEnd,
        handleSetStartAtPlayhead,
        handleSetEndTime,
        handleSubmitSelection,
        handleResetSelection,
        isSelectionComplete: selectionStart !== null && selectionEnd !== null,
    };
} 