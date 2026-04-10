import { createContext } from "react";
import { type IslandData } from "../data/islands";

export interface IslandContextType {
    islands: IslandData[];
    villagersMap: Record<string, string[]>;
    loading: boolean;
    lastUpdated: number | null;
    refreshData: () => Promise<void>;
}

export const IslandContext = createContext<IslandContextType | undefined>(undefined);