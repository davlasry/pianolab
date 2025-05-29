/// <reference types="vitest/config" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    base: "/",
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./vitest.setup.ts",
        coverage: {
            reporter: ["text", "html"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
