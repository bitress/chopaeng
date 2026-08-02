import React from "react";
import type { PocketItem } from "../../hooks/useCommandBuilderPockets";

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
    openDetail: (item: ItemData) => void;
    decreaseOrderQuantity: (id: string) => void;
    increaseOrderQuantity: (id: string) => void;
    addItemToOrderPockets: (item: ItemData) => void;
    decreaseDropQuantity: (id: string) => void;
    increaseDropQuantity: (id: string) => void;
    addItemToDropPockets: (item: ItemData) => void;
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
    openDetail,
    decreaseOrderQuantity,
    increaseOrderQuantity,
    addItemToOrderPockets,
    decreaseDropQuantity,
    increaseDropQuantity,
    addItemToDropPockets,
}) => {
    const isVillager = item.entityType === 'villager';
    const cardSelected = orderQty > 0 || dropQty > 0;

    return (
        <div className="col-6 col-md-4 col-xl-3">
            <div
                className={`bg-white rounded-4 shadow-sm d-flex flex-column overflow-hidden position-relative h-100 border ${cardSelected ? 'border-success border-2' : 'border-light'} cursor-pointer transition-all hover-scale`}
                onClick={() => openDetail(item)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${item.name}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(item); } }}
            >
                {/* Selection Badges */}
                {cardSelected && (
                    <div className="position-absolute top-0 end-0 m-2 z-index-2 d-flex flex-column gap-1 pointer-events-none">
                        {orderQty > 0 && <div className="badge bg-success shadow-sm">O:{orderQty}</div>}
                        {dropQty > 0 && <div className="badge bg-info text-dark shadow-sm">D:{dropQty}</div>}
                    </div>
                )}

                {/* Image Container */}
                <div className="ratio ratio-1x1 bg-light d-flex align-items-center justify-content-center">
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                        className={`w-100 h-100 ${compactMode ? 'p-2' : 'p-4'} ${cardSelected ? 'opacity-75' : ''} ${isVillager ? 'object-fit-contain' : 'object-fit-cover'}`}
                    />
                </div>

                {/* Info Block */}
                <div className="p-2 d-flex flex-column flex-grow-1 border-top">
                    <div className="mb-auto">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="badge bg-light text-muted rounded-pill px-2 py-1" style={{ fontSize: "0.65rem", border: "1px solid #dee2e6" }}>{isVillager ? 'Villager' : item.category}</span>
                            {!isVillager && <button type="button" className="btn btn-link text-muted p-0 m-0" onClick={(e) => { e.stopPropagation(); openDetail(item); }} aria-label={`More info about ${item.name}`}><i className="fa-solid fa-circle-info" style={{ fontSize: "0.85rem" }}></i></button>}
                        </div>
                        <h3 className="h6 fw-black mb-0 text-truncate" title={item.name} style={{ fontSize: "0.85rem" }}>{item.name}</h3>
                        {item.variantLabel && (
                            <div className="badge bg-success-subtle text-success border border-success-subtle rounded-pill mt-1 text-truncate" style={{ maxWidth: '100%', fontSize: '0.66rem' }}>
                                {item.variantLabel}
                            </div>
                        )}
                        {!isVillager && !item.variantLabel && hideVariants && (item.variations?.length ?? 0) > 1 && (
                            <div className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill mt-1" style={{ fontSize: '0.66rem' }}>
                                {item.variations?.length} variants
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-2 w-100" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-2">
                            {/* Order Button Group */}
                            {orderQty > 0 ? (
                                isVillager ? (
                                    <button type="button" className="btn btn-sm btn-success text-white rounded-pill flex-grow-1 fw-bold border-0" style={{ fontSize: "0.75rem" }} onClick={() => decreaseOrderQuantity(item.id)} aria-label={`Remove ${item.name} from order`}>In Order (x)</button>
                                ) : (
                                    <div className="btn-group rounded-pill flex-grow-1 bg-light">
                                        <button type="button" className="btn btn-sm text-success px-2 py-1 fw-bold border-0" onClick={() => decreaseOrderQuantity(item.id)} aria-label={`Decrease order quantity for ${item.name}`}>−</button>
                                        <div className="d-flex align-items-center justify-content-center fw-bold px-1 text-success" style={{ fontSize: "0.75rem", minWidth: "20px" }}>{orderQty}</div>
                                        <button type="button" className="btn btn-sm text-success px-2 py-1 fw-bold border-0" onClick={() => increaseOrderQuantity(item.id)} disabled={!canIncreaseOrder} aria-label={`Increase order quantity for ${item.name}`} title={!canIncreaseOrder ? 'Order bot full (40/40)' : undefined}>+</button>
                                    </div>
                                )
                            ) : (
                                <button type="button" className="btn btn-sm btn-light text-success rounded-pill py-1 flex-grow-1 fw-bold border-0" style={{ fontSize: "0.75rem" }} onClick={() => addItemToOrderPockets(item)} disabled={totalOrderCount >= 40} title={totalOrderCount >= 40 ? 'Order bot full (40/40)' : undefined}>Order</button>
                            )}

                            {/* Drop Button Group */}
                            {dropQty > 0 ? (
                                isVillager ? (
                                    <button type="button" className="btn btn-sm btn-info text-white rounded-pill flex-grow-1 fw-bold border-0" style={{ fontSize: "0.75rem" }} onClick={() => decreaseDropQuantity(item.id)} aria-label={`Remove ${item.name} from drop`}>In Drop (x)</button>
                                ) : (
                                    <div className="btn-group rounded-pill flex-grow-1 bg-light">
                                        <button type="button" className="btn btn-sm text-info px-2 py-1 fw-bold border-0" onClick={() => decreaseDropQuantity(item.id)} aria-label={`Decrease drop quantity for ${item.name}`}>−</button>
                                        <div className="d-flex align-items-center justify-content-center fw-bold px-1 text-info" style={{ fontSize: "0.75rem", minWidth: "20px" }}>{dropQty}</div>
                                        <button type="button" className="btn btn-sm text-info px-2 py-1 fw-bold border-0" onClick={() => increaseDropQuantity(item.id)} disabled={!canIncreaseDrop} aria-label={`Increase drop quantity for ${item.name}`} title={!canIncreaseDrop ? 'Drop bot full (9/9)' : undefined}>+</button>
                                    </div>
                                )
                            ) : (
                                <button type="button" className="btn btn-sm btn-light text-info rounded-pill py-1 flex-grow-1 fw-bold border-0" style={{ fontSize: "0.75rem" }} onClick={() => addItemToDropPockets(item)} disabled={totalDropCount >= 9} title={totalDropCount >= 9 ? 'Drop bot full (9/9)' : undefined}>Drop</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
