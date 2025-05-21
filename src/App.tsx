import "./App.css";
import { PlayerProvider } from "@/context/PlayerContext.tsx";
import { Pieces } from "@/components/Pieces.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";

function App() {
    return (
        <div>
            <h1>PianoLab</h1>

            <Pieces />

            <PlayerProvider>
                <PlayerContent />
            </PlayerProvider>
        </div>
    );
}

export default App;
