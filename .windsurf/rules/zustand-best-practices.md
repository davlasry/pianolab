---
trigger: model_decision
description: working with Zustand stores and selectors
globs:
---

# Zustand Store Best Practices

## Store Organization Pattern

Follow this pattern for all Zustand stores to maintain consistency and better separation of concerns:

### 1. Don't Export the Store Hook Directly

- Keep the main store hook private (don't export `useXxxStore`)
- This prevents direct access to the entire store and encourages proper usage patterns

### 2. Export Selector Hooks Instead

Create individual hooks for accessing specific state slices:

```typescript
// ✅ Good - Granular selector hooks
export const useChordProgression = () => useChordStore((state) => state.chordProgression);
export const useActiveChordIndex = () => useChordStore((state) => state.activeChordIndex);

// ❌ Avoid - Direct store export
export const useChordStore = create<ChordStore>(...);
```

### 3. Group Actions in an `actions` Property

Move all action functions into an `actions` object within the store:

```typescript
interface ChordStore {
    // State
    chordProgression: Chord[];
    activeChordIndex: number | null;

    // Actions grouped together
    actions: ChordActions;
}

const useChordStore = create<ChordStore>((set, get) => ({
    chordProgression: initialChordProgression,
    activeChordIndex: null,

    actions: {
        setChordProgression: (newProg) => set({ chordProgression: newProg }),
        updateChordTime: (index, duration, newStart) => {
            /* ... */
        },
        deleteChord: (index) => {
            /* ... */
        },
        // ... other actions
    },
}));
```

### 4. Export a Single Actions Hook

Provide one hook that returns all actions:

```typescript
export const useChordActions = () => useChordStore((state) => state.actions);
```

### 5. Provide Internal Store Access When Needed

For internal operations (like undo/redo), export the internal store reference:

```typescript
// For internal use only (undo/redo, etc.)
export const chordStoreInternal = useChordStore;
```

## Benefits of This Pattern

- **Better Performance**: Components only subscribe to the state they actually use
- **Cleaner API**: Components import only what they need
- **Type Safety**: Each hook is properly typed for its specific purpose
- **Separation of Concerns**: Clear distinction between state and actions
- **Maintainability**: Easier to refactor and understand store usage

## Example Usage in Components

```typescript
// ✅ Good - Use specific hooks
const chordProgression = useChordProgression();
const activeChordIndex = useActiveChordIndex();
const { updateChordTime, deleteChord, addChordAtEnd } = useChordActions();

// ❌ Avoid - Direct store access
const { chordProgression, updateChordTime, deleteChord } = useChordStore();
```

## Reference Implementation

See [chordsStore.ts](mdc:src/stores/chordsStore.ts) for a complete example of this pattern.
