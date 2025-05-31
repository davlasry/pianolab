import { useMemo } from "react";
import { Note, Chord, Interval } from "tonal";

interface UseNoteDegreeProps {
    midiNumber: number;
    activeChord?: string;
    isActive: boolean;
}

export function useNoteDegree({
    midiNumber,
    activeChord,
    isActive,
}: UseNoteDegreeProps): string | null {
    return useMemo(() => {
        if (!isActive || !activeChord) {
            return null;
        }

        try {
            const chordData = Chord.get(activeChord);
            if (!chordData.tonic || chordData.empty) {
                return null;
            }

            const currentNotePc = Note.pitchClass(Note.fromMidi(midiNumber));
            let intervalNameInChord: string | undefined = undefined;
            const noteIndex = chordData.notes.findIndex(
                (n) => Note.pitchClass(n) === currentNotePc,
            );

            if (noteIndex !== -1 && noteIndex < chordData.intervals.length) {
                intervalNameInChord = chordData.intervals[noteIndex];
            }

            if (intervalNameInChord) {
                const intervalProps = Interval.get(intervalNameInChord);
                const quality = intervalProps.q; // Quality: P, M, m, A, d
                const number = intervalProps.num?.toString(); // Number: 1, 3, 11

                if (!number) return null;

                let text: string | null = null;
                if (quality === "P" || quality === "M") {
                    text = number;
                } else if (quality === "m") {
                    text = "b" + number;
                } else if (quality === "A") {
                    text = "#" + number;
                } else if (quality === "d") {
                    if (
                        number === "5" ||
                        number === "4" ||
                        number === "1"
                    ) {
                        text = "b" + number;
                    } else {
                        text = "bb" + number;
                    }
                } else {
                    text = intervalNameInChord; // Fallback
                }
                
                if (text === "1" || text === "b1") return "R";
                return text;

            } else {
                // Note is not part of the defined chord structure
                const intervalFromTonic = Interval.distance(
                    chordData.tonic,
                    currentNotePc,
                );
                const simpleIntervalProps = Interval.get(intervalFromTonic);
                
                if (simpleIntervalProps.num) {
                    let prefix = "";
                    if (simpleIntervalProps.alt === 1) prefix = "#";
                    else if (simpleIntervalProps.alt === -1) prefix = "b";
                    else if (simpleIntervalProps.alt === 2) prefix = "##";
                    else if (simpleIntervalProps.alt === -2) prefix = "bb";

                    const numStr = simpleIntervalProps.num.toString();
                    if (simpleIntervalProps.num === 1 && simpleIntervalProps.alt === 0) return "R";
                    return prefix + numStr;
                }
            }
            return null; // Should be unreachable if logic is correct
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.warn(
                    `[useNoteDegree] Error calculating degree for MIDI ${midiNumber}, chord ${activeChord}:`,
                    e.message,
                );
            } else {
                console.warn(
                    `[useNoteDegree] An unknown error occurred while calculating degree for MIDI ${midiNumber}, chord ${activeChord}:`,
                    e,
                );
            }
            return null;
        }
    }, [midiNumber, activeChord, isActive]);
} 