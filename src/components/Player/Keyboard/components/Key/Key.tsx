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
    height?: React.CSSProperties["height"];
    components?: {
        blackKey?: CustomKeyComponent;
        whiteKey?: CustomKeyComponent;
        label?: CustomLabelComponent;
    };
    keymap: Keymap | undefined;
};

const Key = React.memo((props: KeyProps) => {
    const {
        active,
        isChordNote,
        midiNumber,
        firstNoteMidiNumber,
        height,
        blackKeyHeight,
        components,
        keymap,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
    } = props;
    const note = midiToNote(midiNumber);
    const KeyComponent = getKeyComponent(components, note.keyColor);
    const style = useMemo(
        () =>
            getKeyStyles(
                midiNumber,
                firstNoteMidiNumber,
                height,
                blackKeyHeight,
            ),
        [midiNumber, firstNoteMidiNumber, height, blackKeyHeight],
    );
    const Label = components?.label;
    const keyboardShortcut = useMemo(
        () => getKeyboardShortcut(midiNumber, keymap),
        [midiNumber, keymap],
    );

    // Determine if the key is in the left hand or right hand range (below or above middle C)
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
function getAbsoluteKeyPosition(midiNumber: number) {
    const KEY_POSITIONS = [1, 8, 13, 22, 25, 37, 44, 49, 57, 61, 70, 73];
    const OCTAVE_LENGTH_IN_COLUMNS = 84;
    const { octave } = midiToNote(midiNumber);
    return (
        octave * OCTAVE_LENGTH_IN_COLUMNS +
        KEY_POSITIONS[midiNumber % KEY_POSITIONS.length]
    );
}

function getKeyPosition(midiNumber: number, firstNoteMidiNumber: number) {
    return (
        getAbsoluteKeyPosition(midiNumber) -
        getAbsoluteKeyPosition(firstNoteMidiNumber) +
        1
    );
}

function getKeyStyles(
    midiNumber: number,
    firstNoteMidiNumber: number,
    height: React.CSSProperties["height"],
    blackKeyHeight: React.CSSProperties["height"] = DEFAULT_BLACK_KEY_HEIGHT,
): React.CSSProperties {
    const WHITE_KEY_COLUMN_SPAN = 12;
    const BLACK_KEY_COLUMN_SPAN = 8;
    const WHITE_KEY_ASPECT_RATIO = "24 / 150";
    const position = getKeyPosition(midiNumber, firstNoteMidiNumber);
    const { keyColor } = midiToNote(midiNumber);

    switch (keyColor) {
        case "white":
            return {
                position: "relative",
                boxSizing: "border-box",
                gridRow: "1 / span 1",
                aspectRatio:
                    height === undefined ? WHITE_KEY_ASPECT_RATIO : undefined,
                gridColumn: `${position} / span ${WHITE_KEY_COLUMN_SPAN}`,
            };
        case "black":
            return {
                position: "relative",
                zIndex: 1,
                boxSizing: "border-box",
                gridRow: "1 / span 1",
                height: blackKeyHeight,
                gridColumn: `${position} / span ${BLACK_KEY_COLUMN_SPAN}`,
            };
    }
}

function getKeyComponent(components: KeyProps["components"], color: KeyColor) {
    return components?.[`${color}Key`] ?? defaultKeyComponents[`${color}Key`];
}

function getKeyboardShortcut(midiNumber: number, keymap: KeyProps["keymap"]) {
    return keymap?.find((item) => item.midiNumber === midiNumber)?.key;
}

export type { KeyProps };
export { Key };
