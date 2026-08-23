export interface SuggestionFormData {
    title: string;
    description: string;
    discordUsername?: string;
    inGameName?: string;
    islandName?: string;
    pageUrl?: string;
}

export interface SuggestionSendResult {
    success: boolean;
    error?: string;
    cooldownSeconds?: number;
}
