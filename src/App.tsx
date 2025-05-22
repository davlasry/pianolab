import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { RecordingView } from "@/components/RecordingView.tsx";
import { PlayerProvider } from "@/context/PlayerContext.tsx";
import { Pieces } from "@/components/Pieces/Pieces.tsx";
import { Recordings } from "@/components/Recordings/Recordings.tsx";
import { PlayerContent } from "@/components/PlayerContent.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recording/:recordingId" element={<RecordingView />} />
        </Routes>
    );
}

export default App;
