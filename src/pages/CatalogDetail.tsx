import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
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

    const {
        selectedItems,
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
        } else {
            const result = requestVillager(entry);
            setDetailStatus(result.message);
        }
        setTimeout(() => setDetailStatus(''), 2800);
    };

    return (
        <div className="bg-pattern font-nunito min-vh-100 pb-5">
            <section className="container py-5">
                <div className="mb-4">
                    <Link to="/command-builder" className="text-decoration-none text-muted small fw-bold">
                        <i className="fa-solid fa-arrow-left me-2"></i>Back to catalog
                    </Link>
                </div>

                <div className="row gy-4">
                    <div className="col-lg-8">
                        <div className="mb-4">
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fw-black text-uppercase x-small">
                                {entry.entityType === 'item' ? 'Item details' : 'Villager details'}
                            </span>
                            <h1 className="display-6 fw-black mt-3 mb-2 text-dark">{detailTitle}</h1>
                            <p className="text-muted small mb-0">
                                {entry.entityType === 'item'
                                    ? 'Choose a variation and add this item to your pockets.'
                                    : 'Request this villager for your command.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-5 border shadow-sm overflow-hidden">
                            <div className="ratio ratio-4x3">
                                <img src={detailImage} alt={detailTitle} className="w-100 h-100 object-fit-contain bg-light p-4" />
                            </div>
                            <div className="p-4">
                                <p className="text-muted mb-4">{entry.description}</p>

                                {entry.entityType === 'item' && entry.variations && entry.variations.length > 0 && (
                                    <div className="mb-4">
                                        <label className="form-label fw-black small text-dark mb-3">
                                            <i className="fa-solid fa-palette me-2 text-success"></i>Choose a variation
                                        </label>
                                        <div className="d-flex flex-wrap gap-2">
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
                                                        className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${isSelected ? 'btn-nook-primary text-white shadow-sm' : 'btn-outline-secondary text-dark'}`}
                                                    >
                                                        {variantText}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 h-100">
                                            <span className="text-uppercase x-small fw-bold text-muted">Category</span>
                                            <div className="fw-black mt-2">{entry.category}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 h-100">
                                            <span className="text-uppercase x-small fw-bold text-muted">Theme</span>
                                            <div className="fw-black mt-2">{entry.theme}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 h-100">
                                            <span className="text-uppercase x-small fw-bold text-muted">Series</span>
                                            <div className="fw-black mt-2">{entry.series}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 h-100">
                                            <span className="text-uppercase x-small fw-bold text-muted">Colour</span>
                                            <div className="fw-black mt-2">{entry.colour}</div>
                                        </div>
                                    </div>
                                </div>

                                {inPocketQty > 0 && entry.entityType === 'item' && (
                                    <div className="alert alert-light border border-success-subtle rounded-4 py-2 px-3 mb-3 small" role="status">
                                        <i className="fa-solid fa-basket-shopping text-success me-2"></i>
                                        In pockets: <strong>{inPocketQty}</strong>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addToCommandBuilder}
                                    className="btn btn-nook-primary rounded-pill px-4 py-3 fw-black w-100"
                                    disabled={entry.entityType === 'item' && totalItemsCount >= 40}
                                >
                                    {entry.entityType === 'item' ? 'Add to Pockets' : 'Request Villager'}
                                </button>

                                {entry.entityType === 'item' && totalItemsCount >= 40 && (
                                    <p className="text-muted small text-center mt-2 mb-0">Your pockets are full (40/40). Remove an item from the sidebar first.</p>
                                )}

                                {detailStatus && (
                                    <div className="alert alert-success rounded-4 py-3 px-4 mt-3 mb-0 small" role="alert">
                                        <i className="fa-solid fa-check text-success me-2 fw-black"></i>{detailStatus}
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
