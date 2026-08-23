import { useState, useEffect, useCallback } from 'react';
import { parseDiscordNicknameToCharacters } from '../utils/characterParser';

export interface SavedCharacter {
    id: string;
    ign: string; // In-Game Name
    islandName: string; // Island Name
    title?: string; // e.g. "Island Representative", "Island Resident"
    icon?: string; // Icon identifier e.g. "fa-user", "fa-crown", "fa-leaf"
    isDefault?: boolean;
    createdAt?: string;
    source?: 'discord' | 'custom';
}

const STORAGE_KEY = 'chopaeng_saved_characters_v1';
export const MAX_CHARACTER_SLOTS = 3;

export const getStoredCharacters = (): SavedCharacter[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        return [];
    } catch {
        return [];
    }
};

export const saveStoredCharacters = (characters: SavedCharacter[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch {
        // Storage write error ignored
    }
    window.dispatchEvent(
        new CustomEvent('chopaeng_characters_updated', {
            detail: { characters },
        })
    );
};

export const useSavedCharacters = (rawDiscordName?: string | null) => {
    const [characters, setCharacters] = useState<SavedCharacter[]>(getStoredCharacters);
    const maxSlots = MAX_CHARACTER_SLOTS;

    const refresh = useCallback(() => {
        setCharacters(getStoredCharacters());
    }, []);

    useEffect(() => {
        window.addEventListener('chopaeng_characters_updated', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('chopaeng_characters_updated', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [refresh]);

    // Automatically sync from Discord Nickname on first load if no custom characters exist
    useEffect(() => {
        if (!rawDiscordName) return;

        const current = getStoredCharacters();
        // If empty or never set, parse from Discord Nickname
        if (current.length === 0) {
            const parsed = parseDiscordNicknameToCharacters(rawDiscordName);
            if (parsed.length > 0) {
                const initialChars: SavedCharacter[] = parsed.slice(0, maxSlots).map((p, idx) => ({
                    id: `char_dc_${Date.now()}_${idx}`,
                    ign: p.ign,
                    islandName: p.islandName,
                    title: idx === 0 ? 'Island Representative' : 'Island Resident',
                    icon: idx === 0 ? 'fa-crown' : 'fa-leaf',
                    isDefault: idx === 0,
                    createdAt: new Date().toISOString(),
                    source: 'discord',
                }));
                saveStoredCharacters(initialChars);
                setCharacters(initialChars);
            }
        }
    }, [rawDiscordName, maxSlots]);

    // Active character fallback
    const activeCharacter: SavedCharacter = characters.find((c) => c.isDefault) ||
        characters[0] || {
            id: 'char_default',
            ign: rawDiscordName ? parseDiscordNicknameToCharacters(rawDiscordName)[0]?.ign || rawDiscordName : 'Resident',
            islandName: rawDiscordName ? parseDiscordNicknameToCharacters(rawDiscordName)[0]?.islandName || 'Island' : 'Island',
            title: 'Island Representative',
            icon: 'fa-leaf',
            isDefault: true,
        };

    const addCharacter = useCallback(
        (ign: string, islandName: string, title = 'Island Resident', icon = 'fa-user'): boolean => {
            const current = getStoredCharacters();
            if (current.length >= maxSlots) {
                return false;
            }

            const newChar: SavedCharacter = {
                id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                ign: ign.trim(),
                islandName: islandName.trim(),
                title: title.trim(),
                icon,
                isDefault: current.length === 0,
                createdAt: new Date().toISOString(),
                source: 'custom',
            };

            const updated = [...current, newChar];
            saveStoredCharacters(updated);
            return true;
        },
        [maxSlots]
    );

    const updateCharacter = useCallback(
        (id: string, updates: Partial<Omit<SavedCharacter, 'id'>>): boolean => {
            const current = getStoredCharacters();
            const index = current.findIndex((c) => c.id === id);
            if (index === -1) return false;

            const updated = [...current];
            updated[index] = { ...updated[index], ...updates };
            saveStoredCharacters(updated);
            return true;
        },
        []
    );

    const deleteCharacter = useCallback((id: string): boolean => {
        const current = getStoredCharacters();
        if (current.length <= 1) {
            return false; // Keep at least one character
        }

        const filtered = current.filter((c) => c.id !== id);
        if (!filtered.some((c) => c.isDefault)) {
            filtered[0].isDefault = true;
        }

        saveStoredCharacters(filtered);
        return true;
    }, []);

    const setDefaultCharacter = useCallback((id: string): boolean => {
        const current = getStoredCharacters();
        const updated = current.map((c) => ({
            ...c,
            isDefault: c.id === id,
        }));
        saveStoredCharacters(updated);
        return true;
    }, []);

    /**
     * 1-Click Sync from Discord server nickname (e.g. "bitress/cheurnice | bitress")
     */
    const syncFromDiscordNickname = useCallback(
        (nameToParse: string): number => {
            if (!nameToParse || !nameToParse.trim()) return 0;
            const parsed = parseDiscordNicknameToCharacters(nameToParse);
            if (parsed.length === 0) return 0;

            const synced: SavedCharacter[] = parsed.slice(0, maxSlots).map((p, idx) => ({
                id: `char_sync_${Date.now()}_${idx}`,
                ign: p.ign,
                islandName: p.islandName,
                title: idx === 0 ? 'Island Representative' : 'Island Resident',
                icon: idx === 0 ? 'fa-crown' : 'fa-leaf',
                isDefault: idx === 0,
                createdAt: new Date().toISOString(),
                source: 'discord',
            }));

            saveStoredCharacters(synced);
            setCharacters(synced);
            return synced.length;
        },
        [maxSlots]
    );

    return {
        characters,
        activeCharacter,
        maxSlots,
        remainingSlots: Math.max(0, maxSlots - characters.length),
        addCharacter,
        updateCharacter,
        deleteCharacter,
        setDefaultCharacter,
        syncFromDiscordNickname,
    };
};
