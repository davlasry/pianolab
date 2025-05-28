import { create } from "zustand";

export interface Snapshot {
    tag: string; // which slice this snapshot belongs to (e.g. 'chords')
    state: unknown;
}

interface HistoryState {
    // State
    past: Snapshot[];
    future: Snapshot[];

    // Actions grouped together
    actions: {
        push: (snap: Snapshot) => void;
        undo: () => Snapshot | undefined;
        redo: () => Snapshot | undefined;
        canUndo: () => boolean;
        canRedo: () => boolean;
    };
}

// Private store hook
const useHistoryStore = create<HistoryState>((set, get) => ({
    past: [],
    future: [],

    actions: {
        push: (snap) =>
            set((state) => ({
                past: [...state.past, snap],
                future: [],
            })),

        undo: () => {
            const { past, future } = get();
            if (past.length === 0) return undefined;
            const previous = past[past.length - 1];
            set({ past: past.slice(0, -1), future: [previous, ...future] });
            return previous;
        },

        redo: () => {
            const { past, future } = get();
            if (future.length === 0) return undefined;
            const next = future[0];
            set({ past: [...past, next], future: future.slice(1) });
            return next;
        },

        canUndo: () => get().past.length > 0,
        canRedo: () => get().future.length > 0,
    },
}));

// Selector hooks
export const usePastSnapshots = () => useHistoryStore((state) => state.past);
export const useFutureSnapshots = () =>
    useHistoryStore((state) => state.future);

// Actions hook
export const useHistoryActions = () =>
    useHistoryStore((state) => state.actions);

// Utility function for pushing snapshots (for use outside React components)
export const pushSnapshot = (snapshot: Snapshot) => {
    useHistoryStore.getState().actions.push(snapshot);
};
