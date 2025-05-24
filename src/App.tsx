import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { SessionView } from "@/components/SessionView.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { PieceView } from "@/components/Pieces/PieceView.tsx";
import { PiecesPage } from "@/pages/PiecesPage";
import { SessionsPage } from "@/pages/SessionsPage.tsx";

function App() {
    return (
        <>
            <Navbar />
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pieces" element={<PiecesPage />} />
                    <Route path="/sessions" element={<SessionsPage />} />
                    <Route
                        path="/session/:sessionId"
                        element={<SessionView />}
                    />
                    <Route path="/piece/:pieceId" element={<PieceView />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
