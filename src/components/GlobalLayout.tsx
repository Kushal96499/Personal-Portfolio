import { ReactNode, useEffect } from "react";
import Experience3D from "./Experience3D";
import Navbar from "./Navbar";
import MobileDock from "./MobileDock";

import Lenis from "@studio-freight/lenis";
import { useLocation } from "react-router-dom";

interface GlobalLayoutProps {
    children: ReactNode;
}

const GlobalLayout = ({ children }: GlobalLayoutProps) => {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith('/admin')) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, [location.pathname]);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <div className="relative min-h-screen w-full text-white overflow-x-hidden">


            {/* Persistent 3D Background - Fixed z-index handled in component */}
            {!isAdminRoute ? (
                <Experience3D />
            ) : (
                <div className="fixed inset-0 bg-[#050505] -z-10" />
            )}

            {/* Navigation - High z-index */}
            {!isAdminRoute && (
                <>
                    <Navbar />
                    <MobileDock />
                </>
            )}

            {/* Main Content - Relative z-index to sit above background */}
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
};

export default GlobalLayout;
