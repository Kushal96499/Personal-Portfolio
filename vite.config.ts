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
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  define: {
    'process.env': {},
    'process.platform': JSON.stringify('browser'),
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
            // Keep React core in main bundle for stability
            if (id.includes('react') || id.includes('react-dom')) {
              return null; 
            }
            // Split heavy 3D engine
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Split heavy file processing tools
            if (
              id.includes('tesseract.js') || 
              id.includes('pdfjs-dist') || 
              id.includes('jspdf') || 
              id.includes('pdf-lib') ||
              id.includes('xlsx') ||
              id.includes('fabric') ||
              id.includes('jszip') ||
              id.includes('docx') ||
              id.includes('mammoth')
            ) {
              return 'tools-vendor';
            }
            // Group heavy animation libs
            if (id.includes('gsap') || id.includes('canvas-confetti')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));
