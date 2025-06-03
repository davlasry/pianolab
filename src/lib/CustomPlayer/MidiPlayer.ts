import { Midi } from "@tonejs/midi";
import { Transport } from "./Transport";
import type { MidiNote, Chord, NoteCallback, ChordCallback } from "./types";

/**
 * MidiPlayer handles MIDI file loading, parsing, and playback
 * Uses native Web MIDI API for sending MIDI events to connected devices
 */
export class MidiPlayer {
    private transport: Transport;
    private midiData: MidiNote[] = [];
    private chordData: Chord[] = [];
    private scheduledEvents: Map<string, number> = new Map();
    private midiAccess: WebMidi.MIDIAccess | null = null;
    private midiOutput: WebMidi.MIDIOutput | null = null;
    private activeNotes: Set<number> = new Set();
    private noteCallbacks: Set<NoteCallback> = new Set();
    private chordCallbacks: Set<ChordCallback> = new Set();
    private _duration: number = 0;
    private isInitialized: boolean = false;
    private currentChord: string = "";

    /**
     * Create a new MidiPlayer
     * @param transport Transport instance for timing
     */
    constructor(transport: Transport) {
        this.transport = transport;

        // Listen for transport events
        this.transport.on("stop", () => {
            this.stopAllNotes();
            this.clearScheduledEvents();
        });

        this.transport.on("pause", () => {
            this.stopAllNotes();
            this.clearScheduledEvents();
        });

        this.transport.on("start", () => {
            this.scheduleEvents();
        });

        this.transport.on("seek", () => {
            this.clearScheduledEvents();
            if (this.transport.transportState === "playing") {
                this.scheduleEvents();
            }
        });

        this.transport.on("ratechange", () => {
            // Reschedule events with new playback rate
            if (this.transport.transportState === "playing") {
                this.clearScheduledEvents();
                this.scheduleEvents();
            }
        });
    }

    /**
     * Initialize Web MIDI API and connect to output
     * @param outputId Optional ID of the MIDI output to use
     * @returns Promise that resolves when Web MIDI API is initialized
     */
    public async initialize(outputId?: string): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Request MIDI access
            this.midiAccess = await navigator.requestMIDIAccess();

            console.log("Web MIDI API enabled successfully!");

            // Get outputs
            const outputs = Array.from(this.midiAccess.outputs.values());

            // Use the first available output if none specified
            if (outputs.length > 0) {
                if (outputId) {
                    this.midiOutput =
                        outputs.find((output) => output.id === outputId) ||
                        null;
                } else {
                    this.midiOutput = outputs[0];
                }

                if (this.midiOutput) {
                    console.log(`Using MIDI output: ${this.midiOutput.name}`);
                } else {
                    console.warn("Specified MIDI output not found");
                }
            } else {
                console.warn("No MIDI outputs available");
            }

            this.isInitialized = true;
        } catch (err) {
            console.error("Error initializing Web MIDI API:", err);
            throw err;
        }
    }

    /**
     * Get a list of available MIDI outputs
     * @returns Array of MIDI outputs or empty array if Web MIDI API not initialized
     */
    public getAvailableOutputs(): WebMidi.MIDIOutput[] {
        if (!this.isInitialized || !this.midiAccess) {
            console.warn("Web MIDI API not initialized yet");
            return [];
        }

        return Array.from(this.midiAccess.outputs.values());
    }

    /**
     * Set the MIDI output to use
     * @param outputId ID of the MIDI output
     */
    public setOutput(outputId: string): void {
        if (!this.isInitialized || !this.midiAccess) {
            console.warn("Web MIDI API not initialized yet");
            return;
        }

        try {
            const output = Array.from(this.midiAccess.outputs.values()).find(
                (output) => output.id === outputId,
            );

            if (output) {
                this.midiOutput = output;
                console.log(`MIDI output changed to: ${this.midiOutput.name}`);
            } else {
                console.error(`MIDI output with ID ${outputId} not found`);
            }
        } catch (err) {
            console.error("Error setting MIDI output:", err);
        }
    }

    /**
     * Get the MIDI duration in seconds
     */
    public get duration(): number {
        return this._duration;
    }

    /**
     * Load and parse a MIDI file
     * @param url URL of the MIDI file
     * @returns Promise that resolves when the MIDI file is loaded
     */
    public async loadMidi(url: string): Promise<MidiNote[]> {
        try {
            // Load the MIDI file using @tonejs/midi
            const midi = await Midi.fromUrl(url);

            // Extract notes from all tracks
            const notes: MidiNote[] = midi.tracks.flatMap((track) =>
                track.notes.map((note) => ({
                    id: `${note.ticks}_${note.midi}`,
                    midi: note.midi,
                    time: note.time,
                    duration: note.duration,
                    velocity: note.velocity,
                    hand: null,
                })),
            );

            // Sort notes by time
            notes.sort((a, b) => a.time - b.time);

            // Store notes
            this.midiData = notes;

            // Calculate duration from the latest note
            if (notes.length > 0) {
                const lastNote = notes[notes.length - 1];
                this._duration = lastNote.time + lastNote.duration;
            } else {
                this._duration = 0;
            }

            return notes;
        } catch (error) {
            console.error("Error loading MIDI file:", error);
            throw error;
        }
    }

    /**
     * Set chord progression data
     * @param chords Array of chord objects
     */
    public setChordProgression(chords: Chord[]): void {
        this.chordData = [...chords];
    }

    /**
     * Add a callback for note events
     * @param callback Function to call when a note is played or stopped
     */
    public addNoteListener(callback: NoteCallback): void {
        this.noteCallbacks.add(callback);
    }

    /**
     * Remove a note event callback
     * @param callback Function to remove
     */
    public removeNoteListener(callback: NoteCallback): void {
        this.noteCallbacks.delete(callback);
    }

    /**
     * Add a callback for chord change events
     * @param callback Function to call when a chord changes
     */
    public addChordListener(callback: ChordCallback): void {
        this.chordCallbacks.add(callback);
    }

    /**
     * Remove a chord event callback
     * @param callback Function to remove
     */
    public removeChordListener(callback: ChordCallback): void {
        this.chordCallbacks.delete(callback);
    }

    /**
     * Schedule note events based on current transport time
     */
    private scheduleEvents(): void {
        if (!this.isInitialized || this.midiData.length === 0) return;

        const currentTime = this.transport.seconds;

        // Schedule notes
        for (const note of this.midiData) {
            // Skip notes that have already played
            if (note.time < currentTime) continue;

            // Schedule note on
            const noteOnId = this.transport.scheduleOnce(() => {
                this.playNote(note);
            }, note.time);

            // Schedule note off
            const noteOffId = this.transport.scheduleOnce(() => {
                this.stopNote(note);
            }, note.time + note.duration);

            // Store the scheduled event IDs
            this.scheduledEvents.set(`${note.id}_on`, noteOnId);
            this.scheduledEvents.set(`${note.id}_off`, noteOffId);
        }

        // Schedule chord changes
        for (const chord of this.chordData) {
            // Skip chords that have already played
            if (chord.startTime < currentTime) continue;

            // Schedule chord change
            const chordId = this.transport.scheduleOnce(() => {
                this.changeChord(chord);
            }, chord.startTime);

            // Store the scheduled event ID
            this.scheduledEvents.set(`chord_${chord.startTime}`, chordId);
        }
    }

    /**
     * Clear all scheduled events
     */
    private clearScheduledEvents(): void {
        // Cancel all scheduled timeouts
        for (const id of this.scheduledEvents.values()) {
            this.transport.cancelScheduled(id);
        }

        // Clear the map
        this.scheduledEvents.clear();
    }

    /**
     * Play a MIDI note
     * @param note Note to play
     */
    private playNote(note: MidiNote): void {
        // Send MIDI message if output is available
        if (this.midiOutput) {
            try {
                // Create note on message: [0x90 | channel, note, velocity]
                // Using channel 0 (corresponds to MIDI channel 1)
                // Velocity in MIDI files is 0-1, but MIDI protocol expects 0-127
                const velocity = Math.min(
                    Math.max(Math.round(note.velocity * 127), 1),
                    127,
                );
                const noteOnMessage = [0x90, note.midi, velocity];
                this.midiOutput.send(noteOnMessage);

                // If duration is finite, schedule note off automatically
                if (isFinite(note.duration)) {
                    const noteOffDelayMs =
                        (note.duration * 1000) / this.transport.playbackRate;
                    setTimeout(() => {
                        if (this.midiOutput) {
                            // Note off: [0x80 | channel, note, velocity (usually 0)]
                            const noteOffMessage = [0x80, note.midi, 0];
                            this.midiOutput.send(noteOffMessage);
                        }
                    }, noteOffDelayMs);
                }
            } catch (err) {
                console.error("Error playing MIDI note:", err);
            }
        }

        // Add to active notes
        this.activeNotes.add(note.midi);

        // Call note listeners
        this.noteCallbacks.forEach((callback) => callback(note));
    }

    /**
     * Stop a MIDI note
     * @param note Note to stop
     */
    private stopNote(note: MidiNote): void {
        // Send MIDI message if output is available
        if (this.midiOutput) {
            try {
                // Create note off message: [0x80 | channel, note, velocity]
                // Using channel 0 (corresponds to MIDI channel 1)
                const noteOffMessage = [0x80, note.midi, 0];
                this.midiOutput.send(noteOffMessage);
            } catch (err) {
                console.error("Error stopping MIDI note:", err);
            }
        }

        // Remove from active notes
        this.activeNotes.delete(note.midi);

        // Call note listeners
        this.noteCallbacks.forEach((callback) =>
            callback({
                ...note,
                velocity: 0, // Indicate that this is a note off event
            }),
        );
    }

    /**
     * Stop all currently playing notes
     */
    private stopAllNotes(): void {
        // Stop all active notes
        if (this.midiOutput) {
            try {
                // Send All Notes Off control change message
                // [0xB0 | channel, 123 (All Notes Off), 0]
                this.midiOutput.send([0xb0, 123, 0]);
            } catch (err) {
                console.error("Error stopping all notes:", err);
            }
        }

        // Notify listeners about each stopped note
        for (const midiNote of this.activeNotes) {
            this.noteCallbacks.forEach((callback) => {
                // Create a note-off event for each active note
                const noteOffEvent: MidiNote = {
                    id: `off_${midiNote}_${Date.now()}`,
                    midi: midiNote,
                    time: this.transport.seconds,
                    duration: 0,
                    velocity: 0,
                    hand: null,
                };
                callback(noteOffEvent);
            });
        }

        // Clear active notes set
        this.activeNotes.clear();
    }

    /**
     * Change the current chord
     * @param chord Chord to change to
     */
    private changeChord(chord: Chord): void {
        this.currentChord = chord.label;
        console.log("this.currentChord =====>", this.currentChord);

        // Call chord listeners
        this.chordCallbacks.forEach((callback) => callback(chord));
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.stopAllNotes();
        this.clearScheduledEvents();
        this.noteCallbacks.clear();
        this.chordCallbacks.clear();
        this.midiData = [];
        this.chordData = [];
        this.midiOutput = null;
    }
}
