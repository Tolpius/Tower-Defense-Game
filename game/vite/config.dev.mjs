import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react()],
    server: {
        port: 8080,
        // Enable history API fallback for client-side routing
        historyApiFallback: true,
    },
    // Ensure all routes fallback to index.html for SPA routing
    appType: "spa",
});

