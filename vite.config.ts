
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable minification to make the output code readable and easier to modify
    minify: false,
    rollupOptions: {
      // Required setting when preserveModules is true to avoid build errors.
      // Vite sets this to false by default, which conflicts with preserveModules.
      preserveEntrySignatures: 'exports-only',
      output: {
        // This setting forces Rollup to generate separate files for each module
        // instead of bundling them into one file.
        preserveModules: true,
        
        // This ensures the output files keep their original names (e.g., AuthScreen.js)
        entryFileNames: '[name].js',
        
        // Optional: organize assets
        assetFileNames: 'assets/[name][extname]'
      },
    },
  },
});
