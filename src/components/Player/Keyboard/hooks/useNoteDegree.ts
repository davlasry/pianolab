import { useMemo } from "react";
import { Note, Chord } from "tonal";

interface UseNoteDegreeProps {
    midiNumber: number;
    activeChord?: string;
    isActive: boolean;
}

/** Functional degree names for each semitone from the root (0-11). */
const DEGREE_BY_CHROMA: Record<number, string> = {
    0: "1",
    1: "b2",
    2: "2",
    3: "b3",
    4: "3",
    5: "4",
    6: "b5", // use "#4" if you prefer lydian spelling
    7: "5",
    8: "#5", // or "b6"
    9: "6",
    10: "b7",
    11: "7",
};

export function useNoteDegree({
    midiNumber,
    activeChord,
    isActive,
}: UseNoteDegreeProps) {
    return useMemo(() => {
        if (!isActive || !activeChord) return null;

        // 1. MIDI → note name (e.g. "E4")
        const noteName = Note.fromMidi(midiNumber); // ♫ 61 → "Db4"
        if (!noteName) return null; // safety guard

        // 2. Parse chord and obtain tonic
        const { tonic } = Chord.get(activeChord); // e.g. "F#"
        if (!tonic) return null; // unrecognised symbol

        // 3. Compare pitch-classes (0-11)
        const noteChroma = Note.get(noteName).chroma!;
        const rootChroma = Note.get(tonic).chroma!;
        const distance = (noteChroma - rootChroma + 12) % 12;

        // 4. Translate to functional degree
        return DEGREE_BY_CHROMA[distance] ?? null;
    }, [midiNumber, activeChord, isActive]);
}
