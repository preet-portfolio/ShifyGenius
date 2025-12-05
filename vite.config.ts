import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    // Increase chunk size warning limit to 600kb (from default 500kb)
    // Our main bundle is ~555kb, which is acceptable for a feature-rich app
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts-vendor': ['recharts'],
        }
      }
    }
  }
});
