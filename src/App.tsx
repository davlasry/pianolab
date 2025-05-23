import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/components/Home.tsx";
import { RecordingView } from "@/components/RecordingView.tsx";
import { Navbar } from "@/components/Navbar.tsx";

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
                </Routes>
            </div>
        </>
    );
}

export default App;
