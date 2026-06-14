import type { CatalogEntity } from './commandBuilderData';
import explorerData from './explorer.json';

type VillagerJson = {
    id: string;
    name: string;
    emoji?: string;
    species?: string;
    gender?: string;
    personality?: string;
    altName?: string;
    isRestricted?: boolean;
};

const toVillagerEntity = (villager: VillagerJson): CatalogEntity => ({
    id: villager.id,
    name: villager.name,
    entityType: 'villager',
    category: villager.personality || 'Villager',
    theme: villager.species || 'Villager',
    series: 'Villager',
    interactivity: villager.gender || 'Unknown',
    colour: 'Various',
    image: `https://www.pange.ca/itemsearch/villagers/${villager.id}.png`,
    description: `Request ${villager.name}${villager.personality ? `, a ${villager.personality.toLowerCase()} ${villager.species?.toLowerCase() || 'villager'}` : ' as your requested villager'}.`,
    variations: [],
});

export const loadVillagers = (): CatalogEntity[] => {
    try {
        const data = explorerData as any;
        const villagers: VillagerJson[] = Array.isArray(data) ? data : data.villagers || [];
        return Array.isArray(villagers) ? villagers.map(toVillagerEntity) : [];
    } catch (error) {
        console.error('Failed to load villagers from explorer.json:', error);
        return [];
    }
};
