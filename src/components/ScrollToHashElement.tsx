import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToSectionWithRetry, scrollToTop } from "@/utils/scrollManager";

const ScrollToHashElement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isFirstRun = useRef(true);

    useEffect(() => {
        // Check for reload on initial mount
        if (isFirstRun.current) {
            isFirstRun.current = false;

            // Check if page was reloaded
            const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
            if (navEntry && navEntry.type === 'reload' && location.hash) {
                // If reload with hash, clear hash and scroll to top
                navigate(location.pathname, { replace: true });
                scrollToTop();
                return;
            }
        }

        const hash = location.hash;

        if (hash) {
            // Use retry mechanism to ensure element exists and layout is ready
            scrollToSectionWithRetry(hash);
        } else {
            // Scroll to top if no hash
            scrollToTop();
        }
    }, [location, navigate]);

    return null;
};

export default ScrollToHashElement;
