import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build works under a GitHub Pages project path
  // (e.g. /CodeAnimes/) as well as at a domain root. The app is a single page
  // with no client-side router, so relative asset paths are safe.
  base: './',
});
