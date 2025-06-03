// Export main player
export { CustomPlayer } from "./CustomPlayer";

// Export individual components for advanced usage
export { Transport } from "./Transport";
export { AudioPlayer } from "./AudioPlayer";
export { MidiPlayer } from "./MidiPlayer";

// Export types
export type {
    TransportState,
    TransportEvent,
    MidiNote,
    Chord,
    TransportCallback,
    NoteCallback,
    ChordCallback,
    PlayerConfig,
    PlayerEventMap,
    KeyEvents,
} from "./types";
