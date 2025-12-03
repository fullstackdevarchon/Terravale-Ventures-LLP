import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Vercel serves from root, so base is "/"
  base: "/",

  build: {
    outDir: "dist",
  },

  // ONLY STATIC CONSTANTS HERE
  define: {
    __APP_VERSION__: JSON.stringify("1.0.0"), // optional
  },

  server: {
    host: true,
    port: 5173,
  },
});
