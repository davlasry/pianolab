import { useState, useRef, useEffect, useCallback } from "react";
import * as Tone from "tone";
import type { Note } from "@/components/Session/hooks/useMidiNotes.ts";
import { useTransportState } from "@/components/Session/hooks/useTransportState.ts";
import { transportTicker } from "@/TransportTicker/transportTicker.ts";
import { useChordProgression, useChordsActions } from "@/stores/chordsStore.ts";
import { usePlayheadActions } from "@/stores/playheadStore.ts";
import { useYouTubeIsReady, useYouTubePlayer, useYouTubeIsVisible } from "@/stores/youtubeStore.ts";

// Window interface is now declared in YouTubePlayer.tsx with callback support

// Key for storing playhead position in localStorage
const PLAYHEAD_POSITION_KEY = "pianolab_playhead_position";

type ActiveNote = {
    midi: number;
    hand: "left" | "right";
};

export const usePlayer = (notes: Note[]) => {
    // Function to save current playhead position to localStorage
    const savePlayheadPosition = useCallback(() => {
        const currentTime = Tone.getTransport().seconds;
        if (currentTime > 0) {
            localStorage.setItem(PLAYHEAD_POSITION_KEY, currentTime.toString());
        }
    }, []);

    // Get the action to set restored position from Zustand store
    const { setRestoredPosition } = usePlayheadActions();

    const chordProgression = useChordProgression();
    const { findChordAtTime } = useChordsActions();
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
    const [activeChord, setActiveChord] = useState<string>("");
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);

    // Helper function to update active chord based on current time
    const updateActiveChordForTime = useCallback((time: number) => {
        const chordAtTime = findChordAtTime(time);
        if (chordAtTime) {
            setActiveChord(chordAtTime.chord.label);
        } else {
            setActiveChord("");
        }
    }, [findChordAtTime]);

    // keep these across renders
    const playerRef = useRef<Tone.Player | null>(null);
    const notesPartRef = useRef<Tone.Part | null>(null);
    const chordPartRef = useRef<Tone.Part | null>(null);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // YouTube integration
    const youtubePlayer = useYouTubePlayer();
    const isYouTubeReady = useYouTubeIsReady();
    const isYouTubeVisible = useYouTubeIsVisible();
    const hasYouTubeSource = isYouTubeReady && youtubePlayer;

    const { transportState } = useTransportState();
    const isPlaying = transportState === "started";
    const isPaused = transportState === "paused";
    const isStopped = transportState === "stopped";

    // Effect to update audio duration when YouTube player is available
    useEffect(() => {
        if (hasYouTubeSource && youtubePlayer.getDuration) {
            try {
                const ytDuration = youtubePlayer.getDuration();
                if (ytDuration && !isNaN(ytDuration) && ytDuration > 0) {
                    setAudioDuration(ytDuration);
                }
            } catch (err) {
                console.error("Error getting YouTube duration:", err);
            }
        }
    }, [hasYouTubeSource, youtubePlayer]);

    // Effect to mute audio player when YouTube is ready and visible
    useEffect(() => {
        if (hasYouTubeSource && isYouTubeVisible) {
            // Mute the audio player when YouTube is ready and visible
            if (playerRef.current) {
                try {
                    playerRef.current.mute = true;
                    setIsMuted(true);
                    console.log("Audio player muted due to YouTube player being visible");
                } catch (err) {
                    console.error("Error muting audio player:", err);
                }
            }
        } else {
            // Unmute the audio player when YouTube is not available or not visible
            if (playerRef.current) {
                try {
                    playerRef.current.mute = false;
                    setIsMuted(false);
                    console.log("Audio player unmuted - YouTube not visible or not available");
                } catch (err) {
                    console.error("Error unmuting audio player:", err);
                }
            }
        }
    }, [hasYouTubeSource, isYouTubeVisible]);

    const loadAudio = useCallback(
        async (
            // Default local file as fallback
            url = "/pianolab/body_and_soul.mp3",
        ) => {
            playerRef.current?.dispose(); // if re-loading

            try {
                // Initialize Tone.js first but don't await it here to prevent blocking
                // This prevents the infinite loading issue
                Tone.start();

                playerRef.current = new Tone.Player({
                    url,
                    autostart: false,
                    onload: () => {
                        // Set audio duration first
                        const duration = playerRef.current!.buffer.duration;
                        setAudioDuration(duration);

                        // After audio is loaded, try to restore position from localStorage
                        const savedPosition = localStorage.getItem(
                            PLAYHEAD_POSITION_KEY,
                        );

                        if (savedPosition) {
                            const time = parseFloat(savedPosition);

                            // Validate the time is within the audio duration
                            if (!isNaN(time) && time > 0 && time < duration) {
                                // Set the transport time directly
                                Tone.getTransport().seconds = time;
                                transportTicker.set(time);

                                setRestoredPosition(time, true);
                            }
                        }

                        // Mute if YouTube is ready
                        if (hasYouTubeSource) {
                            playerRef.current!.mute = true;
                            setIsMuted(true);
                            console.log(
                                "Audio player muted due to YouTube player (on load)",
                            );
                        }
                    },
                    onerror: (err) => {
                        console.error("Error loading audio:", err);
                    },
                }).toDestination();

                playerRef.current.sync(); // follow the Transport

                // Return a resolved promise to indicate loading has started
                // This fixes the infinite loading issue
                return Promise.resolve();
            } catch (error) {
                console.error("Failed to load audio:", error);
                return Promise.reject(error);
            }
        },
        [setRestoredPosition, hasYouTubeSource],
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
            // GUI ─ mark key ON
            setActiveNotes((keys) => [
                ...keys,
                { midi: ev.midi, hand: ev.midi > 75 ? "right" : "left" },
            ]); // add without deduping for speed

            // AUDIO ─ play the note
            // synthRef.current!.triggerAttackRelease(
            //     ev.note,
            //     ev.dur,
            //     time,
            //     ev.vel,
            // );

            // GUI ─ schedule key OFF
            Tone.getTransport().scheduleOnce(() => {
                setActiveNotes((keys) =>
                    keys.filter((k) => k.midi !== ev.midi),
                );
            }, ev.time + ev.dur);
        }, events).start(0); // start at t=0 on the transport
    }, [notes]);

    const buildChordProgressionPart = useCallback(() => {
        const events = chordProgression.map((n) => ({
            time: n.startTime,
            chord: n.label,
        }));

        // dispose the old part if we rebuild
        chordPartRef.current?.dispose();

        chordPartRef.current = new Tone.Part((_time, ev) => {
            setActiveChord(ev.chord); // add without deduping for speed
        }, events).start(0); // start at t=0 on the transport
    }, [chordProgression]);

    /** build (or rebuild) a Parts from the Midi object and chord progressions*/
    const buildPart = useCallback(() => {
        // AUDIO – create a synth once
        // synthRef.current ??= new Tone.PolySynth().toDestination();

        buildNotesPart();
        buildChordProgressionPart();
    }, [buildChordProgressionPart, buildNotesPart]);

    // Rebuild the chord progression part whenever chord progression changes
    useEffect(() => {
        // Only rebuild if the chord part already exists and we're not in a stopped state
        if (chordPartRef.current && transportState !== "stopped") {
            buildChordProgressionPart();
        }
    }, [chordProgression, buildChordProgressionPart, transportState]);

    const play = useCallback(
        async (audioOffset = 0) => {
            await Tone.start(); // unlock AudioContext
            await Tone.loaded(); // wait for Player + MIDI

            if (!notesPartRef.current || !chordPartRef.current) buildPart();

            const lookAhead = 0.05;

            // If using YouTube player, don't need to play audio
            if (hasYouTubeSource) {
                Tone.getTransport().start();
                return;
            }

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
        [buildPart, hasYouTubeSource],
    );

    const pause = useCallback(() => {
        Tone.getTransport().pause();
        synthRef.current?.releaseAll(0); // fade out anything already playing

        // Save position to localStorage when paused
        savePlayheadPosition();
    }, [savePlayheadPosition]);

    const resume = useCallback(() => {
        Tone.getTransport().start();
    }, []);

    const stop = useCallback(() => {
        // Save position to localStorage before stopping
        savePlayheadPosition();

        Tone.getTransport().stop(); // freeze & rewind the clock
        Tone.getTransport().cancel(); // clear all future MIDI events

        synthRef.current?.releaseAll(0); // fade out anything already playing

        notesPartRef.current?.dispose();
        notesPartRef.current = null;

        chordPartRef.current?.dispose();
        chordPartRef.current = null;

        setActiveNotes([]); // GUI reset
        setActiveChord(""); // GUI reset
    }, [savePlayheadPosition]);

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
        [stop],
    );

    const seek = useCallback(
        (time: number) => {
            // 1 – silence and clear GUI
            setActiveNotes([]);
            synthRef.current?.releaseAll(0); // immediate silence

            // 2 – If using YouTube, let YouTube seek first and wait for it to be ready
            if (
                window.__ytSeekHandler &&
                typeof window.__ytSeekHandler === "function"
            ) {
                try {
                    // Let YouTube seek first, then update transport based on actual YouTube position
                    window.__ytSeekHandler(time, (actualTime: number) => {
                        console.log(`Transport seek: updating to YouTube's actual position ${actualTime}s`);
                        Tone.getTransport().seconds = actualTime;
                        transportTicker.set(actualTime);
                        setRestoredPosition(actualTime, false);
                        // Update active chord based on the actual time
                        updateActiveChordForTime(actualTime);
                    });
                } catch (err) {
                    console.error("Error seeking YouTube player:", err);
                    // Fallback to normal seek if YouTube fails
                    Tone.getTransport().seconds = time;
                    transportTicker.set(time);
                    setRestoredPosition(time, false);
                    // Update active chord based on the requested time
                    updateActiveChordForTime(time);
                }
            } else {
                // 3 – No YouTube, seek transport directly
                Tone.getTransport().seconds = time;
                transportTicker.set(time);
                setRestoredPosition(time, false);
                // Update active chord based on the requested time
                updateActiveChordForTime(time);
            }
        },
        [setRestoredPosition, updateActiveChordForTime],
    );

    const seekToBeginning = useCallback(() => {
        seek(0);
        Tone.getTransport().stop();
    }, [seek]);

    return {
        audioDuration,
        loadAudio,
        play,
        pause,
        resume,
        stop,
        seek,
        seekToBeginning,
        isPlaying,
        isPaused,
        isStopped,
        isMuted,
        buildPart,
        getTransport: () => Tone.getTransport(),
        transportState,
        activeNotes,
        activeChord,
    };
};
