import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // 'base: "./"' ensures assets are loaded correctly on GitHub Pages (e.g. /Travel-Planner/assets/...)
    base: './', 
    define: {
      // Safely replace process.env.API_KEY with the string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ""),
      // Define process.env as an empty object to prevent "process is not defined" crashes in libraries
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});