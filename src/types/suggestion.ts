export type SuggestionCategory =
    | 'feature'
    | 'island'
    | 'bot'
    | 'bug'
    | 'general';

export interface SuggestionCategoryMeta {
    id: SuggestionCategory;
    name: string;
    icon: string;
    color: string;
    discordColor: number;
    placeholder: string;
    badgeText: string;
    description: string;
}

export const SUGGESTION_CATEGORIES: Record<SuggestionCategory, SuggestionCategoryMeta> = {
    feature: {
        id: 'feature',
        name: 'Feature Request',
        icon: 'fa-wand-magic-sparkles',
        color: '#10b981', // Emerald
        discordColor: 0x10b981,
        placeholder: 'What cool feature or tool would you like to see added to Chopaeng?',
        badgeText: '💡 Feature',
        description: 'New website tools, Command Builder features, or UI improvements',
    },
    island: {
        id: 'island',
        name: 'Island & Item Ideas',
        icon: 'fa-umbrella-beach',
        color: '#f59e0b', // Amber / Gold
        discordColor: 0xf59e0b,
        placeholder: 'What new island theme, DIY set, or item collections should we host?',
        badgeText: '🏝️ Island',
        description: 'New treasure island themes, item sets, or villager requests',
    },
    bot: {
        id: 'bot',
        name: 'Order Bot & Dodo',
        icon: 'fa-robot',
        color: '#3b82f6', // Blue
        discordColor: 0x3b82f6,
        placeholder: 'Suggestions for the Order Bot, queue management, or Dodo experience...',
        badgeText: '🤖 Bot & Dodo',
        description: 'Queue experience, delivery commands, or bot interactions',
    },
    bug: {
        id: 'bug',
        name: 'Bug / Issue Report',
        icon: 'fa-bug',
        color: '#ef4444', // Red
        discordColor: 0xef4444,
        placeholder: 'Describe what happened, the expected behavior, and steps to reproduce...',
        badgeText: '🐛 Bug Report',
        description: 'Broken buttons, layout glitches, or unexpected errors',
    },
    general: {
        id: 'general',
        name: 'General Feedback',
        icon: 'fa-heart',
        color: '#ec4899', // Pink
        discordColor: 0xec4899,
        placeholder: 'Share your thoughts, suggestions, or words of encouragement for the team!',
        badgeText: '💬 Feedback',
        description: 'Thoughts, praise, or general suggestions for Kuya Cho & staff',
    },
};

export interface SuggestionFormData {
    category: SuggestionCategory;
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
