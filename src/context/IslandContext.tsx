import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type IslandData, type IslandStatus } from "../data/islands";

interface ApiIsland {
    id: string;
    name: string;
    cat: string;
    description: string;
    dodo_code: string;
    visitors: number;
    items: string[];
    map_url: string;
    seasonal: string;
    status: string;
    theme: string;
    type: string;
    updated_at: string;
}

interface VillagerApiResponse {
    timestamp: string;
    total_islands: number;
    islands: Record<string, string[]>;
}

interface IslandContextType {
    islands: IslandData[];
    villagersMap: Record<string, string[]>;
    loading: boolean;
    lastUpdated: number | null;
    refreshData: () => Promise<void>;
}

const IslandContext = createContext<IslandContextType | undefined>(undefined);

const STORAGE_KEY_ISLANDS = "chopaeng_islands_cache";
const STORAGE_KEY_VILLAGERS = "chopaeng_villagers_cache";
const STORAGE_KEY_TIMESTAMP = "chopaeng_cache_timestamp";

const getIslandMap = (islandName: string) => `https://cdn.chopaeng.com/maps/${islandName.toLowerCase()}.png`;

const VALID_CATS = ["public", "member"] as const;
const VALID_THEMES = ["pink", "teal", "purple", "gold"] as const;

const toIslandCat = (value: string, fallback: IslandData["cat"]): IslandData["cat"] =>
    (VALID_CATS as readonly string[]).includes(value) ? (value as IslandData["cat"]) : fallback;

const toIslandTheme = (value: string, fallback: IslandData["theme"]): IslandData["theme"] =>
    (VALID_THEMES as readonly string[]).includes(value) ? (value as IslandData["theme"]) : fallback;

export const IslandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [islands, setIslands] = useState<IslandData[]>(() => {
        const cached = sessionStorage.getItem(STORAGE_KEY_ISLANDS);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Failed to parse cached islands", e);
            }
        }
        return [];
    });

    const [villagersMap, setVillagersMap] = useState<Record<string, string[]>>(() => {
        const cached = sessionStorage.getItem(STORAGE_KEY_VILLAGERS);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Failed to parse cached villagers", e);
            }
        }
        return {};
    });

    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<number | null>(() => {
        const cached = sessionStorage.getItem(STORAGE_KEY_TIMESTAMP);
        return cached ? parseInt(cached, 10) : null;
    });

    const refreshData = useCallback(async () => {
        try {
            // 1. Fetch Island Status
            const islandRes = await fetch("https://dodo.chopaeng.com/api/islands");
            if (!islandRes.ok) throw new Error("Island API error");
            const apiData: ApiIsland[] = await islandRes.json();

            // 2. Fetch Villagers List
            const villagerRes = await fetch("https://acnh-finder.chopaeng.com/api/villagers/list");
            const villagerData: VillagerApiResponse = villagerRes.ok ? await villagerRes.json() : { islands: {} };

            // Process Island Data
            const updatedIslands: IslandData[] = apiData.map((liveData, index) => {
                let computedStatus: IslandStatus = "OFFLINE";
                const rawStatus = liveData.status ? liveData.status.toUpperCase() : "";

                if (["SUB ONLY", "PATREON"].some(k => rawStatus.includes(k))) computedStatus = "SUB ONLY";
                else if (liveData.dodo_code === "GETTIN'" || rawStatus === "REFRESHING") computedStatus = "REFRESHING";
                else if (rawStatus === "ONLINE") computedStatus = "ONLINE";

                return {
                    id: liveData.id || `island-${index}`,
                    name: liveData.name,
                    type: liveData.type,
                    items: liveData.items || [],
                    theme: toIslandTheme(liveData.theme, "teal"),
                    cat: toIslandCat(liveData.cat, "public"),
                    description: liveData.description || "",
                    seasonal: liveData.seasonal || "Year-Round",
                    status: computedStatus,
                    dodoCode: liveData.dodo_code,
                    visitors: Math.max(0, Math.min(7, liveData.visitors ?? 0)),
                    mapUrl: liveData.map_url || getIslandMap(liveData.name),
                    updatedAt: liveData.updated_at,
                };
            });

            const now = Date.now();
            setIslands(updatedIslands);
            setVillagersMap(villagerData.islands);
            setLastUpdated(now);
            setLoading(false);

            // Persist to session storage
            sessionStorage.setItem(STORAGE_KEY_ISLANDS, JSON.stringify(updatedIslands));
            sessionStorage.setItem(STORAGE_KEY_VILLAGERS, JSON.stringify(villagerData.islands));
            sessionStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());

        } catch (error) {
            console.error("Failed to refresh island data:", error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();

        let intervalId: number;

        const startPolling = () => {
            intervalId = window.setInterval(() => {
                if (document.visibilityState === "visible") {
                    refreshData();
                }
            }, 30000); // 30s poll
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Fetch immediately when coming back to tab if it's been a while
                const cachedTimestamp = sessionStorage.getItem(STORAGE_KEY_TIMESTAMP);
                const parsedTimestamp = cachedTimestamp ? parseInt(cachedTimestamp, 10) : null;
                const timeSinceLastUpdate = parsedTimestamp && !isNaN(parsedTimestamp)
                    ? Date.now() - parsedTimestamp
                    : Infinity;
                if (timeSinceLastUpdate > 25000) {
                    refreshData();
                }
                startPolling();
            } else {
                clearInterval(intervalId);
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [refreshData]);

    return (
        <IslandContext.Provider value={{ islands, villagersMap, loading, lastUpdated, refreshData }}>
            {children}
        </IslandContext.Provider>
    );
};

export const useIslandData = () => {
    const context = useContext(IslandContext);
    if (context === undefined) {
        throw new Error("useIslandData must be used within an IslandProvider");
    }
    return context;
};
