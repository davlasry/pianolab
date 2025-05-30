import type React from "react";

export type KeyColor = "black" | "white";

export type Note = {
    keyColor: KeyColor;
    midiNumber: number;
    octave: number;
};

export type KeymapItem = { key: string; midiNumber: number };

export type Keymap = Array<KeymapItem>;

export interface CustomKeyProps {
    active: boolean;
    note: Note;
    isChordNote?: boolean;
    className?: string;
}

export type CustomKeyComponent = React.ComponentType<CustomKeyProps>;

export type CustomLabelProps = {
    note: Note;
    midiC0: number;
    keyboardShortcut: string | undefined;
    active: boolean;
};

export type CustomLabelComponent = React.ComponentType<CustomLabelProps>;
