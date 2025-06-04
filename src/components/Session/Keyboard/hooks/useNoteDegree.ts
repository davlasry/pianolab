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

/** Extended degree names used when a chord contains a 7th */
const EXTENDED_DEGREE_BY_CHROMA: Record<number, string> = {
    0: "1",
    1: "b9",
    2: "9",
    3: "b3",
    4: "3",
    5: "11",
    6: "b5", // could also be "#11" in some contexts
    7: "5",
    8: "#5", // or "b13"
    9: "13",
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

        // 2. Parse chord and obtain tonic and notes
        const chordInfo = Chord.get(activeChord);
        const { tonic, notes } = chordInfo;
        if (!tonic) return null; // unrecognised symbol

        // 3. Check if chord contains extensions (7th, 9th, 11th, 13th)
        const containsExtensions = 
            // Check if chord symbol contains 7, 9, 11, or 13
            activeChord.includes("7") || 
            activeChord.includes("9") || 
            activeChord.includes("11") || 
            activeChord.includes("13") ||
            // Check if chord actually contains 7th intervals (b7 or maj7)
            (notes && (notes.some(note => {
                const noteObj = Note.get(note);
                const tonicObj = Note.get(tonic);
                if (!noteObj.chroma || !tonicObj.chroma) return false;
                const interval = (noteObj.chroma - tonicObj.chroma + 12) % 12;
                return interval === 10 || interval === 11; // b7 or 7
            })));

        // 4. Compare pitch-classes (0-11)
        const noteChroma = Note.get(noteName).chroma!;
        const rootChroma = Note.get(tonic).chroma!;
        const distance = (noteChroma - rootChroma + 12) % 12;

        // 5. Translate to functional degree - use extended degrees for extended chords
        const degreeMap = containsExtensions ? EXTENDED_DEGREE_BY_CHROMA : DEGREE_BY_CHROMA;
        return degreeMap[distance] ?? null;
    }, [midiNumber, activeChord, isActive]);
}
