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

    // 3. Sub-name splitting (strictly / and & + \ separators - NO spaces between IGNs)
    const splitSubNames = (str: string): string[] => {
        if (/[\/&+\\]/.test(str)) {
            return str
                .split(/[\/&+\\]/)
                .map((s) => cleanName(s))
                .filter(Boolean);
        }
        // There are no spaces between IGNs, only / and |
        const single = cleanName(str);
        return single ? [single] : [];
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
    // "ign1/ign2 | island1/island2" -> ign1 from island1, ign2 from island2
    if (igns.length === islands.length) {
        for (let i = 0; i < igns.length; i++) {
            results.push({ ign: igns[i], islandName: islands[i] });
        }
        return results;
    }

    // Case B: Multiple IGNs, single Island
    // "ign1/ign2 | island1" -> ign1 from island1, ign2 from island1
    if (igns.length > 1 && islands.length === 1) {
        for (const ign of igns) {
            results.push({ ign, islandName: islands[0] });
        }
        return results;
    }

    // Case C: Single IGN, multiple Islands
    // "ign1 | island1/island2" -> ign1 from island1, ign1 from island2
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
 * Automatically formats saved character slots (Slots 1, 2, and 3) into the standard Discord server nickname
 * using strictly the separators "|" (separating IGNs from Islands) and "/" (separating multiple character slots).
 * There are NO spaces between the IGNs, only "/" and "|".
 * E.g.:
 * - 1 slot: "IGN1 | Island1"
 * - 2 slots (same island): "IGN1/IGN2 | Island"
 * - 2 slots (diff islands): "IGN1/IGN2 | Island1/Island2"
 * - 3 slots (same island): "IGN1/IGN2/IGN3 | Island"
 * - 3 slots (diff islands): "IGN1/IGN2/IGN3 | Island1/Island2/Island3"
 */
export const formatCharactersToNickname = (
    characters: { ign?: string; islandName?: string; isDefault?: boolean }[]
): string => {
    const valid = characters
        .map((c) => ({
            ign: cleanName(c.ign || '').trim(),
            islandName: cleanName(c.islandName || '').trim(),
            isDefault: Boolean(c.isDefault),
        }))
        .filter((c) => c.ign && c.islandName);

    if (valid.length === 0) return '';

    // Prioritize active/default character in Slot 1
    const sorted = [...valid].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    if (sorted.length === 1) {
        return `${sorted[0].ign} | ${sorted[0].islandName}`.slice(0, 32);
    }

    // Strictly no spaces between IGNs - joined by '/'
    const igns = sorted.map((c) => c.ign);
    const islands = sorted.map((c) => c.islandName);
    const uniqueIslands = Array.from(new Set(islands));

    // Case 1: All slots share the same island
    if (uniqueIslands.length === 1) {
        const fullSame = `${igns.join('/')} | ${uniqueIslands[0]}`;
        if (fullSame.length <= 32) return fullSame;

        const compactSame = `${igns.join('/')}|${uniqueIslands[0]}`;
        if (compactSame.length <= 32) return compactSame;

        if (igns.length > 2) {
            const twoSlots = `${igns.slice(0, 2).join('/')} | ${uniqueIslands[0]}`;
            if (twoSlots.length <= 32) return twoSlots;
        }
        return `${sorted[0].ign} | ${sorted[0].islandName}`.slice(0, 32);
    }

    // Case 2: Slots have different islands -> format using / and |
    const directSlash = `${igns.join('/')} | ${islands.join('/')}`;
    if (directSlash.length <= 32) {
        return directSlash;
    }

    const compactSlash = `${igns.join('/')}|${islands.join('/')}`;
    if (compactSlash.length <= 32) {
        return compactSlash;
    }

    // If duplicate islands exist, deduplicate islands for shorter length
    if (uniqueIslands.length < islands.length) {
        const uniqueSlash = `${igns.join('/')} | ${uniqueIslands.join('/')}`;
        if (uniqueSlash.length <= 32) {
            return uniqueSlash;
        }
        const uniqueCompact = `${igns.join('/')}|${uniqueIslands.join('/')}`;
        if (uniqueCompact.length <= 32) {
            return uniqueCompact;
        }
    }

    // If 3 slots exceed 32 characters, try top 2 slots
    if (sorted.length >= 3) {
        const twoIgns = igns.slice(0, 2).join('/');
        const twoIslands = islands.slice(0, 2).join('/');
        const twoCandidate = `${twoIgns} | ${twoIslands}`;
        if (twoCandidate.length <= 32) return twoCandidate;

        const twoCompact = `${twoIgns}|${twoIslands}`;
        if (twoCompact.length <= 32) return twoCompact;

        const twoUniqueIslands = Array.from(new Set(islands.slice(0, 2))).join('/');
        const twoUniqueCandidate = `${twoIgns} | ${twoUniqueIslands}`;
        if (twoUniqueCandidate.length <= 32) return twoUniqueCandidate;
    }

    // Fallback: Primary slot
    return `${sorted[0].ign} | ${sorted[0].islandName}`.slice(0, 32);
};

/**
 * Generates standard multi-nickname presets from saved character slots using strictly / and |.
 * Note: Presets UI is removed; formatCharactersToNickname is used automatically.
 */
export const generateNicknamePresets = (
    characters: { ign?: string; islandName?: string; icon?: string; isDefault?: boolean }[]
): NicknamePreset[] => {
    const valid = characters.filter((c) => (c.ign || '').trim() && (c.islandName || '').trim());
    if (valid.length === 0) return [];
    const autoNick = formatCharactersToNickname(valid);
    if (!autoNick) return [];
    return [
        {
            id: 'auto-sync',
            label: `All Slots (${valid.length} Slots)`,
            value: autoNick,
            description: `Auto-synced using / and |`,
            icon: 'fa-layer-group',
            badge: 'Auto-Sync',
        },
    ];
};

/**
 * Check whether a string matches the standard ACNH Discord server nickname rule:
 * Must have character name and island name separated by a pipe `|` (e.g. "IGN | Island Name").
 * Supports multiple characters/islands (e.g. "IGN1/IGN2 | Island" or "IGN1 | Isl1 | IGN2 | Isl2").
 */
export const isValidAcnhNickname = (value?: string | null): boolean => {
    if (!value || !value.trim()) return false;
    const trimmed = value.trim();

    let chunks = trimmed.split(/[|¦‖]/).map((s) => cleanName(s)).filter(Boolean);
    if (chunks.length > 0 && chunks[0].toLowerCase() === 'acnh') {
        chunks = chunks.slice(1);
    }

    if (chunks.length < 2) {
        return false;
    }

    const hasNameText = (text: string) => /[\w\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/i.test(text);

    let pairs: [string, string][] = [];
    if (chunks.length % 2 === 0) {
        for (let i = 0; i < chunks.length; i += 2) {
            pairs.push([chunks[i], chunks[i + 1]]);
        }
    } else {
        pairs = chunks.slice(1).map((island) => [chunks[0], island]);
    }

    for (const [ignRaw, islandRaw] of pairs) {
        const igns = ignRaw.split(/[\/&+\\]/).map((s) => cleanName(s)).filter(Boolean);
        const islands = islandRaw.split(/[\/&+\\]/).map((s) => cleanName(s)).filter(Boolean);
        if (igns.length === 0 || islands.length === 0) return false;
        if (![...igns, ...islands].every(hasNameText)) return false;
    }

    return true;
};

/**
 * Returns a user-friendly validation error message for a nickname input, or null if valid.
 */
export const getNicknameValidationError = (value?: string | null): string | null => {
    if (!value || !value.trim()) {
        return 'Server nickname is required.';
    }
    const trimmed = value.trim();
    if (trimmed.length > 32) {
        return 'Discord nicknames cannot exceed 32 characters.';
    }
    if (!/[|¦‖]/.test(trimmed)) {
        return "Must include '|' between your Character Name and Island Name (e.g. 'Resident | Island').";
    }
    if (!isValidAcnhNickname(trimmed)) {
        return "Format must be 'Character Name | Island Name' with valid letters or numbers.";
    }
    return null;
};

