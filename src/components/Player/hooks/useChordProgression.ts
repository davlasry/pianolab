import { useState, useCallback } from "react";

export interface Chord {
    label: string;
    startTime: number;
    duration: number;
}

const initialChordProgression: Chord[] = [
    { label: "F#m", startTime: 0, duration: 2 },
    { label: "C#7b9", startTime: 2, duration: 2 },
    { label: "F#m", startTime: 4, duration: 2 },
    { label: "B7#11", startTime: 6, duration: 2 },
    { label: "E", startTime: 8, duration: 2 },
    { label: "A7", startTime: 10, duration: 2 },
    { label: "Abm", startTime: 12, duration: 2 },
    { label: "Gdim7", startTime: 14, duration: 2 },
    { label: "", startTime: 16, duration: 2 },
];

export const useChordProgressionState = () => {
    const [chordProgression, setChordProgression] = useState<Chord[]>(
        initialChordProgression,
    );

    const updateChordTime = useCallback(
        (index: number, _duration: number, newTime: number) => {
            setChordProgression((currentProgression) => {
                return currentProgression.map((chord, i) =>
                    i === index
                        ? { ...chord, startTime: newTime, duration: _duration }
                        : chord,
                );
            });
        },
        [],
    );

    // Function to get the initial progression if needed elsewhere non-reactively
    // Or simply export initialChordProgression if that's preferred
    const getInitialChordProgression = () => initialChordProgression;

    return { chordProgression, updateChordTime, getInitialChordProgression };
};

// Exporting the initial array directly for any non-React parts that might still use it.
// If all consumers will be React components, this can be removed.
export const chordProgression = initialChordProgression;
