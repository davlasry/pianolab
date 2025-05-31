import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { SessionView } from "@/components/SessionView.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { PieceView } from "@/components/Pieces/PieceView.tsx";
import { PiecesPage } from "@/pages/PiecesPage";
import { SessionsPage } from "@/pages/SessionsPage.tsx";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="pianolab-theme">
            <Navbar />
            <div className="content flex w-full flex-1 flex-col">
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
        </ThemeProvider>
    );
}

export default App;
