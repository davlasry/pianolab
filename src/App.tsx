import { useEffect, useState } from "react";
import "./App.css";
import { usePlayMidi } from "src/hooks/usePlayMidi";
import { Klavier } from "src/klavier/components/Klavier";
import { Clock } from "src/components/Clock";
import { Timeline } from "src/components/Timeline";

function App() {
    const [isReady, setReady] = useState(false);
    const {
        loadMidi,
        loadAudio,
        play,
        pause,
        resume,
        stop,
        activeKeys,
        audioDuration,
    } = usePlayMidi();

    useEffect(() => {
        Promise.all([loadMidi(), loadAudio()]).then(() => setReady(true));
    }, []);

    return (
        <div>
            <h1>PianoLab</h1>
            <div>
                <button onClick={() => play()} disabled={!isReady}>
                    Play
                </button>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <button onClick={stop}>Stop</button>
            </div>
            <Clock />
            <Timeline duration={audioDuration} />
            <Klavier activeKeys={activeKeys} />
        </div>
    );
}

export default App;
