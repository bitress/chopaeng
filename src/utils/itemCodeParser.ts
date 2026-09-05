import type { PocketBundleItem } from '../data/pocketBundles';
import type { CatalogEntity } from '../data/commandBuilderData';

const FALLBACK_IMAGE = 'https://via.placeholder.com/80?text=No+Image';

export interface ParsedItemCodeResult {
    items: PocketBundleItem[];
    totalSlots: number;
    unrecognizedTokens: string[];
    parsedSummary: string;
}

interface CatalogIndex {
    byId: Map<string, CatalogEntity>;
    byName: Map<string, CatalogEntity>;
}

const _catalogIndexCache = new WeakMap<CatalogEntity[], CatalogIndex>();
let _lastCatalogRef: CatalogEntity[] | null = null;
let _lastCatalogIndex: CatalogIndex | null = null;

function getCatalogIndex(catalogItems: CatalogEntity[]): CatalogIndex {
    if (catalogItems.length === 0) {
        return { byId: new Map(), byName: new Map() };
    }
    if (_lastCatalogRef === catalogItems && _lastCatalogIndex) {
        return _lastCatalogIndex;
    }
    const cached = _catalogIndexCache.get(catalogItems);
    if (cached) {
        _lastCatalogRef = catalogItems;
        _lastCatalogIndex = cached;
        return cached;
    }

    const byId = new Map<string, CatalogEntity>();
    const byName = new Map<string, CatalogEntity>();

    for (let i = 0; i < catalogItems.length; i++) {
        const item = catalogItems[i];
        if (item.id) {
            const trimmed = item.id.trim();
            byId.set(trimmed.toUpperCase(), item);
            byId.set(trimmed.toLowerCase(), item);
        }
        if (item.name) {
            byName.set(item.name.trim().toLowerCase(), item);
        }
        if (item.variations) {
            for (let vIdx = 0; vIdx < item.variations.length; vIdx++) {
                const v = item.variations[vIdx];
                if (v.pokerId) {
                    const p = v.pokerId.trim();
                    if (!byId.has(p.toUpperCase())) {
                        byId.set(p.toUpperCase(), item);
                        byId.set(p.toLowerCase(), item);
                    }
                }
                if (v.id) {
                    const vId = String(v.id).trim();
                    if (/^[0-9a-fA-F]{2,6}$/i.test(vId) && !byId.has(vId.toUpperCase())) {
                        byId.set(vId.toUpperCase(), item);
                        byId.set(vId.toLowerCase(), item);
                    }
                }
            }
        }
    }

    const index: CatalogIndex = { byId, byName };
    _catalogIndexCache.set(catalogItems, index);
    _lastCatalogRef = catalogItems;
    _lastCatalogIndex = index;
    return index;
}

/**
 * Intelligent parser for ACNH item codes, Bot commands, and hex lists.
 * Supported formats:
 * - Bot command: `!order 1024 1025 09A2` or `!drop 1024 1025`
 * - Multiplier: `1024x10`, `10x 1024`, `1024*5`, `1024:5`
 * - Delimited: Space, comma, newline, tab, semicolon
 * - Variant IDs: `1024-1`, `1024_2`, `1024:0`
 * - Full 8-char hex: `31E20000` (ID: 31E2, Variant: 0)
 * - Raw Item Names: `Royal Crown`, `Golden Axe x5`, `Raymond`
 */
export const parseItemCodes = (
    rawInput: string,
    catalogItems: CatalogEntity[] = []
): ParsedItemCodeResult => {
    if (!rawInput || !rawInput.trim()) {
        return {
            items: [],
            totalSlots: 0,
            unrecognizedTokens: [],
            parsedSummary: 'No input provided',
        };
    }

    // 1. Pre-clean: strip common bot command prefixes and punctuation wrappers
    const cleanText = rawInput
        .replace(/^(?:!order|!drop|\/order|\/drop|\$order|\$drop|order:|drop:)\s*/i, '')
        .trim();

    const { byId: catalogById, byName: catalogByName } = getCatalogIndex(catalogItems);

    // Split input into lines or token chunks
    const lines = cleanText.split(/[\r\n]+/);
    const accumulatedItems = new Map<string, { item: PocketBundleItem; count: number }>();
    const unrecognizedTokens: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Check if the entire line matches a known item name with optional quantity (e.g. "Royal Crown x5")
        const nameMultiplierMatch = trimmedLine.match(/^(.+?)(?:\s*(?:x|\*|:)\s*(\d+))?$/i);
        if (nameMultiplierMatch) {
            const potentialName = nameMultiplierMatch[1].trim().toLowerCase();
            const qty = nameMultiplierMatch[2] ? parseInt(nameMultiplierMatch[2], 10) : 1;

            if (catalogByName.has(potentialName)) {
                const found = catalogByName.get(potentialName)!;
                const hexKey = found.id.toUpperCase();
                const existing = accumulatedItems.get(hexKey);
                if (existing) {
                    existing.count += Math.max(1, qty);
                } else {
                    accumulatedItems.set(hexKey, {
                        item: {
                            itemId: hexKey,
                            name: found.name,
                            quantity: Math.max(1, qty),
                            category: found.category || 'General',
                            image: found.image || FALLBACK_IMAGE,
                            variantId: undefined,
                            variantLabel: undefined,
                        },
                        count: Math.max(1, qty),
                    });
                }
                continue;
            }
        }

        // Split tokens by commas, spaces, semicolons, tabs
        const rawTokens = trimmedLine.split(/[\s,;|\t]+/);

        for (const rawToken of rawTokens) {
            const token = rawToken.trim();
            if (!token) continue;

            // Ignore command words if repeated inline
            if (/^(?:!order|!drop|\/order|\/drop|\$order|\$drop)$/i.test(token)) continue;

            let hexId = '';
            let variantId: string | undefined = undefined;
            let qty = 1;

            // Pattern 1: `1024x10` or `1024*10` or `1024:10`
            const qtySuffixMatch = token.match(/^([0-9a-fA-F_\-:]+?)(?:x|\*|:)(\d+)$/i);
            // Pattern 2: `10x1024` or `10*1024`
            const qtyPrefixMatch = token.match(/^(\d+)(?:x|\*)([0-9a-fA-F_-]+)$/i);

            let coreToken = token;
            if (qtySuffixMatch) {
                coreToken = qtySuffixMatch[1];
                qty = Math.max(1, parseInt(qtySuffixMatch[2], 10));
            } else if (qtyPrefixMatch) {
                qty = Math.max(1, parseInt(qtyPrefixMatch[1], 10));
                coreToken = qtyPrefixMatch[2];
            }

            // Clean hex prefixes: `0x1024` -> `1024`
            coreToken = coreToken.replace(/^0x/i, '');

            // Check for villager token: `villager:dog01` or `villager:butch`
            const isVillagerToken = /^villager:/i.test(coreToken);
            let isVillager = isVillagerToken;
            let villagerId = '';

            if (isVillagerToken) {
                villagerId = coreToken.replace(/^villager:/i, '').trim();
                const matchedVillager = catalogById.get(villagerId.toLowerCase()) || catalogById.get(villagerId.toUpperCase()) || catalogByName.get(villagerId.toLowerCase());
                if (matchedVillager) {
                    hexId = matchedVillager.id;
                    isVillager = true;
                } else {
                    hexId = villagerId;
                    isVillager = true;
                }
            } else {
                // Pattern for hex with variant: `1024-1` or `1024_2` or `1024:3`
                const variantMatch = coreToken.match(/^([0-9a-fA-F]+)[_\-:](\d+)$/);
                if (variantMatch) {
                    hexId = variantMatch[1].toUpperCase();
                    variantId = variantMatch[2];
                } else if (/^[0-9a-fA-F]{8}$/.test(coreToken)) {
                    // 8-character full item hex e.g. 31E20000 -> Item 31E2, Variant 0
                    hexId = coreToken.slice(0, 4).toUpperCase();
                    const rawVar = parseInt(coreToken.slice(4, 6), 16);
                    if (!isNaN(rawVar) && rawVar > 0) {
                        variantId = String(rawVar);
                    }
                } else if (/^[0-9a-fA-F]{2,6}$/.test(coreToken)) {
                    hexId = coreToken.toUpperCase();
                } else {
                    // Check if it matches a catalog item name
                    const matchedByName = catalogByName.get(coreToken.toLowerCase());
                    if (matchedByName) {
                        hexId = matchedByName.id.toUpperCase();
                        if (matchedByName.entityType === 'villager' || matchedByName.category === 'Villagers') {
                            isVillager = true;
                        }
                    } else {
                        unrecognizedTokens.push(token);
                        continue;
                    }
                }
            }

            // Lookup entity in catalog
            const catalogItem = catalogById.get(hexId) || catalogById.get(hexId.toLowerCase()) || catalogById.get(hexId.toUpperCase());
            if (catalogItem?.entityType === 'villager' || catalogItem?.category === 'Villagers') {
                isVillager = true;
            }

            const dedupeKey = isVillager ? `villager-${hexId}` : variantId ? `${hexId}-${variantId}` : hexId;

            const existing = accumulatedItems.get(dedupeKey);
            if (existing) {
                existing.count = isVillager ? 1 : existing.count + qty;
                existing.item.quantity = existing.count;
            } else {
                const name = catalogItem ? catalogItem.name : isVillager ? `Villager (${hexId})` : `Item (${hexId})`;
                const category = catalogItem?.category || (isVillager ? 'Villagers' : 'Custom Hex');
                let image = catalogItem?.image || FALLBACK_IMAGE;
                let variantLabel: string | undefined = undefined;

                if (catalogItem?.variations) {
                    // Check if hexId directly matched one of the variations' pokerId / hex id
                    const matchedVar = catalogItem.variations.find(
                        (v) => (v.pokerId && v.pokerId.toUpperCase() === hexId.toUpperCase()) ||
                               (v.id && String(v.id).toUpperCase() === hexId.toUpperCase())
                    );
                    if (matchedVar) {
                        variantLabel = matchedVar.Variation || matchedVar.Pattern || undefined;
                        if (matchedVar.imageUrl) {
                            image = matchedVar.imageUrl;
                        }
                    } else if (variantId !== undefined) {
                        const varIndex = Number(variantId);
                        if (!isNaN(varIndex) && catalogItem.variations[varIndex]) {
                            const vObj = catalogItem.variations[varIndex];
                            variantLabel = vObj.Variation || vObj.Pattern || undefined;
                            if (vObj.imageUrl) {
                                image = vObj.imageUrl;
                            }
                        }
                    }
                }

                accumulatedItems.set(dedupeKey, {
                    item: {
                        itemId: hexId,
                        name,
                        quantity: isVillager ? 1 : qty,
                        category,
                        image,
                        entityType: isVillager ? 'villager' : 'item',
                        variantId: variantId || undefined,
                        variantLabel: variantLabel || undefined,
                    },
                    count: isVillager ? 1 : qty,
                });
            }
        }
    }

    const items = Array.from(accumulatedItems.values()).map((v) => ({
        ...v.item,
        quantity: v.count,
    }));

    const totalSlots = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const parsedSummary = `Parsed ${items.length} unique item types (${totalSlots} total pocket slots)`;

    return {
        items,
        totalSlots,
        unrecognizedTokens,
        parsedSummary,
    };
};
