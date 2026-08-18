import type { PocketItem } from '../hooks/useCommandBuilderPockets';

export interface SharedPocketPayload {
    name?: string;
    version: number;
    timestamp: number;
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
 * Encodes order and drop pockets into a URL-safe base64 string.
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
 * Generates the full shareable URL for the current pocket.
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
