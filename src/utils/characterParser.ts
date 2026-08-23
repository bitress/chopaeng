export interface ParsedCharacter {
    ign: string;
    islandName: string;
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
 * - "bitress | bitress" -> [{ ign: "bitress", islandName: "bitress" }]
 * - "bitress/cheurnice | bitress" -> [{ ign: "bitress", islandName: "bitress" }, { ign: "cheurnice", islandName: "bitress" }]
 * - "cache | bitress/cheurnice" -> [{ ign: "cache", islandName: "bitress" }, { ign: "cache", islandName: "cheurnice" }]
 * - "bitress/cheurnice | bitress/cheurnice" -> [{ ign: "bitress", islandName: "bitress" }, { ign: "cheurnice", islandName: "cheurnice" }]
 * - "bitress from bitress" -> [{ ign: "bitress", islandName: "bitress" }]
 */
export const parseDiscordNicknameToCharacters = (rawName?: string | null): ParsedCharacter[] => {
    if (!rawName || !rawName.trim()) {
        return [];
    }

    const trimmed = rawName.trim();

    // 1. Split by main separator: |, ¦, ‖, -, —, –, or " from "
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
        // Single name without separator -> use as IGN and Island
        const cleaned = cleanName(trimmed);
        if (cleaned) {
            return [{ ign: cleaned, islandName: cleaned }];
        }
        return [];
    }

    // 2. Split multiple sub-names by "/" or "&" or "+"
    const splitSubNames = (str: string): string[] => {
        return str
            .split(/[/&+\\]/)
            .map((s) => cleanName(s))
            .filter(Boolean);
    };

    const igns = splitSubNames(leftSide);
    const islands = splitSubNames(rightSide);

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
    // "bitress/cheurnice | bitress/cheurnice" -> bitress from bitress, cheurnice from cheurnice
    if (igns.length === islands.length) {
        for (let i = 0; i < igns.length; i++) {
            results.push({ ign: igns[i], islandName: islands[i] });
        }
        return results;
    }

    // Case B: Multiple IGNs, single Island
    // "bitress/cheurnice | bitress" -> bitress from bitress, cheurnice from bitress
    if (igns.length > 1 && islands.length === 1) {
        for (const ign of igns) {
            results.push({ ign, islandName: islands[0] });
        }
        return results;
    }

    // Case C: Single IGN, multiple Islands
    // "cache | bitress/cheurnice" -> cache from bitress, cache from cheurnice
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
