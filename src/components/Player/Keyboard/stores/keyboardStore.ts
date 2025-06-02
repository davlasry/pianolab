import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the actions interface
interface KeyboardActions {
    toggleShowChordNotes: () => void;
    toggleShowNoteDegrees: () => void;
    setZoomLevel: (level: number) => void;
    increaseZoom: () => void;
    decreaseZoom: () => void;
}

// Define the state interface
interface KeyboardState {
    showChordNotes: boolean;
    showNoteDegrees: boolean;
    zoomLevel: number;
    actions: KeyboardActions;
}

// Create the store with persist middleware
const useKeyboardStore = create<KeyboardState>()(
    persist(
        (set) => ({
            showChordNotes: false,
            showNoteDegrees: true,
            zoomLevel: 1, // default zoom level (100%)

            // Group all actions together
            actions: {
                toggleShowChordNotes: () =>
                    set((state) => ({ showChordNotes: !state.showChordNotes })),
                toggleShowNoteDegrees: () =>
                    set((state) => ({ showNoteDegrees: !state.showNoteDegrees })),
                setZoomLevel: (level: number) => 
                    set({ zoomLevel: Math.max(0.5, Math.min(2, level)) }), // limit between 50% and 200%
                increaseZoom: () => 
                    set((state) => ({ zoomLevel: Math.min(state.zoomLevel + 0.1, 2) })),
                decreaseZoom: () => 
                    set((state) => ({ zoomLevel: Math.max(state.zoomLevel - 0.1, 0.5) })),
            },
        }),
        {
            name: "pianolab-keyboard-settings", // unique name for localStorage
            partialize: (state) => ({ zoomLevel: state.zoomLevel }), // only persist zoomLevel
        }
    )
);

// Export selector hooks for specific state
export const useShowChordNotes = () =>
    useKeyboardStore((state) => state.showChordNotes);
export const useShowNoteDegrees = () =>
    useKeyboardStore((state) => state.showNoteDegrees);
export const useZoomLevel = () =>
    useKeyboardStore((state) => state.zoomLevel);

// Export actions hook
export const useKeyboardActions = () =>
    useKeyboardStore((state) => state.actions);

// Export internal store for advanced usage (undo/redo, etc.)
export const keyboardStoreInternal = useKeyboardStore;
