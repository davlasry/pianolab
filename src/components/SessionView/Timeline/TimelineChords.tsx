import { chordProgression } from "@/components/SessionView/hooks/useChordProgression.ts";

interface Props {
    totalDuration: number;
}

export const TimelineChords = ({ totalDuration }: Props) => {
    if (totalDuration <= 0) return null;

    return chordProgression.map((chord, index) => {
        if (!chord.chord) return null; // Skip empty chords

        const percent = (chord.time / totalDuration) * 100;

        return (
            <div
                key={`chord-${index}`}
                className="absolute top-1/2 transform -translate-y-1/2"
                style={{ left: `${percent}%` }}
            >
                <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    {chord.chord}
                </div>
            </div>
        );
    });
};
