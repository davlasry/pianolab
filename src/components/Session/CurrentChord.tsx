// Retro LCD using theme primary colors

interface ChordDisplayProps {
    chord: string; // e.g. "Cmaj7", "G7", "F#m7b5"
    variant?: "default" | "large";
}

export const CurrentChord = ({
    chord,
    variant = "default",
}: ChordDisplayProps) => {
    if (variant === "large") {
        return (
            <div className="flex items-center justify-center">
                <div className="relative min-w-40 rounded-sm border-2 border-primary/80 bg-black px-10 py-4 text-center shadow-2xl">
                    {/* CRT glow effect */}
                    <div className="absolute -inset-1 rounded-sm bg-primary/20 blur-sm" />
                    <div className="absolute inset-0 rounded-sm bg-primary/5" />

                    {/* Scan lines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-30" 
                         style={{
                             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)'
                         }} />

                    {/* Digital segments background */}
                    <div className="absolute inset-2 rounded-sm bg-gradient-to-b from-primary/5 to-black/50" />

                    <span className="relative font-mono text-4xl font-bold tracking-wider text-primary drop-shadow-[0_0_10px_hsl(var(--primary)_/_0.8)]">
                        {chord || "----"}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex w-32 flex-col items-center justify-center border-2 border-primary/60 bg-black px-3 py-2 shadow-lg">
            {/* CRT glow */}
            <div className="absolute -inset-0.5 bg-primary/20 blur-sm" />
            <div className="absolute inset-0 bg-primary/5" />
            
            {/* Scan lines */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-20"
                 style={{
                     backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, hsl(var(--primary) / 0.1) 1px, hsl(var(--primary) / 0.1) 2px)'
                 }} />

            <span className="relative mb-1 text-[9px] font-bold tracking-widest text-primary/80 uppercase">
                ◉ CHORD
            </span>
            <div className="relative flex items-center gap-2">
                <span className="truncate font-mono text-lg font-bold text-primary drop-shadow-[0_0_5px_hsl(var(--primary)_/_0.6)]">
                    {chord || "----"}
                </span>
            </div>
        </div>
    );
};
