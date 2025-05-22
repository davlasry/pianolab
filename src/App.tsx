import "./App.css";
import { PlayerProvider } from "@/context/PlayerContext.tsx";
import { Pieces } from "@/components/Pieces/Pieces.tsx";
import { Recordings } from "@/components/Recordings/Recordings.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";

function App() {
    return (
        <div>
            <h1>PianoLab</h1>

            <div>
                <Pieces />
                <Recordings />
            </div>

            <PlayerProvider>
                <PlayerContent />
            </PlayerProvider>
        </div>
    );
}

export default App;
