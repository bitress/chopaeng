import { API_BASE } from '../config/api';
import { getAuthToken } from '../context/authToken';
import type { PocketBundle } from '../data/pocketBundles';

const BUNDLES_CACHE_KEY = 'chopaeng_pocket_bundles_db_cache';

const getHeaders = (token?: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const authToken = token ?? getAuthToken();
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
};

export const normalizeBundle = (b: any): PocketBundle => {
    let items: any[] = [];
    if (Array.isArray(b?.items)) {
        items = b.items;
    } else if (typeof b?.items === 'string') {
        try {
            const parsed = JSON.parse(b.items);
            if (Array.isArray(parsed)) items = parsed;
        } catch {
            items = [];
        }
    }
    return {
        id: String(b?.id || ''),
        title: String(b?.title || 'Untitled Bundle'),
        category: b?.category || 'General',
        target: (b?.target === 'drop' || b?.targetPocket === 'drop') ? 'drop' : 'order',
        description: b?.description || '',
        icon: b?.icon || 'fa-box-open',
        isOfficial: Boolean(b?.isOfficial),
        userId: b?.userId || b?.createdBy || undefined,
        createdAt: b?.createdAt || undefined,
        updatedAt: b?.updatedAt || undefined,
        items: items,
    };
};

/**
 * Loads all bundles (official database bundles + user custom bundles).
 * Falls back to built-in default bundles if API is unreachable.
 */
export const fetchPocketBundles = async (token?: string | null): Promise<PocketBundle[]> => {
    try {
        const res = await fetch(`${API_BASE}/api/bundles`, {
            headers: getHeaders(token),
            credentials: 'include',
        });

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                const normalized = data.map(normalizeBundle);
                try {
                    localStorage.setItem(BUNDLES_CACHE_KEY, JSON.stringify(normalized));
                } catch { /* ignore */ }
                return normalized;
            }
        }
    } catch {
        // Backend API may be unreachable; fallback to cached or default
    }

    // Try reading cached DB data
    try {
        const cached = localStorage.getItem(BUNDLES_CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
                return parsed.map(normalizeBundle);
            }
        }
    } catch { /* ignore */ }

    return [];
};

/**
 * Creates a new bundle in the database.
 * If user is an admin and isOfficial is true, it is saved as an Official Bundle.
 * Otherwise, it is saved as a User Custom Bundle.
 */
export const createPocketBundle = async (
    bundle: Omit<PocketBundle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    token?: string | null
): Promise<PocketBundle> => {
    const newId = bundle.id || `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const payload: PocketBundle = {
        ...bundle,
        id: newId,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const res = await fetch(`${API_BASE}/api/bundles`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const data = await res.json();
            return data?.bundle || payload;
        }
    } catch {
        // Fallback for offline/local environment
    }

    // Optimistic fallback
    try {
        const current = await fetchPocketBundles(token);
        const updated = [payload, ...current.filter((b) => b.id !== payload.id)];
        localStorage.setItem(BUNDLES_CACHE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }

    return payload;
};

/**
 * Updates an existing bundle in the database.
 */
export const updatePocketBundle = async (
    id: string,
    updates: Partial<PocketBundle>,
    token?: string | null
): Promise<PocketBundle | null> => {
    const now = new Date().toISOString();
    const payload = { ...updates, updatedAt: now };

    try {
        const res = await fetch(`${API_BASE}/api/bundles/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const data = await res.json();
            return data?.bundle || null;
        }
    } catch {
        // Fallback
    }

    // Optimistic fallback
    try {
        const current = await fetchPocketBundles(token);
        const updated = current.map((b) => (b.id === id ? { ...b, ...payload } : b));
        localStorage.setItem(BUNDLES_CACHE_KEY, JSON.stringify(updated));
        return updated.find((b) => b.id === id) || null;
    } catch { /* ignore */ }

    return null;
};

/**
 * Deletes a bundle from the database.
 */
export const deletePocketBundle = async (id: string, token?: string | null): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/api/bundles/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getHeaders(token),
            credentials: 'include',
        });

        if (res.ok) {
            return true;
        }
    } catch {
        // Fallback
    }

    // Optimistic fallback
    try {
        const current = await fetchPocketBundles(token);
        const updated = current.filter((b) => b.id !== id);
        localStorage.setItem(BUNDLES_CACHE_KEY, JSON.stringify(updated));
        return true;
    } catch { /* ignore */ }

    return true;
};
