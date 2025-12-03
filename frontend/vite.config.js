import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/",  // Important for Render

  build: {
    outDir: "dist",
  },

  define: {
    __SERVER_HOST__: JSON.stringify(process.env.VITE_API_URL),
  },

  server: {
    host: true,
    port: 5173,
  },
});
