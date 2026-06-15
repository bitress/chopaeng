import type { CatalogEntity } from "../data/commandBuilderData";

type PocketItem = CatalogEntity & {
    baseId?: string | number | null;
    variantId?: string | number | null;
    variantLabel?: string | null;
};

type CommandBuilderSummaryProps = {
    savedPockets: Array<{ item: PocketItem; quantity: number }>;
    savedVillager: CatalogEntity | null;
    orderCommandText: string;
    dropCommandText: string;
    copyOrderStatus: string;
    copyDropStatus: string;
    onCopyOrder: () => void;
    onCopyDrop: () => void;
    onDecreaseQuantity?: (itemId: string) => void;
    onIncreaseQuantity?: (itemId: string) => void;
    onRemoveItem?: (itemId: string) => void;
    onRemoveVillager?: () => void;
    onClearPockets?: () => void;
    canIncrease?: boolean;
    onFillTickets?: () => void;
    onFillCrowns?: () => void;
    onFillBells?: () => void;
    showTerminal?: boolean;
};

const CommandBuilderSummary = ({
    savedPockets,
    savedVillager,
    orderCommandText,
    dropCommandText,
    copyOrderStatus,
    copyDropStatus,
    onCopyOrder,
    onCopyDrop,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onRemoveItem,
    onRemoveVillager,
    onClearPockets,
    canIncrease = true,
    onFillTickets,
    onFillCrowns,
    onFillBells,
    showTerminal = false,
}: CommandBuilderSummaryProps) => {
    const itemCount = savedPockets.reduce((sum, pocket) => sum + pocket.quantity, 0);
    const villagerCount = savedVillager ? 1 : 0;

    return (
        <div className="bg-cream rounded-4 border-0 shadow p-4" style={{ borderTop: '4px solid #28a745' }}>
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
                <div>
                    <h2 className="h5 fw-black mb-1 ac-font text-nook" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>Your Pockets</h2>
                    <p className="small text-muted mb-0">Review items and villager requests before copying your command.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span className="badge rounded-pill bg-nook-green text-white fw-bold x-small" style={{ boxShadow: '0 3px 8px rgba(40, 167, 69, 0.2)' }}>Items {itemCount} / 40</span>
                    <span className={`badge rounded-pill fw-bold x-small transition-all ${villagerCount ? 'bg-info text-dark' : 'bg-light text-dark border'}`} style={{ boxShadow: villagerCount ? '0 3px 8px rgba(88, 101, 242, 0.2)' : 'none' }}>
                        Villager {villagerCount} / 1
                    </span>
                    {onClearPockets && savedPockets.length > 0 && (
                        <button type="button" onClick={onClearPockets} className="btn btn-sm btn-outline-danger rounded-pill ms-sm-2 transition-all" style={{ fontSize: '0.75rem' }}>
                            <i className="fa-solid fa-trash-can me-1"></i>Clear
                        </button>
                    )}
                </div>
            </div>
            <div className="mb-4">
                {savedPockets.length === 0 && !savedVillager ? (
                    <div className="text-center py-4 rounded-4 bg-light-green border-2 border-success border-opacity-25" style={{ borderStyle: 'dashed' }}>
                        <i className="fa-solid fa-inbox text-muted mb-2" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                        <p className="small text-muted mb-0">Your pockets are empty. Add items from the catalog or request a villager to build a command.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {savedPockets.map((pocket) => (
                            <div key={pocket.item.id} className="d-flex align-items-center gap-3 rounded-4 border-2 border-success border-opacity-10 p-3 bg-white transition-all" style={{ boxShadow: '0 2px 6px rgba(40, 167, 69, 0.08)' }}>
                                <div className="ratio ratio-1x1" style={{ width: '52px', minWidth: '52px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e8f5e9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <img src={pocket.item.image} alt={pocket.item.name} className="w-100 h-100 object-fit-contain" style={{ padding: '4px' }} />
                                </div>
                                <div className="flex-grow-1 text-truncate">
                                    <strong className="d-block text-dark small text-truncate" title={pocket.item.name} style={{ fontFamily: '"Quicksand", sans-serif' }}>{pocket.item.name}</strong>
                                    <span className="tiny-text text-muted text-truncate d-block">
                                        {pocket.item.category}{pocket.item.variantLabel ? ` · ${pocket.item.variantLabel}` : ''}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-1 flex-nowrap">
                                    {onDecreaseQuantity && (
                                        <button
                                            type="button"
                                            onClick={() => onDecreaseQuantity(pocket.item.id)}
                                            className="btn btn-nook-sm transition-all"
                                            style={{ width: '32px', height: '32px', minWidth: '32px' }}
                                            disabled={pocket.quantity <= 1}
                                            title="Decrease quantity"
                                        >
                                            <i className="fa-solid fa-minus x-small"></i>
                                        </button>
                                    )}
                                    <span className="badge rounded-pill bg-nook-green text-white x-small px-2 fw-bold" style={{ boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)' }}>{pocket.quantity}</span>
                                    {onIncreaseQuantity && (
                                        <button
                                            type="button"
                                            onClick={() => onIncreaseQuantity(pocket.item.id)}
                                            className="btn btn-nook-sm transition-all"
                                            style={{ width: '32px', height: '32px', minWidth: '32px' }}
                                            disabled={!canIncrease}
                                            title="Increase quantity"
                                        >
                                            <i className="fa-solid fa-plus x-small"></i>
                                        </button>
                                    )}
                                    {onRemoveItem && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(pocket.item.id)}
                                            className="btn btn-link text-danger p-0 ms-2 transition-all"
                                            title="Remove item"
                                            style={{ fontSize: '1rem' }}
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {savedVillager && (
                            <div className="d-flex align-items-center gap-3 rounded-4 border-2 p-3 bg-white transition-all" style={{ borderColor: '#88e0a0', boxShadow: '0 2px 6px rgba(136, 224, 160, 0.15)' }}>
                                <div className="ratio ratio-1x1" style={{ width: '52px', minWidth: '52px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e0f7fa', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <img src={savedVillager.image} alt={savedVillager.name} className="w-100 h-100 object-fit-contain" style={{ padding: '4px' }} />
                                </div>
                                <div>
                                    <strong className="d-block text-dark small" style={{ fontFamily: '"Quicksand", sans-serif' }}>{savedVillager.name}</strong>
                                    <span className="tiny-text fw-bold" style={{ color: '#88e0a0' }}>🌿 Villager Selected</span>
                                </div>
                                {onRemoveVillager && (
                                    <button
                                        type="button"
                                        onClick={onRemoveVillager}
                                        className="btn btn-link text-danger p-0 ms-auto transition-all"
                                        title="Remove villager"
                                        style={{ fontSize: '1rem' }}
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
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
                                background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                                color: 'white',
                                border: 'none',
                                boxShadow: orderCommandText ? '0 4px 12px rgba(40, 167, 69, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => !orderCommandText ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)')}
                            onMouseLeave={(e) => !orderCommandText ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)')}
                        >
                            <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                            {copyOrderStatus === 'Copied!' ? '✓ Order Command Copied!' : 'Copy Order Command'}
                        </button>
                        <button
                            type="button"
                            onClick={onCopyDrop}
                            className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                            disabled={!dropCommandText}
                            style={{
                                background: 'linear-gradient(135deg, #5bc0de 0%, #46a5ad 100%)',
                                color: 'white',
                                border: 'none',
                                boxShadow: dropCommandText ? '0 4px 12px rgba(91, 192, 222, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => !dropCommandText ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(91, 192, 222, 0.4)')}
                            onMouseLeave={(e) => !dropCommandText ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 192, 222, 0.3)')}
                        >
                            <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                            {copyDropStatus === 'Copied!' ? '✓ Drop Command Copied!' : 'Copy Drop Command'}
                        </button>
                    </div>
                </div>
            )}
            {(onFillTickets || onFillCrowns || onFillBells) && (
                <div className="bg-light-green rounded-4 p-4 mb-4 border-2" style={{ borderColor: '#88e0a0' }}>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                        <div>
                            <h3 className="h6 fw-black mb-1 ac-font text-nook">⚡ Quick Fill</h3>
                            <p className="small text-muted mb-0">Common buffer items for fast pocket filling.</p>
                        </div>
                    </div>
                    <div className="d-grid gap-2">
                        {onFillTickets && (
                            <button
                                type="button"
                                onClick={onFillTickets}
                                className="btn btn-nook-primary rounded-pill d-flex align-items-center gap-2 transition-all fw-bold py-2"
                                disabled={!canIncrease}
                                style={{ boxShadow: !canIncrease ? 'none' : '0 4px 0 #6dbd83', opacity: !canIncrease ? 0.6 : 1, pointerEvents: !canIncrease ? 'none' : 'auto' }}
                                onMouseEnter={(e) => !canIncrease ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 0 #6dbd83')}
                                onMouseLeave={(e) => !canIncrease ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 0 #6dbd83')}
                            >
                                <i className="fa-solid fa-ticket"></i>
                                <span> Nook Miles Tickets</span>
                            </button>
                        )}
                        {onFillCrowns && (
                            <button
                                type="button"
                                onClick={onFillCrowns}
                                className="btn btn-nook-primary rounded-pill d-flex align-items-center gap-2 transition-all fw-bold py-2"
                                disabled={!canIncrease}
                                style={{ boxShadow: !canIncrease ? 'none' : '0 4px 0 #6dbd83', opacity: !canIncrease ? 0.6 : 1 }}
                                onMouseEnter={(e) => !canIncrease ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 0 #6dbd83')}
                                onMouseLeave={(e) => !canIncrease ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 0 #6dbd83')}
                            >
                                <i className="fa-solid fa-crown"></i>
                                <span> Royal Crowns</span>
                            </button>
                        )}
                        {onFillBells && (
                            <button
                                type="button"
                                onClick={onFillBells}
                                className="btn btn-nook-primary rounded-pill d-flex align-items-center gap-2 transition-all fw-bold py-2"
                                disabled={!canIncrease}
                                style={{ boxShadow: !canIncrease ? 'none' : '0 4px 0 #6dbd83', opacity: !canIncrease ? 0.6 : 1 }}
                                onMouseEnter={(e) => !canIncrease ? null : (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 0 #6dbd83')}
                                onMouseLeave={(e) => !canIncrease ? null : (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 0 #6dbd83')}
                            >
                                <i className="fa-solid fa-money-bill-wave"></i>
                                <span> 99,000 Bells</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
            {showTerminal && (
                <div className="terminal-window shadow-lg rounded-4" style={{ overflow: 'hidden', border: '2px solid #1e7e34' }}>
                    <div className="terminal-header" style={{ background: 'linear-gradient(135deg, #1e7e34 0%, #28a745 100%)', padding: '12px 16px' }}>
                        <div className="terminal-dot r"></div>
                        <div className="terminal-dot y"></div>
                        <div className="terminal-dot g"></div>
                        <span className="ms-3 font-monospace tracking-wide opacity-75 fw-bold text-white" style={{ fontSize: '0.85rem' }}>🏝️ nook-os terminal</span>
                    </div>
                    <div className="p-4" style={{ background: '#0a0e0a' }}>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-success text-white rounded-pill fw-bold font-monospace" style={{ boxShadow: '0 3px 8px rgba(40, 167, 69, 0.3)' }}>📦 Order Bot</span>
                            </div>
                            <div className="bg-dark rounded-3 p-3 mb-3 font-monospace small text-success transition-all" style={{ minHeight: '70px', border: '1px solid #333', whiteSpace: 'pre-wrap', color: '#4ade80', textShadow: '0 0 8px rgba(74, 222, 128, 0.3)' }}>
                                {orderCommandText || <span className="opacity-50">&gt; Waiting for items or villager...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                                onClick={onCopyOrder}
                                disabled={!orderCommandText}
                                style={{
                                    background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: orderCommandText ? '0 4px 12px rgba(40, 167, 69, 0.3)' : 'none'
                                }}
                            >
                                <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyOrderStatus === 'Copied!' ? '✓ Copied!' : 'Copy Order'}
                            </button>
                        </div>

                        <div className="border-top border-secondary pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-info text-dark rounded-pill fw-bold font-monospace" style={{ boxShadow: '0 3px 8px rgba(91, 192, 222, 0.3)' }}>🗑️ Drop Bot</span>
                            </div>
                            <div className="bg-dark rounded-3 p-3 mb-3 font-monospace small text-info transition-all" style={{ minHeight: '70px', border: '1px solid #333', whiteSpace: 'pre-wrap', color: '#22d3ee', textShadow: '0 0 8px rgba(34, 211, 238, 0.3)' }}>
                                {dropCommandText || <span className="opacity-50">&gt; Waiting for items or villager...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn w-100 rounded-pill py-2 fw-bold btn-sm transition-all"
                                onClick={onCopyDrop}
                                disabled={!dropCommandText}
                                style={{
                                    background: 'linear-gradient(135deg, #5bc0de 0%, #46a5ad 100%)',
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: dropCommandText ? '0 4px 12px rgba(91, 192, 222, 0.3)' : 'none'
                                }}
                            >
                                <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'} me-2`} />
                                {copyDropStatus === 'Copied!' ? '✓ Copied!' : 'Copy Drop'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommandBuilderSummary;
