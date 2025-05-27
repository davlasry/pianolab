// const CURRENT_KEY = "E"; // This is the key you want to use for the chord display

interface ChordDisplayProps {
    chord: string; // e.g. "Cmaj7", "G7", "F#m7b5"
}

export const CurrentChord = ({ chord }: ChordDisplayProps) => {
    // const [degreeIndex] = Progression.toRomanNumerals(CURRENT_KEY, [chord]);

    return (
        <div className="flex w-28 flex-col items-center justify-center border border-input bg-card px-3 py-2 shadow-md">
            <span className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">
                Chord
            </span>
            <div className="flex items-center gap-2">
                <span className="truncate text-xl font-semibold text-primary">
                    {chord || "-"}
                </span>
                {/*<span>{degreeIndex}</span>*/}
            </div>
        </div>
    );
};
