import type { CatalogEntity } from './commandBuilderData';

let _cachedVillagers: CatalogEntity[] | null = null;

export const loadVillagers = async (): Promise<CatalogEntity[]> => {
    if (_cachedVillagers) {
        return _cachedVillagers;
    }

    try {
        const [villagersMod, npcsMod] = await Promise.all([
            import('@bitress/animal-crossing/lib/data/Villagers.json'),
            import('@bitress/animal-crossing/lib/data/NPCs.json'),
        ]);
        const villagers = (villagersMod.default || villagersMod) as any[];
        const npcs = (npcsMod.default || npcsMod) as any[];

        const allCharacters: CatalogEntity[] = [];

        // 1. Standard Island Villagers (413 - Orderable/Injectable with filename ID: e.g. cat23 for Raymond)
        if (Array.isArray(villagers)) {
            for (const v of villagers) {
                const villagerId = v.filename || v.catchphrases?.id || v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const primaryImage = v.iconImage || v.photoImage || `https://acnhcdn.com/latest/NpcIcon/${v.filename}.png`;

                allCharacters.push({
                    id: villagerId,
                    name: v.name,
                    entityType: 'villager',
                    category: v.personality ? String(v.personality) : 'Villager',
                    theme: v.species ? String(v.species) : 'Villager',
                    series: 'Villager',
                    interactivity: v.gender ? String(v.gender) : 'Unknown',
                    colour: v.colors?.[0] ? String(v.colors[0]) : 'Various',
                    image: primaryImage,
                    description: `Adopt ${v.name}, a ${v.personality?.toLowerCase() || 'wonderful'} ${v.species?.toLowerCase() || 'villager'} for your island. Favorite saying: "${v.favoriteSaying || v.catchphrase || 'Hello!'}".`,
                    variations: [],
                    personality: v.personality ? String(v.personality) : undefined,
                    unorderable: false,
                    species: v.species ? String(v.species) : undefined,
                    gender: v.gender ? String(v.gender) : undefined,
                    birthday: v.birthday ? String(v.birthday) : undefined,
                    hobby: v.hobby ? String(v.hobby) : undefined,
                    subtype: v.subtype ? String(v.subtype) : undefined,
                    favoriteSaying: v.favoriteSaying ? String(v.favoriteSaying) : undefined,
                    favoriteSong: v.favoriteSong ? String(v.favoriteSong) : undefined,
                    defaultClothing: v.defaultClothing ? String(v.defaultClothing) : undefined,
                    wallpaper: v.wallpaper ? String(v.wallpaper) : undefined,
                    flooring: v.flooring ? String(v.flooring) : undefined,
                    furnitureNameList: Array.isArray(v.furnitureNameList) ? v.furnitureNameList : [],
                    styles: Array.isArray(v.styles) ? v.styles.map(String) : [],
                    favoriteColors: Array.isArray(v.colors) ? v.colors.map(String) : [],
                    houseImage: v.houseImage || undefined,
                    photoImage: v.photoImage || undefined,
                });
            }
        }

        // 2. Special NPCs (65 - Reference only, unorderable)
        if (Array.isArray(npcs)) {
            for (const npc of npcs) {
                const npcInternalId = npc.npcId || npc.iconFilename || npc.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const primaryImage = npc.iconImage || npc.photoImage || `https://acnhcdn.com/latest/NpcIcon/${npc.iconFilename || npc.npcId}.png`;

                allCharacters.push({
                    id: npcInternalId,
                    name: npc.name,
                    entityType: 'villager',
                    category: 'Special NPC',
                    theme: 'NPC',
                    series: 'Special NPC',
                    interactivity: npc.gender ? String(npc.gender) : 'Special',
                    colour: npc.nameColor ? String(npc.nameColor) : 'Gold',
                    image: primaryImage,
                    description: `${npc.name} is a special character in Animal Crossing: New Horizons (Birthday: ${npc.birthday || 'N/A'}).`,
                    variations: [],
                    personality: 'Special NPC',
                    unorderable: true,
                    gender: npc.gender ? String(npc.gender) : undefined,
                    birthday: npc.birthday ? String(npc.birthday) : undefined,
                    photoImage: npc.photoImage || undefined,
                });
            }
        }

        _cachedVillagers = allCharacters;
        return allCharacters;
    } catch (error) {
        console.error('Failed to load villagers from @bitress/animal-crossing:', error);
        return [];
    }
};
