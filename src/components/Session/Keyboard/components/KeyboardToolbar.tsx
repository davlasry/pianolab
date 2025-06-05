import React from "react";
import { CurrentChord } from "@/components/Session/CurrentChord";
import { ZoomControls } from "./ZoomControls";
import { KeyboardControls } from "@/components/Session/Controls/KeyboardControls";
import {
    useShowChordNotes,
    useShowNoteDegrees,
    useShowNoteNames,
    useKeyboardStore,
} from "../stores/keyboardStore";

interface KeyboardToolbarProps {
    activeChord: string;
}

export const KeyboardToolbar: React.FC<KeyboardToolbarProps> = ({
    activeChord,
}) => {
    // Get state and actions from the keyboard store
    const showChordNotes = useShowChordNotes();
    const showNoteDegrees = useShowNoteDegrees();
    const showNoteNames = useShowNoteNames();
    const { toggleShowChordNotes, toggleShowNoteDegrees, toggleShowNoteNames } =
        useKeyboardStore((state) => state.actions);

    return (
        <div className="flex w-full items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-4 py-2 backdrop-blur-sm">
            {/* Left section - Keyboard toggle controls */}
            <div className="flex items-center">
                <KeyboardControls
                    showChordNotes={showChordNotes}
                    toggleShowChordNotes={toggleShowChordNotes}
                    showNoteDegrees={showNoteDegrees}
                    toggleShowNoteDegrees={toggleShowNoteDegrees}
                    showNoteNames={showNoteNames}
                    toggleShowNoteNames={toggleShowNoteNames}
                />
            </div>

            {/* Center section - Current chord with retro green CRT display */}
            <div className="flex flex-1 items-center justify-center">
                <CurrentChord chord={activeChord} variant="large" />
            </div>

            {/* Right section - Zoom controls */}
            <div className="flex items-center">
                <ZoomControls />
            </div>
        </div>
    );
};
