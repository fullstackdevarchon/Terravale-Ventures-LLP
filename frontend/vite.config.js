import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/",  // Required for Render static hosting

  build: {
    outDir: "dist",
  },

  define: {
    __DEFINES__: JSON.stringify({ SERVER_HOST: process.env.VITE_API_URL })
  },

  server: {
    host: true,
    port: 5173,
  },
});
