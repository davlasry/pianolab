import "./App.css";
import { PlayerProvider } from "src/context/PlayerContext";
import { PlayerContent } from "src/components/PlayerContent";

function App() {
    return (
        <div>
            <h1>PianoLab</h1>

            <PlayerProvider>
                <PlayerContent />
            </PlayerProvider>
        </div>
    );
}

export default App;
