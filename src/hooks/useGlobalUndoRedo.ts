import { useHistoryActions } from "@/stores/historyStore";
import { type Chord, useChordsActions } from "@/stores/chordsStore.ts";

export const useGlobalUndoRedo = () => {
    const { undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useHistoryActions();
    const chordsActions = useChordsActions();

    const undo = () => {
        const snapshot = historyUndo();
        if (!snapshot) return;

        // Route the snapshot to the appropriate store based on tag
        switch (snapshot.tag) {
            case "chords":
                chordsActions.updateProgressionPresent(
                    snapshot.state as Chord[],
                );
                break;
            // Add more cases as new stores are added:
            // case "notes":
            //     useNoteStore.getState().updateNotesPresent(snapshot.state as Note[]);
            //     break;
            // case "arrangement":
            //     useArrangementStore.getState().updateArrangementPresent(snapshot.state as Arrangement);
            //     break;
            default:
                console.warn(`Unknown snapshot tag: ${snapshot.tag}`);
        }
    };

    const redo = () => {
        const snapshot = historyRedo();
        if (!snapshot) return;

        // Same routing logic as undo
        switch (snapshot.tag) {
            case "chords":
                chordsActions.updateProgressionPresent(
                    snapshot.state as Chord[],
                );
                break;
            // Add more cases as new stores are added
            default:
                console.warn(`Unknown snapshot tag: ${snapshot.tag}`);
        }
    };

    return {
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
