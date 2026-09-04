import { getUserScopedItem, setUserScopedItem } from './accountStorage';

export interface UserPreferences {
    enableSilentOrder: boolean;
    autoClearPocketsOnSend?: boolean;
    confirmBeforeSend?: boolean;
}

const PREFERENCES_STORAGE_KEY = 'chopaeng_user_preferences';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    enableSilentOrder: true,
    autoClearPocketsOnSend: false,
    confirmBeforeSend: true,
};

export const getUserPreferences = (userId?: string | null): UserPreferences => {
    try {
        const raw = getUserScopedItem(PREFERENCES_STORAGE_KEY, userId);
        if (!raw) return DEFAULT_USER_PREFERENCES;
        return {
            ...DEFAULT_USER_PREFERENCES,
            ...JSON.parse(raw),
        };
    } catch {
        return DEFAULT_USER_PREFERENCES;
    }
};

export const saveUserPreferences = (prefs: Partial<UserPreferences>, userId?: string | null): UserPreferences => {
    try {
        const current = getUserPreferences(userId);
        const updated = { ...current, ...prefs };
        setUserScopedItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated), userId);
        // Dispatch window storage event so active Command Builder tab updates instantly
        window.dispatchEvent(new Event('chopaeng_preferences_updated'));
        return updated;
    } catch {
        return DEFAULT_USER_PREFERENCES;
    }
};
