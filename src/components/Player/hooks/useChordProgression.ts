import { useState, useCallback } from "react";
import { useActionHistory } from "@/hooks/useActionHistory.ts";

export interface Chord {
    label: string;
    startTime: number;
    duration: number;
}

export const initialChordProgression: Chord[] = [
    { label: "F#m", startTime: 0, duration: 2 },
    { label: "C#7b9", startTime: 2, duration: 2 },
    { label: "F#m", startTime: 4, duration: 2 },
    { label: "B7#11", startTime: 6, duration: 2 },
    { label: "E", startTime: 8, duration: 2 },
    { label: "A7", startTime: 10, duration: 2 },
    { label: "Abm", startTime: 12, duration: 2 },
    { label: "Gdim7", startTime: 14, duration: 2 },
];

/*───────────────────────────────────────────────────────────────
  Helper: collision-aware update
───────────────────────────────────────────────────────────────*/
function applyNoOverlapRule(
    prog: Chord[],
    i: number, // chord being edited
    newStart: number,
    newDur: number,
    minDur = 0.1,
): Chord[] {
    const chords = prog.map((c) => ({ ...c })); // shallow copy

    const prev = chords[i - 1] ?? null;
    const curr = chords[i];
    const next = chords[i + 1] ?? null;
    const nextWall = chords[i + 2] ?? null;

    if (next) {
        // if nextWall is defined, we can also check if next is allowed to move
        if (nextWall && next.startTime + next.duration > nextWall.startTime) {
            // If next is not allowed to move, we can skip this step
            return chords;
        }
    }

    /*──────────────── 1. apply the user's edit ────────────────*/
    curr.startTime = newStart;
    curr.duration = newDur;

    /*──────────────── 2. resolve overlap with *previous* only ─*/
    if (prev) {
        const overlapLeft = prev.startTime + prev.duration - curr.startTime; // positive = clash

        if (overlapLeft > 0) {
            // How much can we shorten prev without dropping below minDur?
            const shrinkable = Math.max(0, prev.duration - minDur);

            if (overlapLeft <= shrinkable) {
                prev.duration -= overlapLeft;
            } else {
                // 2-step: shrink to minDur, then shift prev left for the rest
                prev.duration = minDur;
                const shiftLeft = overlapLeft - shrinkable;
                prev.startTime = Math.max(0, prev.startTime - shiftLeft);
                //  ^ if this hits 0 it simply butts against timeline start;
                //    we *do not* keep walking further back
            }
        }
    }

    /*──── 3. resolve overlap with *next* (shift, don't shrink) ───*/
    if (next) {
        const overlapRight = curr.startTime + curr.duration - next.startTime;

        // if nextWall is defined, we can also check if next is allowed to move
        if (nextWall && next.startTime + next.duration > nextWall.startTime) {
            // If next is not allowed to move, we can skip this step
            return chords;
        }

        if (overlapRight > 0) {
            // Keep next's full duration, just move it forward
            next.startTime += overlapRight;
            next.duration = Math.max(minDur, next.duration - overlapRight);

            /* optional: clamp so the gap between next & curr is exactly zero */
            if (next.startTime < curr.startTime + curr.duration) {
                next.startTime = curr.startTime + curr.duration;
            }
        }
    }

    return chords;
}

/*───────────────────────────────────────────────────────────────
  React hook
───────────────────────────────────────────────────────────────*/
export const useChordProgressionState = () => {
    // Use generic history for chord progression
    const {
        state: chordProgression,
        executeAction: setChordProgression,
        updatePresent: updateChordProgressionPresent,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useActionHistory<Chord[]>(initialChordProgression, 20);

    const [activeChordIndex, setActiveChordIndex] = useState<number | null>(
        null,
    );

    /**
     * Save the current state to history before starting a drag operation.
     * This ensures we can undo back to the state before the drag began.
     */
    const saveStateToHistory = useCallback(() => {
        setChordProgression(chordProgression);
    }, [chordProgression, setChordProgression]);

    /**
     * Move or resize a single chord *with* collision-avoidance.
     * This version does NOT save to history - used for final commit after drag.
     * History should already be saved when drag starts.
     * @param index      which chord in the array
     * @param duration   new duration (timeline units)
     * @param newStart   new start-time (timeline units)
     */
    const updateChordTime = useCallback(
        (index: number, duration: number, newStart: number) => {
            // Use the current present state (which includes any live updates)
            // and apply the final collision rules, but don't save to history
            const result = applyNoOverlapRule(
                chordProgression,
                index,
                newStart,
                duration,
            );
            updateChordProgressionPresent(result); // Update present without history
        },
        [chordProgression, updateChordProgressionPresent],
    );

    /**
     * Live update during drag/resize operations - does NOT save to history.
     * Use this for onChange callbacks during drag operations.
     * @param index      which chord in the array
     * @param duration   new duration (timeline units)
     * @param newStart   new start-time (timeline units)
     */
    const updateChordTimeLive = useCallback(
        (index: number, duration: number, newStart: number) => {
            const result = applyNoOverlapRule(
                chordProgression,
                index,
                newStart,
                duration,
            );
            // Update the current state directly without saving to history
            updateChordProgressionPresent(result);
        },
        [chordProgression, updateChordProgressionPresent],
    );

    const insertChordAtIndex = useCallback(
        (indexToInsertRelative: number, side: "before" | "after") => {
            const chords = [...chordProgression.map((c) => ({ ...c }))]; // Create a mutable copy
            const newChordDuration = 2;
            const newChordLabel = "";

            let newChordToInsert: Chord;
            let insertionPoint: number;

            if (side === "after") {
                const anchorChord = chords[indexToInsertRelative];
                if (!anchorChord) {
                    console.error(
                        "Timeline: Cannot add chord after non-existent chord index:",
                        indexToInsertRelative,
                    );
                    return;
                }
                const newStartTime =
                    anchorChord.startTime + anchorChord.duration;
                newChordToInsert = {
                    label: newChordLabel,
                    startTime: newStartTime,
                    duration: newChordDuration,
                };
                insertionPoint = indexToInsertRelative + 1;
            } else {
                // side === 'before'
                const anchorChord = chords[indexToInsertRelative];
                if (!anchorChord) {
                    console.error(
                        "Timeline: Cannot add chord before non-existent chord index:",
                        indexToInsertRelative,
                    );
                    return;
                }
                const newStartTime = anchorChord.startTime;
                newChordToInsert = {
                    label: newChordLabel,
                    startTime: newStartTime,
                    duration: newChordDuration,
                };
                insertionPoint = indexToInsertRelative;
            }

            chords.splice(insertionPoint, 0, newChordToInsert);

            // Adjust subsequent chords' start times to make space
            // Starts from the chord immediately after the newly inserted one
            for (let i = insertionPoint + 1; i < chords.length; i++) {
                const prevChord = chords[i - 1];
                chords[i].startTime = prevChord.startTime + prevChord.duration;
            }

            setChordProgression(chords); // Saves to history
        },
        [chordProgression, setChordProgression],
    );

    const setActiveChord = useCallback((index: number | null) => {
        setActiveChordIndex(index);
    }, []);

    const deleteChord = useCallback(
        (index: number) => {
            if (index < 0 || index >= chordProgression.length) {
                console.error(
                    "Timeline: Cannot delete chord at invalid index:",
                    index,
                );
                return;
            }

            const newProgression = [...chordProgression];
            newProgression.splice(index, 1);

            // Clear active chord if we deleted it
            if (index === activeChordIndex) {
                setActiveChordIndex(null);
            } else if (activeChordIndex !== null && index < activeChordIndex) {
                // Adjust active chord index if we deleted a chord before it
                setActiveChordIndex(activeChordIndex - 1);
            }

            setChordProgression(newProgression); // Saves to history
        },
        [chordProgression, setChordProgression, activeChordIndex],
    );

    const deleteActiveChord = useCallback(() => {
        if (activeChordIndex !== null) {
            deleteChord(activeChordIndex);
        }
    }, [activeChordIndex, deleteChord]);

    const addChordAtEnd = useCallback(() => {
        const lastChord = chordProgression[chordProgression.length - 1];
        const newStartTime = lastChord.startTime + lastChord.duration;

        const newProgression = [
            ...chordProgression,
            {
                label: "",
                startTime: newStartTime,
                duration: 2,
            },
        ];

        setChordProgression(newProgression); // Saves to history
    }, [chordProgression, setChordProgression]);

    return {
        chordProgression,
        updateChordTime,
        updateChordTimeLive,
        saveStateToHistory,
        insertChordAtIndex,
        activeChordIndex,
        setActiveChord,
        deleteChord,
        deleteActiveChord,
        addChordAtEnd,
        // Expose history controls
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
