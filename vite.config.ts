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
    // Increase chunk size warning limit to 1000kb for feature-rich SaaS app
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Aggressive code splitting for optimal loading
        manualChunks: (id) => {
          // Vendor chunks for large libraries
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Routing
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'recharts-vendor';
            }
            // Firebase
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase-vendor';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Markdown rendering
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) {
              return 'markdown-vendor';
            }
            // State management
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            // Validation
            if (id.includes('zod')) {
              return 'validation-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
        }
      }
    }
  }
});
