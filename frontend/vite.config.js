import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Clean Vite configuration for production (Vercel) deployments.
 * All environment‑specific values are accessed via `import.meta.env`.
 * Only truly static constants are defined here.
 */
export default defineConfig({
  plugins: [react()],

  // Vercel serves the app from the root.
  base: "/",

  // Build output directory for Vercel static hosting.
  build: {
    outDir: "dist",
  },

  // Global constants that must be replaced at build time.
  define: {
    // Example static constant – adjust or remove as needed.
    __APP_VERSION__: JSON.stringify("1.0.0"),
    // Optional static base URL (fallback to '/').
    __BASE_URL__: JSON.stringify(process.env.BASE_URL || "/"),
  },

  // Development server configuration (only used locally).
  server: {
    host: true,
    port: 5173,
  },
});
