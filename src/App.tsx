import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "@/pages/Home.tsx";
import { SessionView } from "@/components/Session/SessionView.tsx";
import { PieceView } from "@/components/Pieces/PieceView.tsx";
import { PiecesPage } from "@/pages/PiecesPage";
import { SessionsPage } from "@/pages/SessionsPage.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import { SideNav } from "@/components/navigation/SideNav";
import CustomPlayerPage from "@/pages/CustomPlayerPage.tsx";
import TestPage from "@/pages/TestPage";

function App() {
    // Log the current location to help debug routing issues
    const location = useLocation();

    useEffect(() => {
        console.log("Current route:", location.pathname);
    }, [location]);

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
                        <Route
                            path="/custom-player/:sessionId"
                            element={<CustomPlayerPage />}
                        />
                        <Route path="/test/:sessionId" element={<TestPage />} />
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default App;
