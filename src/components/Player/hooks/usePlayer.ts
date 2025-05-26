import { useState, useRef, useEffect, useCallback } from "react";
import * as Tone from "tone";
import type { Note } from "@/components/Player/hooks/useMidiNotes.ts";
import { initialChordProgression } from "@/components/Player/hooks/useChordProgression.ts";
import { useTransportState } from "@/components/Player/hooks/useTransportState.ts";
import { transportTicker } from "@/TransportTicker/transportTicker.ts";

type ActiveNote = {
    midi: number;
    hand: "left" | "right";
};

export const usePlayer = (notes: Note[]) => {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
    const [activeChord, setActiveChord] = useState<string>("");
    const [audioDuration, setAudioDuration] = useState<number>(0);

    // keep these across renders
    const playerRef = useRef<Tone.Player | null>(null);
    const notesPartRef = useRef<Tone.Part | null>(null);
    const chordPartRef = useRef<Tone.Part | null>(null);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    const { transportState } = useTransportState();
    const isPlaying = transportState === "started";
    const isPaused = transportState === "paused";
    const isStopped = transportState === "stopped";

    const loadAudio = useCallback(
        async (
            // Default local file as fallback
            url = "/pianolab/body_and_soul.mp3",
        ) => {
            playerRef.current?.dispose(); // if re-loading

            try {
                playerRef.current = new Tone.Player({
                    url,
                    autostart: false,
                    onload: () => {
                        setAudioDuration(playerRef.current!.buffer.duration);
                    },
                    onerror: (err) => {
                        console.error("Error loading audio:", err);
                    },
                }).toDestination();

                playerRef.current.sync(); // follow the Transport
            } catch (error) {
                console.error("Failed to load audio:", error);
            }
        },
        [],
    );

    const buildNotesPart = useCallback(() => {
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
    }, [notes]);

    const buildChordProgressionPart = useCallback(() => {
        const events = initialChordProgression.map((n) => ({
            time: n.startTime,
            chord: n.label,
        }));

        // dispose the old part if we rebuild
        chordPartRef.current?.dispose();

        chordPartRef.current = new Tone.Part((_time, ev) => {
            setActiveChord(ev.chord); // add without deduping for speed
        }, events).start(0); // start at t=0 on the transport
    }, []);

    /** build (or rebuild) a Parts from the Midi object and chord progressions*/
    const buildPart = useCallback(() => {
        // 🔊 AUDIO – create a synth once
        // synthRef.current ??= new Tone.PolySynth().toDestination();

        buildNotesPart();
        buildChordProgressionPart();
    }, [buildChordProgressionPart, buildNotesPart]);

    const play = useCallback(
        async (audioOffset = 0) => {
            await Tone.start(); // unlock AudioContext
            await Tone.loaded(); // wait for Player + MIDI

            if (!notesPartRef.current || !chordPartRef.current) buildPart();

            const lookAhead = 0.05;

            // Check if player is initialized before using it
            if (!playerRef.current) {
                console.warn(
                    "Audio player not initialized. Make sure to call loadAudio first.",
                );
                // Start the transport even without audio
                Tone.getTransport().start();
                return;
            }

            playerRef.current
                .sync() // ← re-attach
                .start(lookAhead, audioOffset); // schedule at the same time

            Tone.getTransport().start();
        },
        [buildPart],
    );

    const pause = useCallback(() => {
        Tone.getTransport().pause();
        synthRef.current?.releaseAll(0); // fade out anything already playing
    }, []);

    const resume = useCallback(() => {
        Tone.getTransport().start();
    }, []);

    const stop = useCallback(() => {
        Tone.getTransport().stop(); // freeze & rewind the clock
        Tone.getTransport().cancel(); // clear all future MIDI events

        synthRef.current?.releaseAll(0); // fade out anything already playing

        notesPartRef.current?.dispose();
        notesPartRef.current = null;

        chordPartRef.current?.dispose();
        chordPartRef.current = null;

        setActiveNotes([]); // GUI reset
        setActiveChord(""); // GUI reset
    }, []);

    /** tidy up when the component unmounts */
    useEffect(
        () => () => {
            stop(); // This already handles notesPartRef and chordPartRef disposal

            // Additionally dispose of player and synth
            playerRef.current?.dispose();
            playerRef.current = null;

            synthRef.current?.dispose();
            synthRef.current = null;

            // Reset all state
            setAudioDuration(0);
            Tone.getTransport().stop();
        },
        [],
    );

    const seek = useCallback((time: number) => {
        // 1 – silence and clear GUI
        setActiveNotes([]);

        // 2 – jump the transport
        Tone.getTransport().seconds = time;
        transportTicker.set(time);

        // find last played chord before the time
        const last = initialChordProgression
            .slice()
            .reverse()
            .find((e) => e.startTime <= time);

        if (last) setActiveChord(last.label);
    }, []);

    const seekToBeginning = useCallback(() => {
        seek(0);
        Tone.getTransport().stop();
    }, [seek]);

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
        seekToBeginning,
        isPlaying,
        isPaused,
        isStopped,
        transportState,
        getTransport: () => Tone.getTransport(),
    };
};
