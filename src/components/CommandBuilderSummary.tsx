import { useEffect, useState } from "react";
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
    showTerminal = false,
}: CommandBuilderSummaryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const orderCount = orderPockets.reduce((sum, p) => sum + p.quantity, 0);
    const dropCount = dropPockets.reduce((sum, p) => sum + p.quantity, 0);
    const isEmpty = orderPockets.length === 0 && dropPockets.length === 0;

    const orderFull = orderCount >= ORDER_BOT_MAX;
    const dropFull = dropCount >= DROP_BOT_MAX;

    // Keyboard shortcuts: Ctrl+Shift+O = Copy Order, Ctrl+Shift+D = Copy Drop
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                if (orderCommandText) onCopyOrder();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                if (dropCommandText) onCopyDrop();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [orderCommandText, dropCommandText, onCopyOrder, onCopyDrop]);

    return (
        <div className="bg-cream rounded-4 border-0 shadow-sm p-4" style={{ borderTop: '4px solid var(--nook-green)' }}>
            {/* Screen-reader announcements for copy actions */}
            <div aria-live="polite" className="visually-hidden">
                {[copyOrderStatus, copyDropStatus].filter(Boolean).join(". ")}
            </div>

            {/* Header */}
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
                <div>
                    <h2 className="h5 fw-black mb-1 ac-font text-nook" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>Your Pockets</h2>
                    <p className="small text-muted mb-0">Review items before copying your command.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span
                        className={`badge rounded-pill fw-bold x-small transition-all ${orderFull ? 'bg-danger' : 'bg-nook-green'} text-white`}
                    >
                        Order {orderCount} / {ORDER_BOT_MAX}
                    </span>
                    <span
                        className={`badge rounded-pill fw-bold x-small transition-all ${dropFull ? 'bg-danger' : dropCount > 0 ? 'bg-info text-dark' : 'bg-light text-dark border'}`}
                    >
                        Drop {dropCount} / {DROP_BOT_MAX}
                    </span>

                    <button
                        type="button"
                        className="btn btn-sm btn-white border rounded-pill fw-bold px-3 py-1"
                        onClick={() => setIsCollapsed((value) => !value)}
                        aria-expanded={!isCollapsed}
                        aria-controls={POCKETS_LIST_ID}
                    >
                        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} me-1`}></i>
                        {isCollapsed ? 'Show' : 'Hide'}
                    </button>
                </div>
            </div>



            {!isCollapsed && (
                <div id={POCKETS_LIST_ID}>
            {/* Pockets list */}
            <div className="mb-4">
                {isEmpty ? (
                    <div className="text-center py-4 rounded-4 bg-light-green border-2 border-success border-opacity-25" style={{ borderStyle: 'dashed' }}>
                        <i className="fa-solid fa-inbox text-muted mb-2" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                        <p className="small text-muted mb-0">Your pockets are empty. Add items from the catalog to build a command.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">

                        {/* ── Order Section ────────────────────────────────── */}
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="badge bg-nook-green text-white rounded-pill fw-bold x-small px-3 py-2 shadow-sm">
                                    <i className="fa-solid fa-basket-shopping me-1"></i>Order Bot
                                </span>
                                {onClearOrderPockets && orderPockets.length > 0 && (
                                    <button type="button" onClick={onClearOrderPockets} className="btn btn-sm btn-outline-danger rounded-pill transition-all fw-bold" style={{ fontSize: '0.7rem', padding: '4px 12px' }}>
                                        <i className="fa-solid fa-trash-can me-1"></i>Clear
                                    </button>
                                )}
                            </div>
                            {orderPockets.length === 0 ? (
                                <div className="text-center py-3 rounded-4 bg-white text-muted small shadow-sm border border-light">No order items yet</div>
                            ) : (
                                <div className="d-flex flex-column overflow-auto" style={{ maxHeight: '360px', paddingRight: '4px' }}>
                                    {orderPockets.map((pocket) => (
                                        <div key={pocket.item.id} className="d-flex align-items-center gap-2 border-bottom py-2 bg-transparent transition-all">
                                            <div className="ratio ratio-1x1 bg-white rounded-3 shadow-sm border" style={{ width: '36px', minWidth: '36px', overflow: 'hidden' }}>
                                                <img src={pocket.item.image} alt={pocket.item.name} className="w-100 h-100 object-fit-contain" style={{ padding: '2px' }} />
                                            </div>
                                            <div className="flex-grow-1 text-truncate">
                                                <strong className="d-block text-dark small text-truncate" title={pocket.item.name} style={{ fontFamily: '"Quicksand", sans-serif' }}>{pocket.item.name}</strong>
                                                <span className="tiny-text text-muted text-truncate d-block">
                                                    {pocket.item.category}{pocket.item.variantLabel ? ` · ${pocket.item.variantLabel}` : ''}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                {onDecreaseOrderQuantity && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDecreaseOrderQuantity(pocket.item.id)}
                                                        className="btn btn-nook-sm transition-all"
                                                        style={{ width: '28px', height: '28px', minWidth: '28px' }}
                                                        disabled={pocket.quantity <= 1}
                                                        title="Decrease"
                                                        aria-label={`Decrease quantity of ${pocket.item.name}`}
                                                    >
                                                        <i className="fa-solid fa-minus x-small"></i>
                                                    </button>
                                                )}
                                                <span className="badge rounded-pill bg-nook-green text-white x-small px-2 fw-bold">{pocket.quantity}</span>
                                                {onIncreaseOrderQuantity && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onIncreaseOrderQuantity(pocket.item.id)}
                                                        className="btn btn-nook-sm transition-all"
                                                        style={{ width: '28px', height: '28px', minWidth: '28px' }}
                                                        disabled={!canIncreaseOrder || pocket.item.entityType === 'villager'}
                                                        title={pocket.item.entityType === 'villager' ? 'Max 1 villager' : (!canIncreaseOrder ? `Order bot full (${ORDER_BOT_MAX}/${ORDER_BOT_MAX})` : 'Increase')}
                                                        aria-label={`Increase quantity of ${pocket.item.name}`}
                                                    >
                                                        <i className="fa-solid fa-plus x-small"></i>
                                                    </button>
                                                )}
                                                {onRemoveOrderItem && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveOrderItem(pocket.item.id)}
                                                        className="btn btn-link text-danger p-0 ms-1 transition-all"
                                                        title="Remove"
                                                        aria-label={`Remove ${pocket.item.name} from order`}
                                                        style={{ fontSize: '0.9rem' }}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Fill Buttons */}
                            {canIncreaseOrder && (onFillTickets || onFillCrowns || onFillBells) && (
                                <div className="mt-3">
                                    <span className="tiny-text fw-bold text-muted mb-2 d-block text-uppercase tracking-wide">Quick Fill Remaining Slots</span>
                                    <div className="d-flex gap-2">
                                        {onFillTickets && (
                                            <button type="button" onClick={onFillTickets} className="btn btn-sm btn-white border rounded-pill shadow-sm fw-bold flex-grow-1" title="Fill with Nook Miles Tickets">
                                                <i className="fa-solid fa-ticket text-primary"></i> <span className="d-none d-xl-inline ms-1">Tickets</span>
                                            </button>
                                        )}
                                        {onFillCrowns && (
                                            <button type="button" onClick={onFillCrowns} className="btn btn-sm btn-white border rounded-pill shadow-sm fw-bold flex-grow-1" title="Fill with Royal Crowns">
                                                <i className="fa-solid fa-crown text-warning"></i> <span className="d-none d-xl-inline ms-1">Crowns</span>
                                            </button>
                                        )}
                                        {onFillBells && (
                                            <button type="button" onClick={onFillBells} className="btn btn-sm btn-white border rounded-pill shadow-sm fw-bold flex-grow-1" title="Fill with 99,000 Bells">
                                                <i className="fa-solid fa-sack-dollar text-success"></i> <span className="d-none d-xl-inline ms-1">Bells</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Drop Section ─────────────────────────────────── */}
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="badge bg-info text-dark rounded-pill fw-bold x-small px-3 py-2 shadow-sm">
                                    <i className="fa-solid fa-box-open me-1"></i>Drop Bot
                                </span>
                                {onClearDropPockets && dropPockets.length > 0 && (
                                    <button type="button" onClick={onClearDropPockets} className="btn btn-sm btn-outline-danger rounded-pill transition-all fw-bold" style={{ fontSize: '0.7rem', padding: '4px 12px' }}>
                                        <i className="fa-solid fa-trash-can me-1"></i>Clear
                                    </button>
                                )}
                            </div>
                            {dropPockets.length === 0 ? (
                                <div className="text-center py-3 rounded-4 bg-white text-muted small shadow-sm border border-light">No drop items yet</div>
                            ) : (
                                <div className="d-flex flex-column overflow-auto" style={{ maxHeight: '360px', paddingRight: '4px' }}>
                                    {dropPockets.map((pocket) => (
                                        <div key={pocket.item.id} className="d-flex align-items-center gap-2 border-bottom py-2 bg-transparent transition-all">
                                            <div className="ratio ratio-1x1 bg-white rounded-3 shadow-sm border" style={{ width: '36px', minWidth: '36px', overflow: 'hidden' }}>
                                                <img src={pocket.item.image} alt={pocket.item.name} className="w-100 h-100 object-fit-contain" style={{ padding: '2px' }} />
                                            </div>
                                            <div className="flex-grow-1 text-truncate">
                                                <strong className="d-block text-dark small text-truncate" title={pocket.item.name} style={{ fontFamily: '"Quicksand", sans-serif' }}>{pocket.item.name}</strong>
                                                <span className="tiny-text text-muted text-truncate d-block">
                                                    {pocket.item.category}{pocket.item.variantLabel ? ` · ${pocket.item.variantLabel}` : ''}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1 flex-nowrap">
                                                {onDecreaseDropQuantity && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDecreaseDropQuantity(pocket.item.id)}
                                                        className="btn btn-nook-sm transition-all"
                                                        style={{ width: '28px', height: '28px', minWidth: '28px' }}
                                                        disabled={pocket.quantity <= 1}
                                                        title="Decrease"
                                                        aria-label={`Decrease quantity of ${pocket.item.name}`}
                                                    >
                                                        <i className="fa-solid fa-minus x-small"></i>
                                                    </button>
                                                )}
                                                <span className="badge rounded-pill bg-info text-dark x-small px-2 fw-bold">{pocket.quantity}</span>
                                                {onIncreaseDropQuantity && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onIncreaseDropQuantity(pocket.item.id)}
                                                        className="btn btn-nook-sm transition-all"
                                                        style={{ width: '28px', height: '28px', minWidth: '28px' }}
                                                        disabled={!canIncreaseDrop}
                                                        title={!canIncreaseDrop ? `Drop bot full (${DROP_BOT_MAX}/${DROP_BOT_MAX})` : 'Increase'}
                                                        aria-label={`Increase quantity of ${pocket.item.name}`}
                                                    >
                                                        <i className="fa-solid fa-plus x-small"></i>
                                                    </button>
                                                )}
                                                {onRemoveDropItem && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveDropItem(pocket.item.id)}
                                                        className="btn btn-link text-danger p-0 ms-1 transition-all"
                                                        title="Remove"
                                                        aria-label={`Remove ${pocket.item.name} from drop`}
                                                        style={{ fontSize: '0.9rem' }}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                    </div>
                )}
            </div>

            {/* ── Copy Commands (non-terminal mode) ─────────────────────── */}
            {!showTerminal && (
                <div className="mb-4">
                    <h3 className="h6 fw-black mb-3 ac-font text-nook">📋 Copy Commands</h3>
                    <div className="d-grid gap-2">
                        <button
                            type="button"
                            onClick={onCopyOrder}
                            className="btn w-100 rounded-pill py-2 fw-black btn-sm transition-all btn-nook text-white shadow-sm"
                            disabled={!orderCommandText}
                            title={orderCommandText ? undefined : 'Add order items to enable copying'}
                        >
                            <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                            {copyOrderStatus === 'Copied!' ? 'Order Command Copied!' : 'Copy Order Command'}
                        </button>
                        <button
                            type="button"
                            onClick={onCopyDrop}
                            className="btn w-100 rounded-pill py-2 fw-black btn-sm transition-all shadow-sm text-dark border-0"
                            disabled={!dropCommandText}
                            title={dropCommandText ? undefined : 'Add drop items to enable copying'}
                            style={{ background: '#5bc0de' }}
                        >
                            <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                            {copyDropStatus === 'Copied!' ? 'Drop Command Copied!' : 'Copy Drop Command'}
                        </button>
                        {(orderCommandText || dropCommandText) && (
                            <p className="tiny-text text-muted text-center mb-0">
                                Tip: <kbd className="mx-1" style={{ fontSize: '0.65rem' }}>Ctrl+⇧+O</kbd> / <kbd className="mx-1" style={{ fontSize: '0.65rem' }}>Ctrl+⇧+D</kbd> copy instantly
                            </p>
                        )}

                    </div>
                </div>
            )}

            {/* ── Terminal mode ─────────────────────────────────────────── */}
            {showTerminal && (
                <div className="terminal-window shadow-sm rounded-4" style={{ overflow: 'hidden', border: '2px solid var(--nook-green)' }}>
                    <div className="terminal-header d-flex align-items-center" style={{ background: 'var(--nook-green)', padding: '12px 16px' }}>
                        <i className="fa-solid fa-terminal text-white me-2"></i>
                        <span className="font-monospace tracking-wide fw-bold text-white" style={{ fontSize: '0.85rem' }}>nook-os terminal</span>
                    </div>
                    <div className="p-4 bg-white">
                        {/* Order Bot */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-success text-white rounded-pill fw-bold font-monospace shadow-sm">Order Bot</span>
                            </div>
                            <div className="bg-light rounded-4 p-3 mb-3 font-monospace small text-dark transition-all border shadow-sm" style={{ minHeight: '70px', whiteSpace: 'pre-wrap' }}>
                                {orderCommandText || <span className="text-muted">&gt; Waiting for items...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn w-100 rounded-pill py-2 fw-black btn-sm transition-all btn-nook text-white shadow-sm"
                                onClick={onCopyOrder}
                                disabled={!orderCommandText}
                                title="Ctrl+Shift+O"
                            >
                                <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyOrderStatus === 'Copied!' ? 'Copied!' : 'Copy Order'}
                                <kbd className="ms-2 opacity-50" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 4px', border: '1px solid rgba(255,255,255,0.2)' }}>Ctrl+⇧+O</kbd>
                            </button>
                        </div>

                        {/* Drop Bot */}
                        <div className="border-top pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-info text-dark rounded-pill fw-bold font-monospace shadow-sm">Drop Bot</span>
                            </div>
                            <div className="bg-light rounded-4 p-3 mb-3 font-monospace small text-dark transition-all border shadow-sm" style={{ minHeight: '70px', whiteSpace: 'pre-wrap' }}>
                                {dropCommandText || <span className="text-muted">&gt; Waiting for items...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn w-100 rounded-pill py-2 fw-black btn-sm transition-all shadow-sm text-dark border-0"
                                onClick={onCopyDrop}
                                disabled={!dropCommandText}
                                title="Ctrl+Shift+D"
                                style={{ background: '#5bc0de' }}
                            >
                                <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyDropStatus === 'Copied!' ? 'Copied!' : 'Copy Drop'}
                                <kbd className="ms-2 opacity-50" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 4px', border: '1px solid rgba(255,255,255,0.2)' }}>Ctrl+⇧+D</kbd>
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