
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IITGEEPrep v12.45 Build Config
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    cssCodeSplit: true,
    rollupOptions: {
      // Prevent build errors for dependencies that might be loaded via CDN or importmaps
      external: ['@google/genai'],
      output: {
        globals: {
          '@google/genai': 'GoogleGenAI'
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/screens/')) {
            const screenName = id.split('/screens/')[1].split('.')[0];
            return `screens/${screenName}`;
          }
          if (id.includes('/components/')) {
            const componentName = id.split('/components/')[1].split('.')[0];
            return `components/${componentName}`;
          }
          if (id.includes('/lib/') || id.includes('/services/')) {
            return 'shared-core';
          }
        },
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        indent: true,
        compact: false,
        generatedCode: {
          symbols: true,
        },
      },
    },
  },
});
