import type { Note } from "@/components/Session/Keyboard/types.ts";
import {
    MIDI_NUMBER_MIN,
    MIDI_NUMBER_MAX,
    MIDI_NUMBER_C0,
    OCTAVE_LENGTH,
    BLACK_KEY_MIDI_NUMBERS,
} from "@/components/Session/Keyboard/lib/constants.ts";
import * as Tonal from "tonal";

export function midiToNote(midiNumber: number): Note {
    if (!isMidiNumber(midiNumber)) {
        throw new Error(
            `getMidiNoteAttributes expects a valid midi number: 0-127, received ${midiNumber}`,
        );
    }

    return {
        midiNumber,
        keyColor: isBlackKey(midiNumber) ? "black" : "white",
        octave: Math.floor((midiNumber - MIDI_NUMBER_C0) / OCTAVE_LENGTH),
    };
}

export function isMidiNumber(input: unknown): input is number {
    return (
        typeof input === "number" &&
        Number.isInteger(input) &&
        input >= MIDI_NUMBER_MIN &&
        input <= MIDI_NUMBER_MAX
    );
}

export function isBlackKey(midiNumber: number) {
    return (
        isMidiNumber(midiNumber) && BLACK_KEY_MIDI_NUMBERS.includes(midiNumber)
    );
}

export function isWhiteKey(midiNumber: number) {
    return (
        isMidiNumber(midiNumber) && !BLACK_KEY_MIDI_NUMBERS.includes(midiNumber)
    );
}

export function midiToNoteName(midiNumber: number): string {
    if (!isMidiNumber(midiNumber)) {
        throw new Error(
            `midiToNoteName expects a valid midi number: 0-127, received ${midiNumber}`,
        );
    }

    // Use Tonal.js to convert MIDI number to note name
    return Tonal.Note.fromMidi(midiNumber).replace(/[0-9]/g, "");
}
