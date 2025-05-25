import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import "./index.css";
import App from "./App.tsx";

// // Create a separate root for the toolbar
// if (import.meta.env.DEV) {
//     const toolbarRoot = document.createElement("div");
//     toolbarRoot.id = "stagewise-toolbar";
//     document.body.appendChild(toolbarRoot);
//
//     createRoot(toolbarRoot).render(
//         <StagewiseToolbar config={{ plugins: [] }} />,
//     );
// }

// Main app root
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter basename="/">
            <App />
        </BrowserRouter>
    </StrictMode>,
);
