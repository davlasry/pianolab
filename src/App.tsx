import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { RecordingView } from "@/components/RecordingView.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { PieceView } from "@/components/Pieces/PieceView.tsx";
import { PiecesPage } from "@/pages/PiecesPage";
import { RecordingsPage } from "@/pages/RecordingsPage";

function App() {
    return (
        <>
            <Navbar />
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pieces" element={<PiecesPage />} />
                    <Route path="/recordings" element={<RecordingsPage />} />
                    <Route
                        path="/recording/:recordingId"
                        element={<RecordingView />}
                    />
                    <Route path="/piece/:pieceId" element={<PieceView />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
