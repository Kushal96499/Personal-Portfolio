// 1. Core Polyfills (MUST BE FIRST)
import { Buffer } from "buffer";
import pako from "pako";

// Robust process polyfill for browser
if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = Buffer;
  window.pako = pako;
  
  // Ensure process exists with necessary env vars
  if (!window.process) {
    window.process = {
      env: { 
        NODE_ENV: import.meta.env.MODE,
        BROWSER: true
      },
      browser: true,
      platform: 'browser',
      version: '',
      nextTick: (fn: Function) => setTimeout(fn, 0),
      cwd: () => '/',
      on: () => {},
      once: () => {},
      off: () => {},
      emit: () => {},
      stderr: { write: () => {} },
      stdout: { write: () => {} },
    } as any;
  } else {
    // Merge env if process already exists
    window.process.env = { ...window.process.env, NODE_ENV: import.meta.env.MODE };
  }
}


import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
