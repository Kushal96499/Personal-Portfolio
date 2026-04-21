import { Buffer } from "buffer";
import pako from "pako";
window.Buffer = Buffer;
window.global = window;
window.pako = pako;

import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
