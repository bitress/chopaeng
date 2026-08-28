/**
 * PocketBundleItem uses the explorer.json "Internal ID" (hex string) as itemId,
 * and optionally the variation "id" field as variantId (e.g. "0_0" for primary=0,secondary=0).
 * These are fed directly into generateFullItemHex(pokerId, variantId, category).
 */
export interface PocketBundleItem {
    /** Explorer.json "Internal ID" hex string (e.g. "14BB") — also the pokerId for no-variant items */
    itemId: string;
    name: string;
    quantity: number;
    category?: string;
    entityType?: 'item' | 'villager';
    /** Variation id string like "0_0", "1_0", or "NA" — used for generateFullItemHex */
    variantId?: string;
    variantLabel?: string;
    image?: string;
}

export type PocketBundleCategory =
    | 'All'
    | 'Popular'
    | 'Wealth'
    | 'Tools & Materials'
    | 'Seasonal'
    | 'Aesthetic'
    | 'Custom';

export interface PocketBundle {
    id: string;
    userId?: string | null;
    title: string;
    description: string;
    category: PocketBundleCategory;
    icon: string;
    target: 'order' | 'drop';
    isOfficial?: boolean;
    sortOrder?: number;
    items: PocketBundleItem[];
    createdAt?: string;
    updatedAt?: string;
}
