import React, { useMemo, useRef } from "react";
import type {
    Keymap,
    CustomKeyComponent,
    CustomLabelComponent,
} from "@/components/Player/Keyboard/types.ts";
import { DEFAULT_KEYMAP } from "@/components/Player/Keyboard/keymap.ts";
import {
    DEFAULT_NOTE_RANGE,
    DEFAULT_WHITE_KEY_FIXED_WIDTH_PX,
    DEFAULT_BLACK_KEY_FIXED_WIDTH_PX,
} from "@/components/Player/Keyboard/lib/constants.ts";
import { range } from "@/components/Player/Keyboard/lib/range.ts";
import {
    Key,
    getAbsoluteKeyPosition,
} from "@/components/Player/Keyboard/components/Key/Key";
import {
    isMidiNumber,
    midiToNote,
} from "@/components/Player/Keyboard/lib/midi.ts";
import { useKlavier } from "@/components/Player/Keyboard/state/useKlavier.ts";
import { useMouse } from "@/components/Player/Keyboard/interactivity/useMouse.ts";
import { useKeyboard } from "@/components/Player/Keyboard/interactivity/useKeyboard.ts";
import { useTouch } from "@/components/Player/Keyboard/interactivity/useTouch";
import { useKeyboardNotes } from "@/components/Player/hooks/useKeyboardNotes";
import { useShowChordNotes } from "@/components/Player/Keyboard/stores/keyboardStore.ts";

interface KeyboardProps {
    /**
     * The lowest and the highest notes of the piano in MIDI numbers (0-127).
     * @defaultValue [21, 108]
     */
    keyRange?: [number, number];

    /**
     * Keys that are pressed by default. Subsequent updates are ignored. Cleared when the user begins playing.
     */
    defaultActiveKeys?: Array<number>;

    /**
     * Currently pressed keys. Puts component into controlled mode; active keys must be managed externally via callbacks.
     */
    // activeKeys?: Array<number>;

    /**
     * Fired when a key is played.
     */
    onKeyPress?: (midiNumber: number) => void;

    /**
     * Fired when a key is released.
     */
    onKeyRelease?: (midiNumber: number) => void;

    /**
     * Fired when active keys are changed via user input.
     */
    onChange?: (activeKeys: Array<number>) => void;

    /**
     * Enable interaction with the piano via keyboard, mouse, or touch.
     * @defaultValue true
     */
    interactive?: boolean | Partial<InteractivitySettings>;

    /*
     * Mapping of computer keys to MIDI note numbers.
     * @example [{ key: 'q', midiNumber: 60 }, ..., { key: 'i', midiNumber: 72 }]
     */
    keyMap?: Keymap;

    /**
     * Width of the piano. Accepts any valid CSS value. When unspecified, the piano fills it's container and is responsive.
     * @defaultValue 'auto'
     *
     */
    width?: React.CSSProperties["width"];

    /**
     * Height of the piano. Accepts any valid CSS value.
     * @defaultValue 'auto'
     */
    height?: React.CSSProperties["height"];

    /**
     * Height of the black key. Allows tweaking the appearance of black keys in relation to white keys.
     * @defaultValue '67.5%'
     */
    blackKeyHeight?: React.CSSProperties["height"];

    /**
     * Fixed width for white keys in pixels.
     * @defaultValue 50
     */
    whiteKeyFixedWidth?: number;

    /**
     * Fixed width for black keys in pixels.
     * @defaultValue 30
     */
    blackKeyFixedWidth?: number;

    /**
     * Allows replacing default components for black and white keys.
     * Important: avoid defining components directly in the prop object, as it can cause performance issues.
     * @example:
     * const CustomBlackKey = ({ active, note }) => { return <div /> }
     * const CustomWhiteKey = ({ active, note }) => { return <div /> }
     * const CustomLabel = ({ active, note, midiC0, keyboardShortcut }) => { return <div/> }
     * <Klavier components={{ blackKey: CustomBlackKey, whiteKey: CustomWhiteKey, label: CustomLabel }} />
     */
    components?: {
        blackKey?: CustomKeyComponent;
        whiteKey?: CustomKeyComponent;
        label?: CustomLabelComponent;
    };
    activeNotes?: { midi: number; hand: "left" | "right" }[];
    activeChord?: string;
}

// Constants for key layout
const WHITE_KEY_MICRO_COLUMN_SPAN = 12;
// const BLACK_KEY_MICRO_COLUMN_SPAN = 8; // Will be used in Key.tsx

const Keyboard = (props: KeyboardProps) => {
    const klavierRootRef = useRef<HTMLDivElement>(null);
    const {
        defaultActiveKeys,
        activeNotes,
        activeChord,
        onKeyPress,
        onKeyRelease,
        onChange,
        keyRange = DEFAULT_NOTE_RANGE,
        interactive = true,
        keyMap = DEFAULT_KEYMAP,
        width, // This is now the visible width of the scroll container
        height,
        blackKeyHeight,
        whiteKeyFixedWidth = DEFAULT_WHITE_KEY_FIXED_WIDTH_PX,
        blackKeyFixedWidth = DEFAULT_BLACK_KEY_FIXED_WIDTH_PX,
        components,
    } = props;

    const showChordNotes = useShowChordNotes();

    const { playedNotes, chordNotes } = useKeyboardNotes({
        activeNotes: activeNotes || [],
        activeChord: activeChord || "",
    });

    const [first, last] = keyRange;
    const {
        state,
        actions: { pressKey, releaseKey },
    } = useKlavier({
        defaultActiveKeys,
        activeKeys: playedNotes,
        onKeyPress,
        onKeyRelease,
        onChange,
    });

    const interactivitySettings = determineInteractivitySettings(interactive);
    validateRange(keyRange);

    const handleMouseEvents = useMouse({
        enabled: interactivitySettings.mouse,
        pressKey,
        releaseKey,
    });
    useKeyboard({
        enabled: interactivitySettings.keyboard,
        activeKeys: state.activeKeys,
        keyMap,
        keyRange,
        pressKey,
        releaseKey,
    });
    useTouch({
        enabled: interactivitySettings.touch,
        klavierRootRef: klavierRootRef as React.RefObject<HTMLDivElement>,
        pressKey,
        releaseKey,
    });

    const microColumnWidth = whiteKeyFixedWidth / WHITE_KEY_MICRO_COLUMN_SPAN;

    const totalMicroColumns = useMemo(() => {
        // Calculate the end column of the last physical key
        // to determine the total number of micro-columns needed.
        let maxCol = 0;
        for (let i = first; i <= last; i++) {
            const noteDetails = midiToNote(i);
            const keySpecificSpan =
                noteDetails.keyColor === "white"
                    ? WHITE_KEY_MICRO_COLUMN_SPAN
                    : 8; // Assuming black keys span 8 from Key.tsx logic
            const keyStartCol =
                getAbsoluteKeyPosition(i) - getAbsoluteKeyPosition(first) + 1;
            const keyEndCol = keyStartCol + keySpecificSpan - 1;
            if (keyEndCol > maxCol) {
                maxCol = keyEndCol;
            }
        }
        // A simpler approach: find the starting position of the key *after* the last key
        // If the last key is note X, find the start of X+1.
        // This represents the total span needed.
        // However, getAbsoluteKeyPosition is relative to C0, so we need to adjust.
        const firstKeyStartPos = getAbsoluteKeyPosition(first);
        const theoreticalKeyAfterLastStartPos = getAbsoluteKeyPosition(
            last + 1,
        );

        // Total columns from the start of the first key to the start of the key theoretically after the last.
        // This should give the correct number of micro-columns for the range.
        return theoreticalKeyAfterLastStartPos - firstKeyStartPos;
    }, [first, last]);

    const innerContainerWidth = totalMicroColumns * microColumnWidth;

    // Retrieve paddingTop for the degree bar height, default to 1.5rem (h-6)
    const defaultPaddingTop = "1.5rem";
    const rootPaddingTop = useMemo(() => {
        // This is a bit of a workaround to extract the value if height is an object
        // or to use a default. A more robust solution might involve a dedicated prop for bar height.
        if (
            typeof height === "string" &&
            (height.endsWith("rem") || height.endsWith("px"))
        ) {
            // Assuming the paddingTop should match a specific value if overall height is also specific
            // This logic might need to be more sophisticated based on actual use cases for `height` prop
        }
        return defaultPaddingTop;
    }, []);

    const rootStyles = useMemo(
        () => getRootStyles(width, height, rootPaddingTop),
        [width, height, rootPaddingTop],
    );

    const innerContainerStyles: React.CSSProperties = useMemo(
        () => ({
            display: "grid",
            position: "relative",
            height: "100%", // Fill the scrollable container's height
            width: `${innerContainerWidth}px`,
            gridTemplateColumns: `repeat(${totalMicroColumns}, ${microColumnWidth}px)`,
            alignItems: "stretch", // Keep this from original rootStyles
            WebkitUserSelect: "none", // Keep this
            userSelect: "none", // Keep this
        }),
        [innerContainerWidth, totalMicroColumns, microColumnWidth],
    );

    return (
        <div style={rootStyles} ref={klavierRootRef} className="relative">
            {/* Continuous Degree Bar */}
            <div
                style={{
                    width: `${innerContainerWidth}px`,
                    height: rootPaddingTop, // Use the determined padding/height
                }}
                className="pointer-events-none absolute top-0 left-0 z-[1] bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <div style={innerContainerStyles}>
                {range(first, last + 1).map((midiNumber) => (
                    <Key
                        key={midiNumber}
                        midiNumber={midiNumber}
                        firstNoteMidiNumber={first}
                        active={state.activeKeys.includes(midiNumber)}
                        isChordNote={
                            showChordNotes && chordNotes.includes(midiNumber)
                        }
                        activeChord={activeChord}
                        onMouseDown={handleMouseEvents}
                        onMouseUp={handleMouseEvents}
                        onMouseLeave={handleMouseEvents}
                        onMouseEnter={handleMouseEvents}
                        blackKeyHeight={blackKeyHeight}
                        whiteKeyFixedWidth={whiteKeyFixedWidth}
                        blackKeyFixedWidth={blackKeyFixedWidth}
                        components={components}
                        keymap={keyMap}
                    />
                ))}
            </div>
        </div>
    );
};

const getRootStyles = (
    width: React.CSSProperties["width"],
    height: React.CSSProperties["height"],
    paddingTopValue: React.CSSProperties["paddingTop"] = "1.5rem", // Default padding for degree text
): React.CSSProperties => ({
    position: "relative",
    WebkitUserSelect: "none",
    userSelect: "none",
    width, // This is the visible width of the scroll container
    height,
    overflowX: "auto", // Enable horizontal scrolling
    overflowY: "hidden", // Typically you don't want vertical scroll on the keyboard itself
    paddingTop: paddingTopValue,
});

type InteractivitySettings = {
    keyboard: boolean;
    mouse: boolean;
    touch: boolean;
};

function determineInteractivitySettings(
    prop: KeyboardProps["interactive"],
): InteractivitySettings {
    if (typeof prop === "boolean") {
        return {
            mouse: prop,
            keyboard: prop,
            touch: prop,
        };
    }

    return {
        mouse: false,
        keyboard: false,
        touch: false,
        ...prop,
    };
}

const ERRORS = {
    INVALID_MIDI_VALUES:
        "Note range must be within valid MIDI numbers (0-127).",
    INVALID_RANGE_ORDER: "The last note must be greater than the first.",
};

function validateRange([first, last]: [number, number]) {
    const receivedRangeDisplay = `Received range: [${first}, ${last}]`;

    if (!isMidiNumber(first) || !isMidiNumber(last)) {
        throw new Error(
            `${ERRORS.INVALID_MIDI_VALUES} ${receivedRangeDisplay}`,
        );
    }

    if (first >= last) {
        throw new Error(
            `${ERRORS.INVALID_RANGE_ORDER} ${receivedRangeDisplay}`,
        );
    }
}

export type { KeyboardProps };
export { Keyboard };
