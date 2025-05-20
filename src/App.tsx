import { useEffect } from "react";
import "./App.css";
import { usePlayMidi } from "src/hooks/usePlayMidi";

function App() {
    const { loadMidi, playMidi, pauseMidi, resumeMidi, stopMidi } =
        usePlayMidi();

    useEffect(() => {
        loadMidi();
    }, []);

    return (
        <div>
            <h1>PianoLab</h1>
            <div>
                <button onClick={playMidi}>Play</button>
                <button onClick={pauseMidi}>Pause</button>
                <button onClick={resumeMidi}>Resume</button>
                <button onClick={stopMidi}>Stop</button>
            </div>
        </div>
    );
}

export default App;
