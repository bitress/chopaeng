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
    savedVillagers: CatalogEntity[];
    orderCommandText: string;
    dropCommandText: string;
    injectVillagerCommandText: string;
    copyOrderStatus: string;
    copyDropStatus: string;
    copyInjectVillagerStatus: string;
    onCopyOrder: () => void;
    onCopyDrop: () => void;
    onCopyInjectVillager: () => void;
    // Order item controls
    onDecreaseOrderQuantity?: (itemId: string) => void;
    onIncreaseOrderQuantity?: (itemId: string) => void;
    onRemoveOrderItem?: (itemId: string) => void;
    // Drop item controls
    onDecreaseDropQuantity?: (itemId: string) => void;
    onIncreaseDropQuantity?: (itemId: string) => void;
    onRemoveDropItem?: (itemId: string) => void;
    // Villager controls
    onRemoveVillager?: (villagerId: string) => void;
    onClearOrderPockets?: () => void;
    onClearDropPockets?: () => void;
    onClearVillagers?: () => void;
    canIncreaseOrder?: boolean;
    canIncreaseDrop?: boolean;
    onFillTickets?: () => void;
    onFillCrowns?: () => void;
    onFillBells?: () => void;
    showTerminal?: boolean;
};

const ORDER_BOT_MAX = 40;
const DROP_BOT_MAX = 9;

const CommandBuilderSummary = ({
    orderPockets,
    dropPockets,
    savedVillagers,
    orderCommandText,
    dropCommandText,
    injectVillagerCommandText,
    copyOrderStatus,
    copyDropStatus,
    copyInjectVillagerStatus,
    onCopyOrder,
    onCopyDrop,
    onCopyInjectVillager,
    onDecreaseOrderQuantity,
    onIncreaseOrderQuantity,
    onRemoveOrderItem,
    onDecreaseDropQuantity,
    onIncreaseDropQuantity,
    onRemoveDropItem,
    onRemoveVillager,
    onClearOrderPockets,
    onClearDropPockets,
    onClearVillagers,
    canIncreaseOrder = true,
    canIncreaseDrop = true,
    showTerminal = false,
}: CommandBuilderSummaryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const orderCount = orderPockets.reduce((sum, p) => sum + p.quantity, 0);
    const dropCount = dropPockets.reduce((sum, p) => sum + p.quantity, 0);
    const villagerCount = savedVillagers.length;
    const isEmpty = orderPockets.length === 0 && dropPockets.length === 0 && villagerCount === 0;

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
        <div className="bg-cream rounded-4 border-0 shadow p-4" style={{ borderTop: '4px solid #28a745' }}>
            {/* Header */}
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
                <div>
                    <h2 className="h5 fw-black mb-1 ac-font text-nook" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>Your Pockets</h2>
                    <p className="small text-muted mb-0">Review items before copying your command.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span
                        className={`badge rounded-pill fw-bold x-small transition-all ${orderFull ? 'bg-danger' : 'bg-nook-green'} text-white`}
                        style={{ boxShadow: orderFull ? '0 3px 8px rgba(220,53,69,0.2)' : '0 3px 8px rgba(40,167,69,0.2)' }}
                    >
                        Order {orderCount} / {ORDER_BOT_MAX}
                    </span>
                    <span
                        className={`badge rounded-pill fw-bold x-small transition-all ${dropFull ? 'bg-danger' : dropCount > 0 ? 'bg-info text-dark' : 'bg-light text-dark border'}`}
                        style={{ boxShadow: dropFull ? '0 3px 8px rgba(220,53,69,0.2)' : dropCount > 0 ? '0 3px 8px rgba(91,192,222,0.2)' : 'none' }}
                    >
                        Drop {dropCount} / {DROP_BOT_MAX}
                    </span>
                    {villagerCount > 0 && (
                        <span className="badge rounded-pill fw-bold x-small bg-warning text-dark" style={{ boxShadow: '0 3px 8px rgba(255,193,7,0.2)' }}>
                            Villagers {villagerCount}
                        </span>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm btn-white border rounded-pill fw-bold px-3 py-1"
                        onClick={() => setIsCollapsed((value) => !value)}
                        aria-expanded={!isCollapsed}
                    >
                        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} me-1`}></i>
                        {isCollapsed ? 'Show' : 'Hide'}
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <>
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
                        {(orderPockets.length > 0 || true) && (
                            <div>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="badge bg-nook-green text-white rounded-pill fw-bold x-small px-2" style={{ boxShadow: '0 2px 6px rgba(40,167,69,0.2)' }}>
                                        <i className="fa-solid fa-basket-shopping me-1"></i>Order Bot
                                    </span>
                                    {onClearOrderPockets && orderPockets.length > 0 && (
                                        <button type="button" onClick={onClearOrderPockets} className="btn btn-sm btn-outline-danger rounded-pill transition-all" style={{ fontSize: '0.7rem', padding: '2px 10px' }}>
                                            <i className="fa-solid fa-trash-can me-1"></i>Clear
                                        </button>
                                    )}
                                </div>
                                {orderPockets.length === 0 ? (
                                    <div className="text-center py-2 rounded-3 bg-light text-muted small" style={{ border: '1px dashed #ccc' }}>No order items yet</div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {orderPockets.map((pocket) => (
                                            <div key={pocket.item.id} className="d-flex align-items-center gap-3 rounded-4 border-2 border-success border-opacity-10 p-3 bg-white transition-all" style={{ boxShadow: '0 2px 6px rgba(40,167,69,0.08)' }}>
                                                <div className="ratio ratio-1x1" style={{ width: '48px', minWidth: '48px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e8f5e9' }}>
                                                    <img src={pocket.item.image} alt={pocket.item.name} className="w-100 h-100 object-fit-contain" style={{ padding: '4px' }} />
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
                                                            disabled={!canIncreaseOrder}
                                                            title="Increase"
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
                        )}

                            {dropPockets.length > 0 && (
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="badge bg-info text-dark rounded-pill fw-bold x-small px-2" style={{ boxShadow: '0 2px 6px rgba(91,192,222,0.2)' }}>
                                            <i className="fa-solid fa-box-open me-1"></i>Drop Bot
                                        </span>
                                        {onClearDropPockets && (
                                            <button type="button" onClick={onClearDropPockets} className="btn btn-sm btn-outline-danger rounded-pill transition-all" style={{ fontSize: '0.7rem', padding: '2px 10px' }}>
                                                <i className="fa-solid fa-trash-can me-1"></i>Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="d-flex flex-column gap-2">
                                        {dropPockets.map((pocket) => (
                                            <div key={pocket.item.id} className="d-flex align-items-center gap-3 rounded-4 border-2 p-3 bg-white transition-all" style={{ borderColor: '#b2ebf2', boxShadow: '0 2px 6px rgba(91,192,222,0.1)' }}>
                                                <div className="ratio ratio-1x1" style={{ width: '48px', minWidth: '48px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e0f7fa' }}>
                                                    <img src={pocket.item.image} alt={pocket.item.name} className="w-100 h-100 object-fit-contain" style={{ padding: '4px' }} />
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
                                                            style={{ fontSize: '0.9rem' }}
                                                        >
                                                            <i className="fa-solid fa-trash-can"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* ── Villagers ──────────────────────────────────────── */}
                        {savedVillagers.length > 0 && (
                            <div>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="badge bg-warning text-dark rounded-pill fw-bold x-small px-2" style={{ boxShadow: '0 2px 6px rgba(255,193,7,0.2)' }}>
                                        <i className="fa-solid fa-user-group me-1"></i>Villagers
                                    </span>
                                    {onClearVillagers && (
                                        <button type="button" onClick={onClearVillagers} className="btn btn-sm btn-outline-warning rounded-pill transition-all" style={{ fontSize: '0.7rem', padding: '2px 10px' }}>
                                            <i className="fa-solid fa-trash-can-arrow-up me-1"></i>Clear
                                        </button>
                                    )}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {savedVillagers.map((villager) => (
                                        <div key={villager.id} className="d-flex align-items-center gap-3 rounded-4 border-2 p-3 bg-white transition-all" style={{ borderColor: '#88e0a0', boxShadow: '0 2px 6px rgba(136,224,160,0.15)' }}>
                                            <div className="ratio ratio-1x1" style={{ width: '48px', minWidth: '48px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e0f7fa' }}>
                                                <img src={villager.image} alt={villager.name} className="w-100 h-100 object-fit-contain" style={{ padding: '4px' }} />
                                            </div>
                                            <div>
                                                <strong className="d-block text-dark small" style={{ fontFamily: '"Quicksand", sans-serif' }}>{villager.name}</strong>
                                                <span className="tiny-text fw-bold" style={{ color: '#88e0a0' }}>Villager Selected</span>
                                            </div>
                                            {onRemoveVillager && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveVillager(villager.id)}
                                                    className="btn btn-link text-danger p-0 ms-auto transition-all"
                                                    title="Remove villager"
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                            disabled={!orderCommandText}
                            style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                boxShadow: orderCommandText ? '0 4px 12px rgba(40,167,69,0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => !orderCommandText ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(40,167,69,0.4)')}
                            onMouseLeave={(e) => !orderCommandText ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)')}
                        >
                            <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                            {copyOrderStatus === 'Copied!' ? 'Order Command Copied!' : 'Copy Order Command'}
                        </button>
                        <button
                            type="button"
                            onClick={onCopyDrop}
                            className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                            disabled={!dropCommandText}
                            style={{
                                background: '#5bc0de',
                                color: 'white',
                                border: 'none',
                                boxShadow: dropCommandText ? '0 4px 12px rgba(91,192,222,0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => !dropCommandText ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(91,192,222,0.4)')}
                            onMouseLeave={(e) => !dropCommandText ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,192,222,0.3)')}
                        >
                            <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                            {copyDropStatus === 'Copied!' ? 'Drop Command Copied!' : 'Copy Drop Command'}
                        </button>
                        {savedVillagers.length > 0 && (
                            <div className="p-3 rounded-4 bg-dark text-info font-monospace small" style={{ border: '1px solid #333', whiteSpace: 'pre-wrap', boxShadow: '0 2px 6px rgba(34,211,238,0.15)' }}>
                                <div className="mb-2 d-flex align-items-center justify-content-between">
                                    <span className="badge bg-warning text-dark rounded-pill fw-bold">👤 Inject Villager</span>
                                </div>
                                {injectVillagerCommandText || <span className="opacity-50">&gt; Waiting for villagers...</span>}
                            </div>
                        )}
                        {savedVillagers.length > 0 && (
                            <button
                                type="button"
                                onClick={onCopyInjectVillager}
                                className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                                disabled={!injectVillagerCommandText}
                                style={{
                                    background: '#ffc107',
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: injectVillagerCommandText ? '0 4px 12px rgba(255,193,7,0.3)' : 'none'
                                }}
                            >
                                <i className={`fa-solid ${copyInjectVillagerStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyInjectVillagerStatus === 'Copied!' ? 'Inject Command Copied!' : 'Copy Inject Command'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Terminal mode ─────────────────────────────────────────── */}
            {showTerminal && (
                <div className="terminal-window shadow-lg rounded-4" style={{ overflow: 'hidden', border: '2px solid #1e7e34' }}>
                    <div className="terminal-header" style={{ background: '#1e7e34', padding: '12px 16px' }}>
                        <div className="terminal-dot r"></div>
                        <div className="terminal-dot y"></div>
                        <div className="terminal-dot g"></div>
                        <span className="ms-3 font-monospace tracking-wide opacity-75 fw-bold text-white" style={{ fontSize: '0.85rem' }}>🏝️ nook-os terminal</span>
                    </div>
                    <div className="p-4" style={{ background: '#0a0e0a' }}>
                        {/* Order Bot */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-success text-white rounded-pill fw-bold font-monospace" style={{ boxShadow: '0 3px 8px rgba(40,167,69,0.3)' }}>Order Bot</span>
                            </div>
                            <div className="bg-dark rounded-3 p-3 mb-3 font-monospace small text-success transition-all" style={{ minHeight: '70px', border: '1px solid #333', whiteSpace: 'pre-wrap', color: '#4ade80', textShadow: '0 0 8px rgba(74,222,128,0.3)' }}>
                                {orderCommandText || <span className="opacity-50">&gt; Waiting for items or villager...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                                onClick={onCopyOrder}
                                disabled={!orderCommandText}
                                title="Ctrl+Shift+O"
                                style={{
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: orderCommandText ? '0 4px 12px rgba(40,167,69,0.3)' : 'none'
                                }}
                            >
                                <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyOrderStatus === 'Copied!' ? 'Copied!' : 'Copy Order'}
                                <kbd className="ms-2 opacity-50" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 4px', border: '1px solid rgba(255,255,255,0.2)' }}>Ctrl+⇧+O</kbd>
                            </button>
                        </div>

                        {/* Drop Bot */}
                        <div className="border-top border-secondary pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-info text-dark rounded-pill fw-bold font-monospace" style={{ boxShadow: '0 3px 8px rgba(91,192,222,0.3)' }}>Drop Bot</span>
                            </div>
                            <div className="bg-dark rounded-3 p-3 mb-3 font-monospace small text-info transition-all" style={{ minHeight: '70px', border: '1px solid #333', whiteSpace: 'pre-wrap', color: '#22d3ee', textShadow: '0 0 8px rgba(34,211,238,0.3)' }}>
                                {dropCommandText || <span className="opacity-50">&gt; Waiting for items...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                                onClick={onCopyDrop}
                                disabled={!dropCommandText}
                                title="Ctrl+Shift+D"
                                style={{
                                    background: '#5bc0de',
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: dropCommandText ? '0 4px 12px rgba(91,192,222,0.3)' : 'none'
                                }}
                            >
                                <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyDropStatus === 'Copied!' ? 'Copied!' : 'Copy Drop'}
                                <kbd className="ms-2 opacity-50" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 4px', border: '1px solid rgba(255,255,255,0.2)' }}>Ctrl+⇧+D</kbd>
                            </button>

                            {/* Inject Villager */}
                            {savedVillagers.length > 0 && (
                                <div className="bg-dark rounded-3 p-3 mt-3 font-monospace small text-warning" style={{ border: '1px solid #665200', whiteSpace: 'pre-wrap', boxShadow: '0 2px 6px rgba(255,193,7,0.15)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-warning text-dark rounded-pill fw-bold">Inject Bot</span>
                                    </div>
                                    {injectVillagerCommandText || <span className="opacity-50">&gt; Waiting for villagers...</span>}
                                </div>
                            )}
                            {savedVillagers.length > 0 && (
                                <button
                                    type="button"
                                    className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all mt-2"
                                    onClick={onCopyInjectVillager}
                                    disabled={!injectVillagerCommandText}
                                    style={{
                                        background: '#ffc107',
                                        color: 'white',
                                        border: 'none',
                                        boxShadow: injectVillagerCommandText ? '0 4px 12px rgba(255,193,7,0.3)' : 'none'
                                    }}
                                >
                                    <i className={`fa-solid ${copyInjectVillagerStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                    {copyInjectVillagerStatus === 'Copied!' ? 'Copied!' : 'Copy Inject'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    );
};

export default CommandBuilderSummary;
