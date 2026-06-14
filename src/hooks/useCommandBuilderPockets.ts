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

const BUFFER_OPTIONS = {
    '16DB': { id: '16DB', name: 'Nook Miles Ticket', icon: 'https://dodo.ac/np/images/4/43/Nook_Miles_Ticket_NH_Inv_Icon.png' },
    '14BB': { id: '14BB', name: 'Royal Crown', icon: 'https://dodo.ac/np/images/c/c7/Royal_Crown_NH_Storage_Icon.png' },
    '08A4': { id: '08A4', name: '99,000 Bells', icon: 'https://dodo.ac/np/images/1/1e/99k_Bells_NH_Inv_Icon.png' },
};

const villagerEntities = loadVillagers();

const parseSavedPockets = (): PocketEntry[] => {
    try {
        const saved = localStorage.getItem('command_builder_selected_items');
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

const parseSavedVillagerId = (): string => {
    try {
        const saved = localStorage.getItem('command_builder_villager');
        if (!saved) return '';
        const matchById = villagerEntities.find((v) => v.id === saved);
        if (matchById) return saved;
        const matchByName = villagerEntities.find((v) => v.name.toLowerCase() === saved.toLowerCase());
        return matchByName ? matchByName.id : '';
    } catch {
        return '';
    }
};

const getItemCommandId = (item: PocketItem) => {
    return generateFullItemHex(item.baseId ?? item.id, item.variantId ?? 'NA', item.category);
};

export const useCommandBuilderPockets = () => {
    const [selectedItems, setSelectedItems] = useState<PocketEntry[]>(parseSavedPockets);
    const [villagerId, setVillagerId] = useState(parseSavedVillagerId);
    const [copyOrderStatus, setCopyOrderStatus] = useState('Copy order');
    const [copyDropStatus, setCopyDropStatus] = useState('Copy drop');

    useEffect(() => {
        localStorage.setItem('command_builder_selected_items', JSON.stringify(selectedItems));
    }, [selectedItems]);

    useEffect(() => {
        localStorage.setItem('command_builder_villager', villagerId);
    }, [villagerId]);

    const totalItemsCount = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const canIncrease = totalItemsCount < 40;

    const decreaseQuantity = useCallback((id: string) => {
        setSelectedItems((prev) => prev.map((pocket) => {
            if (pocket.item.id !== id) return pocket;
            const nextQuantity = Math.max(1, pocket.quantity - 1);
            return { ...pocket, quantity: nextQuantity };
        }));
    }, []);

    const increaseQuantity = useCallback((id: string) => {
        setSelectedItems((prev) => {
            const count = prev.reduce((acc, curr) => acc + curr.quantity, 0);
            if (count >= 40) return prev;
            return prev.map((pocket) => {
                if (pocket.item.id !== id) return pocket;
                return { ...pocket, quantity: pocket.quantity + 1 };
            });
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setSelectedItems((prev) => prev.filter((pocket) => pocket.item.id !== id));
    }, []);

    const fillWithItemName = useCallback((name: string) => {
        setSelectedItems((prev) => {
            const count = prev.reduce((acc, curr) => acc + curr.quantity, 0);
            const remaining = 40 - count;
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

    const addItemToPockets = useCallback((item: PocketItem): { success: boolean; message: string } => {
        if (totalItemsCount >= 40) {
            return { success: false, message: 'Your pockets are full (40 items). Remove an item first.' };
        }
        setSelectedItems((prev) => {
            const existing = prev.find((p) => p.item.id === item.id);
            if (existing) {
                return prev.map((p) => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { item, quantity: 1 }];
        });
        return { success: true, message: 'Added to your pockets!' };
    }, [totalItemsCount]);

    const requestVillager = useCallback((villager: CatalogEntity): { success: boolean; message: string } => {
        setVillagerId(villager.id);
        return { success: true, message: `${villager.name} has been requested as your villager.` };
    }, []);

    const selectedVillager = useMemo(
        () => villagerEntities.find((v) => v.id === villagerId) || null,
        [villagerId]
    );

    const orderCommandText = useMemo(() => {
        const itemsList = selectedItems.flatMap((p) => Array(p.quantity).fill(getItemCommandId(p.item))).join(' ');
        const villagerPart = selectedVillager ? `villager:${selectedVillager.id}` : '';
        const commandParts = [itemsList, villagerPart].filter(Boolean).join(' ');
        return commandParts ? `!order ${commandParts}` : '';
    }, [selectedItems, selectedVillager]);

    const dropCommandText = useMemo(() => {
        const itemsList = selectedItems.flatMap((p) => Array(p.quantity).fill(getItemCommandId(p.item))).join(' ');
        const villagerPart = selectedVillager ? `villager:${selectedVillager.id}` : '';
        const commandParts = [itemsList, villagerPart].filter(Boolean).join(' ');
        return commandParts ? `!drop ${commandParts}` : '';
    }, [selectedItems, selectedVillager]);

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

    const getPocketQuantity = useCallback((itemId: string) => {
        const entry = selectedItems.find((p) => p.item.id === itemId);
        return entry?.quantity ?? 0;
    }, [selectedItems]);

    return {
        selectedItems,
        setSelectedItems,
        villagerId,
        setVillagerId,
        totalItemsCount,
        canIncrease,
        decreaseQuantity,
        increaseQuantity,
        removeItem,
        handleFillTickets,
        handleFillCrowns,
        handleFillBells,
        addItemToPockets,
        requestVillager,
        selectedVillager,
        orderCommandText,
        dropCommandText,
        copyOrderStatus,
        copyDropStatus,
        handleCopyOrder,
        handleCopyDrop,
        getPocketQuantity,
    };
};
