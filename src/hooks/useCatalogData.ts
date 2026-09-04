import { useQuery } from '@tanstack/react-query';
import { loadExplorerItems } from '../data/explorerDataLoader';
import { loadVillagers } from '../data/villagerDataLoader';
import type { CatalogEntity } from '../data/commandBuilderData';

let _cachedAllCatalog: CatalogEntity[] | null = null;

export const useCatalogData = (options?: { enabled?: boolean }) => {
    return useQuery<{ items: CatalogEntity[], villagers: CatalogEntity[], all: CatalogEntity[] }>({
        queryKey: ['catalogData'],
        queryFn: async () => {
            const [items, villagers] = await Promise.all([
                loadExplorerItems(),
                loadVillagers()
            ]);
            if (!_cachedAllCatalog || _cachedAllCatalog.length !== items.length + villagers.length) {
                _cachedAllCatalog = [...items, ...villagers];
            }
            return {
                items,
                villagers,
                all: _cachedAllCatalog
            };
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
        gcTime: 1000 * 60 * 60 * 2,
        enabled: options?.enabled ?? true,
    });
};
