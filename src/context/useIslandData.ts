import { useContext } from "react";
import { IslandContext } from "./islandContextShared";

export const useIslandData = () => {
    const context = useContext(IslandContext);
    if (context === undefined) {
        throw new Error("useIslandData must be used within an IslandProvider");
    }
    return context;
};