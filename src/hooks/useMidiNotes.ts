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
    const loadMidi = async (
        // Default local file as fallback
        url = "/pianolab/sample.mid",
    ) => {
        try {
            console.log("Loading MIDI from:", url);
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
        } catch (error) {
            console.error("Failed to load MIDI file:", error);
            
            // If the URL isn't the fallback already, try the fallback
            if (url !== "/pianolab/sample.mid") {
                console.warn("Falling back to local MIDI file");
                return loadMidi("/pianolab/sample.mid");
            }
            
            // If even the fallback fails, return an empty Midi object
            console.error("Failed to load fallback MIDI as well");
            const emptyMidi = new Midi();
            setNotes([]);
            return emptyMidi;
        }
    };

    /** UI helper: change one note's hand */
    const setHand = (id: string, hand: "L" | "R" | null) =>
        setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, hand } : n)));

    return { notes, setNotes, setHand, loadMidi };
};
