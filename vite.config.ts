import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 'base: "./"' ensures assets are loaded correctly on GitHub Pages (e.g. /repo-name/assets/...)
  base: './',
  define: {
    // Polyfill process.env for the Google GenAI SDK usage in browser
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});