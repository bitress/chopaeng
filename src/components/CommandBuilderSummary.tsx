import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { CatalogEntity } from "../data/commandBuilderData";
import { SmartFillDropdown } from "./command-builder/SmartFillDropdown";
import { playChimeClick } from "../utils/kkAudioSynthesizer";

type PocketItem = CatalogEntity & {
    baseId?: string | number | null;
    variantId?: string | number | null;
    variantLabel?: string | null;
};

type CommandBuilderSummaryProps = {
    // Order pockets
    orderPockets: Array<{ item: PocketItem; quantity: number }>;
    // Drop pockets
    dropPockets: Array<{ item: PocketItem; quantity: number }>;
    orderCommandText: string;
    dropCommandText: string;
    copyOrderStatus: string;
    copyDropStatus: string;
    onCopyOrder: () => void;
    onCopyDrop: () => void;
    // Order item controls
    onDecreaseOrderQuantity?: (itemId: string) => void;
    onIncreaseOrderQuantity?: (itemId: string) => void;
    onRemoveOrderItem?: (itemId: string) => void;
    // Drop item controls
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
    onFillRemaining?: (type: 'nmt' | 'crowns' | 'bells' | 'gold' | 'repeat') => void;
    onSortPockets?: () => void;
    showTerminal?: boolean;
    onOpenBundlesModal?: () => void;
    onOpenShareModal?: () => void;
    onOpenCommunityLoadoutsModal?: () => void;
};

const ORDER_BOT_MAX = 40;
const DROP_BOT_MAX = 9;
const POCKETS_LIST_ID = "command-builder-pockets-list";

export const CommandBuilderSummary = ({
    orderPockets,
    dropPockets,
    orderCommandText,
    dropCommandText,
    copyOrderStatus,
    copyDropStatus,
    onCopyOrder,
    onCopyDrop,
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
    onFillRemaining,
    onSortPockets,
    showTerminal = true,
    onOpenBundlesModal,
    onOpenShareModal,
    onOpenCommunityLoadoutsModal,
}: CommandBuilderSummaryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'order' | 'drop'>('all');
    const [listSearchQuery, setListSearchQuery] = useState('');

    const orderCount = useMemo(() => orderPockets.reduce((sum, p) => sum + p.quantity, 0), [orderPockets]);
    const dropCount = useMemo(() => dropPockets.reduce((sum, p) => sum + p.quantity, 0), [dropPockets]);
    const totalCount = orderCount + dropCount;
    const isEmpty = orderPockets.length === 0 && dropPockets.length === 0;

    const orderFull = orderCount >= ORDER_BOT_MAX;
    const dropFull = dropCount >= DROP_BOT_MAX;
    const remainingOrderSlots = Math.max(0, ORDER_BOT_MAX - orderCount);

    // Capacity percentages
    const orderPercent = Math.min(100, Math.round((orderCount / ORDER_BOT_MAX) * 100));
    const dropPercent = Math.min(100, Math.round((dropCount / DROP_BOT_MAX) * 100));

    // Filtered lists when searching in list view
    const filteredOrderPockets = useMemo(() => {
        if (!listSearchQuery.trim()) return orderPockets;
        const q = listSearchQuery.toLowerCase();
        return orderPockets.filter(p => p.item.name.toLowerCase().includes(q) || (p.item.category && p.item.category.toLowerCase().includes(q)));
    }, [orderPockets, listSearchQuery]);

    const filteredDropPockets = useMemo(() => {
        if (!listSearchQuery.trim()) return dropPockets;
        const q = listSearchQuery.toLowerCase();
        return dropPockets.filter(p => p.item.name.toLowerCase().includes(q) || (p.item.category && p.item.category.toLowerCase().includes(q)));
    }, [dropPockets, listSearchQuery]);

    const [copiedInstruction, setCopiedInstruction] = useState<'order' | 'drop' | null>(null);

    // Automatically reveal relevant delivery flow instructions upon copying
    useEffect(() => {
        if (copyOrderStatus === 'Copied!') {
            setCopiedInstruction('order');
        }
    }, [copyOrderStatus]);

    useEffect(() => {
        if (copyDropStatus === 'Copied!') {
            setCopiedInstruction('drop');
        }
    }, [copyDropStatus]);

    // Keyboard shortcuts: Ctrl+Shift+O = Copy Order, Ctrl+Shift+D = Copy Drop
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
                e.preventDefault();
                if (orderCommandText) {
                    onCopyOrder();
                    setCopiedInstruction('order');
                }
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
                e.preventDefault();
                if (dropCommandText) {
                    onCopyDrop();
                    setCopiedInstruction('drop');
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [orderCommandText, dropCommandText, onCopyOrder, onCopyDrop]);

    return (
        <div 
            className="command-builder-summary rounded-4 border shadow-sm p-3 p-md-4 transition-all"
            style={{ 
                borderTop: '5px solid var(--nook-green)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                borderColor: 'var(--card-border, #e9ecef)',
            }}
        >
            {/* Screen-reader announcements for copy actions */}
            <div aria-live="polite" className="visually-hidden">
                {[copyOrderStatus, copyDropStatus].filter(Boolean).join(". ")}
            </div>

            {/* ── Top Header ─────────────────────────────────────────── */}
            <div className="d-flex flex-column gap-3 mb-3">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <div 
                            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: 'linear-gradient(135deg, #e8f7ec 0%, #c3edd0 100%)',
                                color: 'var(--nook-green)' 
                            }}
                        >
                            <i className="fa-solid fa-bag-shopping fs-5"></i>
                        </div>
                        <div>
                            <h2 className="h5 fw-black mb-0 ac-font text-dark" style={{ fontSize: '1.25rem', letterSpacing: '0.3px' }}>
                                Pocket Summary
                            </h2>
                            <p className="tiny-text text-muted mb-0 font-monospace">
                                {totalCount} {totalCount === 1 ? 'item' : 'items'} queued ({orderCount} order · {dropCount} drop)
                            </p>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                        <Link
                            to="/pockets"
                            className="btn btn-sm btn-white border rounded-pill fw-bold text-dark px-2 px-sm-3 py-1 transition-all shadow-2xs d-flex align-items-center gap-1"
                            title="Open Full-Screen 40-Slot Pocket Inventory Grid"
                            style={{ fontSize: '0.78rem' }}
                        >
                            <i className="fa-solid fa-up-right-and-down-left-from-center text-success x-small"></i>
                            <span className="d-none d-sm-inline">Full Grid</span>
                        </Link>

                        <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-pill fw-bold px-2 px-sm-3 py-1 text-muted transition-all shadow-none"
                            onClick={() => {
                                setIsCollapsed((v) => !v);
                                playChimeClick();
                            }}
                            aria-expanded={!isCollapsed}
                            aria-controls={POCKETS_LIST_ID}
                            title={isCollapsed ? "Expand Pocket Summary" : "Collapse Pocket Summary"}
                            style={{ fontSize: '0.78rem' }}
                        >
                            <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} me-1`}></i>
                            <span>{isCollapsed ? 'Show' : 'Hide'}</span>
                        </button>
                    </div>
                </div>

                {/* Capacity Progress Meters */}
                <div className="row g-2">
                    {/* Order Capacity Meter */}
                    <div className="col-6">
                        <div 
                            className="p-2 rounded-3 border transition-all"
                            style={{ 
                                backgroundColor: orderFull ? 'rgba(220, 53, 69, 0.08)' : 'var(--subtle-bg, #f4fbf6)',
                                borderColor: orderFull ? '#f5c6cb' : 'var(--card-border, #d2f0dd)'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="tiny-text fw-bold text-uppercase tracking-wider" style={{ color: orderFull ? '#dc3545' : 'var(--nook-green)' }}>
                                    <i className="fa-solid fa-cart-flatbed me-1"></i>Order Bot
                                </span>
                                <span className={`badge rounded-pill ${orderFull ? 'bg-danger' : 'bg-success'} text-white x-small px-2 py-0`}>
                                    {orderCount}/{ORDER_BOT_MAX}
                                </span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '10px' }}>
                                <div 
                                    className={`progress-bar transition-all ${orderFull ? 'bg-danger' : orderPercent > 75 ? 'bg-warning' : 'bg-success'}`}
                                    role="progressbar" 
                                    style={{ width: `${orderPercent}%`, borderRadius: '10px' }} 
                                    aria-valuenow={orderCount} 
                                    aria-valuemin={0} 
                                    aria-valuemax={ORDER_BOT_MAX}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Drop Capacity Meter */}
                    <div className="col-6">
                        <div 
                            className="p-2 rounded-3 border transition-all"
                            style={{ 
                                backgroundColor: dropFull ? 'rgba(220, 53, 69, 0.08)' : dropCount > 0 ? 'rgba(23, 162, 184, 0.08)' : 'var(--subtle-bg, #f8f9fa)',
                                borderColor: dropFull ? '#f5c6cb' : 'var(--card-border, #e9ecef)'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="tiny-text fw-bold text-uppercase tracking-wider" style={{ color: dropFull ? '#dc3545' : '#17a2b8' }}>
                                    <i className="fa-solid fa-layer-group me-1"></i>Drop Radius
                                </span>
                                <span className={`badge rounded-pill ${dropFull ? 'bg-danger' : dropCount > 0 ? 'bg-info text-dark' : 'bg-secondary'} text-white x-small px-2 py-0`}>
                                    {dropCount}/{DROP_BOT_MAX}
                                </span>
                            </div>
                            <div className="progress" style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '10px' }}>
                                <div 
                                    className={`progress-bar transition-all ${dropFull ? 'bg-danger' : 'bg-info'}`}
                                    role="progressbar" 
                                    style={{ width: `${dropPercent}%`, borderRadius: '10px' }} 
                                    aria-valuenow={dropCount} 
                                    aria-valuemin={0} 
                                    aria-valuemax={DROP_BOT_MAX}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Action Toolbar (Bundles, Smart Tools & Share) ─────────────────────────── */}
            <div className="d-flex flex-wrap gap-2 mb-3">
                {(onOpenCommunityLoadoutsModal || onOpenBundlesModal) && (
                    <button
                        type="button"
                        onClick={() => {
                            if (onOpenCommunityLoadoutsModal) onOpenCommunityLoadoutsModal();
                            else if (onOpenBundlesModal) onOpenBundlesModal();
                            playChimeClick();
                        }}
                        className="btn btn-sm text-white rounded-pill fw-bold px-3 py-2 shadow-sm flex-grow-1 transition-all d-flex align-items-center justify-content-center gap-2"
                        title="Browse Community Loadouts & Official Bundles"
                        style={{
                            background: 'linear-gradient(135deg, #37b06d 0%, #2ea466 100%)',
                            border: 'none',
                            fontSize: '0.8rem',
                        }}
                    >
                        <i className="fa-solid fa-box-open text-warning"></i>
                        <span>Loadouts & Bundles</span>
                    </button>
                )}

                {/* Smart Fill & Optimization Dropdown */}
                {onFillRemaining && onMaximizeStacks && onSortPockets && (
                    <SmartFillDropdown
                        onFillNmt={() => { onFillRemaining('nmt'); playChimeClick(); }}
                        onFillCrowns={() => { onFillRemaining('crowns'); playChimeClick(); }}
                        onFillBells={() => { onFillRemaining('bells'); playChimeClick(); }}
                        onFillGold={() => { onFillRemaining('gold'); playChimeClick(); }}
                        onFillRepeat={() => { onFillRemaining('repeat'); playChimeClick(); }}
                        onMaximizeStacks={() => { onMaximizeStacks(); playChimeClick(); }}
                        onSortPockets={() => { onSortPockets(); playChimeClick(); }}
                        isOrderFull={orderFull}
                        hasItems={orderPockets.length > 0}
                    />
                )}

                {onOpenShareModal && (
                    <button
                        type="button"
                        onClick={() => {
                            onOpenShareModal();
                            playChimeClick();
                        }}
                        className="btn btn-sm btn-white border rounded-pill fw-bold px-3 py-2 shadow-2xs transition-all d-flex align-items-center justify-content-center gap-2"
                        title="Generate shareable link for this exact pocket"
                        disabled={isEmpty}
                        style={{
                            borderColor: isEmpty ? '#e9ecef' : '#bfe3f0',
                            backgroundColor: isEmpty ? '#f8f9fa' : '#ffffff',
                            fontSize: '0.8rem',
                        }}
                    >
                        <i className="fa-solid fa-share-nodes text-primary"></i>
                        <span className="d-none d-sm-inline">Share</span>
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <div id={POCKETS_LIST_ID}>
                    {/* Empty State */}
                    {isEmpty ? (
                        <div 
                            className="text-center py-4 px-3 rounded-4 mb-3" 
                            style={{ 
                                backgroundColor: 'var(--subtle-bg, #fbfcf9)', 
                                border: '2px dashed var(--card-border, #d5e8db)' 
                            }}
                        >
                            <div 
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                style={{ width: '48px', height: '48px', backgroundColor: '#eef8f2', color: 'var(--nook-green)' }}
                            >
                                <i className="fa-solid fa-leaf fs-4" style={{ opacity: 0.6 }}></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-1">Your pockets are empty</h6>
                            <p className="small text-muted mb-0" style={{ maxWidth: '280px', margin: '0 auto' }}>
                                Click any item card from the catalog or paste bot codes to start building your order.
                            </p>
                        </div>
                    ) : (
                        /* Compact / Detailed List View */
                        <div className="d-flex flex-column gap-3 mb-3">
                            {/* Filter & Subtabs in List View */}
                            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                                <div className="d-flex p-1 bg-light rounded-pill border flex-grow-1">
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTab('all'); playChimeClick(); }}
                                        className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all ${activeTab === 'all' ? 'btn-white text-dark shadow-sm' : 'text-muted border-0'}`}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        All ({totalCount})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTab('order'); playChimeClick(); }}
                                        className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all ${activeTab === 'order' ? 'btn-white text-dark shadow-sm' : 'text-muted border-0'}`}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Order ({orderCount}/40)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTab('drop'); playChimeClick(); }}
                                        className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all ${activeTab === 'drop' ? 'btn-white text-dark shadow-sm' : 'text-muted border-0'}`}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Drop ({dropCount}/9)
                                    </button>
                                </div>

                                {totalCount > 4 && (
                                    <div className="position-relative" style={{ minWidth: '130px' }}>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm rounded-pill ps-3 pe-4"
                                            placeholder="Filter..."
                                            value={listSearchQuery}
                                            onChange={(e) => setListSearchQuery(e.target.value)}
                                            style={{ fontSize: '0.75rem' }}
                                        />
                                        {listSearchQuery && (
                                            <button
                                                type="button"
                                                className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y p-0 pe-2 border-0"
                                                onClick={() => setListSearchQuery('')}
                                            >
                                                <i className="fa-solid fa-xmark x-small"></i>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Order List Section ────────────────────────────────── */}
                            {(activeTab === 'all' || activeTab === 'order') && (
                                <div className="p-3 rounded-4 bg-light border">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-success text-white rounded-pill fw-bold x-small px-2 py-1 shadow-sm">
                                                <i className="fa-solid fa-bag-shopping me-1"></i>Order Bot
                                            </span>
                                            <span className="tiny-text text-muted font-monospace">
                                                {orderCount} / {ORDER_BOT_MAX} slots
                                            </span>
                                        </div>
                                        {onClearOrderPockets && orderPockets.length > 0 && (
                                            <button 
                                                type="button" 
                                                onClick={onClearOrderPockets} 
                                                className="btn btn-sm btn-outline-danger rounded-pill transition-all fw-bold py-0 px-2"
                                                style={{ fontSize: '0.7rem' }}
                                                title="Clear all order items"
                                            >
                                                <i className="fa-solid fa-trash-can me-1"></i>Clear
                                            </button>
                                        )}
                                    </div>

                                    {filteredOrderPockets.length === 0 ? (
                                        <div className="text-center py-2 text-muted x-small bg-white rounded-3 border">
                                            {orderPockets.length === 0 ? 'No order items added yet' : 'No matching items'}
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: '280px', paddingRight: '2px' }}>
                                            {filteredOrderPockets.map((pocket) => (
                                                <div 
                                                    key={pocket.item.id} 
                                                    className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border shadow-2xs transition-all hover-shadow-sm"
                                                >
                                                    <div 
                                                        className="ratio ratio-1x1 bg-light rounded-2 border d-flex align-items-center justify-content-center" 
                                                        style={{ width: '38px', minWidth: '38px', overflow: 'hidden' }}
                                                    >
                                                        <img 
                                                            src={pocket.item.image} 
                                                            alt={pocket.item.name} 
                                                            className="w-100 h-100 object-fit-contain p-1" 
                                                            loading="lazy"
                                                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                    <div className="flex-grow-1 text-truncate">
                                                        <strong className="d-block text-dark small text-truncate" title={pocket.item.name}>
                                                            {pocket.item.name}
                                                        </strong>
                                                        <div className="d-flex align-items-center gap-1 flex-wrap">
                                                            <span className="badge bg-light text-secondary border x-small py-0 px-1 font-monospace">
                                                                {pocket.item.category}
                                                            </span>
                                                            {pocket.item.variantLabel && (
                                                                <span className="badge bg-warning-subtle text-warning-emphasis border x-small py-0 px-1 text-truncate" style={{ maxWidth: '100px' }}>
                                                                    {pocket.item.variantLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                        {pocket.item.entityType !== 'villager' && (
                                                            <div className="d-flex align-items-center bg-light rounded-pill border p-1">
                                                                {onDecreaseOrderQuantity && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            onDecreaseOrderQuantity(pocket.item.id);
                                                                            playChimeClick();
                                                                        }}
                                                                        className="btn btn-sm btn-white rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '22px', height: '22px', border: '1px solid #dee2e6' }}
                                                                        disabled={pocket.quantity <= 1}
                                                                        title="Decrease quantity"
                                                                        aria-label={`Decrease quantity of ${pocket.item.name}`}
                                                                    >
                                                                        <i className="fa-solid fa-minus x-small text-muted"></i>
                                                                    </button>
                                                                )}
                                                                <span className="x-small px-2 fw-bold text-dark font-monospace">
                                                                    {pocket.quantity}
                                                                </span>
                                                                {onIncreaseOrderQuantity && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            onIncreaseOrderQuantity(pocket.item.id);
                                                                            playChimeClick();
                                                                        }}
                                                                        className="btn btn-sm btn-white rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '22px', height: '22px', border: '1px solid #dee2e6' }}
                                                                        disabled={!canIncreaseOrder}
                                                                        title={!canIncreaseOrder ? `Order bot full (${ORDER_BOT_MAX}/${ORDER_BOT_MAX})` : 'Increase quantity'}
                                                                        aria-label={`Increase quantity of ${pocket.item.name}`}
                                                                    >
                                                                        <i className="fa-solid fa-plus x-small text-muted"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {onRemoveOrderItem && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    onRemoveOrderItem(pocket.item.id);
                                                                    playChimeClick();
                                                                }}
                                                                className="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center ms-1 transition-all"
                                                                style={{ width: '26px', height: '26px' }}
                                                                title="Remove item"
                                                                aria-label={`Remove ${pocket.item.name} from order`}
                                                            >
                                                                <i className="fa-solid fa-trash-can x-small"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quick Fill Buttons for Order */}
                                    {canIncreaseOrder && (onFillTickets || onFillCrowns || onFillBells) && (
                                        <div className="mt-2 pt-2 border-top">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider">
                                                    ⚡ Fill remaining ({remainingOrderSlots} slots)
                                                </span>
                                            </div>
                                            <div className="d-flex gap-1">
                                                {onFillTickets && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { onFillTickets(); playChimeClick(); }} 
                                                        className="btn btn-sm btn-white border rounded-pill shadow-2xs fw-bold flex-grow-1 py-1 transition-all d-flex align-items-center justify-content-center gap-1" 
                                                        title="Fill remaining slots with Nook Miles Tickets"
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        <i className="fa-solid fa-ticket text-primary"></i> 
                                                        <span>Tickets</span>
                                                    </button>
                                                )}
                                                {onFillCrowns && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { onFillCrowns(); playChimeClick(); }} 
                                                        className="btn btn-sm btn-white border rounded-pill shadow-2xs fw-bold flex-grow-1 py-1 transition-all d-flex align-items-center justify-content-center gap-1" 
                                                        title="Fill remaining slots with Royal Crowns"
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        <i className="fa-solid fa-crown text-warning"></i> 
                                                        <span>Crowns</span>
                                                    </button>
                                                )}
                                                {onFillBells && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { onFillBells(); playChimeClick(); }} 
                                                        className="btn btn-sm btn-white border rounded-pill shadow-2xs fw-bold flex-grow-1 py-1 transition-all d-flex align-items-center justify-content-center gap-1" 
                                                        title="Fill remaining slots with 99,000 Bells"
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        <i className="fa-solid fa-sack-dollar text-success"></i> 
                                                        <span>Bells</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Drop List Section ─────────────────────────────────── */}
                            {(activeTab === 'all' || activeTab === 'drop') && (
                                <div className="p-3 rounded-4 bg-light border">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-info text-dark rounded-pill fw-bold x-small px-2 py-1 shadow-sm">
                                                <i className="fa-solid fa-layer-group me-1"></i>Drop Bot
                                            </span>
                                            <span className="tiny-text text-muted font-monospace">
                                                {dropCount} / {DROP_BOT_MAX} slots
                                            </span>
                                        </div>
                                        {onClearDropPockets && dropPockets.length > 0 && (
                                            <button 
                                                type="button" 
                                                onClick={onClearDropPockets} 
                                                className="btn btn-sm btn-outline-danger rounded-pill transition-all fw-bold py-0 px-2"
                                                style={{ fontSize: '0.7rem' }}
                                                title="Clear all drop items"
                                            >
                                                <i className="fa-solid fa-trash-can me-1"></i>Clear
                                            </button>
                                        )}
                                    </div>

                                    {filteredDropPockets.length === 0 ? (
                                        <div className="text-center py-2 text-muted x-small bg-white rounded-3 border">
                                            {dropPockets.length === 0 ? 'No drop items added yet' : 'No matching items'}
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: '200px', paddingRight: '2px' }}>
                                            {filteredDropPockets.map((pocket) => (
                                                <div 
                                                    key={pocket.item.id} 
                                                    className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border shadow-2xs transition-all hover-shadow-sm"
                                                >
                                                    <div 
                                                        className="ratio ratio-1x1 bg-light rounded-2 border d-flex align-items-center justify-content-center" 
                                                        style={{ width: '38px', minWidth: '38px', overflow: 'hidden' }}
                                                    >
                                                        <img 
                                                            src={pocket.item.image} 
                                                            alt={pocket.item.name} 
                                                            className="w-100 h-100 object-fit-contain p-1" 
                                                            loading="lazy"
                                                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                    <div className="flex-grow-1 text-truncate">
                                                        <strong className="d-block text-dark small text-truncate" title={pocket.item.name}>
                                                            {pocket.item.name}
                                                        </strong>
                                                        <div className="d-flex align-items-center gap-1 flex-wrap">
                                                            <span className="badge bg-light text-secondary border x-small py-0 px-1 font-monospace">
                                                                {pocket.item.category}
                                                            </span>
                                                            {pocket.item.variantLabel && (
                                                                <span className="badge bg-warning-subtle text-warning-emphasis border x-small py-0 px-1 text-truncate" style={{ maxWidth: '100px' }}>
                                                                    {pocket.item.variantLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                        {pocket.item.entityType !== 'villager' && (
                                                            <div className="d-flex align-items-center bg-light rounded-pill border p-1">
                                                                {onDecreaseDropQuantity && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            onDecreaseDropQuantity(pocket.item.id);
                                                                            playChimeClick();
                                                                        }}
                                                                        className="btn btn-sm btn-white rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '22px', height: '22px', border: '1px solid #dee2e6' }}
                                                                        disabled={pocket.quantity <= 1}
                                                                        title="Decrease quantity"
                                                                        aria-label={`Decrease quantity of ${pocket.item.name}`}
                                                                    >
                                                                        <i className="fa-solid fa-minus x-small text-muted"></i>
                                                                    </button>
                                                                )}
                                                                <span className="x-small px-2 fw-bold text-dark font-monospace">
                                                                    {pocket.quantity}
                                                                </span>
                                                                {onIncreaseDropQuantity && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            onIncreaseDropQuantity(pocket.item.id);
                                                                            playChimeClick();
                                                                        }}
                                                                        className="btn btn-sm btn-white rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '22px', height: '22px', border: '1px solid #dee2e6' }}
                                                                        disabled={!canIncreaseDrop}
                                                                        title={!canIncreaseDrop ? `Drop bot full (${DROP_BOT_MAX}/${DROP_BOT_MAX})` : 'Increase quantity'}
                                                                        aria-label={`Increase quantity of ${pocket.item.name}`}
                                                                    >
                                                                        <i className="fa-solid fa-plus x-small text-muted"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {onRemoveDropItem && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    onRemoveDropItem(pocket.item.id);
                                                                    playChimeClick();
                                                                }}
                                                                className="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center ms-1 transition-all"
                                                                style={{ width: '26px', height: '26px' }}
                                                                title="Remove item"
                                                                aria-label={`Remove ${pocket.item.name} from drop`}
                                                            >
                                                                <i className="fa-solid fa-trash-can x-small"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Terminal / Command Output ─────────────────────────────── */}
                    {showTerminal && (
                        <div 
                            className="terminal-window rounded-4 shadow-sm mb-3 overflow-hidden border"
                            style={{ 
                                borderColor: 'rgba(55, 176, 109, 0.3)',
                                background: '#1c2420',
                            }}
                        >
                            {/* Terminal Top Window Bar */}
                            <div 
                                className="d-flex align-items-center justify-content-between px-3 py-2"
                                style={{ 
                                    background: 'linear-gradient(90deg, #18201b 0%, #202b24 100%)',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                                }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <div className="d-flex gap-1">
                                        <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#ff5f56' }}></span>
                                        <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#ffbd2e' }}></span>
                                        <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#27c93f' }}></span>
                                    </div>
                                    <span className="font-monospace text-light fw-bold ms-2 tracking-wide" style={{ fontSize: '0.78rem' }}>
                                        <i className="fa-solid fa-terminal me-1 text-success"></i>nook-os terminal
                                    </span>
                                </div>
                                <span className="tiny-text text-muted font-monospace">ready</span>
                            </div>

                            {/* Terminal Body */}
                            <div className="p-3">
                                {/* Order Bot Command Block */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="badge rounded-pill fw-bold font-monospace x-small bg-success text-white">
                                            !order command ({orderCount} items)
                                        </span>
                                        <span className="tiny-text text-muted font-monospace">
                                            <kbd className="bg-dark text-light border border-secondary px-1" style={{ fontSize: '0.65rem' }}>Ctrl+⇧+O</kbd>
                                        </span>
                                    </div>
                                    <div 
                                        className="p-2 rounded-3 font-monospace text-light mb-2 transition-all select-all"
                                        style={{ 
                                            backgroundColor: '#111713', 
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '0.8rem',
                                            minHeight: '48px',
                                            maxHeight: '80px',
                                            overflowY: 'auto',
                                            wordBreak: 'break-all',
                                            color: '#a3e635'
                                        }}
                                    >
                                        {orderCommandText || <span className="text-muted fst-italic">&gt; Add items to generate !order command...</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn w-100 rounded-pill py-2 fw-bold btn-sm shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 ${copyOrderStatus === 'Copied!' ? 'btn-success text-white' : 'btn-nook text-white'}`}
                                        onClick={() => {
                                            onCopyOrder();
                                            setCopiedInstruction('order');
                                            playChimeClick();
                                        }}
                                        disabled={!orderCommandText}
                                        title="Copy Order Command (Ctrl+Shift+O)"
                                    >
                                        <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-box'}`}></i>
                                        <span>{copyOrderStatus === 'Copied!' ? 'Order Command Copied!' : 'Copy !order Command'}</span>
                                    </button>
                                </div>

                                {/* Drop Bot Command Block */}
                                <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="badge rounded-pill fw-bold font-monospace x-small bg-info text-white" style={{ backgroundColor: '#0284c7' }}>
                                            !drop command ({dropCount} items)
                                        </span>
                                        <span className="tiny-text text-muted font-monospace">
                                            <kbd className="bg-dark text-light border border-secondary px-1" style={{ fontSize: '0.65rem' }}>Ctrl+⇧+D</kbd>
                                        </span>
                                    </div>
                                    <div 
                                        className="p-2 rounded-3 font-monospace text-light mb-2 transition-all select-all"
                                        style={{ 
                                            backgroundColor: '#111713', 
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '0.8rem',
                                            minHeight: '48px',
                                            maxHeight: '80px',
                                            overflowY: 'auto',
                                            wordBreak: 'break-all',
                                            color: '#38bdf8'
                                        }}
                                    >
                                        {dropCommandText || <span className="text-muted fst-italic">&gt; Add items to generate !drop command...</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn w-100 rounded-pill py-2 fw-bold btn-sm shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 text-white`}
                                        style={{ backgroundColor: copyDropStatus === 'Copied!' ? '#198754' : '#0284c7', borderColor: '#0284c7' }}
                                        onClick={() => {
                                            onCopyDrop();
                                            setCopiedInstruction('drop');
                                            playChimeClick();
                                        }}
                                        disabled={!dropCommandText}
                                        title="Copy Drop Command (Ctrl+Shift+D)"
                                    >
                                        <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-plane-arrival'}`}></i>
                                        <span>{copyDropStatus === 'Copied!' ? 'Drop Command Copied!' : 'Copy !drop Command'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bot Delivery Flow Instructions (Shows upon clicking Copy) */}
                    {copiedInstruction && (
                        <div
                            className={`card rounded-4 border-2 p-3 shadow-md mb-2 animate-up position-relative ${
                                copiedInstruction === 'order' ? 'border-success bg-success-subtle' : 'border-info bg-info-subtle'
                            }`}
                            style={{ borderColor: copiedInstruction === 'drop' ? '#0284c7' : undefined }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span
                                        className={`badge text-white rounded-circle p-1 d-flex align-items-center justify-content-center ${
                                            copiedInstruction === 'order' ? 'bg-success' : 'bg-info'
                                        }`}
                                        style={{ width: '22px', height: '22px', backgroundColor: copiedInstruction === 'drop' ? '#0284c7' : undefined }}
                                    >
                                        <i className="fa-solid fa-check x-small"></i>
                                    </span>
                                    <strong className="text-dark small fw-black text-uppercase tracking-wider">
                                        Bot Delivery Instructions
                                    </strong>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-sm"
                                    onClick={() => setCopiedInstruction(null)}
                                    aria-label="Close instructions"
                                    title="Dismiss"
                                />
                            </div>

                            {copiedInstruction === 'order' ? (
                                <div className="p-3 bg-white rounded-3 border border-success-subtle shadow-2xs">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="badge bg-success text-white rounded-pill px-2 py-0 font-monospace">1</span>
                                        <strong className="text-dark small fw-bold">Order Bot Flow (40 Items / Villager):</strong>
                                    </div>
                                    <p className="small text-muted mb-0 mt-2" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                                        Paste <code>!order</code> into the Discord <strong>#order-bot</strong> channel. The bot will DM you a private <strong>Dodo Code</strong>. Empty your inventory and fly over to collect your items!
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 bg-white rounded-3 border border-info-subtle shadow-2xs">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="badge text-white rounded-pill px-2 py-0 font-monospace" style={{ backgroundColor: '#0284c7' }}>2</span>
                                        <strong className="text-dark small fw-bold">Drop Bot Flow (9 Ground Items):</strong>
                                    </div>
                                    <p className="small text-muted mb-0 mt-2" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                                        Fly to an active island, stand on an open 3×3 ground area, and send <code>!drop</code> in in-game chat or Discord — <strong>ChoBot</strong> on the island will drop all 9 items right at your feet!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommandBuilderSummary;