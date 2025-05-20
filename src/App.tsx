import { useEffect, useState } from "react";
import "./App.css";
import { usePlayer } from "src/hooks/usePlayer.ts";
import { Keyboard } from "src/Keyboard/components/Keyboard.tsx";
import { Clock } from "src/components/Clock";
import { Timeline } from "src/components/Timeline";
import { useMidiNotes } from "src/hooks/useMidiNotes.ts";
import { Toolbar } from "src/components/Toolbar.tsx";

function App() {
    const [isReady, setReady] = useState(false);

    const {
        notes,
        loadMidi, // call this once, maybe in a “Load” button
        // setHand,
    } = useMidiNotes();

    const player = usePlayer(notes); // hand the list down

    useEffect(() => {
        Promise.all([loadMidi(), player.loadAudio()]).then(() =>
            setReady(true),
        );
    }, []);

    return (
        <div>
            <h1>PianoLab</h1>

            <Toolbar
                onPlay={() => player.play()}
                onPause={player.pause}
                onStop={player.stop}
                isReady={isReady}
            />

            <Clock />

            <Timeline duration={player.audioDuration} onSeek={player.seek} />

            <Keyboard activeNotes={player.activeNotes} />
        </div>
    );
}

export default App;
