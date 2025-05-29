import { useCallback } from 'react';
import { useShortcut } from '@/shortcuts/KeyboardShortcuts';
import { useGlobalUndoRedo } from '@/hooks/useGlobalUndoRedo';
import { useChordsActions } from '@/stores/chordsStore';
import { useTransportTime } from '@/TransportTicker/transportTicker';

interface UseTimelineShortcutsOptions {
    selectedChordIndices: number[];
    activeChordIndex: number | null;
}

export const useTimelineShortcuts = ({
    selectedChordIndices,
    activeChordIndex,
}: UseTimelineShortcutsOptions) => {
    const { undo, redo } = useGlobalUndoRedo();
    const {
        deleteActiveChord,
        deleteSelectedChords,
        setActiveChord,
        findChordAtTime,
        triggerEditMode,
    } = useChordsActions();
    const currentTime = useTransportTime();

    const handleDelete = useCallback(() => {
        if (selectedChordIndices.length > 1) {
            deleteSelectedChords();
        } else {
            deleteActiveChord();
        }
    }, [deleteActiveChord, deleteSelectedChords, selectedChordIndices]);

    const handleEditChord = useCallback(() => {
        const chordAtPlayheadResult = currentTime !== undefined ? findChordAtTime(currentTime) : null;
        const chordIndexAtPlayhead = chordAtPlayheadResult ? chordAtPlayheadResult.index : null;

        if (activeChordIndex !== null) {
            if (chordIndexAtPlayhead !== null && chordIndexAtPlayhead !== activeChordIndex) {
                setActiveChord(chordIndexAtPlayhead);
                triggerEditMode();
            } else {
                triggerEditMode();
            }
        } else if (chordIndexAtPlayhead !== null) {
            setActiveChord(chordIndexAtPlayhead);
            triggerEditMode();
        }
    }, [activeChordIndex, currentTime, findChordAtTime, setActiveChord, triggerEditMode]);

    // Setup undo/redo shortcuts
    useShortcut({
        key: 'z',
        handler: (e) => {
            if (e.metaKey && e.shiftKey) {
                // Redo: Cmd+Shift+Z
                redo();
            } else if (e.metaKey && !e.shiftKey) {
                // Undo: Cmd+Z
                undo();
            }
        },
        when: () => true, // Always active, handler checks canUndo/canRedo internally
        description: 'Undo (Cmd+Z) / Redo (Cmd+Shift+Z)',
    });

    // Delete shortcuts
    useShortcut({
        key: 'Delete',
        handler: handleDelete,
        description: 'Delete selected chord(s)',
    });

    useShortcut({
        key: 'Backspace',
        handler: handleDelete,
        description: 'Delete selected chord(s)',
    });

    // Edit chord shortcut
    useShortcut({
        key: 'Enter',
        handler: handleEditChord,
        when: () => {
            const activeElement = document.activeElement as HTMLElement | null;
            const isInputFocused =
                activeElement &&
                (activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    activeElement.isContentEditable);
            return !isInputFocused;
        },
        description: 'Edit current chord at playhead or toggle edit mode',
    });
};
