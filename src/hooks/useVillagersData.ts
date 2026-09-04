import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { loadVillagers } from '../data/villagerDataLoader';
import type { CatalogEntity } from '../data/commandBuilderData';

export interface VillagersDataResult {
    villagers: CatalogEntity[];
    isLoading: boolean;
    error: unknown;
    villagerByName: Map<string, CatalogEntity>;
    villagerById: Map<string, CatalogEntity>;
    getVillagerByName: (name: string) => CatalogEntity | undefined;
}

export const useVillagersData = (): VillagersDataResult => {
    const { data: villagers = [], isLoading, error } = useQuery<CatalogEntity[]>({
        queryKey: ['villagersOnlyData'],
        queryFn: () => loadVillagers(),
        staleTime: 1000 * 60 * 60 * 24, // Static game data, cache 24 hours
        gcTime: 1000 * 60 * 60 * 24,
    });

    const villagerByName = useMemo(() => {
        const map = new Map<string, CatalogEntity>();
        for (const v of villagers) {
            map.set(v.name.toLowerCase(), v);
        }
        return map;
    }, [villagers]);

    const villagerById = useMemo(() => {
        const map = new Map<string, CatalogEntity>();
        for (const v of villagers) {
            map.set(v.id.toLowerCase(), v);
        }
        return map;
    }, [villagers]);

    const getVillagerByName = useMemo(() => {
        return (name: string) => villagerByName.get(name.toLowerCase());
    }, [villagerByName]);

    return {
        villagers,
        isLoading,
        error,
        villagerByName,
        villagerById,
        getVillagerByName,
    };
};
