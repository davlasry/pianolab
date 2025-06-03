import { useHistoryActions, type Snapshot } from "@/stores/historyStore";
import {
    type Chord,
    useChordsActions,
    useChordProgression,
} from "@/stores/chordsStore.ts";

export const useGlobalUndoRedo = () => {
    const { undoWithCurrent, redoWithCurrent, canUndo, canRedo } =
        useHistoryActions();
    const chordsActions = useChordsActions();
    const chordProgression = useChordProgression();

    const buildCurrentChordSnapshot = (): Snapshot => ({
        tag: "chords",
        state: chordProgression.map((c) => ({ ...c })),
    });

    const applySnapshot = (snapshot?: Snapshot) => {
        if (!snapshot) return;
        switch (snapshot.tag) {
            case "chords":
                chordsActions.updateProgressionPresent(
                    snapshot.state as Chord[],
                );
                break;
            default:
                console.warn(`Unknown snapshot tag: ${snapshot.tag}`);
        }
    };

    const undo = () => {
        const currentSnap = buildCurrentChordSnapshot();
        const snapshot = undoWithCurrent(currentSnap);
        applySnapshot(snapshot);
    };

    const redo = () => {
        const currentSnap = buildCurrentChordSnapshot();
        const snapshot = redoWithCurrent(currentSnap);
        applySnapshot(snapshot);
    };

    return {
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
