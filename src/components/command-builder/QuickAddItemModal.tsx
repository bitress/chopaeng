import React, { useState, useMemo } from 'react';
import type { CatalogEntity } from '../../data/commandBuilderData';
import type { PocketItem } from '../../hooks/useCommandBuilderPockets';
import { getVariantCommandParts, getVariantKey, getVariantLabel } from '../../utils/commandBuilderHex';
import { playChimeClick } from '../../utils/kkAudioSynthesizer';

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f3f5'/%3E%3Cpath d='M30 65 L45 45 L58 58 L68 42 L75 65 Z' fill='%23ced4da'/%3E%3Ccircle cx='38' cy='35' r='7' fill='%23ced4da'/%3E%3C/svg%3E";

const QUICK_PRESETS = [
    { name: 'Nook Miles Ticket', icon: 'fa-ticket', query: 'Nook Miles Ticket' },
    { name: 'Royal Crown', icon: 'fa-crown', query: 'Royal Crown' },
    { name: 'Bell Bag (99k)', icon: 'fa-sack-dollar', query: '99k' },
    { name: 'Gold Nugget', icon: 'fa-cubes', query: 'Gold Nugget' },
    { name: 'Iron Nugget', icon: 'fa-cubes', query: 'Iron Nugget' },
    { name: 'Star Fragment', icon: 'fa-star', query: 'Star Fragment' },
];

const CATEGORY_TABS = [
    { id: 'all', label: 'All', icon: 'fa-border-all' },
    { id: 'materials', label: 'Materials', icon: 'fa-cubes', category: 'Materials' },
    { id: 'furniture', label: 'Furniture', icon: 'fa-couch', category: 'Housewares' },
    { id: 'fashion', label: 'Fashion', icon: 'fa-shirt', category: 'Tops' },
    { id: 'recipes', label: 'DIYs', icon: 'fa-scroll', kind: 'Recipes' },
    { id: 'villagers', label: 'Villagers', icon: 'fa-paw', kind: 'Villagers' },
];

interface QuickAddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    catalog: CatalogEntity[];
    initialTarget?: 'order' | 'drop';
    addItemToOrderPockets: (item: PocketItem) => { success: boolean; message: string };
    addItemToDropPockets: (item: PocketItem) => { success: boolean; message: string };
    decreaseOrderQuantity: (id: string) => void;
    increaseOrderQuantity: (id: string) => void;
    decreaseDropQuantity: (id: string) => void;
    increaseDropQuantity: (id: string) => void;
    totalOrderCount: number;
    totalDropCount: number;
    canIncreaseOrder: boolean;
    canIncreaseDrop: boolean;
    orderItems: Array<{ item: PocketItem; quantity: number }>;
    dropItems: Array<{ item: PocketItem; quantity: number }>;
}

export const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({
    isOpen,
    onClose,
    catalog,
    initialTarget = 'order',
    addItemToOrderPockets,
    addItemToDropPockets,
    decreaseOrderQuantity,
    increaseOrderQuantity,
    decreaseDropQuantity,
    increaseDropQuantity,
    totalOrderCount,
    totalDropCount,
    canIncreaseOrder,
    canIncreaseDrop,
    orderItems,
    dropItems,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

    // Map active quantities for fast lookup
    const orderQuantityMap = useMemo(() => {
        const map = new Map<string, number>();
        orderItems.forEach((p) => map.set(p.item.id, p.quantity));
        return map;
    }, [orderItems]);

    const dropQuantityMap = useMemo(() => {
        const map = new Map<string, number>();
        dropItems.forEach((p) => map.set(p.item.id, p.quantity));
        return map;
    }, [dropItems]);

    // Filter items
    const filteredItems = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        const activeTab = CATEGORY_TABS.find((t) => t.id === selectedCategoryTab);

        let list = catalog;

        if (activeTab && activeTab.id !== 'all') {
            if (activeTab.kind === 'Recipes') {
                list = list.filter((item) => item.category === 'Recipes' || item.category === 'DIY Recipes');
            } else if (activeTab.kind === 'Villagers') {
                list = list.filter((item) => item.entityType === 'villager' || item.category === 'Villagers');
            } else if (activeTab.category) {
                list = list.filter((item) => item.category?.toLowerCase() === activeTab.category?.toLowerCase());
            }
        }

        if (q) {
            list = list.filter((item) =>
                item.name.toLowerCase().includes(q) ||
                (item.category && item.category.toLowerCase().includes(q))
            );
        }

        return list.slice(0, 60); // Limit to top 60 for performance
    }, [catalog, searchQuery, selectedCategoryTab]);

    if (!isOpen) return null;

    const handleAdd = (item: CatalogEntity, target: 'order' | 'drop') => {
        const defaultVariant = item.variations && item.variations.length > 0 ? item.variations[0] : null;
        const variantKey = getVariantKey(defaultVariant);
        const variantParts = getVariantCommandParts(item.id, defaultVariant);
        const variantLabel = getVariantLabel(defaultVariant);
        const pocketItemId = variantKey !== 'NA' ? `${item.id}:${variantKey}` : item.id;

        const pocketItem: PocketItem = {
            ...item,
            id: pocketItemId,
            baseId: variantParts.baseId,
            variantId: variantParts.variantId,
            variantLabel,
            image: defaultVariant?.imageUrl || item.image || FALLBACK_IMAGE,
        };

        const res = target === 'order' ? addItemToOrderPockets(pocketItem) : addItemToDropPockets(pocketItem);
        playChimeClick();

        if (res.success) {
            setStatusMessage({ text: `Added "${item.name}" to ${target}!`, type: 'success' });
        } else {
            setStatusMessage({ text: res.message, type: 'warning' });
        }
        setTimeout(() => setStatusMessage(null), 2500);
    };

    return (
        <div
            className="modal-overlay d-flex align-items-center justify-content-center p-3"
            onClick={onClose}
            style={{ zIndex: 1060, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-5 shadow-2xl overflow-hidden border-0 position-relative w-100 animate-up"
                style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-3 px-4 border-bottom bg-light d-flex align-items-center justify-content-between">
                    <div>
                        <h2 className="h5 fw-black text-dark mb-0 ac-font d-flex align-items-center gap-2">
                            <i className="fa-solid fa-plus-circle text-success"></i>
                            Quick Add Items to Inventory
                        </h2>
                        <span className="tiny-text text-muted font-monospace">
                            Adding to: <strong className={initialTarget === 'drop' ? 'text-info' : 'text-success'}>{initialTarget.toUpperCase()}</strong> · Order: <strong className="text-success">{totalOrderCount}/40</strong> · Drop: <strong className="text-info">{totalDropCount}/9</strong>
                        </span>
                    </div>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    ></button>
                </div>

                {/* Search & Filter Bar */}
                <div className="p-3 px-4 border-bottom bg-white">
                    {/* Search Input */}
                    <div className="position-relative mb-2">
                        <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="search"
                            className="form-control rounded-pill ps-5 pe-5 py-2 fw-medium border shadow-xs"
                            placeholder="Type to search items, DIYs, materials, or villagers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="btn btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-1 border-0"
                                onClick={() => setSearchQuery('')}
                            >
                                <i className="fa-solid fa-circle-xmark"></i>
                            </button>
                        )}
                    </div>

                    {/* Quick Category Pills */}
                    <div className="d-flex align-items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                        {CATEGORY_TABS.map((tab) => {
                            const active = selectedCategoryTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedCategoryTab(tab.id)}
                                    className={`btn btn-xs rounded-pill text-nowrap fw-bold px-3 py-1 transition-all ${
                                        active ? 'btn-nook text-white shadow-xs' : 'btn-light text-dark border'
                                    }`}
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    <i className={`fa-solid ${tab.icon} me-1 ${active ? 'text-white' : 'text-success'}`}></i>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Currency / Material Presets */}
                    <div className="d-flex align-items-center gap-1 overflow-x-auto pt-2 border-top mt-2 no-scrollbar">
                        <span className="tiny-text fw-bold text-muted text-uppercase text-nowrap me-1">Popular:</span>
                        {QUICK_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => setSearchQuery(preset.query)}
                                className="btn btn-xs rounded-pill bg-light border text-muted px-2 py-0 fw-medium hover-text-dark text-nowrap"
                                style={{ fontSize: '0.72rem' }}
                            >
                                <i className={`fa-solid ${preset.icon} me-1 text-warning`}></i>
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Notice if any */}
                {statusMessage && (
                    <div className={`py-1 px-3 text-center small fw-bold animate-fade ${statusMessage.type === 'success' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                        <i className={`fa-solid ${statusMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-1`}></i>
                        {statusMessage.text}
                    </div>
                )}

                {/* Items Results Grid */}
                <div className="p-3 px-4 overflow-y-auto flex-grow-1" style={{ backgroundColor: '#fffdfa', maxHeight: '420px' }}>
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fa-solid fa-box-open fs-2 mb-2 opacity-50"></i>
                            <h6 className="fw-bold text-dark mb-1">No matching items found</h6>
                            <p className="small mb-0">Try searching for common item names like "Iron", "Raymond", or "Crown".</p>
                        </div>
                    ) : (
                        <div className="row g-2">
                            {filteredItems.map((item) => {
                                const defaultVariant = item.variations && item.variations.length > 0 ? item.variations[0] : null;
                                const vKey = getVariantKey(defaultVariant);
                                const pocketId = vKey !== 'NA' ? `${item.id}:${vKey}` : item.id;
                                const orderQty = orderQuantityMap.get(pocketId) || 0;
                                const dropQty = dropQuantityMap.get(pocketId) || 0;

                                return (
                                    <div key={item.id} className="col-12 col-md-6">
                                        <div className="card rounded-4 p-2 border shadow-2xs h-100 bg-white d-flex flex-row align-items-center gap-2 hover-shadow-sm transition-all">
                                            {/* Item Thumbnail */}
                                            <div
                                                className="ratio ratio-1x1 bg-light rounded-3 border d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: '48px', height: '48px', overflow: 'hidden' }}
                                            >
                                                <img
                                                    src={item.image || FALLBACK_IMAGE}
                                                    alt={item.name}
                                                    className="w-100 h-100 object-fit-contain p-1"
                                                    loading="lazy"
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                                                />
                                            </div>

                                            {/* Name & Category */}
                                            <div className="min-w-0 flex-grow-1">
                                                <strong className="d-block small text-dark text-truncate" title={item.name}>
                                                    {item.name}
                                                </strong>
                                                <span className="tiny-text text-muted text-truncate d-block">
                                                    {item.category}
                                                    {item.variations && item.variations.length > 1 && ` · ${item.variations.length} vars`}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                                {/* Order Button / Stepper */}
                                                {orderQty > 0 ? (
                                                    <div className="btn-group rounded-pill border border-success overflow-hidden" style={{ backgroundColor: '#f0fdf4' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs text-success fw-bold px-2 py-1 border-0"
                                                            onClick={() => decreaseOrderQuantity(pocketId)}
                                                            title="Decrease order"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="x-small px-1 fw-bold text-success font-monospace d-flex align-items-center">
                                                            {orderQty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs text-success fw-bold px-2 py-1 border-0"
                                                            onClick={() => increaseOrderQuantity(pocketId)}
                                                            disabled={!canIncreaseOrder}
                                                            title="Increase order"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-success rounded-pill fw-bold px-2 py-1"
                                                        onClick={() => handleAdd(item, 'order')}
                                                        disabled={totalOrderCount >= 40}
                                                        title="Add to Order bot"
                                                    >
                                                        <i className="fa-solid fa-box me-1"></i>Order
                                                    </button>
                                                )}

                                                {/* Drop Button / Stepper */}
                                                {dropQty > 0 ? (
                                                    <div className="btn-group rounded-pill border border-info overflow-hidden" style={{ backgroundColor: '#f0f9ff', borderColor: '#0284c7' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs text-info fw-bold px-2 py-1 border-0"
                                                            style={{ color: '#0284c7' }}
                                                            onClick={() => decreaseDropQuantity(pocketId)}
                                                            title="Decrease drop"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="x-small px-1 fw-bold font-monospace d-flex align-items-center" style={{ color: '#0284c7' }}>
                                                            {dropQty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs text-info fw-bold px-2 py-1 border-0"
                                                            style={{ color: '#0284c7' }}
                                                            onClick={() => increaseDropQuantity(pocketId)}
                                                            disabled={!canIncreaseDrop}
                                                            title="Increase drop"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-info rounded-pill fw-bold px-2 py-1"
                                                        style={{ color: '#0284c7', borderColor: '#0284c7' }}
                                                        onClick={() => handleAdd(item, 'drop')}
                                                        disabled={totalDropCount >= 9}
                                                        title="Add to Drop bot"
                                                    >
                                                        <i className="fa-solid fa-plane-arrival me-1"></i>Drop
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-top bg-light d-flex align-items-center justify-content-between">
                    <span className="tiny-text text-muted">
                        Need all variations? Switch to <strong className="text-dark">Command Builder Catalog</strong>.
                    </span>
                    <button type="button" className="btn btn-dark rounded-pill px-4 fw-bold btn-sm" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickAddItemModal;
