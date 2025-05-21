interface ChordDisplayProps {
    chord: string; // e.g. "Cmaj7", "G7", "F#m7b5"
}

export const CurrentChord = ({ chord }: ChordDisplayProps) => {
    return (
        <div className="w-28 h-20 flex flex-col items-center justify-center bg-white shadow-md rounded-xl px-3 py-2 border border-gray-200">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                Chord
            </span>
            <span className="text-xl font-semibold text-indigo-600 truncate">
                {chord || "-"}
            </span>
        </div>
    );
};
