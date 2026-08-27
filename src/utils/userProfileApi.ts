import { getAuthToken } from '../context/authToken';
import { DODO_API_BASE } from '../config/api';

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
        const key = username ? `${STORAGE_KEY}_${username.toLowerCase()}` : STORAGE_KEY;
        const saved = localStorage.getItem(key);
        if (saved) {
            return { ...DEFAULT_PASSPORT_DATA, ...JSON.parse(saved) };
        }
    } catch {
        // Storage inaccessible
    }
    return { ...DEFAULT_PASSPORT_DATA, username: username || '' };
};

export const saveStoredPassport = (data: PublicPassportData): void => {
    try {
        const payload = { ...data, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        if (data.username) {
            localStorage.setItem(`${STORAGE_KEY}_${data.username.toLowerCase()}`, JSON.stringify(payload));
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

