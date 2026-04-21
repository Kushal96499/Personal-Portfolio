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
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.platform': JSON.stringify('browser'),
    'global': 'window',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
    include: ['react-turnstile', 'buffer', 'pako'],
  },
  build: {
    target: "esnext",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Priority 1: Core React and Polyfills
            if (id.includes('react') || id.includes('react-dom') || id.includes('buffer') || id.includes('pako')) {
              return 'core-vendor'; 
            }
            // Priority 2: Graphics Engine
            if (id.includes('three') || id.includes('@react-three')) {
              return 'graphics-vendor';
            }
            // Priority 3: Heavy processing engines
            if (
              id.includes('pdfjs-dist') || 
              id.includes('pdf-lib') ||
              id.includes('tesseract.js') ||
              id.includes('xlsx') ||
              id.includes('jszip')
            ) {
              return 'engine-vendor';
            }
            // All other vendors
            return 'vendor';
          }
        },
      },
    },
  },
}));
