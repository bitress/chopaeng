export type IslandCategory = "public" | "member";
export type IslandTheme = "pink" | "teal" | "purple" | "gold";
export type IslandStatus = "ONLINE" | "SUB ONLY" | "REFRESHING" | "OFFLINE";

export interface IslandData {
    id: string;
    name: string;
    type: string;
    items: string[];
    theme: IslandTheme;
    cat: IslandCategory;
    description: string;
    seasonal: string;

    dodoCode?: string;
    status: IslandStatus;
    discordBotOnline?: boolean;
    visitors: number;
    mapUrl?: string;
    updatedAt?: string;
}
