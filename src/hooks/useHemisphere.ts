import { useState, useEffect, useCallback } from 'react';

export type Hemisphere = 'north' | 'south';

const HEMISPHERE_STORAGE_KEY = 'chopaeng_hemisphere';

export const getStoredHemisphere = (): Hemisphere => {
    try {
        const saved = localStorage.getItem(HEMISPHERE_STORAGE_KEY);
        if (saved === 'south') return 'south';
    } catch {
        // Storage read failed
    }
    return 'north';
};

export const setStoredHemisphere = (hemisphere: Hemisphere): void => {
    try {
        localStorage.setItem(HEMISPHERE_STORAGE_KEY, hemisphere);
    } catch {
        // Storage write failed
    }
    window.dispatchEvent(new CustomEvent('chopaeng_hemisphere_updated', { detail: { hemisphere } }));
};

export const useHemisphere = () => {
    const [hemisphere, setHemisphere] = useState<Hemisphere>(getStoredHemisphere);

    const refresh = useCallback(() => {
        setHemisphere(getStoredHemisphere());
    }, []);

    useEffect(() => {
        window.addEventListener('chopaeng_hemisphere_updated', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('chopaeng_hemisphere_updated', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [refresh]);

    const toggleHemisphere = useCallback(() => {
        const next: Hemisphere = hemisphere === 'north' ? 'south' : 'north';
        setStoredHemisphere(next);
        setHemisphere(next);
    }, [hemisphere]);

    const setHemisphereValue = useCallback((value: Hemisphere) => {
        setStoredHemisphere(value);
        setHemisphere(value);
    }, []);

    return {
        hemisphere,
        isNorth: hemisphere === 'north',
        isSouth: hemisphere === 'south',
        toggleHemisphere,
        setHemisphere: setHemisphereValue,
    };
};
