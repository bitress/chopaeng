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
        <div className="bg-white rounded-5 border shadow-sm p-4">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
                <div>
                    <h2 className="h5 fw-black mb-1">Your pockets</h2>
                    <p className="small text-muted mb-0">Review items and villager requests before copying your command.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <span className="badge rounded-pill bg-light text-dark border x-small">Items {itemCount} / 40</span>
                    <span className={`badge rounded-pill x-small ${villagerCount ? 'bg-info text-dark' : 'bg-light text-dark border'}`}>
                        Villager {villagerCount} / 1
                    </span>
                    {onClearPockets && savedPockets.length > 0 && (
                        <button type="button" onClick={onClearPockets} className="btn btn-sm btn-outline-danger rounded-pill ms-2">Clear pockets</button>
                    )}
                </div>
            </div>
            <div className="mb-4">
                {savedPockets.length === 0 && !savedVillager ? (
                    <div className="text-muted small">Your pockets are empty. Add items from the catalog or request a villager to build a command.</div>
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {savedPockets.map((pocket) => (
                            <div key={pocket.item.id} className="d-flex align-items-center gap-2 rounded-4 border p-2 bg-light">
                                <div className="ratio ratio-1x1" style={{ width: '48px', minWidth: '48px' }}>
                                    <img src={pocket.item.image} alt={pocket.item.name} className="w-100 h-100 object-fit-contain rounded-3" />
                                </div>
                                <div className="flex-grow-1 text-truncate">
                                    <strong className="d-block text-dark small text-truncate" title={pocket.item.name}>{pocket.item.name}</strong>
                                    <span className="tiny-text text-muted text-truncate">
                                        {pocket.item.category}{pocket.item.variantLabel ? ` · ${pocket.item.variantLabel}` : ''}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    {onDecreaseQuantity && (
                                        <button
                                            type="button"
                                            onClick={() => onDecreaseQuantity(pocket.item.id)}
                                            className="btn btn-sm btn-light rounded-circle p-0"
                                            style={{ width: '28px', height: '28px' }}
                                            disabled={pocket.quantity <= 1}
                                        >
                                            <i className="fa-solid fa-minus x-small"></i>
                                        </button>
                                    )}
                                    <span className="badge rounded-pill bg-white border text-dark x-small px-2">{pocket.quantity}</span>
                                    {onIncreaseQuantity && (
                                        <button
                                            type="button"
                                            onClick={() => onIncreaseQuantity(pocket.item.id)}
                                            className="btn btn-sm btn-light rounded-circle p-0"
                                            style={{ width: '28px', height: '28px' }}
                                            disabled={!canIncrease}
                                        >
                                            <i className="fa-solid fa-plus x-small"></i>
                                        </button>
                                    )}
                                    {onRemoveItem && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(pocket.item.id)}
                                            className="btn btn-sm btn-link text-danger p-0 ms-1"
                                            title="Remove"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {savedVillager && (
                            <div className="d-flex align-items-center gap-3 rounded-4 border border-info p-2 bg-white">
                                <div className="ratio ratio-1x1" style={{ width: '48px', minWidth: '48px' }}>
                                    <img src={savedVillager.image} alt={savedVillager.name} className="w-100 h-100 object-fit-contain rounded-3" />
                                </div>
                                <div>
                                    <strong className="d-block text-dark small">{savedVillager.name}</strong>
                                    <span className="tiny-text text-info">Villager selected</span>
                                </div>
                                {onRemoveVillager && (
                                    <button
                                        type="button"
                                        onClick={onRemoveVillager}
                                        className="btn btn-sm btn-link text-danger p-0 ms-auto"
                                        title="Remove villager"
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
                    <h3 className="h6 fw-black mb-2">Copy commands</h3>
                    <button
                        type="button"
                        onClick={onCopyOrder}
                        className="btn btn-terminal w-100 rounded-pill py-2 fw-bold btn-sm mb-3"
                        disabled={!orderCommandText}
                    >
                        <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check text-success' : 'fa-copy'} me-2`} />
                        {copyOrderStatus}
                    </button>
                    <button
                        type="button"
                        onClick={onCopyDrop}
                        className="btn btn-terminal w-100 rounded-pill py-2 fw-bold btn-sm"
                        disabled={!dropCommandText}
                    >
                        <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check text-info' : 'fa-copy'} me-2`} />
                        {copyDropStatus}
                    </button>
                </div>
            )}
            {(onFillTickets || onFillCrowns || onFillBells) && (
                <div className="bg-cream rounded-4 p-3 mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h3 className="h6 fw-black mb-1">Quick fill</h3>
                            <p className="small text-muted mb-0">Common buffer items for fast pocket filling.</p>
                        </div>
                    </div>
                    <div className="d-grid gap-2">
                        {onFillTickets && (
                            <button
                                type="button"
                                onClick={onFillTickets}
                                className="btn btn-sm btn-nook-primary rounded-pill d-flex align-items-center gap-2"
                            >
                                <i className="fa-solid fa-ticket"></i>
                                Fill with Nook Miles Tickets
                            </button>
                        )}
                        {onFillCrowns && (
                            <button
                                type="button"
                                onClick={onFillCrowns}
                                className="btn btn-sm btn-nook-primary rounded-pill d-flex align-items-center gap-2"
                                disabled={!canIncrease}
                            >
                                <i className="fa-solid fa-crown"></i>
                                Fill with Royal Crowns
                            </button>
                        )}
                        {onFillBells && (
                            <button
                                type="button"
                                onClick={onFillBells}
                                className="btn btn-sm btn-nook-primary rounded-pill d-flex align-items-center gap-2"
                                disabled={!canIncrease}
                            >
                                <i className="fa-solid fa-money-bill-wave"></i>
                                Fill with 99,000 Bells
                            </button>
                        )}
                    </div>
                </div>
            )}
            {showTerminal && (
                <div className="terminal-window shadow-lg">
                    <div className="terminal-header">
                        <div className="terminal-dot r"></div>
                        <div className="terminal-dot y"></div>
                        <div className="terminal-dot g"></div>
                        <span className="ms-2 font-monospace tracking-wide opacity-75">nook-os terminal</span>
                    </div>
                    <div className="p-3">
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-success text-white rounded-pill fw-bold font-monospace">Order Bot</span>
                            </div>
                            <div className="bg-dark rounded p-2 mb-2 font-monospace small text-success" style={{ minHeight: '60px', border: '1px solid #333', whiteSpace: 'pre-wrap' }}>
                                {orderCommandText || <span className="opacity-50">&gt; Waiting for items or villager...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn btn-terminal w-100 rounded-pill py-2 fw-bold btn-sm"
                                onClick={onCopyOrder}
                                disabled={!orderCommandText}
                            >
                                <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check text-success' : 'fa-copy'} me-2`} />
                                {copyOrderStatus}
                            </button>
                        </div>

                        <div className="border-top border-secondary pt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-info text-dark rounded-pill fw-bold font-monospace">Drop Bot</span>
                            </div>
                            <div className="bg-dark rounded p-2 mb-2 font-monospace small text-info" style={{ minHeight: '60px', border: '1px solid #333', whiteSpace: 'pre-wrap' }}>
                                {dropCommandText || <span className="opacity-50">&gt; Waiting for items or villager...</span>}
                            </div>
                            <button
                                type="button"
                                className="btn btn-terminal w-100 rounded-pill py-2 fw-bold btn-sm"
                                onClick={onCopyDrop}
                                disabled={!dropCommandText}
                            >
                                <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check text-info' : 'fa-copy'} me-2`} />
                                {copyDropStatus}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommandBuilderSummary;
