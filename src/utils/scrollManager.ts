/**
 * Global Scroll Manager
 * Handles smooth scrolling with offset for sticky headers
 * Disables default browser scroll restoration
 */

// Disable default browser scroll restoration
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

/**
 * Scrolls to a specific section by ID with offset
 * @param id The ID of the section to scroll to
 */
export const scrollToSection = (id: string) => {
    // Remove # if present
    const targetId = id.startsWith('#') ? id.substring(1) : id;
    const element = document.getElementById(targetId);

    if (!element) {
        // console.warn(`Element with id "${targetId}" not found`);
        return;
    }

    // Calculate position with offset for sticky header (80px)
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

/**
 * Scrolls to top of the page
 */
export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

/**
 * Scrolls to a specific section by ID with retry mechanism
 * Useful for when the element might not be in the DOM yet (e.g., lazy loaded)
 * @param id The ID of the section to scroll to
 */
export const scrollToSectionWithRetry = (id: string) => {
    const targetId = id.startsWith('#') ? id.substring(1) : id;
    let retries = 0;
    const maxRetries = 20; // Try for 2 seconds (20 * 100ms) to FIND the element

    const attemptScroll = () => {
        const element = document.getElementById(targetId);
        if (element) {
            // Found it! Scroll immediately.
            scrollToSection(id);

            // SUSTAIN SCROLL: Scroll again at intervals to handle layout shifts (e.g. images loading)
            // This ensures we land correctly even if the page height changes after the first scroll
            setTimeout(() => scrollToSection(id), 300);
            setTimeout(() => scrollToSection(id), 600);
            setTimeout(() => scrollToSection(id), 1000);
        } else if (retries < maxRetries) {
            retries++;
            setTimeout(attemptScroll, 100);
        }
    };

    attemptScroll();
};
