import { useMemo, useState, useEffect, useCallback } from 'react';
import type { CatalogEntity } from '../data/commandBuilderData';
import { ITEMS } from '../data/commandBuilderData';
import { loadVillagers } from '../data/villagerDataLoader';
import { generateFullItemHex } from '../utils/commandBuilderHex';

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

const villagerEntities = loadVillagers();

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

const parseSavedVillagerIds = (): string[] => {
    try {
        const saved = localStorage.getItem('command_builder_villager');
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            return parsed.filter((entry) => typeof entry === 'string' && villagerEntities.some((v) => v.id === entry));
        }
        if (typeof parsed === 'string') {
            const matchById = villagerEntities.find((v) => v.id === parsed);
            if (matchById) return [parsed];
            const matchByName = villagerEntities.find((v) => v.name.toLowerCase() === parsed.toLowerCase());
            return matchByName ? [matchByName.id] : [];
        }
        return [];
    } catch {
        return [];
    }
};

const getItemCommandId = (item: PocketItem) => {
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
    const [villagerIds, setVillagerIds] = useState<string[]>(parseSavedVillagerIds);
    const [copyOrderStatus, setCopyOrderStatus] = useState('Copy order');
    const [copyDropStatus, setCopyDropStatus] = useState('Copy drop');
    const [copyInjectVillagerStatus, setCopyInjectVillagerStatus] = useState('Copy inject');

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('command_builder_order_items', JSON.stringify(orderItems));
    }, [orderItems]);

    useEffect(() => {
        localStorage.setItem('command_builder_drop_items', JSON.stringify(dropItems));
    }, [dropItems]);

    useEffect(() => {
        localStorage.setItem('command_builder_villager', JSON.stringify(villagerIds));
    }, [villagerIds]);

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
        setOrderItems((prev) => {
            const existing = prev.find((p) => p.item.id === item.id);
            if (existing) {
                return prev.map((p) => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { item, quantity: 1 }];
        });
        return { success: true, message: 'Added to Order pockets!' };
    }, [totalOrderCount]);

    const addItemToDropPockets = useCallback((item: PocketItem): { success: boolean; message: string } => {
        if (totalDropCount >= DROP_BOT_MAX) {
            return { success: false, message: `Drop pockets are full (${DROP_BOT_MAX} items). Remove an item first.` };
        }
        setDropItems((prev) => {
            const existing = prev.find((p) => p.item.id === item.id);
            if (existing) {
                return prev.map((p) => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { item, quantity: 1 }];
        });
        return { success: true, message: 'Added to Drop pockets!' };
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

    // ── Villager operations ────────────────────────────────────────────────
    const requestVillager = useCallback((villager: CatalogEntity): { success: boolean; message: string } => {
        setVillagerIds((prev) => prev.includes(villager.id) ? prev : [...prev, villager.id]);
        return { success: true, message: `${villager.name} has been requested as a villager.` };
    }, []);

    const removeVillager = useCallback((villagerIdToRemove: string) => {
        setVillagerIds((prev) => prev.filter((id) => id !== villagerIdToRemove));
    }, []);

    const clearVillagers = useCallback(() => setVillagerIds([]), []);

    const selectedVillagers = useMemo(
        () => villagerEntities.filter((v) => villagerIds.includes(v.id)),
        [villagerIds]
    );

    // ── Command text ───────────────────────────────────────────────────────
    const orderCommandText = useMemo(() => {
        const itemsList = orderItems.flatMap((p) => Array(p.quantity).fill(getItemCommandId(p.item))).join(' ');
        const villagerPart = selectedVillagers.length === 1 ? `villager:${selectedVillagers[0].id}` : '';
        const commandParts = [itemsList, villagerPart].filter(Boolean).join(' ');
        return commandParts ? `!order ${commandParts}` : '';
    }, [orderItems, selectedVillagers]);

    const dropCommandText = useMemo(() => {
        const itemsList = dropItems.flatMap((p) => Array(p.quantity).fill(getItemCommandId(p.item))).join(' ');
        return itemsList ? `!drop ${itemsList}` : '';
    }, [dropItems]);

    const injectVillagerCommandText = useMemo(() => {
        if (selectedVillagers.length === 0) return '';
        if (selectedVillagers.length === 1) return `!injectvillager ${selectedVillagers[0].name}`;
        return `!mvi ${selectedVillagers.map((villager) => villager.name).join(' ')}`;
    }, [selectedVillagers]);

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

    const handleCopyInjectVillager = useCallback(async () => {
        if (!injectVillagerCommandText) return;
        try {
            await navigator.clipboard.writeText(injectVillagerCommandText);
            setCopyInjectVillagerStatus('Copied!');
            setTimeout(() => setCopyInjectVillagerStatus('Copy inject'), 1300);
        } catch (error) {
            console.error(error);
            setCopyInjectVillagerStatus('Error');
            setTimeout(() => setCopyInjectVillagerStatus('Copy inject'), 1300);
        }
    }, [injectVillagerCommandText]);

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
        villagerIds,
        setVillagerIds,
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

        // Villagers
        requestVillager,
        removeVillager,
        clearVillagers,
        selectedVillagers,

        // Commands
        orderCommandText,
        dropCommandText,
        injectVillagerCommandText,

        // Copy status
        copyOrderStatus,
        copyDropStatus,
        copyInjectVillagerStatus,

        // Copy handlers
        handleCopyOrder,
        handleCopyDrop,
        handleCopyInjectVillager,

        // Lookup
        getPocketQuantity,
        getOrderPocketQuantity,
        getDropPocketQuantity,
    };
};
