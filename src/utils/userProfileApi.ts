import { getAuthToken } from '../context/authToken';
import { DODO_API_BASE } from '../config/api';
import { getUserScopedItem, setUserScopedItem } from './accountStorage';

export interface PublicPassportData {
    username: string;
    isPublic: boolean;
    showCharacterAndIsland: boolean;
    pronouns: string;
    birthDay: string; // '1' - '31'
    birthMonth: string; // 'January' - 'December'
    nativeFruit: 'Apple' | 'Cherry' | 'Orange' | 'Peach' | 'Pear' | 'Coconut';
    favouriteColour: string;
    favouriteSong: string;
    country: string;
    language: string;
    personality: 'Lazy' | 'Jock' | 'Cranky' | 'Smug' | 'Normal' | 'Peppy' | 'Snooty' | 'Big Sister';
    hobbies: string;
    favouriteShowsFilms: string;
    aboutYou: string; // Max 160 chars
    favouriteVillagers: string[]; // up to 10 villager names
    primaryIgn?: string;
    primaryIsland?: string;
    avatarUrl?: string;
    updatedAt?: number;
}

const STORAGE_KEY = 'chopaeng_public_profile_v1';

export const DEFAULT_PASSPORT_DATA: PublicPassportData = {
    username: '',
    isPublic: false,
    showCharacterAndIsland: true,
    pronouns: '',
    birthDay: '1',
    birthMonth: 'January',
    nativeFruit: 'Apple',
    favouriteColour: '#37b06d',
    favouriteSong: 'K.K. Cruisin\'',
    country: 'Island Paradise',
    language: 'English',
    personality: 'Normal',
    hobbies: 'Fashion, Gardening & Stargazing',
    favouriteShowsFilms: '',
    aboutYou: 'Living my best island life in Animal Crossing: New Horizons!',
    favouriteVillagers: ['Raymond', 'Shino', 'Marshal'],
    updatedAt: Date.now(),
};

export const getStoredPassport = (username?: string): PublicPassportData => {
    try {
        if (username && username.trim()) {
            const saved = localStorage.getItem(`${STORAGE_KEY}_${username.toLowerCase().trim()}`);
            if (saved) {
                return { ...DEFAULT_PASSPORT_DATA, ...JSON.parse(saved) };
            }
        }
        const scopedSaved = getUserScopedItem(STORAGE_KEY);
        if (scopedSaved) {
            return { ...DEFAULT_PASSPORT_DATA, ...JSON.parse(scopedSaved) };
        }
    } catch {
        // Storage inaccessible
    }
    return { ...DEFAULT_PASSPORT_DATA, username: username || '' };
};

export const saveStoredPassport = (data: PublicPassportData): void => {
    try {
        const payload = { ...data, updatedAt: Date.now() };
        setUserScopedItem(STORAGE_KEY, JSON.stringify(payload));
        if (data.username && data.username.trim()) {
            localStorage.setItem(`${STORAGE_KEY}_${data.username.toLowerCase().trim()}`, JSON.stringify(payload));
        }
        window.dispatchEvent(new CustomEvent('chopaeng_passport_updated', { detail: payload }));
    } catch {
        // Ignore
    }
};

export const savePassportToDb = async (data: PublicPassportData, token?: string | null): Promise<boolean> => {
    const authToken = token || getAuthToken();
    saveStoredPassport(data);

    if (!authToken) return true;

    const endpoints = [
        `${DODO_API_BASE}/api/user/passport`,
        `${DODO_API_BASE}/api/profile/passport`,
        `${DODO_API_BASE}/api/user/preferences`,
    ];

    for (const ep of endpoints) {
        try {
            const resp = await fetch(ep, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    passport: data,
                    public_passport: data,
                    preferences: { passport: data },
                }),
            });
            if (resp.ok) return true;
        } catch {
            // continue to next endpoint
        }
    }

    return false;
};

export const fetchPublicPassportFromDb = async (
    username: string,
    token?: string | null
): Promise<PublicPassportData | null> => {
    if (!username) return null;

    const authToken = token || getAuthToken();
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const endpoints = [
        `${DODO_API_BASE}/api/public/passport/${encodeURIComponent(username)}`,
        `${DODO_API_BASE}/api/user/passport/${encodeURIComponent(username)}`,
        `${DODO_API_BASE}/api/profile/passport?username=${encodeURIComponent(username)}`,
    ];

    for (const ep of endpoints) {
        try {
            const resp = await fetch(ep, {
                headers,
                credentials: 'include',
            });
            if (resp.ok) {
                const data = await resp.json();
                const passport = data?.passport || data?.public_passport || data?.data;
                if (passport) {
                    saveStoredPassport(passport);
                    return passport;
                }
            }
        } catch {
            // continue
        }
    }

    // Check local storage fallback
    try {
        const local = localStorage.getItem(`${STORAGE_KEY}_${username.toLowerCase()}`);
        if (local) {
            const parsed = JSON.parse(local);
            if (parsed && (parsed.isPublic || parsed.username.toLowerCase() === username.toLowerCase())) {
                return parsed;
            }
        }
    } catch {
        // Ignore
    }

    return null;
};

export interface UpdateNicknameResult {
    success: boolean;
    nickname?: string;
    message?: string;
}

/**
 * Sends a request to ChoPaeng backend to update the user's Discord guild nickname.
 */
export const updateDiscordNickname = async (
    newNickname: string,
    token?: string | null
): Promise<UpdateNicknameResult> => {
    const authToken = token || getAuthToken();
    const cleanNick = newNickname.trim();

    if (!cleanNick) {
        return { success: false, message: 'Nickname cannot be empty.' };
    }

    if (cleanNick.length > 32) {
        return { success: false, message: 'Discord nicknames cannot exceed 32 characters.' };
    }

    if (!authToken) {
        return { success: false, message: 'You must be logged in to update your Discord nickname.' };
    }

    const endpoints = [
        `${DODO_API_BASE}/api/user/nickname`,
        `${DODO_API_BASE}/api/profile/nickname`,
        `${DODO_API_BASE}/api/user/update-nickname`,
        `${DODO_API_BASE}/api/profile/update-nickname`,
    ];

    let lastError = 'Unable to update nickname on Discord. Please check your backend bot connection.';

    for (const ep of endpoints) {
        try {
            const resp = await fetch(ep, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    nickname: cleanNick,
                    nick: cleanNick,
                }),
            });

            const data = await resp.json().catch(() => ({}));

            if (resp.ok && data.success !== false) {
                return {
                    success: true,
                    nickname: data.nickname || data.nick || cleanNick,
                    message: data.message || `Successfully updated your Discord server nickname to "${cleanNick}"!`,
                };
            }

            if (data.error || data.message) {
                lastError = data.error || data.message;
            }
        } catch {
            // continue to next endpoint
        }
    }

    return { success: false, message: lastError };
};


