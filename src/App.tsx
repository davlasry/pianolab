import { useEffect, useState } from "react";
import "./App.css";
import { usePlayer } from "src/hooks/usePlayer.ts";
import { Keyboard } from "src/Keyboard/components/Keyboard.tsx";
import { Clock } from "src/components/Clock";
import { Timeline } from "src/components/Timeline";
import { useMidiNotes } from "src/hooks/useMidiNotes.ts";
import { Toolbar } from "src/components/Toolbar.tsx";
import { CurrentChord } from "src/components/CurrentChord.tsx";

function App() {
    const [isReady, setReady] = useState(false);

    const {
        notes,
        loadMidi, // call this once, maybe in a “Load” button
        // setHand,
    } = useMidiNotes();

    const Player = usePlayer(notes); // hand the list down

    useEffect(() => {
        Promise.all([loadMidi(), Player.loadAudio()]).then(() =>
            setReady(true),
        );
    }, []);

    return (
        <div>
            <h1>PianoLab</h1>

            <CurrentChord chord={Player.activeChord} />

            <Toolbar
                onPlay={() => Player.play()}
                onPause={Player.pause}
                onStop={Player.stop}
                isReady={isReady}
            />

            <Clock />

            <Timeline duration={Player.audioDuration} onSeek={Player.seek} />

            <Keyboard activeNotes={Player.activeNotes} />
        </div>
    );
}

export default App;
