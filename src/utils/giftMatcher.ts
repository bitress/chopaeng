import type { CatalogEntity } from '../data/commandBuilderData';

export interface GiftScore {
    item: CatalogEntity;
    score: number;
    matchedStyles: string[];
    matchedColors: string[];
}

/**
 * Score an item against a villager's style and color preferences.
 * Villagers in ACNH prefer gifts that match their style and color tastes.
 * Each matching style = 2 points, each matching color = 1 point.
 */
export const scoreGift = (
    item: CatalogEntity,
    villagerStyles: string[],
    villagerColors: string[]
): GiftScore => {
    const matchedStyles: string[] = [];
    const matchedColors: string[] = [];

    // Items have concepts/tags that may match villager styles
    const itemTags = [
        item.tag,
        item.theme,
        ...(item.variations?.map(v => v.Variation) || []),
    ].filter(Boolean).map(s => s!.toLowerCase());

    for (const style of villagerStyles) {
        if (itemTags.some(t => t.includes(style.toLowerCase()))) {
            matchedStyles.push(style);
        }
    }

    // Match colors from item and variant colors
    const itemColors = new Set<string>();
    if (item.colour) itemColors.add(item.colour.toLowerCase());
    item.variations?.forEach(v => {
        v.Colours?.forEach(c => itemColors.add(c.toLowerCase()));
    });

    for (const color of villagerColors) {
        if (itemColors.has(color.toLowerCase())) {
            matchedColors.push(color);
        }
    }

    const score = matchedStyles.length * 2 + matchedColors.length;

    return { item, score, matchedStyles, matchedColors };
};

/**
 * Find the best gift recommendations for a villager from a catalog of items.
 * Returns top N items sorted by gift score descending.
 */
export const findBestGifts = (
    items: CatalogEntity[],
    villagerStyles: string[],
    villagerColors: string[],
    limit: number = 12
): GiftScore[] => {
    if (!villagerStyles.length && !villagerColors.length) return [];

    const scored = items
        .filter(item =>
            item.entityType === 'item' &&
            !item.unorderable &&
            item.category !== 'Recipes' &&
            item.category !== 'Reactions' &&
            item.category !== 'Achievements' &&
            item.category !== 'Construction'
        )
        .map(item => scoreGift(item, villagerStyles, villagerColors))
        .filter(s => s.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            // Tie-break by sell price (higher = more appreciated in-game)
            const aSell = a.item.sell ?? 0;
            const bSell = b.item.sell ?? 0;
            return bSell - aSell;
        });

    return scored.slice(0, limit);
};

/**
 * Personality compatibility map.
 * Returns list of personality types that get along well or clash.
 */
export const PERSONALITY_COMPATIBILITY: Record<string, { friends: string[]; conflicts: string[] }> = {
    Normal: { friends: ['Lazy', 'Peppy', 'Smug', 'Snooty'], conflicts: ['Cranky'] },
    Peppy: { friends: ['Normal', 'Lazy', 'Smug', 'Jock'], conflicts: ['Snooty', 'Cranky'] },
    Lazy: { friends: ['Normal', 'Peppy', 'Smug'], conflicts: ['Jock', 'Snooty', 'Cranky'] },
    Jock: { friends: ['Peppy', 'Smug', 'Sisterly'], conflicts: ['Lazy', 'Snooty', 'Cranky'] },
    Snooty: { friends: ['Normal', 'Smug', 'Cranky'], conflicts: ['Peppy', 'Lazy', 'Jock'] },
    Cranky: { friends: ['Snooty', 'Smug', 'Sisterly'], conflicts: ['Normal', 'Peppy', 'Lazy', 'Jock'] },
    Smug: { friends: ['Normal', 'Peppy', 'Lazy', 'Snooty', 'Cranky', 'Sisterly'], conflicts: [] },
    Sisterly: { friends: ['Peppy', 'Jock', 'Cranky', 'Smug'], conflicts: ['Snooty'] },
};
