import { useHistoryStore } from "@/stores/historyStore";
import { type Chord, useChordsActions } from "@/stores/chordsStore.ts";

export const useGlobalUndoRedo = () => {
    const historyStore = useHistoryStore();
    const chordsActions = useChordsActions();

    const undo = () => {
        const snapshot = historyStore.undo();
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
        const snapshot = historyStore.redo();
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
        canUndo: historyStore.canUndo,
        canRedo: historyStore.canRedo,
    };
};
