import React from "react";
import { CurrentChord } from "@/components/Player/CurrentChord";
import { ZoomControls } from "./ZoomControls";
import { KeyboardControls } from "@/components/Player/Controls/KeyboardControls";
import {
    useShowChordNotes,
    useShowNoteDegrees,
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
    const { toggleShowChordNotes, toggleShowNoteDegrees } = useKeyboardStore(
        (state) => state.actions,
    );

    return (
        <div className="flex w-full items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-4 py-2 backdrop-blur-sm">
            {/* Left section - Keyboard toggle controls */}
            <div className="flex items-center">
                <KeyboardControls
                    showChordNotes={showChordNotes}
                    toggleShowChordNotes={toggleShowChordNotes}
                    showNoteDegrees={showNoteDegrees}
                    toggleShowNoteDegrees={toggleShowNoteDegrees}
                />
            </div>

            {/* Center section - Current chord with LCD-style display */}
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
