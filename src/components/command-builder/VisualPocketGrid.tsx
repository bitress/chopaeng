import React, { useState, useMemo, useCallback } from 'react';
import type { PocketItem } from '../../hooks/useCommandBuilderPockets';
import { playChimeClick } from '../../utils/kkAudioSynthesizer';

interface VisualPocketGridProps {
    orderPockets: Array<{ item: PocketItem; quantity: number }>;
    dropPockets: Array<{ item: PocketItem; quantity: number }>;
    onDecreaseOrderQuantity?: (itemId: string) => void;
    onIncreaseOrderQuantity?: (itemId: string) => void;
    onRemoveOrderItem?: (itemId: string) => void;
    onDecreaseDropQuantity?: (itemId: string) => void;
    onIncreaseDropQuantity?: (itemId: string) => void;
    onRemoveDropItem?: (itemId: string) => void;
    onClearOrderPockets?: () => void;
    onClearDropPockets?: () => void;
    canIncreaseOrder?: boolean;
    canIncreaseDrop?: boolean;
    onFillTickets?: () => void;
    onFillCrowns?: () => void;
    onFillBells?: () => void;
    onMaximizeStacks?: () => void;
    onSortPockets?: () => void;
    onOpenAddItem?: (target: 'order' | 'drop') => void;
    onReorderOrderPockets?: (newOrderIds: string[]) => void;
    onReorderDropPockets?: (newOrderIds: string[]) => void;
}

const ORDER_BOT_MAX = 40;
const DROP_BOT_MAX = 9;

// Ground drop position labels for 3x3 grid
const DROP_POSITION_LABELS = [
    'North-West', 'North', 'North-East',
    'West', 'Center (Player Drop)', 'East',
    'South-West', 'South', 'South-East',
];

// ─── Slot type used for the expanded grid arrays ───────────────────────────
type OrderSlot = { item: PocketItem; quantity: number; parentId: string; isFirstInStack: boolean } | null;
type DropSlot = { item: PocketItem; quantity: number; parentId: string } | null;

export const VisualPocketGrid: React.FC<VisualPocketGridProps> = ({
    orderPockets,
    dropPockets,
    onDecreaseOrderQuantity,
    onIncreaseOrderQuantity,
    onRemoveOrderItem,
    onDecreaseDropQuantity,
    onIncreaseDropQuantity,
    onRemoveDropItem,
    onClearOrderPockets,
    onClearDropPockets,
    canIncreaseOrder = true,
    canIncreaseDrop = true,
    onFillTickets,
    onFillCrowns,
    onFillBells,
    onMaximizeStacks,
    onSortPockets,
    onOpenAddItem,
    onReorderOrderPockets,
    onReorderDropPockets,
}) => {
    const [activeTab, setActiveTab] = useState<'order' | 'drop' | 'villager'>('order');
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [expandIndividualSlots, setExpandIndividualSlots] = useState(true);

    // ── Drag-and-Drop state ────────────────────────────────────────────────
    const [dragSourceIdx, setDragSourceIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    const orderCount = useMemo(
        () => orderPockets.filter((p) => p.item.entityType !== 'villager').reduce((sum, p) => sum + p.quantity, 0),
        [orderPockets]
    );
    const dropCount = useMemo(
        () => dropPockets.filter((p) => p.item.entityType !== 'villager').reduce((sum, p) => sum + p.quantity, 0),
        [dropPockets]
    );

    // Find any villager currently loaded in order or drop pockets
    const currentVillager = useMemo(() => {
        const fromOrder = orderPockets.find((p) => p.item.entityType === 'villager')?.item;
        if (fromOrder) return { item: fromOrder, source: 'order' as const };
        const fromDrop = dropPockets.find((p) => p.item.entityType === 'villager')?.item;
        if (fromDrop) return { item: fromDrop, source: 'drop' as const };
        return null;
    }, [orderPockets, dropPockets]);

    // ── Build 40-slot expanded array for Order Bot (Regular items only) ───────────────────────
    const orderGridSlots = useMemo<OrderSlot[]>(() => {
        const slots: OrderSlot[] = [];
        const regularOrderPockets = orderPockets.filter((p) => p.item.entityType !== 'villager');

        if (expandIndividualSlots) {
            for (const pocket of regularOrderPockets) {
                for (let q = 0; q < pocket.quantity; q++) {
                    if (slots.length < ORDER_BOT_MAX) {
                        slots.push({
                            item: pocket.item,
                            quantity: 1,
                            parentId: pocket.item.id,
                            isFirstInStack: q === 0,
                        });
                    }
                }
            }
        } else {
            for (const pocket of regularOrderPockets) {
                if (slots.length < ORDER_BOT_MAX) {
                    slots.push({
                        item: pocket.item,
                        quantity: pocket.quantity,
                        parentId: pocket.item.id,
                        isFirstInStack: true,
                    });
                }
            }
        }

        while (slots.length < ORDER_BOT_MAX) {
            slots.push(null);
        }

        return slots;
    }, [orderPockets, expandIndividualSlots]);

    // ── Build 9-slot expanded array for Drop Bot (Regular items only) ─────────────────────────
    const dropGridSlots = useMemo<DropSlot[]>(() => {
        const slots: DropSlot[] = [];
        const regularDropPockets = dropPockets.filter((p) => p.item.entityType !== 'villager');
        for (const pocket of regularDropPockets) {
            for (let q = 0; q < pocket.quantity; q++) {
                if (slots.length < DROP_BOT_MAX) {
                    slots.push({
                        item: pocket.item,
                        quantity: 1,
                        parentId: pocket.item.id,
                    });
                }
            }
        }
        while (slots.length < DROP_BOT_MAX) {
            slots.push(null);
        }
        return slots;
    }, [dropPockets]);

    // ── Drag helpers ───────────────────────────────────────────────────────
    const commitOrderReorder = useCallback((fromIdx: number, toIdx: number) => {
        if (!onReorderOrderPockets || fromIdx === toIdx) return;
        // Build new parentId order from current expanded slots, then swap
        const ids = orderGridSlots.map((s) => s?.parentId ?? '');
        const [moved] = ids.splice(fromIdx, 1);
        ids.splice(toIdx, 0, moved);
        onReorderOrderPockets(ids.filter(Boolean));
        playChimeClick();
    }, [orderGridSlots, onReorderOrderPockets]);

    const commitDropReorder = useCallback((fromIdx: number, toIdx: number) => {
        if (!onReorderDropPockets || fromIdx === toIdx) return;
        const ids = dropGridSlots.map((s) => s?.parentId ?? '');
        const [moved] = ids.splice(fromIdx, 1);
        ids.splice(toIdx, 0, moved);
        onReorderDropPockets(ids.filter(Boolean));
        playChimeClick();
    }, [dropGridSlots, onReorderDropPockets]);

    const handleDragStart = (e: React.DragEvent, idx: number) => {
        setDragSourceIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(idx));
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIdx !== idx) setDragOverIdx(idx);
    };

    const handleDrop = (e: React.DragEvent, toIdx: number, isDropGrid = false) => {
        e.preventDefault();
        const fromIdx = dragSourceIdx;
        if (fromIdx !== null && fromIdx !== toIdx) {
            if (isDropGrid) {
                commitDropReorder(fromIdx, toIdx);
            } else {
                commitOrderReorder(fromIdx, toIdx);
            }
        }
        setDragSourceIdx(null);
        setDragOverIdx(null);
    };

    const handleDragEnd = () => {
        setDragSourceIdx(null);
        setDragOverIdx(null);
    };

    return (
        <div className="visual-pocket-grid-container rounded-4 bg-white border p-3 shadow-sm mb-3">

            {/* Top Toolbar & Mode Switcher */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
                <div className="d-flex flex-wrap gap-1 align-items-center">
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill fw-bold px-3 py-1 d-flex align-items-center gap-1 transition-all ${
                            activeTab === 'order' ? 'btn-nook text-white shadow-xs' : 'btn-light text-muted border'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => {
                            setActiveTab('order');
                            playChimeClick();
                            setSelectedSlotIndex(null);
                        }}
                    >
                        <i className="fa-solid fa-boxes-stacked"></i>
                        <span>Order Pockets</span>
                        <span className={`badge rounded-pill ms-1 ${activeTab === 'order' ? 'bg-white text-success' : 'bg-secondary text-white'}`}>
                            {orderCount}/40
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill fw-bold px-3 py-1 d-flex align-items-center gap-1 transition-all ${
                            activeTab === 'drop' ? 'btn-nook text-white shadow-xs' : 'btn-light text-muted border'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => {
                            setActiveTab('drop');
                            playChimeClick();
                            setSelectedSlotIndex(null);
                        }}
                    >
                        <i className="fa-solid fa-layer-group"></i>
                        <span>Drop Radius</span>
                        <span className={`badge rounded-pill ms-1 ${activeTab === 'drop' ? 'bg-white text-success' : 'bg-secondary text-white'}`}>
                            {dropCount}/9
                        </span>
                    </button>

                    {currentVillager && (
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill fw-bold px-3 py-1 d-flex align-items-center gap-1 transition-all ${
                                activeTab === 'villager' ? 'btn-warning text-dark shadow-xs' : 'btn-outline-warning text-dark border'
                            }`}
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => {
                                setActiveTab('villager');
                                playChimeClick();
                                setSelectedSlotIndex(null);
                            }}
                        >
                            <i className="fa-solid fa-house-user text-warning"></i>
                            <span>Villager Box</span>
                            <span className="badge bg-dark text-white rounded-pill ms-1">1</span>
                        </button>
                    )}
                </div>

                {/* Right controls */}
                <div className="d-flex align-items-center gap-2">
                    {activeTab === 'order' && (
                        <button
                            type="button"
                            className={`btn btn-xs rounded-pill px-2 py-1 fw-bold ${expandIndividualSlots ? 'btn-light border text-dark' : 'btn-white border text-muted'}`}
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setExpandIndividualSlots(!expandIndividualSlots)}
                            title={expandIndividualSlots ? 'Switch to Stack View' : 'Switch to 40 Individual Slots'}
                        >
                            <i className={`fa-solid ${expandIndividualSlots ? 'fa-table-cells' : 'fa-list'} me-1 text-success`}></i>
                            {expandIndividualSlots ? '40-Slot Grid' : 'Stacks View'}
                        </button>
                    )}

                    {onOpenAddItem && (
                        <button
                            type="button"
                            className="btn btn-xs btn-nook text-white rounded-pill fw-bold px-2 py-1 shadow-2xs"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => {
                                onOpenAddItem(activeTab === 'drop' ? 'drop' : 'order');
                                playChimeClick();
                            }}
                        >
                            <i className="fa-solid fa-plus me-1"></i>Add Items
                        </button>
                    )}

                    {activeTab === 'order' && onClearOrderPockets && orderPockets.length > 0 && (
                        <button
                            type="button"
                            className="btn btn-xs btn-outline-danger rounded-pill fw-bold px-2 py-1"
                            style={{ fontSize: '0.7rem' }}
                            onClick={onClearOrderPockets}
                        >
                            <i className="fa-solid fa-trash-can me-1"></i>Clear
                        </button>
                    )}

                    {activeTab === 'drop' && onClearDropPockets && dropPockets.length > 0 && (
                        <button
                            type="button"
                            className="btn btn-xs btn-outline-danger rounded-pill fw-bold px-2 py-1"
                            style={{ fontSize: '0.7rem' }}
                            onClick={onClearDropPockets}
                        >
                            <i className="fa-solid fa-trash-can me-1"></i>Clear
                        </button>
                    )}
                </div>
            </div>

            {/* TAB 1: 40-SLOT ORDER BOT IN-GAME GRID */}
            {activeTab === 'order' && (
                <div>
                    {/* Drag hint */}
                    {orderPockets.length > 1 && onReorderOrderPockets && (
                        <div className="mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                            <i className="fa-solid fa-grip-dots-vertical text-success opacity-75"></i>
                            <span>Drag slots to reorder your pockets</span>
                        </div>
                    )}

                    {/* Visual Grid Container (4 rows x 10 columns) */}
                    <div
                        className="pocket-inventory-screen rounded-4 p-2 p-md-3 mb-2"
                        style={{
                            backgroundColor: '#f2f7ec',
                            backgroundImage: 'radial-gradient(#dce8cc 15%, transparent 16%)',
                            backgroundSize: '16px 16px',
                            border: '3px solid #bed6a9',
                        }}
                    >
                        <div
                            className="inventory-grid"
                        >
                            {orderGridSlots.map((slot, idx) => {
                                const isSelected = selectedSlotIndex === idx && slot !== null;
                                const isDragSource = dragSourceIdx === idx;
                                const isDragTarget = dragOverIdx === idx && dragSourceIdx !== null && dragSourceIdx !== idx;
                                const isDraggable = !!slot && !!onReorderOrderPockets;

                                return (
                                    <div
                                        key={idx}
                                        draggable={isDraggable}
                                        onDragStart={isDraggable ? (e) => handleDragStart(e, idx) : undefined}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        className={`pocket-slot-tile position-relative rounded-3 d-flex flex-column align-items-center justify-content-center cursor-pointer transition-all ${
                                            slot ? 'has-item shadow-2xs' : 'empty-slot hover-shadow-2xs'
                                        } ${isSelected ? 'selected-slot' : ''} ${isDragSource ? 'drag-source-slot' : ''} ${isDragTarget ? 'drag-target-slot' : ''}`}
                                        style={{
                                            aspectRatio: '1 / 1',
                                            backgroundColor: isDragTarget
                                                ? 'rgba(55, 176, 109, 0.15)'
                                                : isDragSource
                                                ? 'rgba(55, 176, 109, 0.08)'
                                                : slot
                                                ? '#ffffff'
                                                : 'rgba(255, 255, 255, 0.45)',
                                            border: isDragTarget
                                                ? '2px dashed #2ea466'
                                                : isSelected
                                                ? '2px solid #2ea466'
                                                : slot
                                                ? '2px solid #d4dfcc'
                                                : '2px dashed rgba(150, 180, 140, 0.4)',
                                            overflow: 'hidden',
                                            opacity: isDragSource ? 0.4 : 1,
                                            cursor: isDraggable ? 'grab' : slot ? 'pointer' : 'default',
                                        }}
                                        onClick={() => {
                                            if (slot) {
                                                playChimeClick();
                                                setSelectedSlotIndex(isSelected ? null : idx);
                                            } else if (onOpenAddItem) {
                                                playChimeClick();
                                                onOpenAddItem('order');
                                            }
                                        }}
                                        title={slot ? `${slot.item.name} (Slot #${idx + 1})${isDraggable ? ' — Drag to reorder' : ''}` : `Empty Slot #${idx + 1} - Click to add items`}
                                    >
                                        {slot ? (
                                            <>
                                                {/* Drag handle indicator (top-left micro-grip) */}
                                                {isDraggable && (
                                                    <i
                                                        className="fa-solid fa-grip-dots-vertical position-absolute drag-grip-icon"
                                                        style={{
                                                            fontSize: '0.5rem',
                                                            top: '2px',
                                                            left: '2px',
                                                            color: 'rgba(55,176,109,0.45)',
                                                            pointerEvents: 'none',
                                                        }}
                                                    />
                                                )}

                                                {/* Item Icon */}
                                                <img
                                                    src={slot.item.image}
                                                    alt={slot.item.name}
                                                    draggable={false}
                                                    className="w-75 h-75 object-fit-contain p-1 transform-hover"
                                                    loading="lazy"
                                                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                                />

                                                {/* Quantity badge if > 1 or in stack mode */}
                                                {(slot.quantity > 1 || !expandIndividualSlots) && (
                                                    <span
                                                        className="position-absolute bottom-0 end-0 badge rounded-pill px-1 py-0 font-monospace"
                                                        style={{
                                                            fontSize: '0.62rem',
                                                            backgroundColor: 'rgba(35, 60, 40, 0.85)',
                                                            color: '#ffffff',
                                                            transform: 'scale(0.85)',
                                                        }}
                                                    >
                                                        ×{slot.quantity}
                                                    </span>
                                                )}

                                                {/* Variant indicator dot */}
                                                {slot.item.variantLabel && (
                                                    <span
                                                        className="position-absolute top-0 start-0 badge rounded-circle p-1 bg-warning"
                                                        style={{ width: '6px', height: '6px', transform: 'translate(3px, 3px)' }}
                                                        title={`Variant: ${slot.item.variantLabel}`}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            /* Empty Slot Indicator */
                                            <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-25">
                                                <i className="fa-solid fa-leaf" style={{ fontSize: '0.75rem' }}></i>
                                                <span className="font-monospace" style={{ fontSize: '0.55rem' }}>{idx + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Item Interactive Detail / Action Bar */}
                    {selectedSlotIndex !== null && orderGridSlots[selectedSlotIndex] && (
                        <div className="bg-light rounded-4 border p-2 px-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-2 animate-fade">
                            <div className="d-flex align-items-center gap-2">
                                <img
                                    src={orderGridSlots[selectedSlotIndex]?.item.image}
                                    alt={orderGridSlots[selectedSlotIndex]?.item.name}
                                    style={{ width: 34, height: 34, objectFit: 'contain' }}
                                />
                                <div>
                                    <strong className="d-block text-dark small">
                                        {orderGridSlots[selectedSlotIndex]?.item.name}
                                    </strong>
                                    <span className="tiny-text text-muted">
                                        Slot #{selectedSlotIndex + 1} · {orderGridSlots[selectedSlotIndex]?.item.category}
                                        {orderGridSlots[selectedSlotIndex]?.item.variantLabel ? ` (${orderGridSlots[selectedSlotIndex]?.item.variantLabel})` : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-1">
                                {onDecreaseOrderQuantity && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-white border rounded-pill px-2 py-0 fw-bold"
                                        style={{ fontSize: '0.75rem' }}
                                        onClick={() => {
                                            const parentId = orderGridSlots[selectedSlotIndex]?.parentId;
                                            if (parentId) onDecreaseOrderQuantity(parentId);
                                        }}
                                        title="Decrease Quantity"
                                    >
                                        <i className="fa-solid fa-minus text-muted"></i>
                                    </button>
                                )}

                                {onIncreaseOrderQuantity && canIncreaseOrder && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-white border rounded-pill px-2 py-0 fw-bold"
                                        style={{ fontSize: '0.75rem' }}
                                        onClick={() => {
                                            const parentId = orderGridSlots[selectedSlotIndex]?.parentId;
                                            if (parentId) onIncreaseOrderQuantity(parentId);
                                        }}
                                        title="Add Another"
                                    >
                                        <i className="fa-solid fa-plus text-success"></i>
                                    </button>
                                )}

                                {onRemoveOrderItem && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0 fw-bold ms-1"
                                        style={{ fontSize: '0.75rem' }}
                                        onClick={() => {
                                            const parentId = orderGridSlots[selectedSlotIndex]?.parentId;
                                            if (parentId) {
                                                onRemoveOrderItem(parentId);
                                                setSelectedSlotIndex(null);
                                            }
                                        }}
                                        title="Remove from Pockets"
                                    >
                                        <i className="fa-solid fa-trash-can me-1"></i>Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Fill Preset Pills */}
                    {canIncreaseOrder && (onFillTickets || onFillCrowns || onFillBells || onMaximizeStacks || onSortPockets) && (
                        <div className="d-flex flex-wrap align-items-center gap-1 pt-1">
                            <span className="tiny-text fw-bold text-muted text-uppercase me-1">Quick Actions:</span>
                            {onFillTickets && (
                                <button
                                    type="button"
                                    className="btn btn-xs btn-white border rounded-pill fw-bold text-dark shadow-2xs"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={onFillTickets}
                                >
                                    +Full NMTs (40)
                                </button>
                            )}
                            {onFillCrowns && (
                                <button
                                    type="button"
                                    className="btn btn-xs btn-white border rounded-pill fw-bold text-dark shadow-2xs"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={onFillCrowns}
                                >
                                    +Full Crowns (40)
                                </button>
                            )}
                            {onFillBells && (
                                <button
                                    type="button"
                                    className="btn btn-xs btn-white border rounded-pill fw-bold text-dark shadow-2xs"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={onFillBells}
                                >
                                    +Full Bells (40)
                                </button>
                            )}
                            {onMaximizeStacks && (
                                <button
                                    type="button"
                                    className="btn btn-xs btn-white border rounded-pill fw-bold text-dark shadow-2xs"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={onMaximizeStacks}
                                >
                                    <i className="fa-solid fa-layer-group me-1 text-success"></i>Max Stacks
                                </button>
                            )}
                            {onSortPockets && (
                                <button
                                    type="button"
                                    className="btn btn-xs btn-white border rounded-pill fw-bold text-dark shadow-2xs"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={onSortPockets}
                                >
                                    <i className="fa-solid fa-arrow-down-a-z me-1 text-primary"></i>Sort
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: 9-SLOT DROP BOT 3x3 GROUND RADIUS */}
            {activeTab === 'drop' && (
                <div>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                        {/* 3x3 Ground Drop Grid */}
                        <div
                            className="p-3 rounded-4"
                            style={{
                                backgroundColor: '#f2f7ec',
                                backgroundImage: 'radial-gradient(#dce8cc 15%, transparent 16%)',
                                backgroundSize: '16px 16px',
                                border: '3px solid #bed6a9',
                                width: '260px',
                                maxWidth: '100%',
                            }}
                        >
                            <div className="text-center mb-2">
                                <span className="tiny-text fw-bold text-muted text-uppercase">
                                    <i className="fa-solid fa-location-dot text-danger me-1"></i>3×3 Ground Radius
                                </span>
                                {dropPockets.length > 1 && onReorderDropPockets && (
                                    <span className="ms-2 tiny-text text-muted opacity-75">
                                        <i className="fa-solid fa-arrows-up-down-left-right me-1"></i>Drag to reorder
                                    </span>
                                )}
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px',
                                }}
                            >
                                {dropGridSlots.map((slot, idx) => {
                                    const isDragSource = dragSourceIdx === idx;
                                    const isDragTarget = dragOverIdx === idx && dragSourceIdx !== null && dragSourceIdx !== idx;
                                    const isDraggable = !!slot && !!onReorderDropPockets;

                                    return (
                                        <div
                                            key={idx}
                                            draggable={isDraggable}
                                            onDragStart={isDraggable ? (e) => handleDragStart(e, idx) : undefined}
                                            onDragOver={(e) => handleDragOver(e, idx)}
                                            onDrop={(e) => handleDrop(e, idx, true)}
                                            onDragEnd={handleDragEnd}
                                            className={`rounded-3 p-2 d-flex flex-column align-items-center justify-content-center position-relative transition-all ${
                                                slot ? 'bg-white shadow-2xs border border-success' : 'border border-2 border-dashed'
                                            }`}
                                            style={{
                                                aspectRatio: '1 / 1',
                                                borderColor: isDragTarget ? '#2ea466' : slot ? '#2ea466' : 'rgba(150, 180, 140, 0.4)',
                                                backgroundColor: isDragTarget
                                                    ? 'rgba(55,176,109,0.12)'
                                                    : isDragSource
                                                    ? 'rgba(55,176,109,0.06)'
                                                    : slot
                                                    ? '#ffffff'
                                                    : 'rgba(255,255,255,0.4)',
                                                opacity: isDragSource ? 0.35 : 1,
                                                border: isDragTarget ? '2px dashed #2ea466' : undefined,
                                                cursor: isDraggable ? 'grab' : slot ? 'pointer' : 'default',
                                                transition: 'all 0.15s ease',
                                            }}
                                            title={slot ? `${slot.item.name} (${DROP_POSITION_LABELS[idx]})${isDraggable ? ' — Drag to reorder' : ''}` : `Empty Spot (${DROP_POSITION_LABELS[idx]})`}
                                            onClick={() => {
                                                if (slot) {
                                                    playChimeClick();
                                                    setSelectedSlotIndex(selectedSlotIndex === idx ? null : idx);
                                                } else if (onOpenAddItem) {
                                                    playChimeClick();
                                                    onOpenAddItem('drop');
                                                }
                                            }}
                                        >
                                            {slot ? (
                                                <>
                                                    <img
                                                        src={slot.item.image}
                                                        alt={slot.item.name}
                                                        draggable={false}
                                                        className="w-75 h-75 object-fit-contain"
                                                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                                    />
                                                    <span className="position-absolute top-0 start-0 badge bg-dark text-white rounded-pill px-1" style={{ fontSize: '0.55rem' }}>
                                                        #{idx + 1}
                                                    </span>
                                                    {onRemoveDropItem && (
                                                        <button
                                                            type="button"
                                                            className="position-absolute top-0 end-0 btn btn-link text-danger p-0 m-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRemoveDropItem(slot.parentId);
                                                            }}
                                                            title="Remove"
                                                        >
                                                            <i className="fa-solid fa-xmark x-small"></i>
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center text-muted opacity-40">
                                                    <span className="d-block font-monospace" style={{ fontSize: '0.65rem' }}>#{idx + 1}</span>
                                                    <i className="fa-solid fa-plus x-small"></i>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Drop Bot Guide & Legend */}
                        <div className="flex-grow-1 w-100">
                            <h6 className="fw-bold text-dark mb-1">
                                <i className="fa-solid fa-circle-info text-success me-1"></i>How Drop Bot Works
                            </h6>
                            <p className="tiny-text text-muted mb-2">
                                Drop bots spawn items directly onto the 9 ground tiles surrounding your character when you execute <code>!drop</code> on an island.
                            </p>

                            <div className="p-3 bg-light rounded-3 border mb-2">
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="small fw-bold text-dark">Drop Queue Capacity</span>
                                    <span className={`badge rounded-pill ${dropCount >= DROP_BOT_MAX ? 'bg-warning text-dark' : 'bg-success'}`}>
                                        {dropCount} / {DROP_BOT_MAX} Ground Slots
                                    </span>
                                </div>
                                <div className="progress" style={{ height: 6 }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${(dropCount / DROP_BOT_MAX) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Drop Slot Action controls */}
                            {selectedSlotIndex !== null && dropGridSlots[selectedSlotIndex] && (
                                <div className="p-2 bg-white rounded-3 border d-flex align-items-center justify-content-between gap-2 shadow-2xs">
                                    <div className="d-flex align-items-center gap-2">
                                        <img src={dropGridSlots[selectedSlotIndex]?.item.image} alt="Drop item" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                                        <div className="text-truncate">
                                            <strong className="d-block text-dark x-small text-truncate">{dropGridSlots[selectedSlotIndex]?.item.name}</strong>
                                            <span className="tiny-text text-muted">Drop Position: {DROP_POSITION_LABELS[selectedSlotIndex]}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        {onDecreaseDropQuantity && (
                                            <button
                                                type="button"
                                                className="btn btn-xs btn-white border rounded-pill px-2 py-0 fw-bold"
                                                onClick={() => {
                                                    const pid = dropGridSlots[selectedSlotIndex]?.parentId;
                                                    if (pid) onDecreaseDropQuantity(pid);
                                                }}
                                                title="Decrease"
                                            >
                                                <i className="fa-solid fa-minus text-muted x-small"></i>
                                            </button>
                                        )}
                                        {onIncreaseDropQuantity && canIncreaseDrop && (
                                            <button
                                                type="button"
                                                className="btn btn-xs btn-white border rounded-pill px-2 py-0 fw-bold"
                                                onClick={() => {
                                                    const pid = dropGridSlots[selectedSlotIndex]?.parentId;
                                                    if (pid) onIncreaseDropQuantity(pid);
                                                }}
                                                title="Increase"
                                            >
                                                <i className="fa-solid fa-plus text-success x-small"></i>
                                            </button>
                                        )}
                                        {onRemoveDropItem && (
                                            <button
                                                type="button"
                                                className="btn btn-xs btn-outline-danger rounded-pill px-2 py-0 fw-bold ms-1"
                                                onClick={() => {
                                                    const pid = dropGridSlots[selectedSlotIndex]?.parentId;
                                                    if (pid) {
                                                        onRemoveDropItem(pid);
                                                        setSelectedSlotIndex(null);
                                                    }
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: VILLAGER ADOPTION SHOWCASE */}
            {activeTab === 'villager' && currentVillager && (
                <div className="p-3 rounded-4 bg-light border animate-fade">
                    <div className="row g-3 align-items-center">
                        <div className="col-sm-4 col-md-3 text-center">
                            <div
                                className="rounded-4 p-3 shadow-sm bg-white border border-2 border-warning position-relative overflow-hidden"
                                style={{ background: 'linear-gradient(180deg, #ffffff 60%, #fff8e1 100%)' }}
                            >
                                <img
                                    src={currentVillager.item.image}
                                    alt={currentVillager.item.name}
                                    className="img-fluid"
                                    style={{ maxHeight: '140px', objectFit: 'contain' }}
                                />
                                <span className="position-absolute top-0 end-0 badge bg-warning text-dark m-2 rounded-pill shadow-xs">
                                    In Boxes
                                </span>
                            </div>
                        </div>

                        <div className="col-sm-8 col-md-9">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h5 className="fw-black text-dark mb-0 ac-font">{currentVillager.item.name}</h5>
                                <span className="badge bg-dark text-white rounded-pill px-2 py-1 x-small">
                                    {currentVillager.item.personality || 'Villager'}
                                </span>
                                <span className="badge bg-warning-subtle text-warning-emphasis border rounded-pill px-2 py-1 x-small">
                                    {currentVillager.item.category}
                                </span>
                            </div>

                            <p className="small text-muted mb-2">
                                {currentVillager.item.description || 'Ready for adoption into an empty plot on your island!'}
                            </p>

                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <span className="badge bg-success-subtle text-success-emphasis border rounded-pill px-3 py-2 fw-bold">
                                    <i className="fa-solid fa-house-chimney me-1"></i>
                                    Queued in {currentVillager.source === 'order' ? 'Order Bot' : 'Drop Bot'}
                                </span>

                                {onRemoveOrderItem && currentVillager.source === 'order' && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                                        onClick={() => onRemoveOrderItem(currentVillager.item.id)}
                                    >
                                        <i className="fa-solid fa-trash-can me-1"></i>Remove Villager
                                    </button>
                                )}

                                {onRemoveDropItem && currentVillager.source === 'drop' && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                                        onClick={() => onRemoveDropItem(currentVillager.item.id)}
                                    >
                                        <i className="fa-solid fa-trash-can me-1"></i>Remove Villager
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Injected Styles */}
            <style>{`
                .inventory-grid {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 6px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                @media (max-width: 380px) {
                    .inventory-grid {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 4px;
                    }
                }
                @media (min-width: 576px) {
                    .inventory-grid {
                        grid-template-columns: repeat(8, minmax(0, 1fr));
                        gap: 7px;
                    }
                }
                @media (min-width: 992px) {
                    .inventory-grid {
                        grid-template-columns: repeat(10, minmax(0, 1fr));
                        gap: 8px;
                    }
                }
                .pocket-slot-tile {
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    box-sizing: border-box;
                }
                .pocket-slot-tile:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(55, 176, 109, 0.25);
                }
                .pocket-slot-tile.selected-slot {
                    box-shadow: 0 0 0 3px rgba(55, 176, 109, 0.45) !important;
                    background-color: #f0fbf4 !important;
                }
                .pocket-slot-tile.drag-source-slot {
                    cursor: grabbing !important;
                }
                .pocket-slot-tile.drag-target-slot {
                    transform: scale(1.04);
                    box-shadow: 0 0 0 3px rgba(55, 176, 109, 0.6) !important;
                }
                .pocket-slot-tile[draggable="true"]:active {
                    cursor: grabbing !important;
                }
                .drag-grip-icon {
                    opacity: 0;
                    transition: opacity 0.15s ease;
                }
                .pocket-slot-tile:hover .drag-grip-icon {
                    opacity: 1;
                }
                @media (max-width: 576px) {
                    .pocket-slot-tile {
                        min-height: 44px;
                    }
                }
            `}</style>
        </div>
    );
};
