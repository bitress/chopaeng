import { API_BASE } from '../config/api';
import { getAuthToken } from '../context/authToken';
import type { PocketBundle, PocketBundleItem } from '../data/pocketBundles';

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

const parseItemsList = (raw: any): PocketBundleItem[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

export const normalizeBundle = (b: any): PocketBundle => {
    const title = String(b?.title || b?.name || 'Untitled Bundle');
    const orderItems = parseItemsList(b?.orderItems || b?.order_items);
    const dropItems = parseItemsList(b?.dropItems || b?.drop_items);
    const genericItems = parseItemsList(b?.items);

    let target: 'order' | 'drop' = 'order';
    if (b?.target === 'drop' || b?.targetPocket === 'drop') {
        target = 'drop';
    } else if (dropItems.length > 0 && orderItems.length === 0) {
        target = 'drop';
    }

    let items: PocketBundleItem[] = [];
    if (genericItems.length > 0) {
        items = genericItems;
    } else if (target === 'drop') {
        items = dropItems.length > 0 ? dropItems : orderItems;
    } else {
        items = orderItems.length > 0 ? orderItems : dropItems;
    }

    // Clean and normalize each item
    const normalizedItems: PocketBundleItem[] = items.map((item: any) => ({
        itemId: String(item.itemId || item.id || item.item_id || 'item'),
        name: String(item.name || item.itemName || `Item ${item.itemId || ''}`),
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        category: String(item.category || 'General'),
        variantId: item.variantId !== undefined ? String(item.variantId) : undefined,
        variantLabel: item.variantLabel ? String(item.variantLabel) : undefined,
        image: item.image || undefined,
    }));

    return {
        id: String(b?.id || `bundle-${Date.now()}`),
        title,
        category: b?.category || 'General',
        target,
        description: b?.description || '',
        icon: b?.icon || 'fa-box-open',
        isOfficial: Boolean(b?.isOfficial ?? b?.is_official),
        userId: b?.userId || b?.createdBy || b?.created_by || undefined,
        createdAt: b?.createdAt || b?.created_at || undefined,
        updatedAt: b?.updatedAt || b?.updated_at || undefined,
        items: normalizedItems,
    };
};

/**
 * Loads all bundles directly from the database API.
 * No hardcoded or mock fallbacks are used.
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
                return data.map(normalizeBundle);
            }
        }
    } catch (err) {
        console.warn('Error fetching pocket bundles from database:', err);
    }

    return [];
};

/**
 * Creates a new bundle in the database.
 */
export const createPocketBundle = async (
    bundle: Omit<PocketBundle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    token?: string | null
): Promise<PocketBundle> => {
    const newId = bundle.id || `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const title = bundle.title || 'Untitled Bundle';
    const items = bundle.items || [];
    const target = bundle.target || 'order';

    const orderItems = target === 'drop' ? [] : items;
    const dropItems = target === 'drop' ? items : [];

    const payload = {
        id: newId,
        name: title,
        title,
        description: bundle.description || '',
        category: bundle.category || 'General',
        icon: bundle.icon || 'fa-box-open',
        isOfficial: Boolean(bundle.isOfficial),
        target,
        items,
        orderItems,
        dropItems,
        userId: bundle.userId,
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
            return normalizeBundle(data?.bundle || payload);
        }
    } catch (err) {
        console.error('Failed to create bundle in database:', err);
    }

    return normalizeBundle(payload);
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
    const title = updates.title;
    const items = updates.items;
    const target = updates.target;

    const payload: Record<string, any> = {
        ...updates,
        updatedAt: now,
    };

    if (title !== undefined) {
        payload.name = title;
        payload.title = title;
    }

    if (items !== undefined) {
        payload.items = items;
        if (target === 'drop') {
            payload.dropItems = items;
            payload.orderItems = [];
        } else {
            payload.orderItems = items;
            payload.dropItems = [];
        }
    }

    try {
        const res = await fetch(`${API_BASE}/api/bundles/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const data = await res.json();
            return normalizeBundle(data?.bundle || payload);
        }
    } catch (err) {
        console.error('Failed to update bundle in database:', err);
    }

    return normalizeBundle({ id, ...payload });
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

        return res.ok;
    } catch (err) {
        console.error('Failed to delete bundle from database:', err);
        return false;
    }
};
