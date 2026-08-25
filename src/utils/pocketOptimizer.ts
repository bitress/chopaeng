import type { PocketEntry, PocketItem } from '../hooks/useCommandBuilderPockets';

// Known stack limits in ACNH
export const STACK_30_KEYWORDS = [
    'wood', 'hardwood', 'softwood', 'iron nugget', 'clay', 'stone',
    'star fragment', 'large star fragment', 'gold nugget', 'bamboo piece',
    'young spring bamboo', 'acorn', 'pine cone', 'snowflake', 'large snowflake',
    'maple leaf', 'cherry-blossom petal', 'pearl', 'skinny mushroom',
    'round mushroom', 'flat mushroom', 'rare mushroom', 'elegant mushroom',
    'ornament', 'tree branch', 'weed', 'clump of weeds', 'wasp nest',
    'summer shell', 'conch', 'coral', 'cowrie', 'giant clam', 'sand dollar',
    'sea snail', 'venus comb', 'manila clam', 'clay'
];

export const STACK_10_KEYWORDS = [
    'nook miles ticket', 'fish bait', 'customization kit', 'bell voucher',
    'saharah ticket', 'tailors ticket', 'wrapping paper', 'pitfall seed',
    'party popper', 'firework', 'sparkler', 'fountain firework',
    'bubble blower', 'medicine', 'seed', 'bush start', 'sapling', 'cedar sapling'
];

export const FILLER_PRESETS: Record<string, { id: string; name: string; icon: string; category: string; maxStack: number }> = {
    nmt: {
        id: '16DB',
        name: 'Nook Miles Ticket',
        icon: 'https://www.pange.ca/itemsearch/items/img/MilePlaneTicket.png',
        category: 'Currency',
        maxStack: 10,
    },
    crowns: {
        id: '14BB',
        name: 'Royal Crown',
        icon: 'https://www.pange.ca/itemsearch/items/img/CapHatCrownRed.png',
        category: 'Clothing',
        maxStack: 1,
    },
    bells: {
        id: '08A4',
        name: '99,000 Bells',
        icon: 'https://www.pange.ca/itemsearch/items/img/1000Bell.png',
        category: 'Currency',
        maxStack: 1,
    },
    gold: {
        id: '08BE',
        name: 'Gold Nugget',
        icon: 'https://www.pange.ca/itemsearch/items/img/DIYGold.png',
        category: 'Materials',
        maxStack: 30,
    },
};

export const BUFFER_PRESETS = FILLER_PRESETS;

/**
 * Returns the maximum stack size for a given item name/category.
 */
export const getItemMaxStack = (item: PocketItem): number => {
    if (item.entityType === 'villager') return 1;
    const nameLower = (item.name || '').toLowerCase();
    const categoryLower = (item.category || '').toLowerCase();

    if (categoryLower.includes('material') || STACK_30_KEYWORDS.some(k => nameLower.includes(k))) {
        return 30;
    }
    if (categoryLower.includes('currency') || STACK_10_KEYWORDS.some(k => nameLower.includes(k))) {
        return 10;
    }
    if (nameLower.includes('99,000 bells') || nameLower.includes('crown')) {
        return 1;
    }
    return 1;
};

/**
 * Maximizes the stack sizes of stackable items in the pocket while respecting maximum capacity.
 */
export const maximizePocketStacks = (
    entries: PocketEntry[],
    maxCapacity: number = 40
): PocketEntry[] => {
    const currentTotal = entries.reduce((sum, e) => sum + (e.item.entityType === 'villager' ? 1 : e.quantity), 0);
    let remainingCapacity = maxCapacity - currentTotal;
    if (remainingCapacity <= 0) {
        return entries.map(e => e.item.entityType === 'villager' ? { ...e, quantity: 1 } : e);
    }

    return entries.map((entry) => {
        if (entry.item.entityType === 'villager') {
            return { ...entry, quantity: 1 };
        }
        const itemMax = getItemMaxStack(entry.item);
        if (itemMax <= 1 || entry.quantity >= itemMax || remainingCapacity <= 0) {
            return entry;
        }

        const needed = itemMax - entry.quantity;
        const addAmount = Math.min(needed, remainingCapacity);
        remainingCapacity -= addAmount;

        return {
            ...entry,
            quantity: entry.quantity + addAmount,
        };
    });
};

/**
 * Fills remaining empty slots up to maxCapacity with the chosen buffer or pattern.
 */
export const fillRemainingPockets = (
    entries: PocketEntry[],
    type: 'nmt' | 'crowns' | 'bells' | 'gold' | 'repeat',
    maxCapacity: number = 40
): PocketEntry[] => {
    const currentTotal = entries.reduce((sum, e) => sum + (e.item.entityType === 'villager' ? 1 : e.quantity), 0);
    const remaining = maxCapacity - currentTotal;
    if (remaining <= 0) return entries;

    if (type === 'repeat') {
        const repeatableEntries = entries.filter(e => e.item.entityType !== 'villager');
        if (repeatableEntries.length === 0) return entries;
        const newEntries = entries.map(e => e.item.entityType === 'villager' ? { ...e, quantity: 1 } : { ...e });
        let added = 0;
        let idx = 0;
        while (added < remaining) {
            const sourceEntry = repeatableEntries[idx % repeatableEntries.length];
            const targetIdx = newEntries.findIndex(e => e.item.id === sourceEntry.item.id);
            if (targetIdx >= 0) {
                newEntries[targetIdx] = {
                    ...newEntries[targetIdx],
                    quantity: newEntries[targetIdx].quantity + 1,
                };
            } else {
                newEntries.push({ item: sourceEntry.item, quantity: 1 });
            }
            added++;
            idx++;
        }
        return newEntries;
    }

    const preset = BUFFER_PRESETS[type];
    if (!preset) return entries;

    const bufferItem: PocketItem = {
        id: preset.id,
        entityType: 'item',
        name: preset.name,
        category: preset.category,
        theme: 'Buffer',
        series: 'Buffer',
        interactivity: 'Consumable',
        colour: 'Various',
        image: preset.icon,
        description: `${preset.name} filler`,
        baseId: preset.id,
    };

    const newEntries = [...entries];
    const existingIdx = newEntries.findIndex(e => e.item.id === preset.id);
    if (existingIdx >= 0) {
        newEntries[existingIdx] = {
            ...newEntries[existingIdx],
            quantity: newEntries[existingIdx].quantity + remaining,
        };
    } else {
        newEntries.push({ item: bufferItem, quantity: remaining });
    }

    return newEntries;
};

/**
 * Sorts pocket entries by logical category.
 */
const CATEGORY_ORDER: Record<string, number> = {
    'Tools': 1,
    'Materials': 2,
    'Currency': 3,
    'Furniture': 4,
    'Housewares': 4,
    'Miscellaneous': 5,
    'Wall-mounted': 6,
    'Ceiling Decor': 7,
    'Clothing': 8,
    'Tops': 8,
    'Bottoms': 8,
    'Dress-Up': 8,
    'Headwear': 8,
    'Accessories': 8,
    'Shoes': 8,
    'Recipes': 9,
    'DIY': 9,
    'Villagers': 10,
};

export const sortPocketEntries = (entries: PocketEntry[]): PocketEntry[] => {
    return [...entries].sort((a, b) => {
        const catA = CATEGORY_ORDER[a.item.category] || 50;
        const catB = CATEGORY_ORDER[b.item.category] || 50;
        if (catA !== catB) return catA - catB;
        return (a.item.name || '').localeCompare(b.item.name || '');
    });
};

/**
 * Known DIY Crafting Recipes ingredient mappings.
 */
export interface RecipeIngredient {
    id: string;
    name: string;
    quantity: number;
    image: string;
}

export const POPULAR_DIY_RECIPES: Record<string, RecipeIngredient[]> = {
    'Ironwood Dresser': [
        { id: '08B6', name: 'Wood', quantity: 7, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodNormal.png' },
        { id: '08BD', name: 'Iron Nugget', quantity: 4, image: 'https://www.pange.ca/itemsearch/items/img/DIYIron.png' },
    ],
    'Cutting Board': [
        { id: '08B8', name: 'Hardwood', quantity: 2, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodHard.png' },
        { id: '08BD', name: 'Iron Nugget', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/DIYIron.png' },
    ],
    'Ironwood Kitchenette': [
        { id: '08B6', name: 'Wood', quantity: 4, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodNormal.png' },
        { id: '08BD', name: 'Iron Nugget', quantity: 3, image: 'https://www.pange.ca/itemsearch/items/img/DIYIron.png' },
        { id: '08B8', name: 'Hardwood', quantity: 2, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodHard.png' },
    ],
    'Mush Lamp': [
        { id: '0D33', name: 'Skinny Mushroom', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/MushSlender.png' },
        { id: '08BC', name: 'Clay', quantity: 5, image: 'https://www.pange.ca/itemsearch/items/img/DIYClay.png' },
    ],
    'Nova Light': [
        { id: '08C0', name: 'Star Fragment', quantity: 5, image: 'https://www.pange.ca/itemsearch/items/img/Starpiece.png' },
    ],
    'Crescent-Moon Chair': [
        { id: '08C0', name: 'Star Fragment', quantity: 7, image: 'https://www.pange.ca/itemsearch/items/img/Starpiece.png' },
        { id: '08C1', name: 'Large Star Fragment', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/StarpieceRare.png' },
    ],
    'Moon': [
        { id: '08C0', name: 'Star Fragment', quantity: 15, image: 'https://www.pange.ca/itemsearch/items/img/Starpiece.png' },
        { id: '08C1', name: 'Large Star Fragment', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/StarpieceRare.png' },
    ],
    'Golden Axe': [
        { id: '08BE', name: 'Gold Nugget', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/DIYGold.png' },
        { id: '08B6', name: 'Wood', quantity: 3, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodNormal.png' },
    ],
    'Golden Watering Can': [
        { id: '08BE', name: 'Gold Nugget', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/DIYGold.png' },
        { id: '08BD', name: 'Iron Nugget', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/DIYIron.png' },
    ],
    'Golden Shovel': [
        { id: '08BE', name: 'Gold Nugget', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/DIYGold.png' },
        { id: '08BD', name: 'Iron Nugget', quantity: 1, image: 'https://www.pange.ca/itemsearch/items/img/DIYIron.png' },
    ],
    'Decoy Duck': [
        { id: '08B7', name: 'Softwood', quantity: 4, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodSoft.png' },
    ],
    'Garden Wagon': [
        { id: '08B6', name: 'Wood', quantity: 8, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodNormal.png' },
        { id: '08BD', name: 'Iron Nugget', quantity: 2, image: 'https://www.pange.ca/itemsearch/items/img/DIYIron.png' },
    ],
    'Tiny Library': [
        { id: '08B6', name: 'Wood', quantity: 5, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodNormal.png' },
    ],
    'Beehive': [
        { id: '08B6', name: 'Wood', quantity: 3, image: 'https://www.pange.ca/itemsearch/items/img/DIYWoodNormal.png' },
        { id: '08BB', name: 'Wasp Nest', quantity: 5, image: 'https://www.pange.ca/itemsearch/items/img/Honeycomb.png' },
    ],
};

/**
 * Look up ingredients for a given recipe name.
 */
export const findRecipeIngredients = (recipeName: string): RecipeIngredient[] | null => {
    const clean = recipeName.replace(/^diy\s+recipe\s*:\s*/i, '').trim();
    return POPULAR_DIY_RECIPES[clean] || null;
};
