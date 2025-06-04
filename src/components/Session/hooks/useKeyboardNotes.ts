import { useMemo } from "react";
import { Chord, Note } from "tonal";

export type KeyboardNote = {
    midi: number;
    type: "played" | "chord";
};

interface UseKeyboardNotesProps {
    activeNotes: { midi: number; hand: "left" | "right" }[];
    activeChord: string;
}

export function useKeyboardNotes({
    activeNotes,
    activeChord,
}: UseKeyboardNotesProps) {
    const chordNotes = useMemo(() => {
        if (!activeChord) return [];

        try {
            // Parse the chord (e.g., "F#m" -> ["F#", "A", "C#"])
            const chord = Chord.get(activeChord);
            if (!chord.notes || chord.notes.length === 0) return [];

            // Convert chord notes to MIDI numbers (across multiple octaves for better visibility)
            const midiNumbers: number[] = [];

            // For each octave from 2 to 6
            for (let octave = 2; octave <= 6; octave++) {
                chord.notes.forEach((noteName) => {
                    const midi = Note.midi(`${noteName}${octave}`);
                    if (midi !== null) {
                        midiNumbers.push(midi);
                    }
                });
            }

            return midiNumbers;
        } catch (e) {
            console.warn(`Could not parse chord: ${activeChord}`, e);
            return [];
        }
    }, [activeChord]);

    const playedNotes = useMemo(
        () => activeNotes.map((note) => note.midi),
        [activeNotes],
    );

    return { playedNotes, chordNotes };
}
