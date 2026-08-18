import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'chopaeng_item_favorites';

export const getStoredFavorites = (): string[] => {
    try {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveStoredFavorites = (favorites: string[]): void => {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
        // Storage write failed
    }
    window.dispatchEvent(new CustomEvent('chopaeng_favorites_updated', { detail: { favorites } }));
};

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

    const refresh = useCallback(() => {
        setFavorites(getStoredFavorites());
    }, []);

    useEffect(() => {
        window.addEventListener('chopaeng_favorites_updated', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('chopaeng_favorites_updated', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [refresh]);

    const isFavorite = useCallback((id: string): boolean => {
        if (!id) return false;
        return favorites.includes(id);
    }, [favorites]);

    const toggleFavorite = useCallback((id: string, e?: React.MouseEvent): boolean => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!id) return false;

        const current = getStoredFavorites();
        let updated: string[];
        let added = false;

        if (current.includes(id)) {
            updated = current.filter((favId) => favId !== id);
            added = false;
        } else {
            updated = [id, ...current];
            added = true;
        }

        saveStoredFavorites(updated);
        setFavorites(updated);
        return added;
    }, []);

    const clearFavorites = useCallback(() => {
        saveStoredFavorites([]);
        setFavorites([]);
    }, []);

    return {
        favorites,
        favoriteCount: favorites.length,
        isFavorite,
        toggleFavorite,
        clearFavorites,
    };
};
