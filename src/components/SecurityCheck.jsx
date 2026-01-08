import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function SecurityCheck({ onVerified, externalError }) {
    const mountedRef = useRef(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        mountedRef.current = true;

        // Start verification animation after 0.5 seconds
        const startTimer = setTimeout(() => {
            if (mountedRef.current) {
                setIsVerifying(true);
            }
        }, 500);

        // Show checkmark after 1.5 seconds (1s of spinning animation)
        const checkTimer = setTimeout(() => {
            if (mountedRef.current) {
                setIsVerifying(false);
                setIsChecked(true);
            }
        }, 1500);

        // Complete verification after 2 seconds total
        const verifyTimer = setTimeout(() => {
            if (mountedRef.current) {
                onVerified("simulated-token");
            }
        }, 2000);

        return () => {
            mountedRef.current = false;
            clearTimeout(startTimer);
            clearTimeout(checkTimer);
            clearTimeout(verifyTimer);
        };
    }, [onVerified]);

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


                {/* The Widget Box - OFFICIAL CLOUDFLARE CHECKBOX STYLE */}
                <div className="flex items-center justify-between border relative select-none cursor-pointer transition-colors" style={{
                    backgroundColor: '#333333',
                    borderColor: '#4a4a4a',
                    borderWidth: '2px',
                    borderRadius: '3px',
                    width: '300px',
                    height: '78px',
                    padding: '0 12px'
                }}>

                    {/* Left: Checkbox + "Verify you are human" */}
                    <div className="flex items-center" style={{ gap: '14px', height: '100%' }}>
                        {/* Checkbox with Loading Animation */}
                        <div className="relative flex items-center justify-center flex-shrink-0 border-2" style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '3px',
                            borderColor: isChecked ? '#4caf50' : (isVerifying ? '#4caf50' : '#757575'),
                            backgroundColor: isChecked ? '#4caf50' : 'transparent',
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Loading Spinner - Green Ring */}
                            {isVerifying && !isChecked && (
                                <svg className="w-[22px] h-[22px]" viewBox="0 0 50 50" style={{ animation: 'spin 0.8s linear infinite' }}>
                                    <circle
                                        cx="25"
                                        cy="25"
                                        r="20"
                                        fill="none"
                                        stroke="#4caf50"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray="31.4 31.4"
                                        transform="rotate(-90 25 25)"
                                    />
                                </svg>
                            )}

                            {/* Checkmark */}
                            {isChecked && (
                                <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>

                        {/* "Verify you are human" Text */}
                        <span style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1, color: '#f0f0f0' }}>
                            Verify you are human
                        </span>
                    </div>

                    {/* Right: Cloudflare Logo (Vertical Stack) - COMPACT */}
                    <div className="flex flex-col items-center justify-center" style={{ gap: '3px', height: '100%' }}>
                        {/* Orange Cloud Icon */}
                        <svg viewBox="0 0 48 24" style={{ height: '16px', width: 'auto', marginBottom: '1px' }} fill="#F48120">
                            <path d="M36.65,7.74c-1.89,0-3.61,0.92-4.71,2.34C31.54,9.65,31.06,9.45,30.56,9.45c-1.3,0-2.5,0.48-3.43,1.27 c-0.89-2.31-3.13-3.95-5.75-3.95c-2.86,0-5.27,1.95-6.07,4.64c-0.64-0.18-1.31-0.28-2.01-0.28C5.97,11.13,2,15.1,2,20s3.97,8.87,8.87,8.87 h25.77c3.95,0,7.16-3.21,7.16-7.16S40.6,7.74,36.65,7.74z" transform="scale(0.5) translate(0, 0)" />
                        </svg>

                        {/* CLOUDFLARE Text */}
                        <span style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1, letterSpacing: '0.03em', color: '#fff' }}>CLOUDFLARE</span>

                        {/* Privacy • Terms */}
                        <div className="flex" style={{ fontSize: '8px', fontWeight: 400, lineHeight: 1, gap: '5px', color: '#999999', marginTop: '2px' }}>
                            <span className="cursor-pointer hover:underline">Privacy</span>
                            <span>•</span>
                            <span className="cursor-pointer hover:underline">Terms</span>
                        </div>
                    </div>
                </div>


                {/* Description Paragraph */}
                <div className="max-w-[700px] font-normal mt-10" style={{ fontSize: '18px', lineHeight: 1.6, color: '#b0b0b0' }}>
                    <p>
                        kushalkumawat.in needs to review the security of your connection before proceeding.
                    </p>
                </div>
            </div>

            {/* CSS Animation for Spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

        </div>,
        document.body
    );
}
