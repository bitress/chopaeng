import React from "react";
import type { PocketItem } from "../../hooks/useCommandBuilderPockets";
import { findRecipeIngredients } from "../../utils/pocketOptimizer";

type ItemData = PocketItem;

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f3f5'/%3E%3Cpath d='M30 65 L45 45 L58 58 L68 42 L75 65 Z' fill='%23ced4da'/%3E%3Ccircle cx='38' cy='35' r='7' fill='%23ced4da'/%3E%3C/svg%3E";

interface CommandBuilderItemCardProps {
    item: ItemData;
    orderQty: number;
    dropQty: number;
    compactMode: boolean;
    hideVariants: boolean;
    canIncreaseOrder: boolean;
    canIncreaseDrop: boolean;
    totalOrderCount: number;
    totalDropCount: number;
    isHighlighted?: boolean;
    openDetail: (item: ItemData) => void;
    openVariantPicker?: (item: ItemData) => void;
    decreaseOrderQuantity: (id: string) => void;
    increaseOrderQuantity: (id: string) => void;
    addItemToOrderPockets: (item: ItemData) => void;
    decreaseDropQuantity: (id: string) => void;
    increaseDropQuantity: (id: string) => void;
    addItemToDropPockets: (item: ItemData) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
    onLoadRecipeMaterials?: (recipeName: string) => void;
}

export const CommandBuilderItemCard: React.FC<CommandBuilderItemCardProps> = ({
    item,
    orderQty,
    dropQty,
    compactMode,
    hideVariants,
    canIncreaseOrder,
    canIncreaseDrop,
    totalOrderCount,
    totalDropCount,
    isHighlighted = false,
    isFavorite = false,
    onToggleFavorite,
    openDetail,
    openVariantPicker,
    decreaseOrderQuantity,
    increaseOrderQuantity,
    addItemToOrderPockets,
    decreaseDropQuantity,
    increaseDropQuantity,
    addItemToDropPockets,
    onLoadRecipeMaterials,
}) => {
    const isVillager = item.entityType === 'villager';
    const cardSelected = orderQty > 0 || dropQty > 0;
    const hasMultipleVariants = !isVillager && (item.variations?.length ?? 0) > 1;

    const handleCardClick = () => {
        if (hasMultipleVariants && hideVariants && openVariantPicker) {
            openVariantPicker(item);
        } else {
            openDetail(item);
        }
    };

    const handleInitialOrderClick = () => {
        if (hasMultipleVariants && hideVariants && openVariantPicker) {
            openVariantPicker(item);
        } else {
            addItemToOrderPockets(item);
        }
    };

    const handleInitialDropClick = () => {
        if (hasMultipleVariants && hideVariants && openVariantPicker) {
            openVariantPicker(item);
        } else {
            addItemToDropPockets(item);
        }
    };

    return (
        <div className="col-6 col-md-4 col-xl-3" id={`item-card-${item.id}`} data-item-id={item.id}>
            <div
                className={`bg-white rounded-4 shadow-sm d-flex flex-column overflow-hidden position-relative h-100 border transition-all ${
                    isHighlighted
                        ? 'border-success shadow-md item-card-highlighted'
                        : cardSelected
                            ? 'border-success border-2 shadow-xs'
                            : 'border-light hover-border-success'
                } cursor-pointer hover-scale`}
                onClick={handleCardClick}
                role="button"
                tabIndex={0}
                aria-label={`View details or variations for ${item.name}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
            >
                {/* Favorite Star Button (Top-Left) */}
                {onToggleFavorite && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item.id, e);
                        }}
                        className={`position-absolute top-0 start-0 m-2 btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 transition-all ${
                            isFavorite 
                                ? 'btn-warning text-white shadow-sm' 
                                : 'btn-white bg-white text-muted border shadow-2xs opacity-85 hover-opacity-100'
                        }`}
                        style={{ width: '28px', height: '28px', zIndex: 10 }}
                        title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                    >
                        <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`} style={{ fontSize: '0.75rem' }}></i>
                    </button>
                )}

                {/* Selection Badges (Top-Right) */}
                {cardSelected && (
                    <div className="position-absolute top-0 end-0 m-2 z-index-2 d-flex flex-column gap-1 pointer-events-none">
                        {orderQty > 0 && (
                            <div className="badge bg-success text-white rounded-pill px-2 py-1 shadow-sm d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '0.68rem' }}>
                                <i className="fa-solid fa-box x-small"></i>
                                <span>{orderQty}</span>
                            </div>
                        )}
                        {dropQty > 0 && (
                            <div className="badge bg-info text-white rounded-pill px-2 py-1 shadow-sm d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '0.68rem', backgroundColor: '#0284c7' }}>
                                <i className="fa-solid fa-plane-arrival x-small"></i>
                                <span>{dropQty}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Image Container */}
                <div className="ratio ratio-1x1 bg-light d-flex align-items-center justify-content-center">
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                        className={`w-100 h-100 ${compactMode ? 'p-2' : 'p-4'} ${cardSelected ? 'opacity-90' : ''} ${isVillager ? 'object-fit-contain' : 'object-fit-cover'}`}
                    />
                </div>

                {/* Info Block */}
                <div className="p-2 d-flex flex-column flex-grow-1 border-top">
                    <div className="mb-auto">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="badge bg-light text-muted rounded-pill px-2 py-1" style={{ fontSize: "0.65rem", border: "1px solid #dee2e6" }}>
                                {isVillager ? 'Villager' : item.category}
                            </span>
                            {!isVillager && (
                                <button
                                    type="button"
                                    className="btn btn-link text-muted p-0 m-0"
                                    onClick={(e) => { e.stopPropagation(); openDetail(item); }}
                                    aria-label={`More info about ${item.name}`}
                                    title="View full detail page"
                                >
                                    <i className="fa-solid fa-circle-info" style={{ fontSize: "0.85rem" }}></i>
                                </button>
                            )}
                        </div>
                        <h3 className="h6 fw-black mb-0 text-truncate" title={item.name} style={{ fontSize: "0.85rem" }}>
                            {item.name}
                        </h3>

                        {/* Variant Pill / Count Tag */}
                        {item.variantLabel && (
                            <div className="badge bg-success-subtle text-success border border-success-subtle rounded-pill mt-1 text-truncate" style={{ maxWidth: '100%', fontSize: '0.66rem' }}>
                                {item.variantLabel}
                            </div>
                        )}
                        {!isVillager && !item.variantLabel && hideVariants && hasMultipleVariants && (
                            <button
                                type="button"
                                className="btn p-0 border-0 text-start"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (openVariantPicker) openVariantPicker(item);
                                    else openDetail(item);
                                }}
                                title="Click to choose variation"
                            >
                                <div className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill mt-1 d-inline-flex align-items-center gap-1 hover-shadow" style={{ fontSize: '0.66rem', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-palette" style={{ fontSize: '0.6rem' }}></i>
                                    <span>{item.variations?.length} variants</span>
                                </div>
                            </button>
                        )}

                        {/* Recipe Materials Quick Action */}
                        {onLoadRecipeMaterials && findRecipeIngredients(item.name) && (
                            <button
                                type="button"
                                className="btn p-0 border-0 text-start d-block mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLoadRecipeMaterials(item.name);
                                }}
                                title="Autofill required crafting materials for this recipe into pockets"
                            >
                                <div className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill d-inline-flex align-items-center gap-1 hover-shadow" style={{ fontSize: '0.66rem', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-hammer" style={{ fontSize: '0.6rem' }}></i>
                                    <span>Load Materials</span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Action Buttons (Order vs Drop) */}
                    <div className="mt-auto pt-2 w-100" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1">
                            {/* Order Button / Toggle / Stepper */}
                            {isVillager ? (
                                orderQty > 0 ? (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success text-white rounded-pill py-1 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 transition-all shadow-2xs"
                                        style={{ fontSize: "0.75rem", backgroundColor: '#2ea466', borderColor: '#2ea466' }}
                                        onClick={() => decreaseOrderQuantity(item.id)}
                                        title="Click to remove villager from Order"
                                    >
                                        <i className="fa-solid fa-check x-small"></i>
                                        <span>Order</span>
                                        <i className="fa-solid fa-xmark ms-1 opacity-75 x-small"></i>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-success rounded-pill py-1 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 transition-all"
                                        style={{ fontSize: "0.75rem" }}
                                        onClick={handleInitialOrderClick}
                                        title="Add or replace moving-in Villager (1/1)"
                                    >
                                        <i className="fa-solid fa-user-plus x-small"></i>
                                        <span>Order</span>
                                    </button>
                                )
                            ) : orderQty > 0 ? (
                                <div
                                    className="btn-group rounded-pill flex-grow-1 border border-success overflow-hidden"
                                    style={{ backgroundColor: '#f0fdf4' }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-sm text-success px-2 py-1 fw-bold border-0 hover-bg-success hover-text-white transition-all"
                                        onClick={() => decreaseOrderQuantity(item.id)}
                                        aria-label={`Decrease order quantity for ${item.name}`}
                                        title="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <div
                                        className="d-flex align-items-center justify-content-center fw-bold px-1 text-success font-monospace"
                                        style={{ fontSize: "0.75rem", minWidth: "22px" }}
                                        title={`Order: ${orderQty} items`}
                                    >
                                        {orderQty}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm text-success px-2 py-1 fw-bold border-0 hover-bg-success hover-text-white transition-all"
                                        onClick={() => increaseOrderQuantity(item.id)}
                                        disabled={!canIncreaseOrder}
                                        aria-label={`Increase order quantity for ${item.name}`}
                                        title={!canIncreaseOrder ? 'Order bot full (40/40)' : 'Increase quantity'}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success rounded-pill py-1 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 transition-all"
                                    style={{ fontSize: "0.75rem" }}
                                    onClick={handleInitialOrderClick}
                                    disabled={totalOrderCount >= 40}
                                    title={totalOrderCount >= 40 ? 'Order bot item slots full (40/40)' : hasMultipleVariants && hideVariants ? 'Choose variant to order' : 'Add to Order ($order)'}
                                >
                                    <i className="fa-solid fa-box x-small"></i>
                                    <span>Order</span>
                                </button>
                            )}

                            {/* Drop Button / Toggle / Stepper */}
                            {isVillager ? (
                                dropQty > 0 ? (
                                    <button
                                        type="button"
                                        className="btn btn-sm text-white rounded-pill py-1 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 transition-all shadow-2xs"
                                        style={{ fontSize: "0.75rem", backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                                        onClick={() => decreaseDropQuantity(item.id)}
                                        title="Click to remove villager from Drop"
                                    >
                                        <i className="fa-solid fa-check x-small"></i>
                                        <span>Drop</span>
                                        <i className="fa-solid fa-xmark ms-1 opacity-75 x-small"></i>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-info rounded-pill py-1 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 transition-all"
                                        style={{ fontSize: "0.75rem", color: '#0284c7', borderColor: '#0284c7' }}
                                        onClick={handleInitialDropClick}
                                        disabled={totalDropCount >= 9}
                                        title={totalDropCount >= 9 ? 'Drop bot full (9/9)' : 'Add to Drop ($drop)'}
                                    >
                                        <i className="fa-solid fa-plane-arrival x-small"></i>
                                        <span>Drop</span>
                                    </button>
                                )
                            ) : dropQty > 0 ? (
                                <div
                                    className="btn-group rounded-pill flex-grow-1 border border-info overflow-hidden"
                                    style={{ backgroundColor: '#f0f9ff', borderColor: '#0284c7' }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-sm text-info px-2 py-1 fw-bold border-0 hover-bg-info hover-text-white transition-all"
                                        style={{ color: '#0284c7' }}
                                        onClick={() => decreaseDropQuantity(item.id)}
                                        aria-label={`Decrease drop quantity for ${item.name}`}
                                        title="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <div
                                        className="d-flex align-items-center justify-content-center fw-bold px-1 font-monospace"
                                        style={{ fontSize: "0.75rem", minWidth: "22px", color: '#0284c7' }}
                                        title={`Drop: ${dropQty} items`}
                                    >
                                        {dropQty}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm text-info px-2 py-1 fw-bold border-0 hover-bg-info hover-text-white transition-all"
                                        style={{ color: '#0284c7' }}
                                        onClick={() => increaseDropQuantity(item.id)}
                                        disabled={!canIncreaseDrop}
                                        aria-label={`Increase drop quantity for ${item.name}`}
                                        title={!canIncreaseDrop ? 'Drop bot full (9/9)' : 'Increase quantity'}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-info rounded-pill py-1 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 transition-all"
                                    style={{ fontSize: "0.75rem", color: '#0284c7', borderColor: '#0284c7' }}
                                    onClick={handleInitialDropClick}
                                    disabled={totalDropCount >= 9}
                                    title={totalDropCount >= 9 ? 'Drop bot full (9/9)' : hasMultipleVariants && hideVariants ? 'Choose variant to drop' : 'Add to Drop ($drop)'}
                                >
                                    <i className="fa-solid fa-plane-arrival x-small"></i>
                                    <span>Drop</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandBuilderItemCard;
