import { useState, useEffect } from "react";
import Turnstile from "react-turnstile";

export default function SecurityCheck({ onVerified }) {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Use test key for localhost, production key for deployed site
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const siteKey = isLocalhost
        ? "1x00000000000000000000AA" // Cloudflare test key (always passes)
        : "0x4AAAAAAACCnPOSXXplvy65O"; // Your production key

    useEffect(() => {
        // Check if Turnstile script is already loaded
        if (window.turnstile) {
            setScriptLoaded(true);
            return;
        }

        // Wait for script to load
        const checkScript = setInterval(() => {
            if (window.turnstile) {
                setScriptLoaded(true);
                clearInterval(checkScript);
            }
        }, 100);

        // Timeout after 10 seconds
        const timeout = setTimeout(() => {
            clearInterval(checkScript);
            if (!window.turnstile) {
                setError("Failed to load verification widget. Please refresh the page.");
            }
        }, 10000);

        return () => {
            clearInterval(checkScript);
            clearTimeout(timeout);
        };
    }, []);

    const handleSuccess = (token) => {
        console.log("Turnstile verification successful");
        setVerified(true);
        onVerified(token);
    };

    const handleError = (errorCode) => {
        console.error("Turnstile widget error:", errorCode);
        setError("Verification failed. Please refresh the page.");
    };

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
            color: "white",
            cursor: "default",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <div style={{
                textAlign: "center",
                padding: "40px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)",
                maxWidth: "500px"
            }}>
                <h2 style={{
                    color: "#06b6d4",
                    marginBottom: "12px",
                    fontSize: "28px",
                    fontWeight: "700",
                    textShadow: "0 0 20px rgba(6, 182, 212, 0.5)"
                }}>Security Verification</h2>
                <p style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    marginBottom: "24px",
                    fontSize: "14px"
                }}>Please verify you're human to continue.</p>

                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "65px"
                }}>
                    {scriptLoaded ? (
                        <Turnstile
                            sitekey={siteKey}
                            onVerify={handleSuccess}
                            onError={handleError}
                            theme="dark"
                            size="normal"
                            retry="auto"
                            refreshExpired="auto"
                        />
                    ) : (
                        <p style={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "14px"
                        }}>Loading verification...</p>
                    )}
                </div>

                {error && (
                    <p style={{
                        color: "#ef4444",
                        marginTop: "16px",
                        fontSize: "13px"
                    }}>{error}</p>
                )}

                {isLocalhost && (
                    <p style={{
                        color: "rgba(255, 255, 255, 0.5)",
                        marginTop: "12px",
                        fontSize: "11px"
                    }}>Development mode - using test key</p>
                )}
            </div>
        </div>
    );
}

