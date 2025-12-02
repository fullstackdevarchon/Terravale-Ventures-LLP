import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // output folder as requested
  },
  base: './', // ensures relative paths work for Netlify
  define: {
    __DEFINES__: {},
    __HMR_CONFIG_NAME__: 'null',
  },
});
