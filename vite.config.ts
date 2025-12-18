import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IITGEEPrep v12.24 Build Config
// Optimized for individual component delivery and maximum readability
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable minification to ensure generated code is readable and maintainable
    minify: false,
    // Ensure CSS is also split for component-level loading
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Individual bundles per component and screen
        manualChunks(id) {
          // Put third-party libraries into a vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Split every screen into its own JS file
          if (id.includes('/screens/')) {
            const screenName = id.split('/screens/')[1].split('.')[0];
            return `screens/${screenName}`;
          }
          // Split every major component into its own JS file
          if (id.includes('/components/')) {
            const componentName = id.split('/components/')[1].split('.')[0];
            return `components/${componentName}`;
          }
          // Shared libraries/utils
          if (id.includes('/lib/') || id.includes('/services/')) {
            return 'shared-core';
          }
        },
        // Clean naming convention without complex hashes for maintainability
        // Note: Production usually uses [hash], but for "maintainable for future modifications", 
        // readable paths are prioritized.
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // Ensure proper indentation and formatting in the output
        indent: true,
        compact: false,
        generatedCode: {
          symbols: true,
        },
      },
    },
  },
});