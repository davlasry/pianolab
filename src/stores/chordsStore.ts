import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { pushSnapshot } from "@/stores/historyStore";
import { supabase } from "@/supabase";
import type { Json } from "src/types/database.types";
import { useSessionStore } from "@/stores/sessionStore";

export interface Chord {
    label: string;
    startTime: number;
    duration: number;
}

/*───────────────────────────────────────────────────────────────
  Helper: collision-aware update (unchanged from previous code)
───────────────────────────────────────────────────────────────*/
function applyNoOverlapRule(
    prog: Chord[],
    i: number,
    newStart: number,
    newDur: number,
    minDur = 0.1,
): Chord[] {
    const chords = prog.map((c) => ({ ...c }));
    const prev = chords[i - 1] ?? null;
    const curr = chords[i];
    const next = chords[i + 1] ?? null;
    const nextWall = chords[i + 2] ?? null;

    if (
        next &&
        nextWall &&
        next.startTime + next.duration > nextWall.startTime
    ) {
        return chords;
    }

    curr.startTime = newStart;
    curr.duration = newDur;

    if (prev) {
        const overlapLeft = prev.startTime + prev.duration - curr.startTime;
        if (overlapLeft > 0) {
            const shrinkable = Math.max(0, prev.duration - minDur);
            if (overlapLeft <= shrinkable) {
                prev.duration -= overlapLeft;
            } else {
                prev.duration = minDur;
                const shiftLeft = overlapLeft - shrinkable;
                prev.startTime = Math.max(0, prev.startTime - shiftLeft);
            }
        }
    }

    if (next) {
        const overlapRight = curr.startTime + curr.duration - next.startTime;
        if (nextWall && next.startTime + next.duration > nextWall.startTime) {
            return chords;
        }
        if (overlapRight > 0) {
            next.startTime += overlapRight;
            next.duration = Math.max(minDur, next.duration - overlapRight);
            if (next.startTime < curr.startTime + curr.duration) {
                next.startTime = curr.startTime + curr.duration;
            }
        }
    }

    return chords;
}

/*───────────────────────────────────────────────────────────────
  Action types
───────────────────────────────────────────────────────────────*/
interface ChordActions {
    setChordProgression: (newProg: Chord[]) => void;
    updateProgressionPresent: (newProg: Chord[]) => void;
    setActiveChord: (index: number | null) => void;
    setSelectedChords: (indices: number[]) => void;
    toggleChordSelection: (index: number) => void;
    updateChordTime: (
        index: number,
        duration: number,
        newStart: number,
    ) => void;
    updateChordTimeLive: (
        index: number,
        duration: number,
        newStart: number,
    ) => void;
    updateChordLabel: (index: number, label: string) => void;
    insertChordAtIndex: (index: number, side: "before" | "after") => void;
    deleteChord: (index: number) => void;
    deleteActiveChord: () => void;
    deleteSelectedChords: () => void;
    findChordAtTime: (time: number) => { chord: Chord; index: number } | null;
    triggerEditMode: () => void;
    addChordAtEnd: () => void;
    addChordAtTime: (time: number) => void;
    createChordSnapshot: () => void;
    extendChordToBoundary: (index: number, side: "left" | "right") => void;
}

/*───────────────────────────────────────────────────────────────
  Zustand slice for chords (history stored globally)
───────────────────────────────────────────────────────────────*/
interface ChordsStore {
    chordProgression: Chord[];
    activeChordIndex: number | null;
    selectedChordIndices: number[];
    editModeTriggered: number; // Timestamp to trigger edit mode
    actions: ChordActions;
}

const createChordSnapshot = (state: { chordProgression: Chord[] }) => {
    const snapshot = {
        tag: "chords",
        state: state.chordProgression.map((chord) => ({ ...chord })), // Deep copy
    };
    pushSnapshot(snapshot);
};

/*───────────────────────────────────────────────────────────────
  Supabase persistence helpers (throttled write)
───────────────────────────────────────────────────────────────*/
const createThrottledSaveToSupabase = (delay = 500) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let latestSessionId = "";
    let latestChords: Chord[] = [];

    return (sessionId: string, chords: Chord[]) => {
        latestSessionId = sessionId;
        latestChords = [...chords];
        if (timeout) return;

        timeout = setTimeout(async () => {
            if (!latestSessionId) {
                console.warn("No session ID available to save chords");
                timeout = null;
                return;
            }

            try {
                await supabase
                    .from("sessions")
                    .update({ chords: latestChords as unknown as Json })
                    .eq("id", latestSessionId);
            } catch (error) {
                console.error("Error saving chords to Supabase:", error);
            }
            timeout = null;
        }, delay);
    };
};

const throttledSaveToSupabase = createThrottledSaveToSupabase();

// Get the current session ID from the session store
const getCurrentSessionId = (): string | null => {
    return useSessionStore.getState().sessionId;
};

// Custom storage adapter for Zustand that uses Supabase
const zustandStorage = createJSONStorage<ChordsStore>(() => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getItem: async (_name: string) => {
        const sessionId = getCurrentSessionId();
        if (!sessionId) return null;

        try {
            const { data, error } = await supabase
                .from("sessions")
                .select("chords")
                .eq("id", sessionId)
                .single();

            if (error) throw error;
            if (!data || !data.chords) return null;

            // Convert the data to the format expected by Zustand
            const state = JSON.parse(
                JSON.stringify({
                    state: {
                        chordProgression: data.chords,
                        activeChordIndex: null,
                        selectedChordIndices: [],
                        editModeTriggered: 0,
                    },
                }),
            );
            return JSON.stringify(state);
        } catch (error) {
            console.error("Error loading chords from Supabase:", error);
            return null;
        }
    },
    setItem: (_name: string, value: string) => {
        try {
            const sessionId = getCurrentSessionId();
            if (!sessionId) {
                console.warn("No session ID available to save chords");
                return;
            }

            const parsedValue = JSON.parse(value);
            const chords = parsedValue?.state?.chordProgression || [];

            throttledSaveToSupabase(sessionId, chords);
        } catch (error) {
            console.error("Error parsing chords for Supabase:", error);
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeItem: (_name: string) => {
        // Not needed for Supabase implementation
    },
}));

/*───────────────────────────────────────────────────────────────
  Chords store with persistence
───────────────────────────────────────────────────────────────*/
// Add a listener to reload chords when session ID changes
let previousSessionId: string | null = null;
useSessionStore.subscribe((state) => {
    const currentSessionId = state.sessionId;
    
    // Only reload if the session ID actually changed
    if (currentSessionId && currentSessionId !== previousSessionId) {
        previousSessionId = currentSessionId;
        
        // Force reload chords from Supabase
        const reloadChords = async () => {
            try {
                const { data, error } = await supabase
                    .from("sessions")
                    .select("chords")
                    .eq("id", currentSessionId)
                    .single();

                if (error) throw error;
                if (!data || !data.chords) return;

                // Update the chord progression in the store
                // Need to cast through unknown first for type safety
                const chords = data.chords as unknown as Chord[];
                useChordsStore.getState().actions.updateProgressionPresent(chords);
            } catch (error) {
                console.error("Error reloading chords for new session:", error);
            }
        };
        
        reloadChords();
    }
});

const useChordsStore = create<ChordsStore>()(
    persist(
        (set, get) => ({
            chordProgression: [],
            activeChordIndex: null,
            selectedChordIndices: [],
            editModeTriggered: 0,
            actions: {
                /*─────────────────────────── core ──────────────────────────*/
                setChordProgression: (newProg) =>
                    set((state) => {
                        createChordSnapshot(state);
                        return { chordProgression: newProg };
                    }),

                updateProgressionPresent: (newProg) =>
                    set({ chordProgression: newProg }),

                /*───────────────────────── selection ───────────────────────*/
                setActiveChord: (index) =>
                    set({
                        activeChordIndex: index,
                        selectedChordIndices: index !== null ? [index] : [],
                    }),

                setSelectedChords: (indices) =>
                    set({
                        selectedChordIndices: indices,
                        activeChordIndex:
                            indices.length === 1 ? indices[0] : null,
                    }),

                toggleChordSelection: (index) =>
                    set((state) => {
                        const currentSelected = state.selectedChordIndices;
                        const isSelected = currentSelected.includes(index);

                        let newSelected: number[];
                        if (isSelected) {
                            // Remove from selection
                            newSelected = currentSelected.filter(
                                (i) => i !== index,
                            );
                        } else {
                            // Add to selection
                            newSelected = [...currentSelected, index].sort(
                                (a, b) => a - b,
                            );
                        }

                        return {
                            selectedChordIndices: newSelected,
                            activeChordIndex:
                                newSelected.length === 1
                                    ? newSelected[0]
                                    : null,
                        };
                    }),

                /*────────────────────────── editing ────────────────────────*/
                updateChordTime: (index, duration, newStart) =>
                    set((state) => {
                        const result = applyNoOverlapRule(
                            state.chordProgression,
                            index,
                            newStart,
                            duration,
                        );
                        return { chordProgression: result };
                    }),

                updateChordTimeLive: (index, duration, newStart) =>
                    set((state) => {
                        const result = applyNoOverlapRule(
                            state.chordProgression,
                            index,
                            newStart,
                            duration,
                        );
                        return { chordProgression: result };
                    }),

                updateChordLabel: (index, label) =>
                    set((state) => {
                        createChordSnapshot(state);
                        const newProgression = [...state.chordProgression];
                        newProgression[index] = {
                            ...newProgression[index],
                            label,
                        };
                        return { chordProgression: newProgression };
                    }),

                insertChordAtIndex: (indexToInsertRelative, side) =>
                    set((state) => {
                        createChordSnapshot(state);

                        const chords = [
                            ...state.chordProgression.map((c) => ({ ...c })),
                        ];
                        const newChordDuration = 2;
                        const newChordLabel = "";

                        let newChordToInsert: Chord;
                        let insertionPoint: number;

                        if (side === "after") {
                            const anchor = chords[indexToInsertRelative];
                            if (!anchor) return {};
                            const newStart = anchor.startTime + anchor.duration;
                            newChordToInsert = {
                                label: newChordLabel,
                                startTime: newStart,
                                duration: newChordDuration,
                            };
                            insertionPoint = indexToInsertRelative + 1;
                        } else {
                            const anchor = chords[indexToInsertRelative];
                            if (!anchor) return {};
                            const newStart = anchor.startTime;
                            newChordToInsert = {
                                label: newChordLabel,
                                startTime: newStart,
                                duration: newChordDuration,
                            };
                            insertionPoint = indexToInsertRelative;
                        }

                        chords.splice(insertionPoint, 0, newChordToInsert);
                        for (
                            let i = insertionPoint + 1;
                            i < chords.length;
                            i++
                        ) {
                            const prev = chords[i - 1];
                            chords[i].startTime =
                                prev.startTime + prev.duration;
                        }

                        return { chordProgression: chords };
                    }),

                deleteChord: (index) =>
                    set((state) => {
                        if (index < 0 || index >= state.chordProgression.length)
                            return {};

                        createChordSnapshot(state);

                        const newProgression = [...state.chordProgression];
                        newProgression.splice(index, 1);

                        let newActive = state.activeChordIndex;
                        let newSelectedIndices = state.selectedChordIndices;

                        // Update active chord index
                        if (index === state.activeChordIndex) newActive = null;
                        else if (
                            state.activeChordIndex !== null &&
                            index < state.activeChordIndex
                        )
                            newActive = state.activeChordIndex - 1;

                        // Update selected chord indices
                        newSelectedIndices = newSelectedIndices
                            .filter((i) => i !== index) // Remove deleted chord
                            .map((i) => (i > index ? i - 1 : i)); // Shift indices after deleted chord

                        return {
                            chordProgression: newProgression,
                            activeChordIndex: newActive,
                            selectedChordIndices: newSelectedIndices,
                        };
                    }),

                deleteActiveChord: () => {
                    const idx = get().activeChordIndex;
                    if (idx !== null) get().actions.deleteChord(idx);
                },

                deleteSelectedChords: () => {
                    const { selectedChordIndices, chordProgression } = get();
                    if (selectedChordIndices.length === 0) return;

                    createChordSnapshot(get());

                    // Sort indices in descending order to delete from end to beginning
                    // This prevents index shifting issues during deletion
                    const sortedIndices = [...selectedChordIndices].sort(
                        (a, b) => b - a,
                    );

                    const newProgression = [...chordProgression];

                    // Delete chords from end to beginning
                    for (const index of sortedIndices) {
                        if (index >= 0 && index < newProgression.length) {
                            newProgression.splice(index, 1);
                        }
                    }

                    set({
                        chordProgression: newProgression,
                        activeChordIndex: null,
                        selectedChordIndices: [],
                    });
                },

                addChordAtEnd: () => {
                    const lastChord = get().chordProgression.at(-1);
                    const newStart = lastChord
                        ? lastChord.startTime + lastChord.duration
                        : 0;

                    const newChord: Chord = {
                        label: "Cmaj7",
                        startTime: newStart,
                        duration: 1,
                    };

                    set((state) => ({
                        chordProgression: [...state.chordProgression, newChord],
                        activeChordIndex: state.chordProgression.length,
                        selectedChordIndices: [state.chordProgression.length],
                    }));
                },

                addChordAtTime(time: number) {
                    const { chordProgression, actions } = get();

                    // Check if there's already a chord at this exact timestamp
                    const chordExists = chordProgression.some(
                        (chord) => chord.startTime === time,
                    );

                    if (chordExists) return;

                    // Find the correct position to insert the new chord
                    const insertIndex = chordProgression.findIndex(
                        (chord) => chord.startTime > time,
                    );
                    const targetIndex =
                        insertIndex === -1
                            ? chordProgression.length
                            : insertIndex;

                    // Create the new chord
                    const newChord: Chord = {
                        label: "",
                        startTime: time,
                        duration: 1,
                    };

                    // Insert the new chord
                    const newProgression = [...chordProgression];
                    newProgression.splice(targetIndex, 0, newChord);

                    set({
                        chordProgression: newProgression,
                        activeChordIndex: targetIndex,
                        selectedChordIndices: [targetIndex],
                    });

                    // Create a snapshot for undo/redo
                    actions.createChordSnapshot();
                },

                extendChordToBoundary: (index, side) =>
                    set((state) => {
                        const { chordProgression } = state;
                        const currentChord = chordProgression[index];
                        if (!currentChord) return {}; // Current chord not found

                        let newStartTime = currentChord.startTime;
                        let newDuration = currentChord.duration;
                        const minAllowedDuration = 0.1; // Consistent with applyNoOverlapRule default

                        if (side === "left") {
                            const prevChord = chordProgression[index - 1];
                            if (prevChord) {
                                const targetStartTime =
                                    prevChord.startTime + prevChord.duration;
                                // Calculate potential new end time for current chord
                                const currentChordEndTime =
                                    currentChord.startTime +
                                    currentChord.duration;
                                const potentialNewDuration =
                                    currentChordEndTime - targetStartTime;

                                if (
                                    potentialNewDuration >= minAllowedDuration
                                ) {
                                    newStartTime = targetStartTime;
                                    newDuration = potentialNewDuration;
                                } else {
                                    return {}; // Not enough space or invalid operation
                                }
                            } else {
                                return {}; // No previous chord to extend to
                            }
                        } else {
                            // side === "right"
                            const nextChord = chordProgression[index + 1];
                            if (nextChord) {
                                const potentialNewDuration =
                                    nextChord.startTime -
                                    currentChord.startTime;
                                if (
                                    potentialNewDuration >= minAllowedDuration
                                ) {
                                    newDuration = potentialNewDuration;
                                    // newStartTime remains currentChord.startTime
                                } else {
                                    return {}; // Not enough space or invalid operation
                                }
                            } else {
                                return {}; // No next chord to extend to
                            }
                        }

                        // If no change would occur, abort to prevent unnecessary snapshot/rerender
                        if (
                            newStartTime === currentChord.startTime &&
                            newDuration === currentChord.duration
                        ) {
                            return {};
                        }

                        createChordSnapshot(state); // Create snapshot before modification

                        const result = applyNoOverlapRule(
                            state.chordProgression, // Pass original progression for rules
                            index,
                            newStartTime,
                            newDuration,
                        );
                        return { chordProgression: result };
                    }),

                createChordSnapshot: () => {
                    createChordSnapshot(get());
                },

                findChordAtTime: (time: number) => {
                    const { chordProgression } = get();
                    for (let i = 0; i < chordProgression.length; i++) {
                        const chord = chordProgression[i];
                        if (
                            time >= chord.startTime &&
                            time < chord.startTime + chord.duration
                        ) {
                            return { chord, index: i };
                        }
                    }
                    return null;
                },

                triggerEditMode: () => {
                    set({ editModeTriggered: Date.now() });
                },
            },
        }),
        {
            name: "chords-storage",
            storage: zustandStorage,
            merge: (persistedState: unknown, currentState: ChordsStore) => {
                // On first load, use persisted state if it exists
                if (
                    persistedState &&
                    typeof persistedState === "object" &&
                    persistedState !== null
                ) {
                    const state = persistedState as Partial<ChordsStore>;
                    return {
                        ...currentState,
                        chordProgression:
                            state.chordProgression ||
                            currentState.chordProgression,
                    };
                }
                return currentState;
            },
        },
    ),
);

/*───────────────────────────────────────────────────────────────
  Selector hooks
───────────────────────────────────────────────────────────────*/
export const useChordProgression = () =>
    useChordsStore((state) => state.chordProgression);
export const useActiveChordIndex = () =>
    useChordsStore((state) => state.activeChordIndex);
export const useSelectedChordIndices = () =>
    useChordsStore((state) => state.selectedChordIndices);
export const useEditModeTriggered = () =>
    useChordsStore((state) => state.editModeTriggered);

/*───────────────────────────────────────────────────────────────
  Actions hook
───────────────────────────────────────────────────────────────*/
export const useChordsActions = () => useChordsStore((state) => state.actions);
