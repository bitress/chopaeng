import { useState, useEffect, useCallback } from 'react';
import { getUserScopedItem, setUserScopedItem } from '../utils/accountStorage';

const COLLECTION_STORAGE_KEY = 'chopaeng_collection';

export const getStoredCollection = (): string[] => {
    try {
        const saved = getUserScopedItem(COLLECTION_STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveStoredCollection = (collection: string[]): void => {
    try {
        setUserScopedItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
    } catch {
        // Storage write failed
    }
    window.dispatchEvent(new CustomEvent('chopaeng_collection_updated', { detail: { collection } }));
};

export const useCollection = () => {
    const [collection, setCollection] = useState<string[]>(getStoredCollection);

    const refresh = useCallback(() => {
        setCollection(getStoredCollection());
    }, []);

    useEffect(() => {
        window.addEventListener('chopaeng_collection_updated', refresh);
        window.addEventListener('chopaeng_account_switched', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('chopaeng_collection_updated', refresh);
            window.removeEventListener('chopaeng_account_switched', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [refresh]);

    const isCollected = useCallback((id: string): boolean => {
        if (!id) return false;
        return collection.includes(id);
    }, [collection]);

    const toggleCollected = useCallback((id: string, e?: React.MouseEvent): boolean => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!id) return false;

        const current = getStoredCollection();
        let updated: string[];
        let added = false;

        if (current.includes(id)) {
            updated = current.filter((cid) => cid !== id);
            added = false;
        } else {
            updated = [id, ...current];
            added = true;
        }

        saveStoredCollection(updated);
        setCollection(updated);
        return added;
    }, []);

    const clearCollection = useCallback(() => {
        saveStoredCollection([]);
        setCollection([]);
    }, []);

    const exportCollection = useCallback((): string => {
        return JSON.stringify(getStoredCollection());
    }, []);

    const importCollection = useCallback((json: string): boolean => {
        try {
            const parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) return false;
            const validIds = parsed.filter((id: unknown) => typeof id === 'string');
            saveStoredCollection(validIds);
            setCollection(validIds);
            return true;
        } catch {
            return false;
        }
    }, []);

    return {
        collection,
        collectedCount: collection.length,
        isCollected,
        toggleCollected,
        clearCollection,
        exportCollection,
        importCollection,
    };
};
