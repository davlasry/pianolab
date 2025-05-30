import React, { useMemo, useRef } from "react";
import type {
    Keymap,
    CustomKeyComponent,
    CustomLabelComponent,
} from "@/components/Player/Keyboard/types.ts";
import { DEFAULT_KEYMAP } from "@/components/Player/Keyboard/keymap.ts";
import { DEFAULT_NOTE_RANGE } from "@/components/Player/Keyboard/lib/constants.ts";
import { range } from "@/components/Player/Keyboard/lib/range.ts";
import { Key } from "@/components/Player/Keyboard/components/Key";
import { isMidiNumber } from "@/components/Player/Keyboard/lib/midi.ts";
import { useKlavier } from "@/components/Player/Keyboard/state/useKlavier.ts";
import { useMouse } from "@/components/Player/Keyboard/interactivity/useMouse.ts";
import { useKeyboard } from "@/components/Player/Keyboard/interactivity/useKeyboard.ts";
import { useTouch } from "@/components/Player/Keyboard/interactivity/useTouch";
import { useKeyboardNotes } from "@/components/Player/hooks/useKeyboardNotes";

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
        width,
        height,
        blackKeyHeight,
        components,
    } = props;

    const { playedNotes, chordNotes } = useKeyboardNotes({
        activeNotes: activeNotes || [],
        activeChord: activeChord || "",
    });

    const activeKeys = playedNotes;

    const [first, last] = keyRange;
    const {
        state,
        actions: { pressKey, releaseKey },
    } = useKlavier({
        defaultActiveKeys,
        activeKeys,
        onKeyPress,
        onKeyRelease,
        onChange,
    });
    const rootStyles = useMemo(
        () => getRootStyles(width, height),
        [width, height],
    );
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        klavierRootRef,
        pressKey,
        releaseKey,
    });

    return (
        <div style={rootStyles} ref={klavierRootRef} className="relative">
            {range(first, last + 1).map((midiNumber) => (
                <Key
                    key={midiNumber}
                    midiNumber={midiNumber}
                    firstNoteMidiNumber={first}
                    active={state.activeKeys.includes(midiNumber)}
                    isChordNote={chordNotes.includes(midiNumber)}
                    onMouseDown={handleMouseEvents}
                    onMouseUp={handleMouseEvents}
                    onMouseLeave={handleMouseEvents}
                    onMouseEnter={handleMouseEvents}
                    height={height}
                    blackKeyHeight={blackKeyHeight}
                    components={components}
                    keymap={keyMap}
                />
            ))}
        </div>
    );
};

const getRootStyles = (
    width: React.CSSProperties["width"],
    height: React.CSSProperties["height"],
): React.CSSProperties => ({
    display: "grid",
    alignItems: "stretch",
    gridAutoColumns: "1fr",
    position: "relative",
    WebkitUserSelect: "none",
    userSelect: "none",
    width,
    height,
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
