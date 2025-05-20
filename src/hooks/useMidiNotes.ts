// useMidiNotes.ts
import { useState } from "react";
import { Midi } from "@tonejs/midi";

export type Note = {
    id: string; // `${ticks}_${midi}`
    midi: number;
    ticks: number;
    time: number;
    duration: number;
    velocity: number;
    hand: "L" | "R" | null;
};

export const useMidiNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);

    /** load a MIDI file → editable Note[]  */
    const loadMidi = async (url = "/pianolab/sample.mid") => {
        const midi = await Midi.fromUrl(url);

        const parsed: Note[] = midi.tracks.flatMap((t) =>
            t.notes.map((n) => ({
                id: `${n.ticks}_${n.midi}`,
                midi: n.midi,
                ticks: n.ticks,
                time: n.time,
                duration: n.duration,
                velocity: n.velocity,
                hand: null,
            })),
        );

        setNotes(parsed);
        return midi; // return raw Midi in case you still need it
    };

    /** UI helper: change one note’s hand */
    const setHand = (id: string, hand: "L" | "R" | null) =>
        setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, hand } : n)));

    return { notes, setNotes, setHand, loadMidi };
};
