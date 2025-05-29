import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { pushSnapshot } from "@/stores/historyStore";

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
    addChordAtEnd: () => void;
    addChordAtTime: (time: number) => void;
    createChordSnapshot: () => void;
}

/*───────────────────────────────────────────────────────────────
  Zustand slice for chords (history stored globally)
───────────────────────────────────────────────────────────────*/
interface ChordsStore {
    chordProgression: Chord[];
    activeChordIndex: number | null;
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
  Local-storage persistence helpers (throttled write)
───────────────────────────────────────────────────────────────*/
const createThrottledSetItem = (delay = 500) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let latestKey = "";
    let latestValue = "";
    return (key: string, value: string) => {
        latestKey = key;
        latestValue = value;
        if (timeout) return;
        timeout = setTimeout(() => {
            try {
                localStorage.setItem(latestKey, latestValue);
            } catch {
                /* ignore write errors, e.g. Safari private mode */
            }
            timeout = null;
        }, delay);
    };
};

const throttledSetItem = createThrottledSetItem();

const zustandStorage = createJSONStorage<ChordsStore>(() => ({
    getItem: (name: string) => {
        try {
            return localStorage.getItem(name);
        } catch {
            return null;
        }
    },
    setItem: throttledSetItem,
    removeItem: (name: string) => {
        try {
            localStorage.removeItem(name);
        } catch {
            /* ignore */
        }
    },
}));

/*───────────────────────────────────────────────────────────────
  Chords store with persistence
───────────────────────────────────────────────────────────────*/
const useChordsStore = create<ChordsStore>()(
    persist(
        (set, get) => ({
            chordProgression: initialChordProgression,
            activeChordIndex: null,
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
                setActiveChord: (index) => set({ activeChordIndex: index }),

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
                        newProgression[index] = { ...newProgression[index], label };
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
                        for (let i = insertionPoint + 1; i < chords.length; i++) {
                            const prev = chords[i - 1];
                            chords[i].startTime = prev.startTime + prev.duration;
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
                        if (index === state.activeChordIndex) newActive = null;
                        else if (
                            state.activeChordIndex !== null &&
                            index < state.activeChordIndex
                        )
                            newActive = state.activeChordIndex - 1;

                        return {
                            chordProgression: newProgression,
                            activeChordIndex: newActive,
                        };
                    }),

                deleteActiveChord: () => {
                    const idx = get().activeChordIndex;
                    if (idx !== null) get().actions.deleteChord(idx);
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
                    }));
                },

                addChordAtTime(time: number) {
                    const { chordProgression, actions } = get();
                    
                    // Check if there's already a chord at this exact timestamp
                    const chordExists = chordProgression.some(
                        (chord) => chord.startTime === time
                    );
                    
                    if (chordExists) return;
                    
                    // Find the correct position to insert the new chord
                    const insertIndex = chordProgression.findIndex(chord => chord.startTime > time);
                    const targetIndex = insertIndex === -1 ? chordProgression.length : insertIndex;
                    
                    // Create the new chord
                    const newChord: Chord = {
                        label: "?",
                        startTime: time,
                        duration: 1,
                    };
                    
                    // Insert the new chord
                    const newProgression = [...chordProgression];
                    newProgression.splice(targetIndex, 0, newChord);
                    
                    set({
                        chordProgression: newProgression,
                        activeChordIndex: targetIndex,
                    });
                    
                    // Create a snapshot for undo/redo
                    actions.createChordSnapshot();
                },

                createChordSnapshot: () => {
                    createChordSnapshot(get());
                },
            },
        }),
        {
            name: "chords-storage",
            storage: zustandStorage,
            merge: (persistedState: unknown, currentState: ChordsStore) => {
                // On first load, use persisted state if it exists
                if (persistedState && typeof persistedState === 'object' && persistedState !== null) {
                    const state = persistedState as Partial<ChordsStore>;
                    return {
                        ...currentState,
                        chordProgression: state.chordProgression || currentState.chordProgression,
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

/*───────────────────────────────────────────────────────────────
  Actions hook
───────────────────────────────────────────────────────────────*/
export const useChordsActions = () => useChordsStore((state) => state.actions);
