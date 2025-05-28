import { create } from "zustand";

export interface Snapshot {
    tag: string; // which slice this snapshot belongs to (e.g. 'chords')
    state: unknown;
}

interface HistoryState {
    past: Snapshot[];
    future: Snapshot[];
    push: (snap: Snapshot) => void;
    undo: () => Snapshot | undefined;
    redo: () => Snapshot | undefined;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    past: [],
    future: [],

    push: (snap) =>
        set((state) => {
            console.log('History store - pushing snapshot. Current past:', state.past);
            return {
                past: [...state.past, snap],
                future: [],
            };
        }),

    undo: () => {
        const { past, future } = get();
        console.log('History store - undo. Past:', past, 'Future:', future);
        if (past.length === 0) return undefined;
        const previous = past[past.length - 1];
        set({ past: past.slice(0, -1), future: [previous, ...future] });
        return previous;
    },

    redo: () => {
        const { past, future } = get();
        console.log('History store - redo. Past:', past, 'Future:', future);
        if (future.length === 0) return undefined;
        const next = future[0];
        set({ past: [...past, next], future: future.slice(1) });
        return next;
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
}));
