import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { loadExplorerItems } from "../data/explorerDataLoader";
import { loadVillagers } from "../data/villagerDataLoader";
import type { CatalogEntity } from "../data/commandBuilderData";
import { getVariantLabel } from "../utils/commandBuilderHex";
import { useCommandBuilderPockets } from "../hooks/useCommandBuilderPockets";
import CommandBuilderSummary from "../components/CommandBuilderSummary";

const CatalogDetail = () => {
    const { entityType, id } = useParams<{ entityType?: string; id?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const variantIdParam = searchParams.get('variantId') || '';

    const items = useMemo(() => loadExplorerItems(), []);
    const villagers = useMemo(() => loadVillagers(), []);
    const type = entityType === 'villager' ? 'villager' : 'item';
    const entry = useMemo<CatalogEntity | null>(() => {
        if (!id) return null;
        return (type === 'villager'
            ? villagers.find((villager) => villager.id === id)
            : items.find((item) => item.id === id)) || null;
    }, [id, type, items, villagers]);

    const [detailStatus, setDetailStatus] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const detailStatusRef = useRef<HTMLDivElement | null>(null);

    const {
        selectedItems,
        setSelectedItems,
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
        setVillagerId,
    } = useCommandBuilderPockets();



    useEffect(() => {
        if (entry?.entityType !== 'item') {
            setSelectedVariantId(null);
            return;
        }

        const validIds = entry.variations?.map((variant) => variant.id || 'NA') || [];
        if (variantIdParam && validIds.includes(variantIdParam)) {
            setSelectedVariantId(variantIdParam);
            return;
        }

        setSelectedVariantId(validIds[0] || null);
    }, [entry, variantIdParam]);

    if (!entry) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-pattern font-nunito py-5">
                <div className="bg-white rounded-5 shadow-sm border p-5 text-center" style={{ maxWidth: '560px' }}>
                    <h1 className="h3 fw-black mb-3">Entry not found</h1>
                    <p className="text-muted mb-4">This item or villager could not be found. Return to the command builder and try again.</p>
                    <Link to="/command-builder" className="btn btn-nook-primary rounded-pill px-4 py-3 fw-black">Back to Command Builder</Link>
                </div>
            </div>
        );
    }

    const selectedVariant = entry.entityType === 'item'
        ? entry.variations?.find((variant) => (variant.id || 'NA') === selectedVariantId) || null
        : null;

    const variantLabel = getVariantLabel(selectedVariant);
    const detailImage = selectedVariant?.imageUrl || entry.image;
    const detailTitle = entry.entityType === 'item' && variantLabel ? `${entry.name} (${variantLabel})` : entry.name;

    const pocketItemId = entry.entityType === 'item'
        ? (selectedVariant ? `${entry.id}:${selectedVariant.id || 'NA'}` : entry.id)
        : entry.id;
    const inPocketQty = getPocketQuantity(pocketItemId);

    const handleVariantSelect = (variantId: string) => {
        setSelectedVariantId(variantId);
        const basePath = `/command-builder/${entry.entityType}/${entry.id}`;
        const query = variantId && variantId !== 'NA' ? `?variantId=${encodeURIComponent(variantId)}` : '';
        navigate(`${basePath}${query}`, { replace: true });
    };

    const addToCommandBuilder = () => {
        if (entry.entityType === 'item') {
            const itemToSave = {
                ...entry,
                id: pocketItemId,
                baseId: entry.id,
                variantId: selectedVariant?.id || 'NA',
                variantLabel,
                image: detailImage,
            };
            const result = addItemToPockets(itemToSave);
            setDetailStatus(result.message);
            // focus the status for screen readers
            setTimeout(() => {
                detailStatusRef.current?.focus();
            }, 50);
        } else {
            const result = requestVillager(entry);
            setDetailStatus(result.message);
            setTimeout(() => {
                detailStatusRef.current?.focus();
            }, 50);
        }
        // clear status after a short delay
        setTimeout(() => setDetailStatus(''), 2800);
    };

    return (
        <div className="bg-pattern font-nunito min-vh-100 pb-5">
            <section className="container py-5">
                <div className="mb-5">
                    <Link to="/command-builder" className="text-decoration-none text-nook small fw-bold transition-all" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back to catalog</span>
                    </Link>
                </div>

                <div className="row gy-4">
                    <div className="col-lg-8">
                        <div className="mb-3">
                            <span className="badge bg-nook-green text-white rounded-pill px-2 py-2 fw-black x-small" style={{ boxShadow: '0 3px 8px rgba(40, 167, 69, 0.2)' }}>
                                {entry.entityType === 'item' ? 'Item Details' : 'Villager Details'}
                            </span>
                            <h1 className="ac-font fw-black mt-2 mb-2 text-nook" style={{ fontSize: '2.2rem', letterSpacing: '0.5px' }}>{detailTitle}</h1>
                            <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
                                {entry.entityType === 'item'
                                    ? 'Choose a variation and add this item to your pockets.'
                                    : 'Request this villager for your command.'}
                            </p>
                        </div>

                        <div className="bg-cream rounded-4 border-0 shadow overflow-hidden" style={{ borderTop: '4px solid #28a745' }}>
                            <div className="ratio ratio-4x3 bg-light p-4">
                                <img src={detailImage} alt={detailTitle} className="w-100 h-100 object-fit-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }} />
                            </div>
                            <div className="p-4">
                                <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{entry.description}</p>

                                {entry.entityType === 'item' && entry.variations && entry.variations.length > 0 && (
                                    <div className="mb-5 p-4 rounded-4 bg-light-green border-2" style={{ borderColor: '#88e0a0' }}>
                                        <label className="fw-black small text-nook mb-3 d-block" style={{ fontSize: '0.95rem' }}>
                                            <i className="fa-solid fa-palette me-2"></i>Choose a variation
                                        </label>
                                        <div className="d-flex flex-wrap gap-3">
                                            {(entry.variations || []).map((variant) => {
                                                const variantId = variant.id || 'NA';
                                                const variantText = getVariantLabel(variant) || 'Default';
                                                const isSelected = variantId === selectedVariantId;
                                                const thumbUrl = variant.imageUrl || entry.image;

                                                if (thumbUrl) {
                                                    return (
                                                        <button
                                                            key={variantId}
                                                            type="button"
                                                            onClick={() => handleVariantSelect(variantId)}
                                                            className={`variant-thumb-btn btn p-2 rounded-4 d-flex flex-column align-items-center gap-1 ${isSelected ? 'variant-thumb-btn--selected' : 'btn-outline-secondary'}`}
                                                                        title={variantText}
                                                                        aria-pressed={isSelected}
                                                                        aria-label={`Select variation ${variantText}`}
                                                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVariantSelect(variantId); } }}
                                                        >
                                                            <div className="ratio ratio-1x1" style={{ width: '48px' }}>
                                                                <img src={thumbUrl} alt={variantText} className="w-100 h-100 object-fit-contain rounded-3" />
                                                            </div>
                                                            <span className="x-small fw-bold text-truncate" style={{ maxWidth: '72px' }}>{variantText}</span>
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={variantId}
                                                        type="button"
                                                        onClick={() => handleVariantSelect(variantId)}
                                                        className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${isSelected ? 'bg-nook-green text-white border-0' : 'btn-outline-secondary text-dark border-2'}`}
                                                        aria-pressed={isSelected}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVariantSelect(variantId); } }}
                                                        style={isSelected ? { boxShadow: '0 3px 8px rgba(40, 167, 69, 0.3)' } : {}}
                                                    >
                                                        {variantText}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="row g-3 mb-5">
                                    <div className="col-6">
                                        <div className="bg-white rounded-4 p-4 h-100 border-2 border-success border-opacity-10 transition-all" style={{ boxShadow: '0 2px 6px rgba(40, 167, 69, 0.08)' }}>
                                            <span className="x-small fw-bold text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Category</span>
                                            <div className="fw-black mt-3 text-nook" style={{ fontSize: '1.05rem' }}>{entry.category}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-white rounded-4 p-4 h-100 border-2 border-success border-opacity-10 transition-all" style={{ boxShadow: '0 2px 6px rgba(40, 167, 69, 0.08)' }}>
                                            <span className="x-small fw-bold text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Theme</span>
                                            <div className="fw-black mt-3 text-nook" style={{ fontSize: '1.05rem' }}>{entry.theme}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-white rounded-4 p-4 h-100 border-2 border-success border-opacity-10 transition-all" style={{ boxShadow: '0 2px 6px rgba(40, 167, 69, 0.08)' }}>
                                            <span className="x-small fw-bold text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Series</span>
                                            <div className="fw-black mt-3 text-nook" style={{ fontSize: '1.05rem' }}>{entry.series}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-white rounded-4 p-4 h-100 border-2 border-success border-opacity-10 transition-all" style={{ boxShadow: '0 2px 6px rgba(40, 167, 69, 0.08)' }}>
                                            <span className="x-small fw-bold text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Colour</span>
                                            <div className="fw-black mt-3 text-nook" style={{ fontSize: '1.05rem' }}>{entry.colour}</div>
                                        </div>
                                    </div>
                                </div>

                                {inPocketQty > 0 && entry.entityType === 'item' && (
                                    <div className="alert rounded-4 py-3 px-4 mb-4 small border-2" style={{ background: '#f0fdf4', borderColor: '#88e0a0', color: '#1e7e34' }} role="status">
                                        <i className="fa-solid fa-basket-shopping me-2 fw-black"></i>
                                        In pockets: <strong>{inPocketQty} × {entry.name}</strong>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addToCommandBuilder}
                                    className="btn rounded-pill px-4 py-3 fw-black w-100 transition-all"
                                    disabled={entry.entityType === 'item' && totalItemsCount >= 40}
                                    style={{
                                        background: entry.entityType === 'item' && totalItemsCount >= 40 
                                            ? '#f8f9fa' 
                                            : 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                                        color: entry.entityType === 'item' && totalItemsCount >= 40 ? '#adb5bd' : 'white',
                                        border: 'none',
                                        boxShadow: entry.entityType === 'item' && totalItemsCount >= 40 
                                            ? 'none' 
                                            : '0 4px 12px rgba(40, 167, 69, 0.3)',
                                        cursor: entry.entityType === 'item' && totalItemsCount >= 40 ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!(entry.entityType === 'item' && totalItemsCount >= 40)) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!(entry.entityType === 'item' && totalItemsCount >= 40)) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                        }
                                    }}
                                >
                                    <i className={`fa-solid me-2 ${entry.entityType === 'item' ? (inPocketQty > 0 ? 'fa-check' : 'fa-plus') : 'fa-heart'}`}></i>
                                    {entry.entityType === 'item' ? (inPocketQty > 0 ? `In pockets (${inPocketQty})` : 'Add to Pockets') : 'Request Villager'}
                                </button>

                                {entry.entityType === 'item' && totalItemsCount >= 40 && (
                                    <p className="text-muted small text-center mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
                                        <i className="fa-solid fa-circle-info me-1"></i>Your pockets are full (40/40). Remove an item first.
                                    </p>
                                )}

                                {detailStatus && (
                                    <div ref={detailStatusRef} tabIndex={-1} aria-live="polite" className="alert rounded-4 py-3 px-4 mt-4 mb-0 small border-2" style={{ background: '#f0fdf4', borderColor: '#88e0a0', color: '#1e7e34' }} role="alert">
                                        <i className="fa-solid fa-circle-check me-2 fw-black"></i>{detailStatus}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="col-lg-4">
                        <div className="sticky-top" style={{ top: '90px' }}>
                            <CommandBuilderSummary
                                savedPockets={selectedItems}
                                savedVillager={selectedVillager}
                                orderCommandText={orderCommandText}
                                dropCommandText={dropCommandText}
                                copyOrderStatus={copyOrderStatus}
                                copyDropStatus={copyDropStatus}
                                onCopyOrder={handleCopyOrder}
                                onCopyDrop={handleCopyDrop}
                                onDecreaseQuantity={decreaseQuantity}
                                onIncreaseQuantity={increaseQuantity}
                                onRemoveItem={removeItem}
                                onRemoveVillager={() => setVillagerId('')}
                                onClearPockets={() => setSelectedItems([])}
                                canIncrease={canIncrease}
                                onFillTickets={handleFillTickets}
                                onFillCrowns={handleFillCrowns}
                                onFillBells={handleFillBells}
                                showTerminal={true}
                            />
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
};

export default CatalogDetail;
