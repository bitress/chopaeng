export type ThemeMode = 'nook' | 'celeste' | 'roost';

export interface ThemeOption {
    id: ThemeMode;
    name: string;
    description: string;
    icon: string;
    badgeColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
    {
        id: 'nook',
        name: 'Nook Day',
        description: 'Classic island sand & vibrant Nook green',
        icon: 'fa-leaf',
        badgeColor: '#28a745',
    },
    {
        id: 'celeste',
        name: 'Celeste Stargazing',
        description: 'Deep midnight navy with golden starlight accents',
        icon: 'fa-star',
        badgeColor: '#c084fc',
    },
    {
        id: 'roost',
        name: 'The Roost Cozy',
        description: 'Warm espresso, rich mahogany & cafe tones',
        icon: 'fa-mug-hot',
        badgeColor: '#d4a373',
    },
];

const THEME_STORAGE_KEY = 'chopaeng_active_theme';

export const getStoredTheme = (): ThemeMode => {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (saved && (saved === 'nook' || saved === 'celeste' || saved === 'roost')) {
            return saved;
        }
    } catch {
        // Local storage inaccessible
    }
    return 'nook';
};

export const applyTheme = (theme: ThemeMode): void => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Update theme-color meta tag for browser mobile address bars
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const colorMap: Record<ThemeMode, string> = {
        nook: '#fefae0',
        celeste: '#182035',
        roost: '#26201c',
    };
    if (metaTheme) {
        metaTheme.setAttribute('content', colorMap[theme]);
    }
};

export const setStoredTheme = (theme: ThemeMode): void => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Local storage inaccessible
    }
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent('chopaeng_theme_updated', { detail: { theme } }));
};

export const initTheme = (): ThemeMode => {
    const theme = getStoredTheme();
    applyTheme(theme);
    return theme;
};
