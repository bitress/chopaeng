import type { PocketBundleItem } from '../data/pocketBundles';
import type { PocketEntry } from '../hooks/useCommandBuilderPockets';
import { API_BASE } from '../config/api';

export interface LocalPreset {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    orderItems: PocketBundleItem[];
    dropItems: PocketBundleItem[];
    createdAt: string;
    updatedAt: string;
}

const LOCAL_PRESETS_KEY = 'chopaeng_local_preset_vault_v1';

const getHeaders = (token?: string | null): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const getLocalPresets = (): LocalPreset[] => {
    try {
        const stored = localStorage.getItem(LOCAL_PRESETS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // Ignore JSON error
    }
    return [];
};

/**
 * Fetches user presets from backend database and merges with local storage.
 */
export const syncUserPresetsFromBackend = async (token?: string | null): Promise<LocalPreset[]> => {
    const local = getLocalPresets();
    try {
        const res = await fetch(`${API_BASE}/api/user/presets`, {
            headers: getHeaders(token),
            credentials: 'include',
        });
        if (res.ok) {
            const serverPresets: LocalPreset[] = await res.json();
            if (Array.isArray(serverPresets)) {
                // Merge server and local presets by id
                const presetMap = new Map<string, LocalPreset>();
                for (const p of serverPresets) presetMap.set(p.id, p);
                for (const p of local) {
                    if (!presetMap.has(p.id)) presetMap.set(p.id, p);
                }
                const merged = Array.from(presetMap.values());
                try {
                    localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(merged));
                } catch {
                    // Ignore
                }
                return merged;
            }
        }
    } catch {
        // Fallback to local
    }
    return local;
};

export const saveLocalPreset = async (
    title: string,
    orderPockets: PocketEntry[],
    dropPockets: PocketEntry[],
    description: string = '',
    category: string = 'Custom Builds',
    tags: string[] = [],
    token?: string | null
): Promise<LocalPreset> => {
    const id = `local-preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const orderItems: PocketBundleItem[] = orderPockets.map((p) => ({
        itemId: String(p.item.baseId || p.item.id),
        name: p.item.name,
        quantity: p.quantity,
        category: p.item.category,
        variantId: p.item.variantId !== undefined && p.item.variantId !== null ? String(p.item.variantId) : undefined,
        variantLabel: p.item.variantLabel || undefined,
        image: p.item.image,
    }));

    const dropItems: PocketBundleItem[] = (dropPockets || []).map((p) => ({
        itemId: String(p.item.baseId || p.item.id),
        name: p.item.name,
        quantity: p.quantity,
        category: p.item.category,
        variantId: p.item.variantId !== undefined && p.item.variantId !== null ? String(p.item.variantId) : undefined,
        variantLabel: p.item.variantLabel || undefined,
        image: p.item.image,
    }));

    const newPreset: LocalPreset = {
        id,
        title: title.trim() || 'Untitled Preset',
        description: description.trim(),
        category,
        tags: tags.length > 0 ? tags : ['vault', 'local'],
        orderItems,
        dropItems,
        createdAt: now,
        updatedAt: now,
    };

    // Save locally
    const current = getLocalPresets();
    const updated = [newPreset, ...current.filter((p) => p.id !== id)];
    try {
        localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(updated));
    } catch {
        // Ignore
    }

    // Sync to backend asynchronously
    try {
        fetch(`${API_BASE}/api/user/presets`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify(newPreset),
        }).catch(() => {});
    } catch {
        // Ignore
    }

    return newPreset;
};

export const deleteLocalPreset = async (id: string, token?: string | null): Promise<void> => {
    const current = getLocalPresets();
    const updated = current.filter((p) => p.id !== id);
    try {
        localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(updated));
    } catch {
        // Ignore
    }

    // Delete on backend
    try {
        fetch(`${API_BASE}/api/user/presets/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getHeaders(token),
            credentials: 'include',
        }).catch(() => {});
    } catch {
        // Ignore
    }
};

export const updateLocalPresetTitle = (id: string, newTitle: string): void => {
    const current = getLocalPresets();
    const updated = current.map((p) => (p.id === id ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p));
    try {
        localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(updated));
    } catch {
        // Ignore
    }
};
