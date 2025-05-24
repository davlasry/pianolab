import { Progression } from "tonal";

const CURRENT_KEY = "E"; // This is the key you want to use for the chord display

interface ChordDisplayProps {
    chord: string; // e.g. "Cmaj7", "G7", "F#m7b5"
}

export const CurrentChord = ({ chord }: ChordDisplayProps) => {
    const [degreeIndex] = Progression.toRomanNumerals(CURRENT_KEY, [chord]);

    return (
        <div className="w-28 flex flex-col items-center justify-center bg-card shadow-md rounded-xl px-3 py-2 border border-input">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Chord
            </span>
            <span className="text-xl font-semibold text-primary truncate">
                {chord || "-"}
            </span>
            <span>{degreeIndex}</span>
        </div>
    );
};
