import { useState, useEffect } from 'react';

/**
 * Delays showing a loading state for `delayMs` milliseconds.
 * If the query resolves before the delay, the skeleton is never shown —
 * preventing the jarring "flash of skeleton" for fast/cached responses.
 *
 * Usage:
 *   const showSkeleton = useDelayedLoading(isLoading);
 *   if (showSkeleton) return <MySkeleton />;
 */
export function useDelayedLoading(isLoading: boolean, delayMs = 200): boolean {
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShowSkeleton(false);
            return;
        }

        const timer = setTimeout(() => setShowSkeleton(true), delayMs);
        return () => clearTimeout(timer);
    }, [isLoading, delayMs]);

    return showSkeleton;
}
