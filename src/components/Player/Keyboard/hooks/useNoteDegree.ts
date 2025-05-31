import { useMemo } from "react";
import { Note, Interval, Chord } from "tonal";

interface UseNoteDegreeProps {
    midiNumber: number;
    activeChord?: string;
    isActive: boolean;
}

export function useNoteDegree({ midiNumber, activeChord, isActive }: UseNoteDegreeProps) {
    return useMemo(() => {
        // Only calculate degree if there's an active chord and the note is active
        if (!activeChord || !isActive) {
            return null;
        }

        try {
            // Convert MIDI number to note name
            const noteName = Note.fromMidi(midiNumber);
            if (!noteName) return null;

            // Get the chord information
            const chord = Chord.get(activeChord);
            if (!chord.tonic) return null;

            // Calculate the interval between the root and the note
            const interval = Interval.distance(chord.tonic, noteName);
            
            // Convert interval to degree notation
            const intervalToNotation: Record<string, string> = {
                "1P": "R", // Root
                "2m": "b2",
                "2M": "2",
                "3m": "b3",
                "3M": "3",
                "4P": "4",
                "4A": "#4",
                "5d": "b5",
                "5P": "5",
                "5A": "#5",
                "6m": "b6",
                "6M": "6",
                "7m": "b7",
                "7M": "7",
                "8P": "R", // Octave
                "9m": "b9",
                "9M": "9",
                "11P": "11",
                "11A": "#11",
                "13m": "b13",
                "13M": "13"
            };

            return intervalToNotation[interval] || interval;
        } catch (error) {
            console.warn("Error calculating note degree:", error);
            return null;
        }
    }, [midiNumber, activeChord, isActive]);
} 