export interface CommandBuilderViewState {
    category: string;
    theme: string;
    series: string;
    interactivity: string;
    colour: string;
    kindFilter: string;
    villagerType: string;
    hideVariants: boolean;
    compactMode: boolean;
    searchInput: string;
    debouncedSearch: string;
    currentPage: number;
    scrollY?: number;
    lastViewedItemId?: string | null;
}

const STORAGE_KEY = 'command_builder_view_state';

export const saveCommandBuilderState = (state: Partial<CommandBuilderViewState>): void => {
    try {
        const existing = getSavedCommandBuilderState();
        const updated = {
            ...existing,
            ...state,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
        console.warn('Failed to save command builder view state to sessionStorage', err);
    }
};

export const getSavedCommandBuilderState = (): CommandBuilderViewState | null => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CommandBuilderViewState;
    } catch (err) {
        console.warn('Failed to retrieve command builder view state', err);
        return null;
    }
};

export const clearCommandBuilderPosition = (): void => {
    try {
        const existing = getSavedCommandBuilderState();
        if (existing) {
            delete existing.scrollY;
            delete existing.lastViewedItemId;
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        }
    } catch (err) {
        console.warn('Failed to clear command builder position in sessionStorage', err);
    }
};

export const clearCommandBuilderState = (): void => {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.warn('Failed to clear command builder view state in sessionStorage', err);
    }
};
