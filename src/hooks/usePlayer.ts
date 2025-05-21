import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import type { Note } from "@/hooks/useMidiNotes.ts";
import { chordProgression } from "@/hooks/useChordProgression.ts";

export const usePlayer = (notes: Note[]) => {
    // const [midi, setMidi] = useState<Midi | null>(null);
    const [activeNotes, setActiveNotes] = useState<any[]>([]);
    const [activeChord, setActiveChord] = useState<string>("");
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    // keep these across renders
    const playerRef = useRef<Tone.Player | null>(null);
    const notesPartRef = useRef<Tone.Part | null>(null);
    const chordPartRef = useRef<Tone.Part | null>(null);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // Update isPlaying and isPaused state based on the Transport state
    useEffect(() => {
        const updatePlayingState = () => {
            const transportState = Tone.getTransport().state;
            setIsPlaying(transportState === "started");
            setIsPaused(transportState === "paused");
        };

        // Initial state
        updatePlayingState();

        // Listen for transport state changes
        Tone.getTransport().on("start", updatePlayingState);
        Tone.getTransport().on("stop", updatePlayingState);
        Tone.getTransport().on("pause", updatePlayingState);

        return () => {
            // Clean up listeners
            Tone.getTransport().off("start", updatePlayingState);
            Tone.getTransport().off("stop", updatePlayingState);
            Tone.getTransport().off("pause", updatePlayingState);
        };
    }, []);

    // async function loadMidi() {
    //     try {
    //         const midi = await Midi.fromUrl("/pianolab/sample.mid");
    //         setMidi(midi);
    //     } catch (err) {
    //         console.error("Failed to load MIDI:", err);
    //     }
    // }

    const loadAudio = async (
        // url = "https://pianolab-audio.s3.us-east-2.amazonaws.com/body-and-soul.mp3",
        url = "/pianolab/body_and_soul.mp3",
    ) => {
        playerRef.current?.dispose(); // if re-loading
        playerRef.current = new Tone.Player({
            url,
            autostart: false,
            onload: () => {
                setAudioDuration(playerRef.current!.buffer.duration);
                console.log("Audio loaded");
            },
        }).toDestination();
        playerRef.current.sync(); // follow the Transport
    };

    const buildNotesPart = () => {
        const events = notes.map((n) => ({
            time: n.time,
            note: Tone.Frequency(n.midi, "midi").toNote(), // "C4" etc.
            dur: n.duration,
            vel: n.velocity,
            midi: n.midi,
            hand: n.hand, // keep it if colouring during playback
        }));

        // dispose the old part if we rebuild
        notesPartRef.current?.dispose();

        notesPartRef.current = new Tone.Part((_time, ev) => {
            // 🔵 GUI ─ mark key ON
            setActiveNotes((keys) => [
                ...keys,
                { midi: ev.midi, hand: ev.midi > 75 ? "right" : "left" },
            ]); // add without deduping for speed

            // 🔊 AUDIO ─ play the note
            // synthRef.current!.triggerAttackRelease(
            //     ev.note,
            //     ev.dur,
            //     time,
            //     ev.vel,
            // );

            // 🔴 GUI ─ schedule key OFF
            Tone.getTransport().scheduleOnce(() => {
                setActiveNotes((keys) =>
                    keys.filter((k) => k.midi !== ev.midi),
                );
            }, ev.time + ev.dur);
        }, events).start(0); // start at t=0 on the transport
    };

    const buildChordProgressionPart = () => {
        const events = chordProgression.map((n) => ({
            time: n.time,
            chord: n.chord,
        }));

        // dispose the old part if we rebuild
        chordPartRef.current?.dispose();

        chordPartRef.current = new Tone.Part((_time, ev) => {
            setActiveChord(ev.chord); // add without deduping for speed
        }, events).start(0); // start at t=0 on the transport
    };

    /** build (or rebuild) a Part from the Midi object */
    const buildPart = () => {
        // if (!midi) return;

        // create a synth once
        synthRef.current ??= new Tone.PolySynth().toDestination();

        buildNotesPart();
        buildChordProgressionPart();
    };

    async function play(audioOffset = 0) {
        await Tone.start(); // unlock AudioContext
        await Tone.loaded(); // wait for Player + MIDI

        if (!notesPartRef.current || !chordPartRef) buildPart();

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
    }

    function resume() {
        Tone.getTransport().start();
    }

    const stop = () => {
        Tone.getTransport().stop(); // freeze & rewind the clock
        Tone.getTransport().cancel(); // clear all future MIDI events

        synthRef.current?.releaseAll(0); // fade out anything already playing

        notesPartRef.current?.dispose();
        notesPartRef.current = null;

        chordPartRef.current?.dispose();
        chordPartRef.current = null;

        setActiveNotes([]); // GUI reset
        setActiveChord(""); // GUI reset
    };

    /** tidy up when the component unmounts */
    useEffect(() => () => stop(), []);

    function seek(time: number) {
        // 1 – silence and clear GUI
        setActiveNotes([]);

        // 2 – jump the transport
        Tone.getTransport().seconds = time;

        const last = chordProgression
            .slice()
            .reverse()
            .find((e) => e.time <= time);

        if (last) setActiveChord(last.chord);
    }

    return {
        loadAudio,
        play,
        pause,
        resume,
        stop,
        activeNotes,
        activeChord,
        audioDuration,
        seek,
        isPlaying,
        isPaused,
    };
};
