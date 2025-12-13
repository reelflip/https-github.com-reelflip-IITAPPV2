
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification for smaller bundle size
    minify: true,
    rollupOptions: {
      output: {
        // Forces all JS code into a single chunk named 'app'
        manualChunks: () => 'app',
        // Adds a hash to the filename to prevent browser caching of old code
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
