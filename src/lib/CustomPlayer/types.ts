/**
 * Types for the Custom Audio and MIDI Player
 */

// Supported playback states
export type TransportState = "stopped" | "paused" | "playing";

// Transport events that can be subscribed to
export type TransportEvent = "start" | "pause" | "stop" | "seek" | "ratechange";

// MIDI Note representation
export interface MidiNote {
    id: string;
    midi: number;
    time: number;
    duration: number;
    velocity: number;
    hand?: "L" | "R" | null;
}

// Chord representation
export interface Chord {
    label: string;
    startTime: number;
    endTime?: number;
}

// Listener callback types
export type TransportCallback = (time: number) => void;
export type NoteCallback = (note: MidiNote) => void;
export type ChordCallback = (chord: Chord) => void;

// Configuration options for the player
export interface PlayerConfig {
    debugMode?: boolean;
    visualizationFPS?: number;
}

// Available event listeners in the player
export interface PlayerEventMap {
    transportchange: TransportCallback;
    noteon: NoteCallback;
    noteoff: NoteCallback;
    chordchange: ChordCallback;
}

// Key events for mapping keyboard controls
export type KeyEvents =
    | "play"
    | "pause"
    | "stop"
    | "seekforward"
    | "seekbackward";
