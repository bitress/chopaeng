import { useEffect, useState, useMemo } from "react";
import type { CatalogEntity } from "../data/commandBuilderData";

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
    showTerminal?: boolean;
    onOpenBundlesModal?: () => void;
    onOpenShareModal?: () => void;
};

const ORDER_BOT_MAX = 40;
const DROP_BOT_MAX = 9;
const POCKETS_LIST_ID = "command-builder-pockets-list";

const CommandBuilderSummary = ({
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
    showTerminal = true,
    onOpenBundlesModal,
    onOpenShareModal,
}: CommandBuilderSummaryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'order' | 'drop'>('all');

    const orderCount = useMemo(() => orderPockets.reduce((sum, p) => sum + p.quantity, 0), [orderPockets]);
    const dropCount = useMemo(() => dropPockets.reduce((sum, p) => sum + p.quantity, 0), [dropPockets]);
    const isEmpty = orderPockets.length === 0 && dropPockets.length === 0;

    const orderFull = orderCount >= ORDER_BOT_MAX;
    const dropFull = dropCount >= DROP_BOT_MAX;
    const remainingOrderSlots = Math.max(0, ORDER_BOT_MAX - orderCount);

    // Capacity percentages for progress rings/bars
    const orderPercent = Math.min(100, Math.round((orderCount / ORDER_BOT_MAX) * 100));
    const dropPercent = Math.min(100, Math.round((dropCount / DROP_BOT_MAX) * 100));

    // Keyboard shortcuts: Ctrl+Shift+O = Copy Order, Ctrl+Shift+D = Copy Drop
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
                e.preventDefault();
                if (orderCommandText) onCopyOrder();
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
                e.preventDefault();
                if (dropCommandText) onCopyDrop();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [orderCommandText, dropCommandText, onCopyOrder, onCopyDrop]);

    return (
        <div 
            className="rounded-4 border shadow-sm p-3 p-md-4 transition-all"
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

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="d-flex flex-column gap-3 mb-3">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <div 
                            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                            style={{ 
                                width: '38px', 
                                height: '38px', 
                                background: 'linear-gradient(135deg, #e8f7ec 0%, #c3edd0 100%)',
                                color: 'var(--nook-green)' 
                            }}
                        >
                            <i className="fa-solid fa-bag-shopping fs-5"></i>
                        </div>
                        <div>
                            <h2 className="h5 fw-black mb-0 ac-font text-dark" style={{ fontSize: '1.25rem', letterSpacing: '0.3px' }}>
                                Pocket Inventory
                            </h2>
                            <p className="tiny-text text-muted mb-0 font-monospace">
                                {orderCount + dropCount} total items queued
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-pill fw-bold px-3 py-1 text-muted transition-all shadow-none"
                        onClick={() => setIsCollapsed((value) => !value)}
                        aria-expanded={!isCollapsed}
                        aria-controls={POCKETS_LIST_ID}
                        title={isCollapsed ? "Expand Pocket Summary" : "Collapse Pocket Summary"}
                        style={{ fontSize: '0.78rem' }}
                    >
                        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} me-1`}></i>
                        {isCollapsed ? 'Show' : 'Hide'}
                    </button>
                </div>

                {/* Capacity Meters */}
                <div className="row g-2">
                    {/* Order Capacity Meter */}
                    <div className="col-6">
                        <div 
                            className="p-2 rounded-3 border transition-all"
                            style={{ 
                                backgroundColor: orderFull ? 'rgba(220, 53, 69, 0.12)' : 'var(--subtle-bg, #f4fbf6)',
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
                                backgroundColor: dropFull ? 'rgba(220, 53, 69, 0.12)' : dropCount > 0 ? 'rgba(23, 162, 184, 0.12)' : 'var(--subtle-bg, #f8f9fa)',
                                borderColor: dropFull ? '#f5c6cb' : 'var(--card-border, #e9ecef)'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="tiny-text fw-bold text-uppercase tracking-wider" style={{ color: dropFull ? '#dc3545' : '#17a2b8' }}>
                                    <i className="fa-solid fa-box-open me-1"></i>Drop Bot
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

            {/* ── Quick Action Toolbar (Bundles & Share) ─────────────────────────── */}
            <div className="d-flex gap-2 mb-3">
                {onOpenBundlesModal && (
                    <button
                        type="button"
                        onClick={onOpenBundlesModal}
                        className="btn btn-sm text-white rounded-pill fw-bold px-3 py-2 shadow-sm flex-grow-1 transition-all d-flex align-items-center justify-content-center gap-2"
                        title="Browse & Apply 1-Click Themed Pocket Presets"
                        style={{
                            background: 'linear-gradient(135deg, #28a745 0%, #208738 100%)',
                            border: 'none',
                        }}
                    >
                        <i className="fa-solid fa-bolt-lightning text-warning"></i>
                        <span>Pocket Bundles</span>
                    </button>
                )}
                {onOpenShareModal && (
                    <button
                        type="button"
                        onClick={onOpenShareModal}
                        className="btn btn-sm btn-white border rounded-pill fw-bold px-3 py-2 shadow-sm flex-grow-1 transition-all d-flex align-items-center justify-content-center gap-2"
                        title="Generate shareable link for this exact pocket"
                        disabled={isEmpty}
                        style={{
                            borderColor: isEmpty ? '#e9ecef' : '#bfe3f0',
                            backgroundColor: isEmpty ? '#f8f9fa' : '#ffffff',
                        }}
                    >
                        <i className="fa-solid fa-share-nodes text-primary"></i>
                        <span>Share Pocket</span>
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <div id={POCKETS_LIST_ID}>
                    {/* View Switcher Tabs if there are items */}
                    {!isEmpty && (
                        <div className="d-flex p-1 bg-light rounded-pill mb-3 border">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all ${activeTab === 'all' ? 'btn-white text-dark shadow-sm' : 'text-muted border-0'}`}
                                style={{ fontSize: '0.75rem' }}
                            >
                                All ({orderCount + dropCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('order')}
                                className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all ${activeTab === 'order' ? 'btn-white text-dark shadow-sm' : 'text-muted border-0'}`}
                                style={{ fontSize: '0.75rem' }}
                            >
                                Order ({orderCount}/40)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('drop')}
                                className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all ${activeTab === 'drop' ? 'btn-white text-dark shadow-sm' : 'text-muted border-0'}`}
                                style={{ fontSize: '0.75rem' }}
                            >
                                Drop ({dropCount}/9)
                            </button>
                        </div>
                    )}

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
                                Click any item card from the catalog to add it to your order.
                            </p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3 mb-4">
                            {/* ── Order Section ────────────────────────────────── */}
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

                                    {orderPockets.length === 0 ? (
                                        <div className="text-center py-2 text-muted x-small bg-white rounded-3 border">
                                            No order items added yet
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: '280px', paddingRight: '2px' }}>
                                            {orderPockets.map((pocket) => (
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
                                                                        onClick={() => onDecreaseOrderQuantity(pocket.item.id)}
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
                                                                        onClick={() => onIncreaseOrderQuantity(pocket.item.id)}
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
                                                                onClick={() => onRemoveOrderItem(pocket.item.id)}
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
                                                    ⚡ Fill remaining ({remainingOrderSlots})
                                                </span>
                                            </div>
                                            <div className="d-flex gap-1">
                                                {onFillTickets && (
                                                    <button 
                                                        type="button" 
                                                        onClick={onFillTickets} 
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
                                                        onClick={onFillCrowns} 
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
                                                        onClick={onFillBells} 
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

                            {/* ── Drop Section ─────────────────────────────────── */}
                            {(activeTab === 'all' || activeTab === 'drop') && (
                                <div className="p-3 rounded-4 bg-light border">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-info text-dark rounded-pill fw-bold x-small px-2 py-1 shadow-sm">
                                                <i className="fa-solid fa-box-open me-1"></i>Drop Bot
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

                                    {dropPockets.length === 0 ? (
                                        <div className="text-center py-2 text-muted x-small bg-white rounded-3 border">
                                            No drop items added yet
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: '200px', paddingRight: '2px' }}>
                                            {dropPockets.map((pocket) => (
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
                                                                        onClick={() => onDecreaseDropQuantity(pocket.item.id)}
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
                                                                        onClick={() => onIncreaseDropQuantity(pocket.item.id)}
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
                                                                onClick={() => onRemoveDropItem(pocket.item.id)}
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
                            className="terminal-window rounded-4 shadow-sm mb-2 overflow-hidden border"
                            style={{ 
                                borderColor: 'rgba(40, 167, 69, 0.3)',
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
                                            !order command
                                        </span>
                                        <span className="tiny-text text-muted font-monospace">
                                            <kbd className="bg-dark text-light border border-secondary px-1" style={{ fontSize: '0.65rem' }}>Ctrl+⇧+O</kbd>
                                        </span>
                                    </div>
                                    <div 
                                        className="p-2 rounded-3 font-monospace text-light mb-2 transition-all"
                                        style={{ 
                                            backgroundColor: '#111713', 
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '0.8rem',
                                            minHeight: '48px',
                                            wordBreak: 'break-all',
                                            color: '#a3e635'
                                        }}
                                    >
                                        {orderCommandText || <span className="text-muted fst-italic">&gt; Add items to generate !order command...</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn w-100 rounded-pill py-2 fw-bold btn-sm shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 ${copyOrderStatus === 'Copied!' ? 'btn-success text-white' : 'btn-light text-dark'}`}
                                        onClick={onCopyOrder}
                                        disabled={!orderCommandText}
                                        title="Copy Order Command (Ctrl+Shift+O)"
                                    >
                                        <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'}`}></i>
                                        <span>{copyOrderStatus === 'Copied!' ? 'Order Command Copied!' : 'Copy Order Command'}</span>
                                    </button>
                                </div>

                                {/* Drop Bot Command Block */}
                                <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="badge rounded-pill fw-bold font-monospace x-small bg-info text-dark">
                                            !drop command
                                        </span>
                                        <span className="tiny-text text-muted font-monospace">
                                            <kbd className="bg-dark text-light border border-secondary px-1" style={{ fontSize: '0.65rem' }}>Ctrl+⇧+D</kbd>
                                        </span>
                                    </div>
                                    <div 
                                        className="p-2 rounded-3 font-monospace text-light mb-2 transition-all"
                                        style={{ 
                                            backgroundColor: '#111713', 
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '0.8rem',
                                            minHeight: '48px',
                                            wordBreak: 'break-all',
                                            color: '#38bdf8'
                                        }}
                                    >
                                        {dropCommandText || <span className="text-muted fst-italic">&gt; Add items to generate !drop command...</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn w-100 rounded-pill py-2 fw-bold btn-sm shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 ${copyDropStatus === 'Copied!' ? 'btn-info text-dark' : 'btn-light text-dark'}`}
                                        onClick={onCopyDrop}
                                        disabled={!dropCommandText}
                                        title="Copy Drop Command (Ctrl+Shift+D)"
                                    >
                                        <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'}`}></i>
                                        <span>{copyDropStatus === 'Copied!' ? 'Drop Command Copied!' : 'Copy Drop Command'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommandBuilderSummary;