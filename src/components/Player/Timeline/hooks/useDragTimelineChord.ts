import { useState, type RefObject } from "react";
import type { IEnrichedChord } from "@/components/Player/Timeline/TimelineChords.tsx";
import type { Chord } from "@/components/Player/hooks/useChordProgression.ts";

export interface DragChord {
    index: number;
    mode: "resize" | "move";
    initialX: number;
    initialDuration: number;
    initialStartTime: number;
    rowStartTime: number;
    rowWidth: number;
    visualDuration?: number;
    visualStartTime?: number;
}

interface Props {
    chordProgression: Chord[];
    onChordUpdate: (index: number, duration: number, startTime: number) => void;
    isEditMode?: boolean;
    totalDuration: number;
    timelineRef: RefObject<HTMLDivElement | null>;
}

export const useDragTimelineChord = ({
    chordProgression,
    onChordUpdate,
    isEditMode,
    totalDuration,
    timelineRef,
}: Props) => {
    const enrichedChords: IEnrichedChord[] = chordProgression.map((chord) => {
        return {
            ...chord,
            originalStartTime: chord.startTime,
            originalDuration: chord.duration,
            originalIndex: chordProgression.findIndex(
                (c) => c.startTime === chord.startTime,
            ),
        };
    });

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragChord, setDragChord] = useState<DragChord | null>(null);

    // Handle mouse down on chord for moving
    const handleChordMouseDown = (
        event: React.MouseEvent,
        chord: IEnrichedChord,
    ) => {
        // Only handle in edit mode
        if (!isEditMode) return;

        event.stopPropagation();
        event.preventDefault();

        // Don't initiate move if we clicked on a resize handle
        if ((event.target as HTMLElement).classList.contains("resize-handle")) {
            return;
        }

        // Find the original chord data if this is a continuation
        const originalIndex = chord.originalIndex;
        const originalChord = chordProgression[originalIndex];
        if (!originalChord) return;

        console.log(
            `Starting drag on chord ${originalIndex}, startTime: ${originalChord.startTime}`,
        );

        // Get the timeline element for the row
        if (!timelineRef?.current) return;

        const rect = timelineRef.current!.getBoundingClientRect();
        const pixelsPerSecond = rect.width / totalDuration;

        // Initial cursor position in the timeline
        const initialX = event.clientX - rect.left;

        // Set dragging state
        setIsDragging(true);
        setDragChord({
            index: originalIndex,
            mode: "move",
            initialX: event.clientX,
            initialDuration: originalChord.duration,
            initialStartTime: originalChord.startTime,
            rowStartTime: 0,
            rowWidth: rect.width,
            visualStartTime: originalChord.startTime,
        });

        // Function to handle mouse movement
        const handleMove = (moveEvent: MouseEvent) => {
            // Calculate new horizontal position
            const currentX = moveEvent.clientX - rect.left;
            const deltaX = currentX - initialX;
            const deltaTime = deltaX / pixelsPerSecond;

            // Calculate new start time (clamped to prevent negative times)
            const newStartTime = Math.max(
                0,
                originalChord.startTime + deltaTime,
            );

            console.log(
                `Dragging, deltaX: ${deltaX}, new start time: ${newStartTime}`,
            );

            // Update drag state for visual feedback
            setDragChord((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    visualStartTime: newStartTime,
                };
            });

            // Update the chord position
            onChordUpdate(originalIndex, originalChord.duration, newStartTime);
        };

        // Function to handle mouse up - end dragging
        const handleUp = () => {
            setIsDragging(false);
            setDragChord(null);

            // Clean up event listeners
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleUp);
        };

        // Add event listeners for dragging
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
    };

    return {
        isDragging,
        dragChord,
        handleChordMouseDown,
        setIsDragging,
        setDragChord,
        // Additional functions can be added here as needed
        enrichedChords,
    };
};
