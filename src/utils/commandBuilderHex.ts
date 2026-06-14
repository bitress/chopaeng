export type ItemVariant = {
    id?: string;
    pokerId?: string;
    imageUrl?: string | null;
    Variation?: string;
    Pattern?: string;
    Colours?: string[];
    uniqueEntryId?: string;
};

export const generateFullItemHex = (
    baseId: string | number | null | undefined,
    variantString: string | number | null | undefined,
    category = ''
): string => {
    if (String(baseId).length === 16) return String(baseId).toUpperCase();
    if (variantString && String(variantString).length === 16) return String(variantString).toUpperCase();
    const paddedBaseId = String(baseId).toUpperCase().padStart(4, '0');
    if (!variantString || variantString === 'NA' || variantString === '' || variantString === 'DIY') {
        return paddedBaseId;
    }
    let primary = 0;
    let secondary = 0;
    const parts = String(variantString).split('_');
    if (parts.length === 2) {
        primary = parseInt(parts[0], 10) || 0;
        secondary = parseInt(parts[1], 10) || 0;
    }
    if (category === 'Fencing') {
        const primaryHex = primary.toString(16).toUpperCase();
        return `${primaryHex}00310000${paddedBaseId}`;
    }
    const variantInt = primary + (secondary * 32);
    const variantHex = variantInt.toString(16).toUpperCase().padStart(4, '0');
    return `0000${variantHex}0000${paddedBaseId}`;
};

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
