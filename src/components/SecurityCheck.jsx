import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Turnstile from "react-turnstile";

// Bridge for react-turnstile: ensure callback resolves even if Turnstile
// script was loaded prior to component mounting or callback assignment.
if (typeof window !== 'undefined' && !window.__turnstileBridgeInstalled) {
    window.__turnstileBridgeInstalled = true;
    let _cfCallback = window.cf__reactTurnstileOnLoad;
    Object.defineProperty(window, 'cf__reactTurnstileOnLoad', {
        configurable: true,
        get() {
            return _cfCallback;
        },
        set(fn) {
            _cfCallback = fn;
            if (typeof fn === 'function' && window.turnstile) {
                setTimeout(() => {
                    try {
                        fn();
                    } catch (e) {
                        console.debug("Turnstile onload bridge:", e);
                    }
                }, 0);
            }
        }
    });
}

export default function SecurityCheck({ onVerified, externalError }) {
    const [error, setError] = useState(null);
    const [widgetKey, setWidgetKey] = useState(0);

    const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname === '::1' || 
         window.location.hostname === '[::1]' || 
         window.location.hostname === '0.0.0.0' || 
         window.location.hostname.endsWith('.local'));

    // Production site key or Cloudflare test key for localhost
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || 
        (isLocalhost ? "1x00000000000000000000AA" : "0x4AAAAAACCnPOSXXplvy65O");

    useEffect(() => {
        if (externalError) {
            setError(externalError);
            setWidgetKey(prev => prev + 1);
        }
    }, [externalError]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // If Turnstile is already loaded, ensure callback is triggered immediately
        if (window.turnstile && typeof window.cf__reactTurnstileOnLoad === 'function') {
            try {
                window.cf__reactTurnstileOnLoad();
            } catch (e) {
                console.debug("Turnstile onload bridge:", e);
            }
        }

        const checkInterval = setInterval(() => {
            if (window.turnstile && typeof window.cf__reactTurnstileOnLoad === 'function') {
                try {
                    window.cf__reactTurnstileOnLoad();
                } catch (e) {
                    console.debug("Turnstile onload bridge:", e);
                }
            }
        }, 100);

        return () => clearInterval(checkInterval);
    }, []);

    const handleSuccess = (token) => {
        console.log("Turnstile verification successful");
        setError(null);
        if (onVerified) {
            onVerified(token);
        }
    };

    const handleError = (errorCode) => {
        console.error("Turnstile widget error:", errorCode);
        setError("Verification failed. Please try again.");
    };

    const handleExpire = () => {
        console.warn("Turnstile token expired");
        setWidgetKey(prev => prev + 1);
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] antialiased overflow-y-auto flex items-center p-4 sm:p-8 font-sans" style={{ backgroundColor: '#141414', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif', cursor: 'default' }}>

            {/* Universal Container: Vertically Centered, Left Aligned Content */}
            <div className="flex flex-col items-start w-full max-w-[900px] mx-auto" style={{ paddingLeft: '5vw' }}>

                {/* Domain Name Title */}
                <h1 className="font-normal leading-tight mb-4" style={{ fontSize: '38px', color: '#e0e0e0', fontWeight: 400 }}>
                    kushalkumawat.in
                </h1>

                {/* Subtitle */}
                <div className="mb-8" style={{ fontSize: '20px', color: '#c0c0c0', fontWeight: 400 }}>
                    <p>
                        Checking if the site connection is secure
                    </p>
                </div>

                {/* Real Cloudflare Turnstile Widget Box */}
                <div style={{ minHeight: '65px', minWidth: '300px' }}>
                    <Turnstile
                        key={widgetKey}
                        sitekey={siteKey}
                        onVerify={handleSuccess}
                        onError={handleError}
                        onExpire={handleExpire}
                        theme="dark"
                        size="normal"
                        retry="auto"
                        refreshExpired="auto"
                    />
                </div>

                {error && (
                    <div style={{ color: '#ef4444', marginTop: '12px', fontSize: '13px' }}>
                        {error}
                        <button 
                            type="button"
                            onClick={() => { setError(null); setWidgetKey(prev => prev + 1); }}
                            style={{ marginLeft: '8px', color: '#06b6d4', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Description Paragraph */}
                <div className="max-w-[700px] font-normal mt-10" style={{ fontSize: '18px', lineHeight: 1.6, color: '#b0b0b0' }}>
                    <p>
                        kushalkumawat.in needs to review the security of your connection before proceeding.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}
