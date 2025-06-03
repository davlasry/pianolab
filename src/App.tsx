import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { SessionView } from "@/components/SessionView.tsx";
import { PieceView } from "@/components/Pieces/PieceView.tsx";
import { PiecesPage } from "@/pages/PiecesPage";
import { SessionsPage } from "@/pages/SessionsPage.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import { SideNav } from "@/components/navigation/SideNav";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="pianolab-theme">
            <div className="flex h-screen w-screen overflow-hidden">
                <SideNav />
                <main className="flex-1 overflow-auto">
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
                </main>
            </div>
        </ThemeProvider>
    );
}

export default App;
