// const CURRENT_KEY = "E"; // This is the key you want to use for the chord display

interface ChordDisplayProps {
    chord: string; // e.g. "Cmaj7", "G7", "F#m7b5"
    variant?: "default" | "large";
}

export const CurrentChord = ({
    chord,
    variant = "default",
}: ChordDisplayProps) => {
    // const [degreeIndex] = Progression.toRomanNumerals(CURRENT_KEY, [chord]);

    if (variant === "large") {
        return (
            <div className="flex items-center justify-center">
                <div className="relative min-w-40 rounded-sm border border-primary/70 bg-black/60 px-10 py-3 text-center shadow-inner">
                    {/* LCD glow effect */}
                    <div className="absolute inset-0 rounded-sm bg-primary/5" />

                    {/* LCD scan line effect */}
                    <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-20" />

                    <span className="relative font-mono text-3xl font-semibold tracking-wide text-primary">
                        {chord || "-"}
                    </span>
                </div>
            </div>
        );
    }

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
