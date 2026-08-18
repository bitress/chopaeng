import { useMemo, useState, useEffect, useCallback } from 'react';
import type { CatalogEntity } from '../data/commandBuilderData';
import { ITEMS } from '../data/commandBuilderData';
import { generateFullItemHex } from '../utils/commandBuilderHex';
import banner from '../assets/banner.png';

export type PocketItem = CatalogEntity & {
    baseId?: string | number | null;
    variantId?: string | number | null;
    variantLabel?: string | null;
};

export type PocketEntry = { item: PocketItem; quantity: number };

const ORDER_BOT_MAX = 40;
const DROP_BOT_MAX = 9;

const BUFFER_OPTIONS = {
    '16DB': { id: '16DB', name: 'Nook Miles Ticket', icon: 'https://dodo.ac/np/images/4/43/Nook_Miles_Ticket_NH_Inv_Icon.png' },
    '14BB': { id: '14BB', name: 'Royal Crown', icon: 'https://dodo.ac/np/images/c/c7/Royal_Crown_NH_Storage_Icon.png' },
    '08A4': { id: '08A4', name: '99,000 Bells', icon: 'https://dodo.ac/np/images/1/1e/99k_Bells_NH_Inv_Icon.png' },
};


const parsePocketEntries = (key: string): PocketEntry[] => {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        if (parsed.length > 0 && !parsed[0].item) {
            return parsed.map((item: PocketItem) => ({ item, quantity: 1 }));
        }
        return parsed.map((entry: PocketEntry) => ({
            item: entry.item,
            quantity: typeof entry.quantity === 'number' ? entry.quantity : 1,
        }));
    } catch {
        return [];
    }
};

// One-time migration: move old combined pocket data into order pockets
const migrateOldPockets = (): PocketEntry[] => {
    try {
        const legacy = localStorage.getItem('command_builder_selected_items');
        const alreadyMigrated = localStorage.getItem('command_builder_migrated_v2');
        if (!legacy || alreadyMigrated) return [];
        const entries = parsePocketEntries('command_builder_selected_items');
        localStorage.setItem('command_builder_migrated_v2', '1');
        localStorage.removeItem('command_builder_selected_items');
        return entries;
    } catch {
        return [];
    }
};

const getItemCommandId = (item: PocketItem) => {
    if (item.entityType === 'villager') {
        return `villager:${item.id}`;
    }
    return generateFullItemHex(item.baseId ?? item.id, item.variantId ?? 'NA', item.category);
};

export const useCommandBuilderPockets = () => {
    // Separate order and drop pocket lists — with one-time migration from old combined key
    const [orderItems, setOrderItems] = useState<PocketEntry[]>(() => {
        const migrated = migrateOldPockets();
        if (migrated.length > 0) return migrated;
        return parsePocketEntries('command_builder_order_items');
    });
    const [dropItems, setDropItems] = useState<PocketEntry[]>(() =>
        parsePocketEntries('command_builder_drop_items')
    );
    const [copyOrderStatus, setCopyOrderStatus] = useState('Copy order');
    const [copyDropStatus, setCopyDropStatus] = useState('Copy drop');



    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('command_builder_order_items', JSON.stringify(orderItems));
    }, [orderItems]);

    useEffect(() => {
        localStorage.setItem('command_builder_drop_items', JSON.stringify(dropItems));
    }, [dropItems]);



    // Counts
    const totalOrderCount = orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalDropCount = dropItems.reduce((acc, curr) => acc + curr.quantity, 0);
    // Keep legacy alias for components that use totalItemsCount
    const totalItemsCount = totalOrderCount;

    const canIncrease = totalOrderCount < ORDER_BOT_MAX;
    const canIncreaseOrder = totalOrderCount < ORDER_BOT_MAX;
    const canIncreaseDrop = totalDropCount < DROP_BOT_MAX;

    // ── Order pocket operations ────────────────────────────────────────────
    const decreaseOrderQuantity = useCallback((id: string) => {
        setOrderItems((prev) => prev.map((pocket) => {
            if (pocket.item.id !== id) return pocket;
            return { ...pocket, quantity: Math.max(1, pocket.quantity - 1) };
        }));
    }, []);

    const increaseOrderQuantity = useCallback((id: string) => {
        setOrderItems((prev) => {
            const count = prev.reduce((acc, curr) => acc + curr.quantity, 0);
            if (count >= ORDER_BOT_MAX) return prev;
            return prev.map((pocket) => {
                if (pocket.item.id !== id) return pocket;
                if (pocket.item.entityType === 'villager') return pocket;
                return { ...pocket, quantity: pocket.quantity + 1 };
            });
        });
    }, []);

    const removeOrderItem = useCallback((id: string) => {
        setOrderItems((prev) => prev.filter((pocket) => pocket.item.id !== id));
    }, []);

    // ── Drop pocket operations ─────────────────────────────────────────────
    const decreaseDropQuantity = useCallback((id: string) => {
        setDropItems((prev) => prev.map((pocket) => {
            if (pocket.item.id !== id) return pocket;
            return { ...pocket, quantity: Math.max(1, pocket.quantity - 1) };
        }));
    }, []);

    const increaseDropQuantity = useCallback((id: string) => {
        setDropItems((prev) => {
            const count = prev.reduce((acc, curr) => acc + curr.quantity, 0);
            if (count >= DROP_BOT_MAX) return prev; // silently block; UI disables the button
            const pocket = prev.find((p) => p.item.id === id);
            if (!pocket) return prev;
            if (pocket.item.entityType === 'villager') return prev; // Only 1 villager allowed
            // guard: adding 1 more would exceed cap
            if (count + 1 > DROP_BOT_MAX) return prev;
            return prev.map((p) => {
                if (p.item.id !== id) return p;
                return { ...p, quantity: p.quantity + 1 };
            });
        });
    }, []);

    const removeDropItem = useCallback((id: string) => {
        setDropItems((prev) => prev.filter((pocket) => pocket.item.id !== id));
    }, []);

    // ── Legacy aliases (used by some pages still referencing old API) ──────
    const decreaseQuantity = decreaseOrderQuantity;
    const increaseQuantity = increaseOrderQuantity;
    const removeItem = removeOrderItem;

    // ── Add to pockets ─────────────────────────────────────────────────────
    const addItemToOrderPockets = useCallback((item: PocketItem): { success: boolean; message: string } => {
        if (totalOrderCount >= ORDER_BOT_MAX) {
            return { success: false, message: `Order pockets are full (${ORDER_BOT_MAX} items). Remove an item first.` };
        }
        let message = 'Added to Order pockets!';
        let success = true;
        setOrderItems((prev) => {
            if (item.entityType === 'villager') {
                const existingVillager = prev.find(p => p.item.entityType === 'villager');
                if (existingVillager && existingVillager.item.id === item.id) {
                    message = 'Villager is already in Order pockets.';
                    success = false;
                    return prev;
                }
                if (existingVillager) {
                    message = `Replaced ${existingVillager.item.name} with ${item.name} in Order pockets!`;
                } else {
                    message = `${item.name} added to Order pockets!`;
                }
                const withoutVillagers = prev.filter(p => p.item.entityType !== 'villager');
                return [...withoutVillagers, { item, quantity: 1 }];
            }

            const existing = prev.find((p) => p.item.id === item.id);
            if (existing) {
                return prev.map((p) => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { item, quantity: 1 }];
        });
        return { success, message };
    }, [totalOrderCount]);

    const addItemToDropPockets = useCallback((item: PocketItem): { success: boolean; message: string } => {
        if (totalDropCount >= DROP_BOT_MAX) {
            return { success: false, message: `Drop pockets are full (${DROP_BOT_MAX} items). Remove an item first.` };
        }
        let message = 'Added to Drop pockets!';
        let success = true;
        setDropItems((prev) => {
            if (item.entityType === 'villager') {
                const existingVillager = prev.find(p => p.item.id === item.id);
                if (existingVillager) {
                    message = 'Villager is already in Drop pockets.';
                    success = false;
                    return prev;
                }
                return [...prev, { item, quantity: 1 }];
            }

            const existing = prev.find((p) => p.item.id === item.id);
            if (existing) {
                return prev.map((p) => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { item, quantity: 1 }];
        });
        return { success, message };
    }, [totalDropCount]);

    // Legacy alias — adds to order by default
    const addItemToPockets = addItemToOrderPockets;

    // ── Fill helpers (order only) ──────────────────────────────────────────
    const fillWithItemName = useCallback((name: string) => {
        setOrderItems((prev) => {
            const count = prev.reduce((acc, curr) => acc + curr.quantity, 0);
            const remaining = ORDER_BOT_MAX - count;
            if (remaining <= 0) return prev;

            const bufferOption = Object.values(BUFFER_OPTIONS).find((buffer) => buffer.name === name);
            let item: PocketItem | undefined;

            if (bufferOption) {
                item = {
                    id: bufferOption.id,
                    entityType: 'item',
                    name: bufferOption.name,
                    category: 'Currency',
                    theme: 'Buffer',
                    series: 'Buffer',
                    interactivity: 'Consumable',
                    colour: 'Various',
                    image: bufferOption.icon,
                    description: `${bufferOption.name} buffer item`,
                };
            } else {
                item = ITEMS.find((it) => it.name === name && it.entityType === 'item');
            }

            if (!item) return prev;

            const existing = prev.find((p) => p.item.id === item!.id);
            if (existing) {
                return prev.map((p) => p.item.id === item!.id ? { ...p, quantity: p.quantity + remaining } : p);
            }
            return [...prev, { item, quantity: remaining }];
        });
    }, []);

    const handleFillTickets = useCallback(() => fillWithItemName('Nook Miles Ticket'), [fillWithItemName]);
    const handleFillCrowns = useCallback(() => fillWithItemName('Royal Crown'), [fillWithItemName]);
    const handleFillBells = useCallback(() => fillWithItemName('99,000 Bells'), [fillWithItemName]);

    // ── Bundle & Share loaders ─────────────────────────────────────────────
    const loadBundleIntoOrder = useCallback((bundleItems: Array<{ itemId?: string; id?: string; name: string; quantity: number; category?: string; variantId?: string | number | null; variantLabel?: string | null; image?: string; entityType?: 'item' | 'villager' }>, mode: 'replace' | 'merge' = 'replace') => {
        setOrderItems((prev) => {
            const currentEntries: PocketEntry[] = mode === 'replace' ? [] : [...prev];
            let currentCount = currentEntries.reduce((acc, curr) => acc + curr.quantity, 0);

            for (const bItem of bundleItems) {
                if (currentCount >= ORDER_BOT_MAX) break;
                // itemId from pocketBundles is the explorer.json 'Internal ID' hex (= pokerId)
                const itemId = String(bItem.itemId || bItem.id || bItem.name);
                const quantityToAdd = Math.min(bItem.quantity || 1, ORDER_BOT_MAX - currentCount);
                if (quantityToAdd <= 0) continue;

                const pocketItem: PocketItem = {
                    id: itemId,
                    name: bItem.name,
                    entityType: bItem.entityType || 'item',
                    category: bItem.category || 'Misc',
                    theme: 'Standard',
                    series: 'General',
                    interactivity: 'Static',
                    colour: 'Various',
                    image: bItem.image || banner,
                    description: bItem.name,
                    // baseId is always the itemId (pokerId hex from explorer.json)
                    // variantId is the variation key (e.g. "0_0") or undefined/NA for no-variant items
                    baseId: itemId,
                    variantId: bItem.variantId ?? undefined,
                    variantLabel: bItem.variantLabel ?? undefined,
                };

                const existingIdx = currentEntries.findIndex((p) => p.item.id === itemId);
                if (existingIdx >= 0) {
                    currentEntries[existingIdx] = {
                        ...currentEntries[existingIdx],
                        quantity: currentEntries[existingIdx].quantity + quantityToAdd,
                    };
                } else {
                    currentEntries.push({ item: pocketItem, quantity: quantityToAdd });
                }
                currentCount += quantityToAdd;
            }

            return currentEntries;
        });
    }, []);

    const loadBundleIntoDrop = useCallback((bundleItems: Array<{ itemId?: string; id?: string; name: string; quantity: number; category?: string; variantId?: string | number | null; variantLabel?: string | null; image?: string; entityType?: 'item' | 'villager' }>, mode: 'replace' | 'merge' = 'replace') => {
        setDropItems((prev) => {
            const currentEntries: PocketEntry[] = mode === 'replace' ? [] : [...prev];
            let currentCount = currentEntries.reduce((acc, curr) => acc + curr.quantity, 0);

            for (const bItem of bundleItems) {
                if (currentCount >= DROP_BOT_MAX) break;
                const itemId = String(bItem.itemId || bItem.id || bItem.name);
                const quantityToAdd = Math.min(bItem.quantity || 1, DROP_BOT_MAX - currentCount);
                if (quantityToAdd <= 0) continue;

                const pocketItem: PocketItem = {
                    id: itemId,
                    name: bItem.name,
                    entityType: bItem.entityType || 'item',
                    category: bItem.category || 'Misc',
                    theme: 'Standard',
                    series: 'General',
                    interactivity: 'Static',
                    colour: 'Various',
                    image: bItem.image || banner,
                    description: bItem.name,
                    // baseId is always the itemId (pokerId hex from explorer.json)
                    baseId: itemId,
                    variantId: bItem.variantId ?? undefined,
                    variantLabel: bItem.variantLabel ?? undefined,
                };

                const existingIdx = currentEntries.findIndex((p) => p.item.id === itemId);
                if (existingIdx >= 0) {
                    currentEntries[existingIdx] = {
                        ...currentEntries[existingIdx],
                        quantity: currentEntries[existingIdx].quantity + quantityToAdd,
                    };
                } else {
                    currentEntries.push({ item: pocketItem, quantity: quantityToAdd });
                }
                currentCount += quantityToAdd;
            }

            return currentEntries;
        });
    }, []);

    const loadSharedPocket = useCallback((sharedData: { orderItems?: any[]; dropItems?: any[] }) => {
        if (Array.isArray(sharedData.orderItems) && sharedData.orderItems.length > 0) {
            loadBundleIntoOrder(sharedData.orderItems, 'replace');
        }
        if (Array.isArray(sharedData.dropItems) && sharedData.dropItems.length > 0) {
            loadBundleIntoDrop(sharedData.dropItems, 'replace');
        }
    }, [loadBundleIntoOrder, loadBundleIntoDrop]);



    // ── Command text ───────────────────────────────────────────────────────
    const orderCommandText = useMemo(() => {
        const itemsList = orderItems.flatMap((p) => Array(p.quantity).fill(getItemCommandId(p.item))).join(' ');
        return itemsList ? `!order ${itemsList}` : '';
    }, [orderItems]);

    const dropCommandText = useMemo(() => {
        const regularItems = dropItems.filter(p => p.item.entityType !== 'villager');
        const villagers = dropItems.filter(p => p.item.entityType === 'villager');

        let dropPart = '';
        if (regularItems.length > 0) {
            const itemsList = regularItems.flatMap((p) => Array(p.quantity).fill(getItemCommandId(p.item))).join(' ');
            dropPart = `!drop ${itemsList}`;
        }

        let villagerPart = '';
        const villagerTotalQuantity = villagers.reduce((acc, curr) => acc + curr.quantity, 0);
        if (villagerTotalQuantity === 1) {
            villagerPart = `!injectvillager ${villagers[0].item.name}`;
        } else if (villagerTotalQuantity > 1) {
            const names = villagers.flatMap((p) => Array(p.quantity).fill(p.item.name)).join(' ');
            villagerPart = `!mvi ${names}`;
        }

        if (dropPart && villagerPart) return `${dropPart}\n${villagerPart}`;
        return dropPart || villagerPart;
    }, [dropItems]);

    // ── Copy handlers ──────────────────────────────────────────────────────
    const handleCopyOrder = useCallback(async () => {
        if (!orderCommandText) return;
        try {
            await navigator.clipboard.writeText(orderCommandText);
            setCopyOrderStatus('Copied!');
            setTimeout(() => setCopyOrderStatus('Copy order'), 1300);
        } catch (error) {
            console.error(error);
            setCopyOrderStatus('Error');
            setTimeout(() => setCopyOrderStatus('Copy order'), 1300);
        }
    }, [orderCommandText]);

    const handleCopyDrop = useCallback(async () => {
        if (!dropCommandText) return;
        try {
            await navigator.clipboard.writeText(dropCommandText);
            setCopyDropStatus('Copied!');
            setTimeout(() => setCopyDropStatus('Copy drop'), 1300);
        } catch (error) {
            console.error(error);
            setCopyDropStatus('Error');
            setTimeout(() => setCopyDropStatus('Copy drop'), 1300);
        }
    }, [dropCommandText]);



    // ── Quantity lookup ────────────────────────────────────────────────────
    const getOrderPocketQuantity = useCallback((itemId: string) => {
        return orderItems.find((p) => p.item.id === itemId)?.quantity ?? 0;
    }, [orderItems]);

    const getDropPocketQuantity = useCallback((itemId: string) => {
        return dropItems.find((p) => p.item.id === itemId)?.quantity ?? 0;
    }, [dropItems]);

    // Legacy alias
    const getPocketQuantity = getOrderPocketQuantity;

    return {
        // State
        orderItems,
        setOrderItems,
        dropItems,
        setDropItems,
        // Legacy alias for pages that haven't been updated
        selectedItems: orderItems,
        setSelectedItems: setOrderItems,

        // Counts
        totalOrderCount,
        totalDropCount,
        totalItemsCount,

        // Can-increase flags
        canIncrease,
        canIncreaseOrder,
        canIncreaseDrop,

        // Order operations
        decreaseOrderQuantity,
        increaseOrderQuantity,
        removeOrderItem,

        // Drop operations
        decreaseDropQuantity,
        increaseDropQuantity,
        removeDropItem,

        // Legacy aliases
        decreaseQuantity,
        increaseQuantity,
        removeItem,

        // Add to pocket
        addItemToOrderPockets,
        addItemToDropPockets,
        addItemToPockets,

        // Fill helpers
        handleFillTickets,
        handleFillCrowns,
        handleFillBells,

        // Bundle & Share loaders
        loadBundleIntoOrder,
        loadBundleIntoDrop,
        loadSharedPocket,

        orderCommandText,
        dropCommandText,

        copyOrderStatus,
        copyDropStatus,

        handleCopyOrder,
        handleCopyDrop,

        // Lookup
        getPocketQuantity,
        getOrderPocketQuantity,
        getDropPocketQuantity,
    };
};
