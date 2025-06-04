import { create } from "zustand";

/*───────────────────────────────────────────────────────────────
  Playhead Store Types
───────────────────────────────────────────────────────────────*/
interface PlayheadState {
    restoredPosition: number | null;
    shouldCenter: boolean;
    actions: {
        setRestoredPosition: (time: number | null, shouldCenter?: boolean) => void;
    };
}

/*───────────────────────────────────────────────────────────────
  Playhead Store Implementation
───────────────────────────────────────────────────────────────*/
export const usePlayheadStore = create<PlayheadState>((set) => ({
    // Initial state
    restoredPosition: null,
    shouldCenter: false,

    // Actions
    actions: {
        setRestoredPosition: (time: number | null, shouldCenter = false) =>
            set({ restoredPosition: time, shouldCenter }),
    },
}));

/*───────────────────────────────────────────────────────────────
  Selector Hooks
───────────────────────────────────────────────────────────────*/
export const useRestoredPosition = () =>
    usePlayheadStore((state) => state.restoredPosition);

export const useShouldCenter = () =>
    usePlayheadStore((state) => state.shouldCenter);

/*───────────────────────────────────────────────────────────────
  Actions Hook
───────────────────────────────────────────────────────────────*/
export const usePlayheadActions = () =>
    usePlayheadStore((state) => state.actions);
