import { create } from "zustand";

// Define the actions interface
interface KeyboardActions {
    toggleShowChordNotes: () => void;
    toggleShowNoteDegrees: () => void;
    // Add other actions here in the future
}

// Define the state interface
interface KeyboardState {
    showChordNotes: boolean;
    showNoteDegrees: boolean;
    actions: KeyboardActions;
}

// Create the store but don't export it directly
const useKeyboardStore = create<KeyboardState>((set) => ({
    showChordNotes: false,
    showNoteDegrees: true,

    // Group all actions together
    actions: {
        toggleShowChordNotes: () =>
            set((state) => ({ showChordNotes: !state.showChordNotes })),
        toggleShowNoteDegrees: () =>
            set((state) => ({ showNoteDegrees: !state.showNoteDegrees })),
    },
}));

// Export selector hooks for specific state
export const useShowChordNotes = () =>
    useKeyboardStore((state) => state.showChordNotes);
export const useShowNoteDegrees = () =>
    useKeyboardStore((state) => state.showNoteDegrees);

// Export actions hook
export const useKeyboardActions = () =>
    useKeyboardStore((state) => state.actions);

// Export internal store for advanced usage (undo/redo, etc.)
export const keyboardStoreInternal = useKeyboardStore;
