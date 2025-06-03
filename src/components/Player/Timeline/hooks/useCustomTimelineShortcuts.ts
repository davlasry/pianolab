import { useCallback } from "react";
import { useShortcut } from "@/shortcuts/KeyboardShortcuts";
import { useGlobalUndoRedo } from "@/hooks/useGlobalUndoRedo";
import { useChordsActions } from "@/stores/chordsStore";
import { useCustomPlayerContext } from "@/components/Player/context/CustomPlayerContext";

interface UseCustomTimelineShortcutsOptions {
    selectedChordIndices: number[];
    activeChordIndex: number | null;
}

export const useCustomTimelineShortcuts = ({
    selectedChordIndices,
    activeChordIndex,
}: UseCustomTimelineShortcutsOptions) => {
    const { undo, redo } = useGlobalUndoRedo();
    const {
        deleteActiveChord,
        deleteSelectedChords,
        setActiveChord,
        findChordAtTime,
        triggerEditMode,
    } = useChordsActions();
    const { currentTime, isPlayerReady } = useCustomPlayerContext();

    const handleDelete = useCallback(() => {
        if (selectedChordIndices.length > 1) {
            deleteSelectedChords();
        } else {
            deleteActiveChord();
        }
    }, [deleteActiveChord, deleteSelectedChords, selectedChordIndices]);

    const handleEditChord = useCallback(() => {
        const chordAtPlayheadResult =
            currentTime !== undefined ? findChordAtTime(currentTime) : null;
        const chordIndexAtPlayhead = chordAtPlayheadResult
            ? chordAtPlayheadResult.index
            : null;

        if (activeChordIndex !== null) {
            if (
                chordIndexAtPlayhead !== null &&
                chordIndexAtPlayhead !== activeChordIndex
            ) {
                setActiveChord(chordIndexAtPlayhead);
                triggerEditMode();
            } else {
                triggerEditMode();
            }
        } else if (chordIndexAtPlayhead !== null) {
            setActiveChord(chordIndexAtPlayhead);
            triggerEditMode();
        }
    }, [
        activeChordIndex,
        currentTime,
        findChordAtTime,
        setActiveChord,
        triggerEditMode,
    ]);

    // Setup undo/redo shortcuts
    useShortcut({
        key: "z",
        handler: (e) => {
            if (e.metaKey && e.shiftKey) {
                // Redo: Cmd+Shift+Z
                redo();
            } else if (e.metaKey && !e.shiftKey) {
                // Undo: Cmd+Z
                undo();
            }
        },
        when: () => isPlayerReady, 
        description: "Undo (Cmd+Z) / Redo (Cmd+Shift+Z)",
    });

    // Delete shortcuts
    useShortcut({
        key: "Delete",
        handler: handleDelete,
        when: () => isPlayerReady,
        description: "Delete selected chord(s)",
    });

    useShortcut({
        key: "Backspace",
        handler: handleDelete,
        when: () => isPlayerReady,
        description: "Delete selected chord(s)",
    });

    // Edit chord shortcut
    useShortcut({
        key: "Enter",
        handler: handleEditChord,
        when: () => {
            const activeElement = document.activeElement as HTMLElement | null;
            const isInputFocused =
                activeElement &&
                (activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    activeElement.isContentEditable);
            return !isInputFocused && isPlayerReady;
        },
        description: "Edit current chord at playhead or toggle edit mode",
    });
}; 