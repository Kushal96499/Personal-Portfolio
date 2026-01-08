import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const SpotlightEffect = () => {
    const divRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith('/admin')) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (rafRef.current) return;

            rafRef.current = requestAnimationFrame(() => {
                const { clientX, clientY } = e;

                // Update the main spotlight background directly
                if (divRef.current) {
                    divRef.current.style.background = `radial-gradient(600px circle at ${clientX}px ${clientY}px, rgba(29, 78, 216, 0.15), transparent 80%)`;
                }

                // Update cards with .spotlight-hover class (optimized)
                // Use a more specific selector or method if this is still too heavy,
                // but removing the state update is the biggest win.
                const cards = document.getElementsByClassName("spotlight-hover");
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i] as HTMLElement;
                    const rect = card.getBoundingClientRect();
                    const x = clientX - rect.left;
                    const y = clientY - rect.top;
                    card.style.setProperty("--mouse-x", `${x}px`);
                    card.style.setProperty("--mouse-y", `${y}px`);
                }

                rafRef.current = null;
            });
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [location.pathname]);

    if (location.pathname.startsWith('/admin')) return null;

    return (
        <div
            ref={divRef}
            className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
            // Initial state
            style={{
                background: `radial-gradient(600px circle at 0px 0px, rgba(29, 78, 216, 0.15), transparent 80%)`,
            }}
        />
    );
};
