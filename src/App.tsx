import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { RecordingView } from "@/components/RecordingView.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { PieceView } from "@/components/Pieces/PieceView.tsx";

function App() {
    return (
        <>
            <Navbar />
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
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
