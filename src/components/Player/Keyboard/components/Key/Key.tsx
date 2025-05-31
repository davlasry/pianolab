import React, { useMemo } from "react";
import { midiToNote } from "@/components/Player/Keyboard/lib/midi.ts";
import type {
    CustomKeyComponent,
    CustomLabelComponent,
    KeyColor,
    Keymap,
} from "@/components/Player/Keyboard/types.ts";
import {
    DEFAULT_BLACK_KEY_HEIGHT,
    MIDI_NUMBER_C0,
} from "@/components/Player/Keyboard/lib/constants.ts";
import { defaultKeyComponents } from "@/components/Player/Keyboard/components/Key/defaultKeyComponents.tsx";

// Updated KeyProps to include fixed width props
// These are passed down from Keyboard.tsx but widths are primarily controlled
// by the parent grid's column setup and the key's column span.
// They are kept for completeness and potential future direct calculations if needed.
type KeyProps = {
    midiNumber: number;
    firstNoteMidiNumber: number;
    active: boolean;
    isChordNote?: boolean;
    onMouseDown: React.MouseEventHandler;
    onMouseUp: React.MouseEventHandler;
    onMouseLeave: React.MouseEventHandler;
    onMouseEnter: React.MouseEventHandler;
    blackKeyHeight?: React.CSSProperties["height"];
    components?: {
        blackKey?: CustomKeyComponent;
        whiteKey?: CustomKeyComponent;
        label?: CustomLabelComponent;
    };
    keymap: Keymap | undefined;
    whiteKeyFixedWidth?: number; // Added
    blackKeyFixedWidth?: number; // Added
};

const Key = React.memo((props: KeyProps) => {
    const {
        active,
        isChordNote,
        midiNumber,
        firstNoteMidiNumber,
        blackKeyHeight,
        components,
        keymap,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
        // whiteKeyFixedWidth, // Destructured but not directly used for styling width
        // blackKeyFixedWidth, // Destructured but not directly used for styling width
    } = props;
    const note = midiToNote(midiNumber);
    const KeyComponent = getKeyComponent(components, note.keyColor);
    const style = useMemo(
        () =>
            getKeyStyles(
                midiNumber,
                firstNoteMidiNumber,
                blackKeyHeight,
                // props.whiteKeyFixedWidth, // No longer passing these directly for styling
                // props.blackKeyFixedWidth
            ),
        [
            midiNumber,
            firstNoteMidiNumber,
            blackKeyHeight /*, props.whiteKeyFixedWidth, props.blackKeyFixedWidth*/,
        ],
    );
    const Label = components?.label;
    const keyboardShortcut = useMemo(
        () => getKeyboardShortcut(midiNumber, keymap),
        [midiNumber, keymap],
    );

    const handPosition = midiNumber < 60 ? "left-hand" : "right-hand";

    return (
        <div
            style={style}
            data-midi-number={midiNumber}
            className={`${handPosition} transition-colors duration-100`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <KeyComponent
                note={note}
                active={active}
                isChordNote={isChordNote}
            />
            {Label ? (
                <Label
                    active={active}
                    note={note}
                    keyboardShortcut={keyboardShortcut}
                    midiC0={MIDI_NUMBER_C0}
                />
            ) : null}
        </div>
    );
});

// The keyboard is laid out on a horizontal CSS grid.
// Position represents a starting column: `grid-column-start` in CSS terms.
// White keys span over 12 columns each, making the octave length 84 columns total.
// Black keys span over 8 columns each, and are overlaid on top white keys.
// Key positions (starting columns) of a single octave are calculated by hand to match a real piano keyboard as closely as possible.
// THIS FUNCTION IS USED BY THE PARENT Keyboard.tsx component
export function getAbsoluteKeyPosition(midiNumber: number): number {
    const KEY_POSITIONS = [1, 8, 13, 22, 25, 37, 44, 49, 57, 61, 70, 73]; // Column start for each of the 12 notes in an octave
    const OCTAVE_LENGTH_IN_COLUMNS = 84; // Total columns for one octave (7 white keys * 12 cols/key = 84)
    const { octave } = midiToNote(midiNumber); // We only need octave from here
    const noteIndexInOctave = midiNumber % 12; // Calculate 0-11 index directly

    // Adjust for C0 being MIDI 12. If your midiToNote gives octave relative to C0=MIDI 12, this should be fine.
    // Or, if octave is already 0 for the lowest C on a standard piano.
    // The key is that (octave * OCTAVE_LENGTH_IN_COLUMNS) gives the start of the correct octave block.
    return octave * OCTAVE_LENGTH_IN_COLUMNS + KEY_POSITIONS[noteIndexInOctave];
}

function getKeyPosition(
    midiNumber: number,
    firstNoteMidiNumber: number,
): number {
    return (
        getAbsoluteKeyPosition(midiNumber) -
        getAbsoluteKeyPosition(firstNoteMidiNumber) +
        1 // CSS grids are 1-indexed
    );
}

function getKeyStyles(
    midiNumber: number,
    firstNoteMidiNumber: number,
    blackKeyHeight: React.CSSProperties["height"] = DEFAULT_BLACK_KEY_HEIGHT,
    // whiteKeyFixedWidth?: number, // Not used for styling here
    // blackKeyFixedWidth?: number  // Not used for styling here
): React.CSSProperties {
    const WHITE_KEY_COLUMN_SPAN = 12;
    const BLACK_KEY_COLUMN_SPAN = 8;
    const position = getKeyPosition(midiNumber, firstNoteMidiNumber);
    const { keyColor } = midiToNote(midiNumber);

    // These props are passed but not directly used to set style.width here,
    // as the parent grid + column span define the width.
    // This comment is to satisfy linters about unused variables if they were destructured.
    // e.g., _whiteKeyFixedWidth = whiteKeyFixedWidth;

    switch (keyColor) {
        case "white":
            return {
                position: "relative",
                boxSizing: "border-box",
                gridRow: "1 / span 1", // Occupy the single row defined by the parent grid
                gridColumn: `${position} / span ${WHITE_KEY_COLUMN_SPAN}`,
                // Width is determined by the parent grid's column definition and this span.
                // Height will stretch to fill the row due to parent's alignItems: "stretch".
            };
        case "black":
            return {
                position: "relative",
                zIndex: 1,
                boxSizing: "border-box",
                gridRow: "1 / span 1", // Occupy the single row
                height: blackKeyHeight, // Applied as a percentage of the white key height (which is row height)
                gridColumn: `${position} / span ${BLACK_KEY_COLUMN_SPAN}`,
                // Width is determined by the parent grid's column definition and this span.
            };
    }
}

function getKeyComponent(components: KeyProps["components"], color: KeyColor) {
    return components?.[`${color}Key`] ?? defaultKeyComponents[`${color}Key`];
}

function getKeyboardShortcut(midiNumber: number, keymap: KeyProps["keymap"]) {
    return keymap?.find((item) => item.midiNumber === midiNumber)?.key;
}

// Export KeyProps if it's to be used externally, or keep it internal if not.
// For now, it's only used internally.
// export type { KeyProps };

export { Key /* , getAbsoluteKeyPosition */ }; // getAbsoluteKeyPosition is exported at its definition
