import { useState, useCallback } from "react";

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
    const [chordProgression, setChordProgression] = useState<Chord[]>(
        initialChordProgression,
    );
    const [activeChordIndex, setActiveChordIndex] = useState<number | null>(
        null,
    );

    /**
     * Move or resize a single chord *with* collision-avoidance.
     * @param index      which chord in the array
     * @param duration   new duration (timeline units)
     * @param newStart   new start-time (timeline units)
     */
    const updateChordTime = useCallback(
        (index: number, duration: number, newStart: number) => {
            setChordProgression((curr) => {
                const result = applyNoOverlapRule(
                    curr,
                    index,
                    newStart,
                    duration,
                );
                return result;
            });
        },
        [],
    );

    const insertChordAtIndex = useCallback(
        (indexToInsertRelative: number, side: "before" | "after") => {
            setChordProgression((currentProgression) => {
                const chords = [...currentProgression.map((c) => ({ ...c }))]; // Create a mutable copy
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
                        return currentProgression;
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
                        return currentProgression;
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
                    chords[i].startTime =
                        prevChord.startTime + prevChord.duration;
                }

                return chords;
            });
        },
        [],
    );

    const setActiveChord = useCallback((index: number | null) => {
        setActiveChordIndex(index);
    }, []);

    const deleteChord = useCallback(
        (index: number) => {
            setChordProgression((currentProgression) => {
                if (index < 0 || index >= currentProgression.length) {
                    console.error(
                        "Timeline: Cannot delete chord at invalid index:",
                        index,
                    );
                    return currentProgression;
                }

                const newProgression = [...currentProgression];
                newProgression.splice(index, 1);

                // Clear active chord if we deleted it
                if (index === activeChordIndex) {
                    setActiveChordIndex(null);
                } else if (
                    activeChordIndex !== null &&
                    index < activeChordIndex
                ) {
                    // Adjust active chord index if we deleted a chord before it
                    setActiveChordIndex(activeChordIndex - 1);
                }

                return newProgression;
            });
        },
        [activeChordIndex],
    );

    const deleteActiveChord = useCallback(() => {
        if (activeChordIndex !== null) {
            deleteChord(activeChordIndex);
        }
    }, [activeChordIndex, deleteChord]);

    const addChordAtEnd = useCallback(() => {
        setChordProgression((currentProgression) => {
            const lastChord = currentProgression[currentProgression.length - 1];
            const newStartTime = lastChord.startTime + lastChord.duration;
            
            return [...currentProgression, {
                label: "",
                startTime: newStartTime,
                duration: 2,
            }];
        });
    }, []);

    return {
        chordProgression,
        updateChordTime,
        insertChordAtIndex,
        activeChordIndex,
        setActiveChord,
        deleteChord,
        deleteActiveChord,
        addChordAtEnd,
    };
};
