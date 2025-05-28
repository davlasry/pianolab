import { useShortcut } from "@/shortcuts/KeyboardShortcuts";

interface UseUndoRedoShortcutsProps {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const useUndoRedoShortcuts = ({
    undo,
    redo,
    canUndo,
    canRedo,
}: UseUndoRedoShortcutsProps) => {
    // Keyboard shortcut for undo (Cmd+Z)
    useShortcut({
        key: "z",
        handler: (e) => {
            if (e.metaKey && !e.shiftKey) {
                undo();
            }
        },
        when: () => canUndo,
        description: "Undo last action",
    });

    // Keyboard shortcut for redo (Cmd+Shift+Z)
    useShortcut({
        key: "Z", // Capital Z for Shift+Z
        handler: (e) => {
            if (e.metaKey && e.shiftKey) {
                redo();
            }
        },
        when: () => canRedo,
        description: "Redo last action",
    });
}; 