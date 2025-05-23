import { Progression } from "tonal";

const CURRENT_KEY = "E"; // This is the key you want to use for the chord display

interface ChordDisplayProps {
    chord: string; // e.g. "Cmaj7", "G7", "F#m7b5"
}

export const CurrentChord = ({ chord }: ChordDisplayProps) => {
    // const keyData = Key.minorKey(CURRENT_KEY);
    // const chordDegreeIndex = keyData.natural.chords.indexOf(chord);
    // const triadDegreeIndex = keyData.natural.triads.indexOf(chord);
    // console.log("keyData.natural =====>", keyData.natural);
    // console.log("chord =====>", chord);
    // console.log("triadDegreeIndex =====>", triadDegreeIndex);
    // const degreeIndex =
    //     chordDegreeIndex > -1 ? chordDegreeIndex : triadDegreeIndex;

    const [degreeIndex] = Progression.toRomanNumerals(CURRENT_KEY, [chord]);

    return (
        <div className="w-28  flex flex-col items-center justify-center bg-white shadow-md rounded-xl px-3 py-2 border border-gray-200">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                Chord
            </span>
            <span className="text-xl font-semibold text-indigo-600 truncate">
                {chord || "-"}
            </span>
            <span>{degreeIndex}</span>
        </div>
    );
};
