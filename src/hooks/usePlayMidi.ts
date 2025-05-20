import { useState, useRef, useEffect } from "react";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

export const usePlayMidi = () => {
    const [midi, setMidi] = useState<Midi | null>(null);

    // keep these across renders
    const partRef = useRef<Tone.Part | null>(null);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    async function loadMidi() {
        try {
            const midi = await Midi.fromUrl("/pianolab/sample.mid");
            console.log("midi =====>", midi);
            console.log("Tracks:", midi.tracks);
            console.log("Header:", midi.header);

            setMidi(midi);
        } catch (err) {
            console.error("Failed to load MIDI:", err);
        }
    }

    /** build (or rebuild) a Part from the Midi object */
    const buildPart = () => {
        if (!midi) return;

        // create a synth once
        synthRef.current ??= new Tone.PolySynth().toDestination();

        // transform midi → Tone.Part-friendly events
        const events = midi.tracks.flatMap((t) =>
            t.notes.map((n) => ({
                time: n.time, // seconds relative to start
                note: n.name,
                dur: n.duration,
                vel: n.velocity,
            })),
        );

        // dispose the old part if we rebuild
        partRef.current?.dispose();

        partRef.current = new Tone.Part((time, ev) => {
            console.log(
                `Play ${ev.note} at ${Tone.getTransport().seconds.toFixed(2)}s`,
            );
            synthRef.current!.triggerAttackRelease(
                ev.note,
                ev.dur,
                time,
                ev.vel,
            );
        }, events).start(0); // start at t=0 on the transport
    };

    async function playMidi() {
        await Tone.start();

        if (!partRef.current) buildPart(); // build once
        Tone.getTransport().start("+0.05"); // tiny look-ahead helps
    }

    function pauseMidi() {
        Tone.getTransport().pause();
        synthRef.current?.releaseAll(0); // fade out anything already playing
    }

    function resumeMidi() {
        Tone.getTransport().start();
    }

    const stopMidi = () => {
        Tone.getTransport().stop(); // rewind to 0
        Tone.getTransport().cancel(); // clear timeline so we don’t double-schedule
        synthRef.current?.releaseAll(0); // fade out anything already playing
        partRef.current?.dispose();
        partRef.current = null;
    };

    /** tidy up when the component unmounts */
    useEffect(() => () => stopMidi(), []);

    return {
        loadMidi,
        playMidi,
        pauseMidi,
        resumeMidi,
        stopMidi,
    };
};
