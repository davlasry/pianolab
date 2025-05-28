import { useShortcut } from "@/shortcuts/KeyboardShortcuts";

interface UseUndoRedoShortcutsProps {
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

export const useUndoRedoShortcuts = ({
    undo,
    redo,
    canUndo,
    canRedo,
}: UseUndoRedoShortcutsProps) => {
    // Combined keyboard shortcut for undo/redo (Cmd+Z / Cmd+Shift+Z)
    useShortcut({
        key: "z",
        handler: (e) => {
            if (e.metaKey && e.shiftKey) {
                // Redo: Cmd+Shift+Z
                if (canRedo()) {
                    redo();
                }
            } else if (e.metaKey && !e.shiftKey) {
                // Undo: Cmd+Z
                if (canUndo()) {
                    undo();
                }
            }
        },
        when: () => canUndo() || canRedo(),
        description: "Undo (Cmd+Z) / Redo (Cmd+Shift+Z)",
    });
};
