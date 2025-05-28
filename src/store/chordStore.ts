import { create } from "zustand";
import { useHistoryStore } from "@/store/historyStore";

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
  Zustand slice for chords (history stored globally)
───────────────────────────────────────────────────────────────*/
interface ChordStore {
    chordProgression: Chord[];
    activeChordIndex: number | null;

    // Core mutations
    setChordProgression: (newProg: Chord[]) => void;
    updateProgressionPresent: (newProg: Chord[]) => void; // no history push

    // Editing helpers
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
    insertChordAtIndex: (index: number, side: "before" | "after") => void;
    deleteChord: (index: number) => void;
    deleteActiveChord: () => void;
    addChordAtEnd: () => void;

    // History delegates
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

const pushSnapshot = (state: { chordProgression: Chord[] }) => {
    const snapshot = { 
        tag: "chords", 
        state: state.chordProgression.map(chord => ({...chord}))  // Deep copy
    };
    console.log('Pushing snapshot:', snapshot);
    useHistoryStore.getState().push(snapshot);
};

export const useChordStore = create<ChordStore>((set, get) => ({
    chordProgression: initialChordProgression,
    activeChordIndex: null,

    /*─────────────────────────── core ──────────────────────────*/
    setChordProgression: (newProg) =>
        set((state) => {
            pushSnapshot(state);
            return { chordProgression: newProg };
        }),

    updateProgressionPresent: (newProg) => set({ chordProgression: newProg }),

    /*───────────────────────── selection ───────────────────────*/
    setActiveChord: (index) => set({ activeChordIndex: index }),

    /*────────────────────────── editing ────────────────────────*/
    updateChordTime: (index, duration, newStart) =>
        set((state) => {
            pushSnapshot(state);
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

    insertChordAtIndex: (indexToInsertRelative, side) =>
        set((state) => {
            pushSnapshot(state);
            
            const chords = [...state.chordProgression.map((c) => ({ ...c }))];
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
            if (index < 0 || index >= state.chordProgression.length) return {};
            
            console.log('Before delete - state:', state.chordProgression);
            pushSnapshot(state);
            
            const newProgression = [...state.chordProgression];
            newProgression.splice(index, 1);
            console.log('After delete - newProgression:', newProgression);

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
        if (idx !== null) get().deleteChord(idx);
    },

    addChordAtEnd: () =>
        set((state) => {
            pushSnapshot(state);
            
            const last =
                state.chordProgression[state.chordProgression.length - 1];
            const newStart = last.startTime + last.duration;
            const newChord: Chord = {
                label: "",
                startTime: newStart,
                duration: 2,
            };
            const newProgression = [...state.chordProgression, newChord];
            return { chordProgression: newProgression };
        }),

    /*────────────────────── history delegates ──────────────────*/
    undo: () => {
        console.log('Attempting undo...');
        const snap = useHistoryStore.getState().undo();
        console.log('Undo snapshot:', snap);
        if (snap && snap.tag === "chords") {
            const restoredState = (snap.state as Chord[]).map(chord => ({...chord}));
            console.log('Restoring state:', restoredState);
            set({ chordProgression: restoredState });
        }
    },

    redo: () => {
        console.log('Attempting redo...');
        const snap = useHistoryStore.getState().redo();
        console.log('Redo snapshot:', snap);
        if (snap && snap.tag === "chords") {
            const restoredState = (snap.state as Chord[]).map(chord => ({...chord}));
            console.log('Restoring state:', restoredState);
            set({ chordProgression: restoredState });
        }
    },

    canUndo: () => useHistoryStore.getState().canUndo(),
    canRedo: () => useHistoryStore.getState().canRedo(),
}));
