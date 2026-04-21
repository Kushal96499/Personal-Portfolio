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
            // Priority 1: UI & Animations (Moderate size)
            if (
              id.includes('@radix-ui') || 
              id.includes('lucide-react') || 
              id.includes('framer-motion') || 
              id.includes('gsap') ||
              id.includes('embla-carousel') ||
              id.includes('recharts') ||
              id.includes('react-hook-form') ||
              id.includes('vaul')
            ) {
              return 'ui-vendor';
            }

            // Priority 2: Database & Utilities
            if (
              id.includes('@supabase') || 
              id.includes('@tanstack') || 
              id.includes('zod') ||
              id.includes('date-fns') ||
              id.includes('crypto-js')
            ) {
              return 'db-vendor';
            }

            // Priority 3: Heavy Graphics Engine
            if (id.includes('three') || id.includes('@react-three')) {
              return 'graphics-vendor';
            }

            // Priority 4: Heavy Document Engines (PDF, OCR)
            if (
              id.includes('pdfjs-dist') || 
              id.includes('pdf-lib') ||
              id.includes('tesseract.js') ||
              id.includes('xlsx') ||
              id.includes('jszip') ||
              id.includes('fabric') ||
              id.includes('jspdf') ||
              id.includes('pdfmake') ||
              id.includes('pptxgenjs') ||
              id.includes('mammoth') ||
              id.includes('docx')
            ) {
              return 'engine-vendor';
            }

            // All other vendors (includes buffer, pako, and small libs)
            // Keeping these in a stable 'shared-vendor' or default chunk
            return 'vendor';
          }
        },
      },
    },
  },
}));
