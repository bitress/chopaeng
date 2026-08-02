import { useQuery } from '@tanstack/react-query';
import { loadExplorerItems } from '../data/explorerDataLoader';
import { loadVillagers } from '../data/villagerDataLoader';
import type { CatalogEntity } from '../data/commandBuilderData';

export const useCatalogData = () => {
    return useQuery<{ items: CatalogEntity[], villagers: CatalogEntity[], all: CatalogEntity[] }>({
        queryKey: ['catalogData'],
        queryFn: async () => {
            const [items, villagers] = await Promise.all([
                loadExplorerItems(),
                loadVillagers()
            ]);
            return {
                items,
                villagers,
                all: [...items, ...villagers]
            };
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });
};
