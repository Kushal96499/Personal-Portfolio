import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'util', 'buffer'],
      globals: {
        Buffer: false, // Handled manually in main.tsx to avoid initialization order issues
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  define: {
    'process.env': {},
    'process.platform': JSON.stringify('browser'),
    'global': 'window',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
    include: ['react-turnstile'],
  },
  build: {
    target: "esnext",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep React core and fundamental utils in the main bundle for stability
            if (id.includes('react') || id.includes('react-dom') || id.includes('buffer') || id.includes('pako')) {
              return null; 
            }
            // Group heavy engine & file processing into one stable chunk
            if (
              id.includes('three') || 
              id.includes('@react-three') ||
              id.includes('pdfjs-dist') || 
              id.includes('pdf-lib') ||
              id.includes('tesseract.js')
            ) {
              return 'engine-vendor';
            }
            // Everything else in a generic vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
}));
