import { create } from "zustand";

// Define the actions interface
interface KeyboardActions {
  toggleShowChordNotes: () => void;
  // Add other actions here in the future
}

// Define the state interface
interface KeyboardState {
  showChordNotes: boolean;
  actions: KeyboardActions;
}

// Create the store but don't export it directly
const useKeyboardStore = create<KeyboardState>((set) => ({
  showChordNotes: true, // Default to showing chord notes
  
  // Group all actions together
  actions: {
    toggleShowChordNotes: () =>
      set((state) => ({ showChordNotes: !state.showChordNotes })),
  },
}));

// Export selector hooks for specific state
export const useShowChordNotes = () => useKeyboardStore((state) => state.showChordNotes);

// Export actions hook
export const useKeyboardActions = () => useKeyboardStore((state) => state.actions);

// Export internal store for advanced usage (undo/redo, etc.)
export const keyboardStoreInternal = useKeyboardStore; 