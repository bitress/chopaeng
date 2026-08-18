import { API_BASE } from '../config/api';
import { getAuthToken } from '../context/authToken';
import type { PocketItem } from '../hooks/useCommandBuilderPockets';

export interface SharedPocketPayload {
    id?: string;
    name?: string;
    version?: number;
    timestamp?: number;
    createdAt?: string;
    createdBy?: string;
    views?: number;
    orderItems: Array<{
        id: string;
        name: string;
        quantity: number;
        category?: string;
        baseId?: string | number | null;
        variantId?: string | number | null;
        variantLabel?: string | null;
        image?: string;
        entityType?: 'item' | 'villager';
    }>;
    dropItems: Array<{
        id: string;
        name: string;
        quantity: number;
        category?: string;
        baseId?: string | number | null;
        variantId?: string | number | null;
        variantLabel?: string | null;
        image?: string;
        entityType?: 'item' | 'villager';
    }>;
}

/**
 * Encodes order and drop pockets into a URL-safe base64 string (Offline / Fallback).
 */
export const encodePocketShareData = (
    orderPockets: Array<{ item: PocketItem; quantity: number }>,
    dropPockets: Array<{ item: PocketItem; quantity: number }>,
    pocketName?: string
): string => {
    const payload: SharedPocketPayload = {
        name: pocketName?.trim() || 'ACNH Pocket',
        version: 1,
        timestamp: Date.now(),
        orderItems: orderPockets.map((p) => ({
            id: p.item.id,
            name: p.item.name,
            quantity: p.quantity,
            category: p.item.category,
            baseId: p.item.baseId,
            variantId: p.item.variantId,
            variantLabel: p.item.variantLabel,
            image: p.item.image,
            entityType: p.item.entityType,
        })),
        dropItems: dropPockets.map((p) => ({
            id: p.item.id,
            name: p.item.name,
            quantity: p.quantity,
            category: p.item.category,
            baseId: p.item.baseId,
            variantId: p.item.variantId,
            variantLabel: p.item.variantLabel,
            image: p.item.image,
            entityType: p.item.entityType,
        })),
    };

    try {
        const jsonStr = JSON.stringify(payload);
        const encoded = btoa(encodeURIComponent(jsonStr));
        return encodeURIComponent(encoded);
    } catch (err) {
        console.error('Failed to encode pocket data:', err);
        return '';
    }
};

/**
 * Decodes a URL-safe base64 string into SharedPocketPayload.
 */
export const decodePocketShareData = (encodedStr: string): SharedPocketPayload | null => {
    if (!encodedStr) return null;
    try {
        const rawDecoded = decodeURIComponent(encodedStr);
        const jsonStr = decodeURIComponent(atob(rawDecoded));
        const parsed = JSON.parse(jsonStr) as SharedPocketPayload;
        if (!parsed || (!Array.isArray(parsed.orderItems) && !Array.isArray(parsed.dropItems))) {
            return null;
        }
        return parsed;
    } catch (err) {
        console.warn('Failed to decode pocket share string:', err);
        return null;
    }
};

/**
 * Saves the pocket loadout to backend database and returns a short unique link URL (e.g. ?p=abc123xy).
 * Falls back to encoded base64 URL if API is offline.
 */
export const createShortPocketShare = async (
    orderPockets: Array<{ item: PocketItem; quantity: number }>,
    dropPockets: Array<{ item: PocketItem; quantity: number }>,
    pocketName?: string
): Promise<{ id: string; url: string; isShort: boolean }> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.chopaeng.com';
    const orderItems = orderPockets.map((p) => ({
        id: p.item.id,
        name: p.item.name,
        quantity: p.quantity,
        category: p.item.category,
        baseId: p.item.baseId,
        variantId: p.item.variantId,
        variantLabel: p.item.variantLabel,
        image: p.item.image,
        entityType: p.item.entityType,
    }));
    const dropItems = dropPockets.map((p) => ({
        id: p.item.id,
        name: p.item.name,
        quantity: p.quantity,
        category: p.item.category,
        baseId: p.item.baseId,
        variantId: p.item.variantId,
        variantLabel: p.item.variantLabel,
        image: p.item.image,
        entityType: p.item.entityType,
    }));

    try {
        const token = getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/pockets/share`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: pocketName?.trim() || 'ACNH Pocket',
                orderItems,
                dropItems,
            }),
            credentials: 'include',
        });

        if (res.ok) {
            const data = await res.json();
            if (data?.id) {
                return {
                    id: data.id,
                    url: `${origin}/command-builder?p=${data.id}`,
                    isShort: true,
                };
            }
        }
    } catch (err) {
        console.warn('Backend short pocket share unavailable, using local fallback:', err);
    }

    // Fallback to local base64 URL
    const fallbackUrl = generatePocketShareUrl(orderPockets, dropPockets, pocketName);
    return {
        id: '',
        url: fallbackUrl,
        isShort: false,
    };
};

/**
 * Fetches a shared pocket from backend database by its short slug ID.
 */
export const fetchSharedPocket = async (pocketId: string): Promise<SharedPocketPayload | null> => {
    if (!pocketId) return null;
    try {
        const res = await fetch(`${API_BASE}/api/pockets/share/${encodeURIComponent(pocketId)}`, {
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            if (data && (Array.isArray(data.orderItems) || Array.isArray(data.dropItems))) {
                return data as SharedPocketPayload;
            }
        }
    } catch (err) {
        console.warn(`Failed to fetch shared pocket ${pocketId}:`, err);
    }
    return null;
};

/**
 * Generates the full shareable URL for the current pocket (fallback).
 */
export const generatePocketShareUrl = (
    orderPockets: Array<{ item: PocketItem; quantity: number }>,
    dropPockets: Array<{ item: PocketItem; quantity: number }>,
    pocketName?: string
): string => {
    const encoded = encodePocketShareData(orderPockets, dropPockets, pocketName);
    if (!encoded) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.chopaeng.com';
    return `${origin}/command-builder?pocket=${encoded}`;
};
