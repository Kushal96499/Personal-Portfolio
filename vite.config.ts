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
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // ONLY split out heavy libraries that are behind lazy-loaded routes
            // and do NOT import React at the top level of their bundle.
            // Everything else stays in the default chunk to avoid TDZ/init-order crashes.

            // Three.js + R3F (only used in 3D components, no top-level React dependency)
            if (id.includes('three') || id.includes('@react-three') || id.includes('maath')) {
              return 'graphics-vendor';
            }

            // Heavy document processing engines (only used in /tools/pdf/* routes)
            if (
              id.includes('pdfjs-dist') || 
              id.includes('pdf-lib') ||
              id.includes('tesseract.js') ||
              id.includes('xlsx') ||
              id.includes('jszip') ||
              id.includes('jspdf') ||
              id.includes('pdfmake') ||
              id.includes('mammoth') ||
              id.includes('docx') ||
              id.includes('fabric') ||
              id.includes('pptxgenjs')
            ) {
              return 'engine-vendor';
            }
          }
          // Return undefined for everything else → Rollup handles it safely
        },
      },
    },
  },
}));
