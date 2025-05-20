import { useState, useRef, useEffect } from "react";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

export const usePlayMidi = () => {
    const [midi, setMidi] = useState<Midi | null>(null);
    const [activeKeys, setActiveKeys] = useState<number[]>([]);
    const [audioDuration, setAudioDuration] = useState<number>(0);

    // keep these across renders
    const playerRef = useRef<Tone.Player | null>(null);
    const partRef = useRef<Tone.Part | null>(null);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    async function loadMidi() {
        try {
            const midi = await Midi.fromUrl("/pianolab/sample.mid");
            setMidi(midi);
        } catch (err) {
            console.error("Failed to load MIDI:", err);
        }
    }

    const loadAudio = async (url = "/pianolab/body_and_soul.mp3") => {
        playerRef.current?.dispose(); // if re-loading
        playerRef.current = new Tone.Player({
            url,
            autostart: false,
            onload: () => {
                setAudioDuration(playerRef.current!.buffer.duration);
                console.log(
                    "playerRef.current!.buffer.duration =====>",
                    playerRef.current!.buffer.duration,
                );
                console.log("Audio loaded");
            },
        }).toDestination();
        playerRef.current.sync(); // follow the Transport
    };

    /** build (or rebuild) a Part from the Midi object */
    const buildPart = () => {
        if (!midi) return;

        // create a synth once
        synthRef.current ??= new Tone.PolySynth().toDestination();

        // transform midi → Tone.Part-friendly events
        const events = midi.tracks.flatMap((t) =>
            t.notes.map((n) => ({
                time: n.time, // seconds relative to start
                note: n.name, // "C4", "F#3" …
                dur: n.duration,
                vel: n.velocity,
                midi: n.midi, //  <-- add this line
            })),
        );

        // dispose the old part if we rebuild
        partRef.current?.dispose();

        partRef.current = new Tone.Part((time, ev) => {
            // console.log(
            //     `Play ${ev.note} at ${Tone.getTransport().seconds.toFixed(2)}s`,
            // );

            // 🔵 GUI ─ mark key ON
            setActiveKeys((keys) => [...keys, ev.midi]); // add without deduping for speed

            // 🔊 AUDIO ─ play the note
            // synthRef.current!.triggerAttackRelease(
            //     ev.note,
            //     ev.dur,
            //     time,
            //     ev.vel,
            // );

            // 🔴 GUI ─ schedule key OFF
            Tone.getTransport().scheduleOnce(() => {
                setActiveKeys((keys) => keys.filter((k) => k !== ev.midi));
            }, ev.time + ev.dur);
        }, events).start(0); // start at t=0 on the transport
    };

    async function play(audioOffset = 0) {
        await Tone.start(); // unlock AudioContext
        await Tone.loaded(); // wait for Player + MIDI

        if (!partRef.current) buildPart();

        const lookAhead = 0.05;
        // const startAt = Tone.now() + lookAhead; // single timestamp

        playerRef
            .current!.sync() // ← re-attach
            .start(lookAhead, audioOffset); // schedule at the same time

        Tone.getTransport().start();
    }

    function pause() {
        Tone.getTransport().pause();
        synthRef.current?.releaseAll(0); // fade out anything already playing
        setActiveKeys([]); // GUI reset
    }

    function resume() {
        Tone.getTransport().start();
    }

    const stop = () => {
        Tone.getTransport().stop(); // freeze & rewind the clock
        Tone.getTransport().cancel(); // clear all future MIDI events

        synthRef.current?.releaseAll(0); // fade out anything already playing
        partRef.current?.dispose();
        partRef.current = null;
        setActiveKeys([]); // GUI reset
    };

    /** tidy up when the component unmounts */
    useEffect(() => () => stop(), []);

    function seek(time: number) {
        // 1 – silence and clear GUI
        setActiveKeys([]);

        // 2 – jump the transport
        Tone.getTransport().seconds = time;
    }

    return {
        loadMidi,
        loadAudio,
        play,
        pause,
        resume,
        stop,
        activeKeys,
        audioDuration,
        seek,
    };
};
