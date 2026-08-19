import React, { useState, useEffect, useMemo } from 'react';
import type { CatalogEntity } from '../../data/commandBuilderData';
import type { PocketItem } from '../../hooks/useCommandBuilderPockets';
import { getVariantCommandParts, getVariantKey, getVariantLabel, type ItemVariant } from '../../utils/commandBuilderHex';

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f3f5'/%3E%3Cpath d='M30 65 L45 45 L58 58 L68 42 L75 65 Z' fill='%23ced4da'/%3E%3Ccircle cx='38' cy='35' r='7' fill='%23ced4da'/%3E%3C/svg%3E";

const getAcnhcdnUrl = (url: string | undefined): string => {
    if (!url) return FALLBACK_IMAGE;
    return url;
};

interface CommandBuilderVariantModalProps {
    item: (CatalogEntity & Partial<PocketItem>) | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenFullDetail: (item: CatalogEntity, variantKey?: string) => void;
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
    getOrderPocketQuantity: (id: string) => number;
    getDropPocketQuantity: (id: string) => number;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
}

export const CommandBuilderVariantModal: React.FC<CommandBuilderVariantModalProps> = ({
    item,
    isOpen,
    onClose,
    onOpenFullDetail,
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
    getOrderPocketQuantity,
    getDropPocketQuantity,
    isFavorite = false,
    onToggleFavorite,
}) => {
    const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');

    // Reset selected variant when opened with a new item
    useEffect(() => {
        if (!isOpen || !item) {
            setSelectedVariantKey(null);
            setStatusMessage('');
            return;
        }

        const variants = item.variations || [];
        if (variants.length > 0) {
            setSelectedVariantKey(getVariantKey(variants[0]));
        } else {
            setSelectedVariantKey(null);
        }
    }, [isOpen, item]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const variations = useMemo(() => item?.variations || [], [item]);

    const selectedVariant = useMemo<ItemVariant | null>(() => {
        if (!variations.length) return null;
        return variations.find((v) => getVariantKey(v) === selectedVariantKey) || variations[0] || null;
    }, [variations, selectedVariantKey]);

    if (!isOpen || !item) return null;

    const variantLabel = getVariantLabel(selectedVariant);
    const selectedVariantParts = getVariantCommandParts(item.id, selectedVariant);
    const activeImage = getAcnhcdnUrl(selectedVariant?.imageUrl || item.image);

    const pocketItemId = selectedVariantKey ? `${item.id}:${selectedVariantKey}` : item.id;
    const currentOrderQty = getOrderPocketQuantity(pocketItemId);
    const currentDropQty = getDropPocketQuantity(pocketItemId);

    const buildPocketItem = (): PocketItem => {
        return {
            ...item,
            id: pocketItemId,
            baseId: selectedVariantParts.baseId,
            variantId: selectedVariantParts.variantId,
            variantLabel,
            image: activeImage,
        };
    };

    const handleAddOrder = () => {
        const pocketItem = buildPocketItem();
        const res = addItemToOrderPockets(pocketItem);
        setStatusMessage(res.message);
        setTimeout(() => setStatusMessage(''), 2500);
    };

    const handleAddDrop = () => {
        const pocketItem = buildPocketItem();
        const res = addItemToDropPockets(pocketItem);
        setStatusMessage(res.message);
        setTimeout(() => setStatusMessage(''), 2500);
    };

    return (
        <div
            className="modal-overlay d-flex align-items-center justify-content-center p-3"
            onClick={onClose}
            style={{ zIndex: 1060 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="variant-modal-title"
        >
            <div
                className="modal-content-card bg-white rounded-5 shadow-lg overflow-hidden border-0 position-relative w-100"
                style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 pb-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div className="d-flex align-items-center gap-2">
                        {onToggleFavorite && (
                            <button
                                type="button"
                                onClick={(e) => onToggleFavorite(item.id, e)}
                                className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 transition-all ${
                                    isFavorite ? 'btn-warning text-white shadow-sm' : 'btn-white bg-white text-muted border shadow-2xs'
                                }`}
                                style={{ width: '32px', height: '32px' }}
                                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                                <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`} style={{ fontSize: '0.85rem' }}></i>
                            </button>
                        )}
                        <span className="badge bg-nook-green text-white rounded-pill px-3 py-1 fw-black x-small">
                            {item.category}
                        </span>
                        <h2 id="variant-modal-title" className="h5 fw-black text-dark mb-0 text-truncate" style={{ maxWidth: '300px' }}>
                            {item.name}
                        </h2>
                    </div>
                    <button
                        type="button"
                        className="btn-close rounded-circle p-2"
                        onClick={onClose}
                        aria-label="Close variant selector"
                    ></button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-grow-1" style={{ overscrollBehavior: 'contain' }}>
                    {/* Selected Variant Showcase */}
                    <div className="row g-3 align-items-center mb-4 bg-light rounded-4 p-3 border">
                        <div className="col-4 col-sm-3 text-center">
                            <div className="ratio ratio-1x1 bg-white rounded-4 border p-2 shadow-sm d-flex align-items-center justify-content-center">
                                <img
                                    src={activeImage}
                                    alt={variantLabel ? `${item.name} (${variantLabel})` : item.name}
                                    className="w-100 h-100 object-fit-contain transition-all"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                                />
                            </div>
                        </div>
                        <div className="col-8 col-sm-9">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <h3 className="h6 fw-black text-nook mb-0">
                                    {variantLabel || 'Standard Version'}
                                </h3>
                                {(currentOrderQty > 0 || currentDropQty > 0) && (
                                    <div className="d-flex gap-1">
                                        {currentOrderQty > 0 && <span className="badge bg-success shadow-sm">In Order: {currentOrderQty}</span>}
                                        {currentDropQty > 0 && <span className="badge bg-info text-dark shadow-sm">In Drop: {currentDropQty}</span>}
                                    </div>
                                )}
                            </div>
                            <p className="small text-muted mb-3">
                                {item.series && item.series !== 'None' && item.series !== 'NA' ? `${item.series} Series · ` : ''}
                                {item.theme && item.theme !== 'None' && item.theme !== 'NA' ? `${item.theme} Theme` : 'ACNH Item'}
                            </p>

                            {/* Quick Add Buttons for active variant */}
                            <div className="d-flex flex-wrap gap-2">
                                {/* Order Controls */}
                                {currentOrderQty > 0 ? (
                                    <div className="btn-group rounded-pill bg-white border shadow-sm">
                                        <button
                                            type="button"
                                            className="btn btn-sm text-success px-3 fw-bold border-0"
                                            onClick={() => decreaseOrderQuantity(pocketItemId)}
                                            aria-label="Decrease order quantity"
                                        >−</button>
                                        <div className="d-flex align-items-center justify-content-center fw-bold px-2 text-success" style={{ fontSize: "0.85rem", minWidth: "28px" }}>
                                            {currentOrderQty}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm text-success px-3 fw-bold border-0"
                                            onClick={() => increaseOrderQuantity(pocketItemId)}
                                            disabled={!canIncreaseOrder}
                                            aria-label="Increase order quantity"
                                        >+</button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-nook rounded-pill px-3 fw-bold shadow-sm"
                                        onClick={handleAddOrder}
                                        disabled={totalOrderCount >= 40}
                                    >
                                        <i className="fa-solid fa-basket-shopping me-1"></i>
                                        {totalOrderCount >= 40 ? 'Order Full (40/40)' : 'Add to Order'}
                                    </button>
                                )}

                                {/* Drop Controls */}
                                {currentDropQty > 0 ? (
                                    <div className="btn-group rounded-pill bg-white border shadow-sm">
                                        <button
                                            type="button"
                                            className="btn btn-sm text-info px-3 fw-bold border-0"
                                            onClick={() => decreaseDropQuantity(pocketItemId)}
                                            aria-label="Decrease drop quantity"
                                        >−</button>
                                        <div className="d-flex align-items-center justify-content-center fw-bold px-2 text-info" style={{ fontSize: "0.85rem", minWidth: "28px" }}>
                                            {currentDropQty}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm text-info px-3 fw-bold border-0"
                                            onClick={() => increaseDropQuantity(pocketItemId)}
                                            disabled={!canIncreaseDrop}
                                            aria-label="Increase drop quantity"
                                        >+</button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-info text-white rounded-pill px-3 fw-bold shadow-sm"
                                        onClick={handleAddDrop}
                                        disabled={totalDropCount >= 9}
                                    >
                                        <i className="fa-solid fa-box-open me-1"></i>
                                        {totalDropCount >= 9 ? 'Drop Full (9/9)' : 'Add to Drop'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status feedback toast */}
                    {statusMessage && (
                        <div className="alert rounded-4 py-2 px-3 mb-3 small border-2 text-success bg-success-subtle border-success-subtle animate-fade-in" role="status">
                            <i className="fa-solid fa-circle-check me-2"></i>{statusMessage}
                        </div>
                    )}

                    {/* Variations Grid */}
                    <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <label className="fw-black small text-nook text-uppercase tracking-wide" style={{ fontSize: '0.75rem' }}>
                                <i className="fa-solid fa-palette me-1"></i> Choose Variation ({variations.length})
                            </label>
                            <span className="x-small text-muted">Click a variant to preview & add</span>
                        </div>

                        <div className="row g-2">
                            {variations.map((v) => {
                                const vKey = getVariantKey(v);
                                const vLabel = getVariantLabel(v) || 'Default';
                                const isSelected = vKey === selectedVariantKey;
                                const vThumb = getAcnhcdnUrl(v.imageUrl || item.image);
                                const vPocketId = `${item.id}:${vKey}`;
                                const inOrder = getOrderPocketQuantity(vPocketId);
                                const inDrop = getDropPocketQuantity(vPocketId);

                                return (
                                    <div key={vKey} className="col-6 col-sm-4 col-md-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedVariantKey(vKey)}
                                            className={`btn w-100 p-2 rounded-4 text-start position-relative d-flex flex-column align-items-center gap-1 transition-all ${
                                                isSelected
                                                    ? 'border-success border-2 shadow-sm bg-success-subtle bg-opacity-25'
                                                    : 'border bg-white hover-scale'
                                            }`}
                                            style={{ minHeight: '105px' }}
                                        >
                                            {/* Quantity badges */}
                                            {(inOrder > 0 || inDrop > 0) && (
                                                <div className="position-absolute top-0 end-0 m-1 d-flex flex-column gap-1 pointer-events-none" style={{ zIndex: 2 }}>
                                                    {inOrder > 0 && <span className="badge bg-success" style={{ fontSize: '0.6rem' }}>O:{inOrder}</span>}
                                                    {inDrop > 0 && <span className="badge bg-info text-dark" style={{ fontSize: '0.6rem' }}>D:{inDrop}</span>}
                                                </div>
                                            )}

                                            <div className="ratio ratio-1x1 w-100 bg-light rounded-3 d-flex align-items-center justify-content-center p-1" style={{ maxWidth: '64px' }}>
                                                <img
                                                    src={vThumb}
                                                    alt={vLabel}
                                                    className="w-100 h-100 object-fit-contain"
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                                                />
                                            </div>

                                            <span className={`x-small fw-bold text-center text-truncate w-100 mt-auto ${isSelected ? 'text-success' : 'text-dark'}`} style={{ fontSize: '0.72rem' }} title={vLabel}>
                                                {vLabel}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-top bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-link text-decoration-none text-muted p-0 small fw-bold"
                        onClick={() => {
                            onClose();
                            onOpenFullDetail(item, selectedVariantKey || undefined);
                        }}
                    >
                        <i className="fa-solid fa-circle-info me-1 text-nook"></i>
                        View Full Details Page →
                    </button>

                    <button
                        type="button"
                        className="btn btn-dark rounded-pill px-4 py-2 fw-bold btn-sm shadow-sm"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
