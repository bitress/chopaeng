export interface ParsedCharacter {
    ign: string;
    islandName: string;
}

export interface NicknamePreset {
    id: string;
    label: string;
    value: string;
    description: string;
    icon?: string;
    badge?: string;
}

/**
 * Clean emojis and special decorative symbols from IGNs or island names.
 */
const cleanName = (text: string): string => {
    return text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[()[\]{}]/g, '')
        .trim();
};

/**
 * Parses Discord nickname strings like:
 * - "ign1 | island1" -> [{ ign: "ign1", islandName: "island1" }]
 * - "ign1 ign2 | island1" -> [{ ign: "ign1", islandName: "island1" }, { ign: "ign2", islandName: "island1" }]
 * - "ign1 ign2 | island1 island2" -> [{ ign: "ign1", islandName: "island1" }, { ign: "ign2", islandName: "island2" }]
 * - "ign1 | island1 island2" -> [{ ign: "ign1", islandName: "island1" }, { ign: "ign1", islandName: "island2" }]
 * - "ign1/ign2 | island1" -> [{ ign: "ign1", islandName: "island1" }, { ign: "ign2", islandName: "island1" }]
 * - "ign1 | island1 | ign2 | island2" -> [{ ign: "ign1", islandName: "island1" }, { ign: "ign2", islandName: "island2" }]
 */
export const parseDiscordNicknameToCharacters = (rawName?: string | null): ParsedCharacter[] => {
    if (!rawName || !rawName.trim()) {
        return [];
    }

    const trimmed = rawName.trim();

    // 1. Check if multiple pipes format: "ign1 | isl1 | ign2 | isl2" (even count of chunks >= 4)
    if (/[|¦‖]/.test(trimmed)) {
        const pipeChunks = trimmed.split(/[|¦‖]/).map((s) => cleanName(s)).filter(Boolean);
        if (pipeChunks.length >= 4 && pipeChunks.length % 2 === 0) {
            const results: ParsedCharacter[] = [];
            for (let i = 0; i < pipeChunks.length; i += 2) {
                results.push({ ign: pipeChunks[i], islandName: pipeChunks[i + 1] });
            }
            return results;
        }
    }

    // 2. Split by main separator: |, ¦, ‖, -, —, –, or " from "
    let leftSide = '';
    let rightSide = '';

    if (/[\s]+from[\s]+/i.test(trimmed)) {
        const parts = trimmed.split(/[\s]+from[\s]+/i);
        leftSide = parts[0] || '';
        rightSide = parts.slice(1).join(' ');
    } else if (/[|¦‖]/.test(trimmed)) {
        const parts = trimmed.split(/[|¦‖]/);
        leftSide = parts[0] || '';
        rightSide = parts.slice(1).join('|');
    } else if (/[\s]+[-—–][\s]+/.test(trimmed)) {
        const parts = trimmed.split(/[\s]+[-—–][\s]+/);
        leftSide = parts[0] || '';
        rightSide = parts.slice(1).join('-');
    } else if (trimmed.includes(',')) {
        const parts = trimmed.split(',');
        leftSide = parts[0] || '';
        rightSide = parts.slice(1).join(',');
    } else {
        const cleaned = cleanName(trimmed);
        if (cleaned) {
            return [{ ign: cleaned, islandName: cleaned }];
        }
        return [];
    }

    // 3. Sub-name splitting (handles '/', '&', '+', and space-separated multiple names)
    const splitSubNames = (str: string): string[] => {
        // If it contains explicit delimiters
        if (/[\/&+\\]/.test(str)) {
            return str
                .split(/[\/&+\\]/)
                .map((s) => cleanName(s))
                .filter(Boolean);
        }
        // If it contains spaces (e.g. "ign1 ign2" or "island1 island2")
        const words = str
            .split(/\s+/)
            .map((s) => cleanName(s))
            .filter(Boolean);
        return words.length > 0 ? words : [cleanName(str)].filter(Boolean);
    };

    let igns = splitSubNames(leftSide);
    let islands = splitSubNames(rightSide);

    // If sub-names failed to split cleanly, fallback to single cleaned strings
    if (igns.length === 0 && leftSide.trim()) {
        igns = [cleanName(leftSide)];
    }
    if (islands.length === 0 && rightSide.trim()) {
        islands = [cleanName(rightSide)];
    }

    if (igns.length === 0 && islands.length === 0) {
        return [];
    }

    if (igns.length === 0 && islands.length > 0) {
        return islands.map((isl) => ({ ign: isl, islandName: isl }));
    }

    if (igns.length > 0 && islands.length === 0) {
        return igns.map((ign) => ({ ign, islandName: ign }));
    }

    const results: ParsedCharacter[] = [];

    // Case A: Equal count (e.g. 2 IGNs & 2 Islands -> 1-to-1 pair)
    // "ign1 ign2 | island1 island2" -> ign1 from island1, ign2 from island2
    if (igns.length === islands.length) {
        for (let i = 0; i < igns.length; i++) {
            results.push({ ign: igns[i], islandName: islands[i] });
        }
        return results;
    }

    // Case B: Multiple IGNs, single Island
    // "ign1 ign2 | island1" -> ign1 from island1, ign2 from island1
    if (igns.length > 1 && islands.length === 1) {
        for (const ign of igns) {
            results.push({ ign, islandName: islands[0] });
        }
        return results;
    }

    // Case C: Single IGN, multiple Islands
    // "ign1 | island1 island2" -> ign1 from island1, ign1 from island2
    if (igns.length === 1 && islands.length > 1) {
        for (const isl of islands) {
            results.push({ ign: igns[0], islandName: isl });
        }
        return results;
    }

    // Case D: Mismatched counts -> pair up to longest
    const maxLen = Math.max(igns.length, islands.length);
    for (let i = 0; i < maxLen; i++) {
        const ign = igns[i] || igns[igns.length - 1];
        const island = islands[i] || islands[islands.length - 1];
        results.push({ ign, islandName: island });
    }

    return results;
};

/**
 * Generates all multi-nickname preset combinations from saved character slots.
 */
export const generateNicknamePresets = (
    characters: { ign?: string; islandName?: string; icon?: string }[]
): NicknamePreset[] => {
    const valid = characters.filter((c) => (c.ign || '').trim() && (c.islandName || '').trim()).map((c) => ({
        ign: cleanName(c.ign || ''),
        islandName: cleanName(c.islandName || ''),
        icon: c.icon || 'fa-leaf',
    }));

    if (valid.length === 0) return [];

    const presets: NicknamePreset[] = [];
    const seenValues = new Set<string>();

    const addPreset = (preset: NicknamePreset) => {
        const trimmedVal = preset.value.trim().slice(0, 32);
        if (trimmedVal && !seenValues.has(trimmedVal)) {
            seenValues.add(trimmedVal);
            presets.push({ ...preset, value: trimmedVal });
        }
    };

    // 1. Single individual slots: "ign1 | island1"
    valid.forEach((char, idx) => {
        addPreset({
            id: `slot-${idx}`,
            label: `Slot ${idx + 1}`,
            value: `${char.ign} | ${char.islandName}`,
            description: `${char.ign} from ${char.islandName}`,
            icon: char.icon,
            badge: 'Single Slot',
        });
    });

    if (valid.length >= 2) {
        const igns = valid.map((c) => c.ign);
        const islands = valid.map((c) => c.islandName);
        const uniqueIslands = Array.from(new Set(islands));
        const uniqueIgns = Array.from(new Set(igns));

        // Format 1: Multiple IGNs on same island: "ign1/ign2 | island1" (Standard)
        if (uniqueIslands.length === 1) {
            addPreset({
                id: 'multi-ign-slash-same',
                label: 'IGNs (Slash)',
                value: `${uniqueIgns.join('/')} | ${uniqueIslands[0]}`,
                description: `${uniqueIgns.join('/')} on ${uniqueIslands[0]}`,
                icon: 'fa-users',
                badge: 'Recommended',
            });
            addPreset({
                id: 'multi-ign-space-same',
                label: 'IGNs (Space)',
                value: `${uniqueIgns.join(' ')} | ${uniqueIslands[0]}`,
                description: `${uniqueIgns.join(' & ')} on ${uniqueIslands[0]}`,
                icon: 'fa-users',
                badge: 'Space Style',
            });
        }

        // Format 2: Multiple IGNs across Multiple Islands: "ign1/ign2 | island1/island2" (Standard)
        if (uniqueIslands.length > 1 && uniqueIgns.length > 1) {
            addPreset({
                id: 'multi-all-slash',
                label: 'All Slots (Slash)',
                value: `${uniqueIgns.join('/')} | ${uniqueIslands.join('/')}`,
                description: `${uniqueIgns.join('/')} | ${uniqueIslands.join('/')}`,
                icon: 'fa-layer-group',
                badge: 'Recommended',
            });
            addPreset({
                id: 'multi-all-space',
                label: 'All Slots (Space)',
                value: `${uniqueIgns.join(' ')} | ${uniqueIslands.join(' ')}`,
                description: `${uniqueIgns.join(' ')} | ${uniqueIslands.join(' ')}`,
                icon: 'fa-layer-group',
                badge: 'Space Style',
            });
            addPreset({
                id: 'multi-all-pipe',
                label: 'Pairs (Pipe)',
                value: valid.map((c) => `${c.ign} | ${c.islandName}`).join(' | '),
                description: `Full IGN & Island pairs`,
                icon: 'fa-bars',
                badge: 'Pairs',
            });
        }

        // Format 3: Single IGN on multiple islands: "ign1 | island1/island2" (Standard)
        if (uniqueIgns.length === 1 && uniqueIslands.length > 1) {
            addPreset({
                id: 'multi-island-slash',
                label: 'Multi-Island (Slash)',
                value: `${uniqueIgns[0]} | ${uniqueIslands.join('/')}`,
                description: `${uniqueIgns[0]} on ${uniqueIslands.join('/')}`,
                icon: 'fa-map-location-dot',
                badge: 'Recommended',
            });
            addPreset({
                id: 'multi-island-space',
                label: 'Multi-Island (Space)',
                value: `${uniqueIgns[0]} | ${uniqueIslands.join(' ')}`,
                description: `${uniqueIgns[0]} on ${uniqueIslands.join(' & ')}`,
                icon: 'fa-map-location-dot',
                badge: 'Space Style',
            });
        }

        // General multi-slot combinations for 2 characters:
        if (valid.length === 2 && uniqueIslands.length === 2 && uniqueIgns.length === 2) {
            addPreset({
                id: 'pair-slash',
                label: `${valid[0].ign}/${valid[1].ign} | ${valid[0].islandName}/${valid[1].islandName}`,
                value: `${valid[0].ign}/${valid[1].ign} | ${valid[0].islandName}/${valid[1].islandName}`,
                description: `Standard 2-Character Format`,
                icon: 'fa-user-group',
                badge: 'ACNH Rule',
            });
        }
    }

    return presets;
};
