import { Transport } from "./Transport";
import { AudioPlayer } from "./AudioPlayer";
import { MidiPlayer } from "./MidiPlayer";
import type { MidiNote, Chord, PlayerConfig, TransportState } from "./types";

/**
 * CustomPlayer integrates the Transport, AudioPlayer, and MidiPlayer components
 * into a single interface for synchronized audio and MIDI playback
 */
export class CustomPlayer {
    transport: Transport;
    private audioPlayer: AudioPlayer;
    private midiPlayer: MidiPlayer;
    private config: PlayerConfig;
    private isInitialized: boolean = false;

    /**
     * Create a new CustomPlayer
     * @param config Configuration options
     */
    constructor(config: PlayerConfig = {}) {
        this.config = {
            debugMode: false,
            visualizationFPS: 60,
            ...config,
        };

        // Create transport, audio player, and MIDI player
        this.transport = new Transport(this.config.visualizationFPS);
        this.audioPlayer = new AudioPlayer(this.transport);
        this.midiPlayer = new MidiPlayer(this.transport);

        if (this.config.debugMode) {
            console.log("CustomPlayer initialized with config:", this.config);
        }
    }

    /**
     * Initialize the player
     * @param midiOutputId Optional ID of the MIDI output to use
     * @returns Promise that resolves when the player is initialized
     */
    public async initialize(midiOutputId?: string): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Initialize MIDI player
            await this.midiPlayer.initialize(midiOutputId);
            this.isInitialized = true;

            if (this.config.debugMode) {
                console.log("CustomPlayer initialization complete");
            }
        } catch (err) {
            console.error("Error initializing CustomPlayer:", err);
            throw err;
        }
    }

    /**
     * Load audio and MIDI files
     * @param audioUrl URL of the audio file
     * @param midiUrl URL of the MIDI file
     * @returns Promise that resolves when both files are loaded
     */
    public async loadMedia(
        audioUrl: string,
        midiUrl: string,
    ): Promise<{
        audioDuration: number;
        midiNotes: MidiNote[];
    }> {
        try {
            // Load files in parallel
            const [, midiNotes] = await Promise.all([
                this.audioPlayer.loadAudio(audioUrl),
                this.midiPlayer.loadMidi(midiUrl),
            ]);

            if (this.config.debugMode) {
                console.log("Media loaded:", {
                    audioDuration: this.audioPlayer.duration,
                    midiDuration: this.midiPlayer.duration,
                    noteCount: midiNotes.length,
                });
            }

            return {
                audioDuration: this.audioPlayer.duration,
                midiNotes,
            };
        } catch (error) {
            console.error("Error loading media:", error);
            throw error;
        }
    }

    /**
     * Set chord progression data
     * @param chords Array of chord objects
     */
    public setChordProgression(chords: Chord[]): void {
        this.midiPlayer.setChordProgression(chords);

        if (this.config.debugMode) {
            console.log("Chord progression set:", chords.length, "chords");
        }
    }

    /**
     * Add a callback for note events
     * @param callback Function to call when a note is played or stopped
     */
    public addNoteListener(callback: (note: MidiNote) => void): void {
        this.midiPlayer.addNoteListener(callback);
    }

    /**
     * Remove a note event callback
     * @param callback Function to remove
     */
    public removeNoteListener(callback: (note: MidiNote) => void): void {
        this.midiPlayer.removeNoteListener(callback);
    }

    /**
     * Add a callback for chord change events
     * @param callback Function to call when a chord changes
     */
    public addChordListener(callback: (chord: Chord) => void): void {
        this.midiPlayer.addChordListener(callback);
    }

    /**
     * Remove a chord event callback
     * @param callback Function to remove
     */
    public removeChordListener(callback: (chord: Chord) => void): void {
        this.midiPlayer.removeChordListener(callback);
    }

    /**
     * Add a transport time listener
     * @param callback Function to call when transport time updates
     */
    public addTimeListener(callback: (time: number) => void): void {
        this.transport.on("transportchange", callback);
    }

    /**
     * Remove a transport time listener
     * @param callback Function to remove
     */
    public removeTimeListener(callback: (time: number) => void): void {
        this.transport.off("transportchange", callback);
    }

    /**
     * Get available MIDI outputs
     * @returns Array of MIDI outputs
     */
    public getAvailableMidiOutputs(): WebMidi.MIDIOutput[] {
        return this.midiPlayer.getAvailableOutputs();
    }

    /**
     * Set the MIDI output to use
     * @param outputId ID of the MIDI output
     */
    public setMidiOutput(outputId: string): void {
        this.midiPlayer.setOutput(outputId);
    }

    /**
     * Set the audio volume
     * @param volume Volume level (0-1)
     */
    public setVolume(volume: number): void {
        this.audioPlayer.volume = volume;
    }

    /**
     * Get the current playback rate
     */
    public get playbackRate(): number {
        return this.transport.playbackRate;
    }

    /**
     * Set the playback rate
     * @param rate New playback rate (0.25 to 2.0)
     */
    public setPlaybackRate(rate: number): void {
        this.transport.playbackRate = rate;

        if (this.config.debugMode) {
            console.log("Playback rate set to:", rate);
        }
    }

    /**
     * Get the current transport time in seconds
     */
    public get currentTime(): number {
        return this.transport.seconds;
    }

    /**
     * Get the current transport state
     */
    public get transportState(): TransportState {
        return this.transport.transportState;
    }

    /**
     * Get the duration of the loaded media (uses the longer of audio or MIDI)
     */
    public get duration(): number {
        return Math.max(
            this.audioPlayer.duration || 0,
            this.midiPlayer.duration || 0,
        );
    }

    /**
     * Start playback
     */
    public play(): void {
        if (!this.isInitialized) {
            console.warn("Player not initialized yet");
            return;
        }

        this.transport.start();

        if (this.config.debugMode) {
            console.log("Playback started at:", this.transport.seconds);
        }
    }

    /**
     * Pause playback
     */
    public pause(): void {
        this.transport.pause();

        if (this.config.debugMode) {
            console.log("Playback paused at:", this.transport.seconds);
        }
    }

    /**
     * Stop playback and reset position
     */
    public stop(): void {
        this.transport.stop();

        if (this.config.debugMode) {
            console.log("Playback stopped");
        }
    }

    /**
     * Seek to a specific time
     * @param time Time in seconds
     */
    public seek(time: number): void {
        this.transport.seek(time);

        if (this.config.debugMode) {
            console.log("Seeked to:", time);
        }
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.transport.dispose();
        this.audioPlayer.dispose();
        this.midiPlayer.dispose();
        this.isInitialized = false;

        if (this.config.debugMode) {
            console.log("CustomPlayer disposed");
        }
    }
}
