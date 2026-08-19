import type { PocketBundleItem } from '../data/pocketBundles';

export type LoadoutCategory =
    | 'All'
    | 'Starter Kits'
    | 'Aesthetic & Themes'
    | 'Wealth & Currencies'
    | 'Materials & DIY'
    | 'Seasonal & Events'
    | 'Villager Dreamies'
    | 'Custom Builds';

export interface CommunityLoadout {
    id: string;
    shortCode: string;
    name: string;
    description: string;
    category: LoadoutCategory;
    tags: string[];
    orderItems: PocketBundleItem[];
    dropItems: PocketBundleItem[];
    author: string;
    authorAvatar?: string;
    userId?: string;
    upvotes: number;
    views: number;
    isOfficial?: boolean;
    hasUpvoted?: boolean;
    createdAt: string;
    updatedAt: string;
}
