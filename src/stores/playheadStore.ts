import { create } from "zustand";

/*───────────────────────────────────────────────────────────────
  Playhead Store Types
───────────────────────────────────────────────────────────────*/
interface PlayheadState {
    restoredPosition: number | null;
    actions: {
        setRestoredPosition: (time: number | null) => void;
    };
}

/*───────────────────────────────────────────────────────────────
  Playhead Store Implementation
───────────────────────────────────────────────────────────────*/
export const usePlayheadStore = create<PlayheadState>((set) => ({
    // Initial state
    restoredPosition: null,

    // Actions
    actions: {
        setRestoredPosition: (time: number | null) =>
            set({ restoredPosition: time }),
    },
}));

/*───────────────────────────────────────────────────────────────
  Selector Hooks
───────────────────────────────────────────────────────────────*/
export const useRestoredPosition = () =>
    usePlayheadStore((state) => state.restoredPosition);

/*───────────────────────────────────────────────────────────────
  Actions Hook
───────────────────────────────────────────────────────────────*/
export const usePlayheadActions = () =>
    usePlayheadStore((state) => state.actions);
