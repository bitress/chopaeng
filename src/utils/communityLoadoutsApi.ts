import { API_BASE } from '../config/api';
import { getAuthToken } from '../context/authToken';
import type { CommunityLoadout } from '../types/pocketLoadout';

const UPVOTES_STORAGE_KEY = 'chopaeng_user_upvoted_loadouts';

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

const generateShortCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CHOP-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * Loads all community loadouts directly from the backend database.
 */
export const fetchCommunityLoadouts = async (token?: string | null): Promise<CommunityLoadout[]> => {
    try {
        const res = await fetch(`${API_BASE}/api/loadouts`, {
            headers: getHeaders(token),
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                return data;
            }
        }
    } catch {
        // Backend API unreachable or loading error
    }

    return [];
};

/**
 * Fetch a specific community loadout by short code or ID from backend.
 */
export const fetchLoadoutByCode = async (
    codeOrId: string,
    token?: string | null
): Promise<CommunityLoadout | null> => {
    const cleanCode = codeOrId.trim().toUpperCase();

    try {
        const res = await fetch(`${API_BASE}/api/loadouts/code/${encodeURIComponent(cleanCode)}`, {
            headers: getHeaders(token),
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            if (data?.loadout) return data.loadout;
            if (data?.id) return data;
        }
    } catch {
        // Error or not found
    }

    return null;
};

/**
 * Save a new loadout to the backend database.
 */
export const saveCommunityLoadout = async (
    loadout: Omit<CommunityLoadout, 'id' | 'shortCode' | 'upvotes' | 'views' | 'createdAt' | 'updatedAt'> & { id?: string; shortCode?: string },
    token?: string | null
): Promise<CommunityLoadout> => {
    const id = loadout.id || `loadout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const shortCode = loadout.shortCode || generateShortCode();
    const now = new Date().toISOString();

    const fullLoadout: CommunityLoadout = {
        ...loadout,
        id,
        shortCode,
        upvotes: 0,
        views: 1,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const res = await fetch(`${API_BASE}/api/loadouts`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify(fullLoadout),
        });
        if (res.ok) {
            const data = await res.json();
            return data.loadout || fullLoadout;
        }
    } catch {
        // Error handling
    }

    return fullLoadout;
};

/**
 * Toggle upvote for a community loadout on the backend database.
 */
export const upvoteCommunityLoadout = async (
    id: string,
    token?: string | null
): Promise<{ success: boolean; newCount: number; upvoted: boolean }> => {
    try {
        const res = await fetch(`${API_BASE}/api/loadouts/${encodeURIComponent(id)}/upvote`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            const upvoted = Boolean(data.upvoted);
            const newCount = typeof data.upvotes === 'number' ? data.upvotes : 0;

            // Sync with local cache
            try {
                const stored = localStorage.getItem(UPVOTES_STORAGE_KEY);
                let ids: string[] = stored ? JSON.parse(stored) : [];
                if (upvoted) {
                    if (!ids.includes(id)) ids.push(id);
                } else {
                    ids = ids.filter((x) => x !== id);
                }
                localStorage.setItem(UPVOTES_STORAGE_KEY, JSON.stringify(ids));
            } catch {
                // Ignore
            }

            return { success: true, newCount, upvoted };
        }
    } catch {
        // Error handling
    }

    return { success: false, newCount: 0, upvoted: false };
};

/**
 * Check if the user has upvoted a loadout in this session/browser.
 */
export const isLoadoutUpvoted = (id: string, serverHasUpvoted?: boolean): boolean => {
    if (typeof serverHasUpvoted === 'boolean') {
        return serverHasUpvoted;
    }
    try {
        const stored = localStorage.getItem(UPVOTES_STORAGE_KEY);
        if (stored) {
            const ids: string[] = JSON.parse(stored);
            return ids.includes(id);
        }
    } catch {
        // Ignore
    }
    return false;
};
