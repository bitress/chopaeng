export type ItemVariant = {
    id?: string;
    pokerId?: string;
    imageUrl?: string | null;
    Variation?: string;
    Pattern?: string;
    Colours?: string[];
    uniqueEntryId?: string;
};

/** A variant id counts as "meaningful" if it's set and isn't the placeholder 'NA'. */
export const hasMeaningfulVariantId = (id?: string | number | null): boolean => {
    if (id === null || id === undefined) return false;
    const value = String(id).trim();
    return value !== '' && value !== 'NA';
};

/** Best available identifier for a variant, in priority order. */
export const getVariantKey = (variant?: ItemVariant | null): string => {
    if (!variant) return 'NA';
    if (hasMeaningfulVariantId(variant.id)) return String(variant.id);
    if (variant.pokerId) return String(variant.pokerId);
    if (variant.uniqueEntryId) return variant.uniqueEntryId;
    return 'NA';
};

/** Determines which base/variant id pair to feed into hex generation. */
export const getVariantCommandParts = (
    parentId: string | number,
    variant?: ItemVariant | null
) => {
    if (!variant) {
        return { baseId: parentId, variantId: 'NA' };
    }

    const rawId = variant.id !== undefined && variant.id !== null ? String(variant.id).trim() : '';
    // Pattern variations (customizable items like furniture) use "primary_secondary" (e.g. "0_0", "1_0")
    const isPatternVariant = /^\d+_\d+$/.test(rawId) || rawId === 'DIY';

    if (isPatternVariant) {
        const baseId = variant.pokerId || parentId;
        return { baseId, variantId: rawId };
    }

    // Distinct-item variations (e.g. clothing, accessories, etc. where each variation has its own internal ID / hex):
    // The variant itself has its own distinct hex ID (pokerId or id).
    // The base ID is the variant's own hex ID, and there is no pattern variant ('NA').
    const hexId = (hasMeaningfulVariantId(variant.pokerId) ? String(variant.pokerId) : null)
        || (hasMeaningfulVariantId(variant.id) ? String(variant.id) : null)
        || String(parentId);

    return { baseId: hexId, variantId: 'NA' };
};

/**
 * Builds the final order hex for SysBot / Discord order commands.
 * - If baseId or variantString is already a full 16-char hex, return it as-is.
 * - For customizable furniture, encodes variant info (primary/secondary) into a 16-char hex: 0000<variantHex>0000<baseId>.
 * - For "Fencing", uses the fencing layout: <countHex>00310000<baseId>.
 * - For standalone items or items with distinct color internal IDs (e.g. clothing), returns the 4-char hex ID.
 */
export const generateFullItemHex = (
    baseId: string | number | null | undefined,
    variantString: string | number | null | undefined,
    category = ''
): string => {
    let cleanBase = String(baseId ?? '').trim().toUpperCase();
    let cleanVar = variantString !== null && variantString !== undefined ? String(variantString).trim() : '';

    // Handle compound id like '116F:2B0C' or '38EF:1_0' if passed as baseId
    if (cleanBase.includes(':')) {
        const [parent, vKey] = cleanBase.split(':');
        if (/^\d+_\d+$/.test(vKey)) {
            cleanBase = parent;
            if (!cleanVar || cleanVar === 'NA') cleanVar = vKey;
        } else if (/^[0-9A-F]{2,6}$/i.test(vKey)) {
            cleanBase = vKey;
            if (cleanVar === vKey) cleanVar = 'NA';
        } else {
            cleanBase = parent;
        }
    }

    if (cleanBase.length === 16) return cleanBase;
    if (cleanVar && cleanVar.length === 16) return cleanVar.toUpperCase();

    // If no variant or variant is NA / empty / DIY:
    if (!cleanVar || cleanVar === 'NA' || cleanVar === '' || cleanVar === 'DIY') {
        return cleanBase.padStart(4, '0');
    }

    // Pattern variations (customizable items like furniture) use "primary_secondary" (e.g. "0_0", "1_0")
    const parts = cleanVar.split('_');
    if (parts.length === 2) {
        const primary = parseInt(parts[0], 10) || 0;
        const secondary = parseInt(parts[1], 10) || 0;
        const paddedBaseId = cleanBase.padStart(4, '0');

        if (category === 'Fencing') {
            const primaryHex = primary.toString(16).toUpperCase();
            return `${primaryHex}00310000${paddedBaseId}`;
        }

        const variantInt = primary + (secondary * 32);
        const variantHex = variantInt.toString(16).toUpperCase().padStart(4, '0');
        return `0000${variantHex}0000${paddedBaseId}`;
    }

    // If cleanVar was passed a hex ID (like '2B0C') mistakenly stored as variantId:
    if (/^[0-9A-F]{2,6}$/i.test(cleanVar)) {
        return cleanVar.toUpperCase().padStart(4, '0');
    }

    return cleanBase.padStart(4, '0');
};

/** Human-readable label combining Variation and Pattern, for presenting variant choices. */
export const getVariantLabel = (variant?: ItemVariant | { Variation?: string; Pattern?: string } | null): string | null => {
    if (!variant) return null;
    const vVar = variant.Variation;
    const vPat = variant.Pattern;
    const varNA = !vVar || vVar === 'NA';
    const patNA = !vPat || vPat === 'NA';
    if (varNA && patNA) return null;
    if (!varNA && patNA) return vVar!;
    if (!varNA && !patNA) return `${vVar} / ${vPat}`;
    if (varNA && !patNA) return vPat!;
    return null;
};
