import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
      // Disable Fast Refresh for production
      fastRefresh: false,
    }),
  ],

  base: "/",

  // Define all Vite internal variables to prevent undefined errors
  define: {
    __DEFINES__: "{}",
    __HMR_CONFIG_NAME__: '"vite"',
    __BASE__: '"/"',
    __SERVER_HOST__: '""',
    __HMR_PROTOCOL__: '""',
    __HMR_HOSTNAME__: '""',
    __HMR_PORT__: "null",
    __HMR_DIRECT_TARGET__: '""',
    __HMR_BASE__: '"/"',
    __HMR_TIMEOUT__: "30000",
    __HMR_ENABLE_OVERLAY__: "false",
    __WS_TOKEN__: '""',
    __MODE__: '"production"',
    __VITE_IS_MODERN__: "true",
    __VITE_PUBLIC_PATH__: '"/"',
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'redux', 'react-redux'],
          'ui-vendor': ['react-hot-toast', 'react-icons'],
        },
      },
    },
  },

  server: {
    host: true,
    port: 5173,
    hmr: false, // Disable HMR in development too
  },
});