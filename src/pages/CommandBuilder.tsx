import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CatalogEntity } from "../data/commandBuilderData";
import { loadExplorerItems } from "../data/explorerDataLoader";
import { loadVillagers } from "../data/villagerDataLoader";
import { getVariantLabel } from "../utils/commandBuilderHex";
import { useCommandBuilderPockets, type PocketItem } from "../hooks/useCommandBuilderPockets";
import CommandBuilderSummary from "../components/CommandBuilderSummary";

type ItemData = PocketItem;

type CatalogStringKey = Exclude<keyof CatalogEntity, 'variations'>;

const uniqueValues = (items: CatalogEntity[], key: CatalogStringKey) => [
    "All",
    ...Array.from(new Set(items.map((item) => String(item[key])))).sort(),
];

const explorerItems = loadExplorerItems();
const villagerEntities = loadVillagers();
const catalogEntities = [...explorerItems, ...villagerEntities];

const CommandBuilder = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState("All");
    const [theme, setTheme] = useState("All");
    const [series, setSeries] = useState("All");
    const [interactivity, setInteractivity] = useState("All");
    const [colour, setColour] = useState("All");
    // auto-hide variants by default to declutter the list
    const [hideVariants, setHideVariants] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [kindFilter, setKindFilter] = useState("All"); // All | Items | Recipes | Villagers
    const [villagerType, setVillagerType] = useState("All");
    const [compactMode, setCompactMode] = useState(true);

    const {
        orderItems,
        setOrderItems,
        dropItems,
        setDropItems,
        villagerIds,
        totalOrderCount,
        totalDropCount,
        canIncreaseOrder,
        canIncreaseDrop,
        decreaseOrderQuantity,
        increaseOrderQuantity,
        removeOrderItem,
        decreaseDropQuantity,
        increaseDropQuantity,
        removeDropItem,
        handleFillTickets,
        handleFillCrowns,
        handleFillBells,
        addItemToOrderPockets,
        addItemToDropPockets,
        requestVillager,
        removeVillager,
        clearVillagers,
        selectedVillagers,
        orderCommandText,
        dropCommandText,
        injectVillagerCommandText,
        copyOrderStatus,
        copyDropStatus,
        copyInjectVillagerStatus,
        handleCopyOrder,
        handleCopyDrop,
        handleCopyInjectVillager,
    } = useCommandBuilderPockets();

    const expandedCatalogItems = useMemo(() => {
        return catalogEntities.flatMap((item) => {
            // auto-hide variants for non-items or when hiding is requested or there are no meaningful variations
            if (item.entityType !== 'item' || !item.variations || hideVariants || item.variations.length === 0) {
                return [item as ItemData];
            }

            return item.variations.map((variant) => ({
                ...item,
                id: `${item.id}:${variant.id ?? 'NA'}`,
                baseId: variant.pokerId || item.id,
                variantId: variant.id || 'NA',
                variantLabel: getVariantLabel(variant),
                image: variant.imageUrl || item.image,
            }));
        });
    }, [hideVariants, catalogEntities]);

    const itemCategories = useMemo(() => uniqueValues(explorerItems.filter(i => i.entityType === 'item'), 'category'), []);
    const villagerTypes = useMemo(() => uniqueValues(villagerEntities, 'category'), []);

    const filteredItems = useMemo(() => {
        return expandedCatalogItems.filter((item) => {
            const lowerName = `${item.name}${item.variantLabel ? ` ${item.variantLabel}` : ''}`.toLowerCase();
            const matchesSearch = lowerName.includes(searchTerm.toLowerCase());
            const matchesCategory = category === "All" || item.category === category;
            const matchesTheme = theme === "All" || item.theme === theme;
            const matchesSeries = series === "All" || item.series === series;
            const matchesInteractivity = interactivity === "All" || item.interactivity === interactivity;
            const matchesColour = colour === "All" || item.colour === colour;
            const matchesKind = kindFilter === 'All' || (kindFilter === 'Items' && item.entityType === 'item' && item.category !== 'Recipes') || (kindFilter === 'Recipes' && item.entityType === 'item' && item.category === 'Recipes') || (kindFilter === 'Villagers' && item.entityType === 'villager');
            const matchesVillagerType = villagerType === 'All' || item.entityType !== 'villager' || item.category === villagerType;
            return matchesSearch && matchesCategory && matchesTheme && matchesSeries && matchesInteractivity && matchesColour && matchesKind && matchesVillagerType;
        });
    }, [expandedCatalogItems, category, theme, series, interactivity, colour, searchTerm, kindFilter, villagerType]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = compactMode ? 50 : 26;
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const pagedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getDetailUrl = (item: ItemData) => {
        const [baseId, variantId] = item.id.split(":");
        const query = variantId && variantId !== 'NA' ? `?variantId=${encodeURIComponent(variantId)}` : '';
        return `/command-builder/${item.entityType}/${baseId}${query}`;
    };

    const openDetail = (item: ItemData) => {
        navigate(getDetailUrl(item));
    };

    const clearFilters = () => {
        setCategory("All");
        setTheme("All");
        setSeries("All");
        setInteractivity("All");
        setColour("All");
        setSearchTerm("");
        setKindFilter("All");
        setVillagerType("All");
        setCompactMode(false);
        setHideVariants(true);
    };

    return (
        <>
            <title>Chopaeng | Command Builder</title>
            <meta
                name="description"
                content="Browse items by category, theme, series, interactivity, colour, or name. Add up to 40 items to your pockets and build your ACNH command with a villager option."
            />
            <link rel="canonical" href="https://www.chopaeng.com/command-builder" />

            <div className="bg-pattern font-nunito min-vh-100 pb-5">
                <section className="container mt-n5 position-relative" style={{ zIndex: 10 }}>
                    <div className="row gy-4">
                        <div className="col-12">
                            <div className="glass-filter rounded-5 p-4 border">
                                <div className="row align-items-center gy-3">
                                    <div className="col-md-9">
                                        <div className="row g-3">
                                            <div className="col-12 col-sm-6 col-md-4">
                                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-magnifying-glass me-1 text-muted"></i> Search</label>
                                                <input
                                                    type="search"
                                                    className="form-control bg-white rounded-pill border-0 shadow-sm px-4"
                                                    placeholder="e.g. Ironwood"
                                                    value={searchTerm}
                                                    onChange={(event) => setSearchTerm(event.target.value)}
                                                />
                                            </div>
                                            <div className="col-12 col-sm-6 col-md-4">
                                                    <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-layer-group me-1 text-muted"></i> Type</label>
                                                    <select
                                                        className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                        value={kindFilter}
                                                        onChange={(event) => setKindFilter(event.target.value)}
                                                    >
                                                        <option value="All">All</option>
                                                        <option value="Items">Items</option>
                                                        <option value="Recipes">Recipes</option>
                                                        <option value="Villagers">Villagers</option>
                                                    </select>
                                            </div>
                                                <div className="col-12 col-sm-6 col-md-4">
                                                    <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-tags me-1 text-muted"></i> Category</label>
                                                    <select
                                                        className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                        value={category}
                                                        onChange={(event) => setCategory(event.target.value)}
                                                    >
                                                        {itemCategories.map((value) => (
                                                            <option key={value} value={value}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-12 col-sm-6 col-md-4">
                                                    <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-user-astronaut me-1 text-muted"></i> Villager Type</label>
                                                    <select
                                                        className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                        value={villagerType}
                                                        onChange={(event) => setVillagerType(event.target.value)}
                                                    >
                                                        {villagerTypes.map((value) => (
                                                            <option key={value} value={value}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            <div className="col-12 col-sm-6 col-md-4">
                                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-palette me-1 text-muted"></i> Theme</label>
                                                <select
                                                    className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                    value={theme}
                                                    onChange={(event) => setTheme(event.target.value)}
                                                >
                                                    {uniqueValues(catalogEntities, 'theme').map((value) => (
                                                        <option key={value} value={value}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-sm-6 col-md-4">
                                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-cubes me-1 text-muted"></i> Series</label>
                                                <select
                                                    className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                    value={series}
                                                    onChange={(event) => setSeries(event.target.value)}
                                                >
                                                    {uniqueValues(catalogEntities, 'series').map((value) => (
                                                        <option key={value} value={value}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-sm-6 col-md-4">
                                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-hand-pointer me-1 text-muted"></i> Interact</label>
                                                <select
                                                    className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                    value={interactivity}
                                                    onChange={(event) => setInteractivity(event.target.value)}
                                                >
                                                    {uniqueValues(catalogEntities, 'interactivity').map((value) => (
                                                        <option key={value} value={value}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-sm-6 col-md-4">
                                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-droplet me-1 text-muted"></i> Colour</label>
                                                <select
                                                    className="form-select bg-white rounded-pill border-0 shadow-sm px-4 cursor-pointer"
                                                    value={colour}
                                                    onChange={(event) => setColour(event.target.value)}
                                                >
                                                    {uniqueValues(catalogEntities, 'colour').map((value) => (
                                                        <option key={value} value={value}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-sm-6 col-md-4 d-flex align-items-center">
                                                <div className="d-flex w-100 gap-3 align-items-center">
                                                    <div className="form-check form-switch flex-grow-1">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="hideVariants"
                                                            checked={hideVariants}
                                                            onChange={(event) => setHideVariants(event.target.checked)}
                                                        />
                                                        <label className="form-check-label small text-dark" htmlFor="hideVariants">
                                                            Hide variants
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="compactMode"
                                                            checked={compactMode}
                                                            onChange={(e) => setCompactMode(e.target.checked)}
                                                        />
                                                        <label className="form-check-label small text-dark" htmlFor="compactMode">
                                                            Compact
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 d-flex align-items-end justify-content-md-end h-100">
                                        <button
                                            type="button"
                                            className="btn btn-white text-dark rounded-pill px-4 py-2 fw-bold shadow-sm border mt-3 mt-md-0"
                                            onClick={clearFilters}
                                        >
                                            <i className="fa-solid fa-rotate-left me-2"></i>
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container py-5">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h2 className="h4 fw-black mb-1">Catalog</h2>
                                    <p className="mb-0 text-muted small">Select items or a villager to build your command.</p>
                                </div>
                                <span className="badge bg-white text-dark rounded-pill px-3 py-2 border shadow-sm">
                                    {filteredItems.length} results
                                </span>
                            </div>

                            <div className="command-builder-tip bg-light border border-success rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
                                <i className="fa-solid fa-hand-pointer text-success fs-4"></i>
                                <div className="small text-muted mb-0">
                                    Use <strong>Add to Order</strong> (max 40) or <strong>Add to Drop</strong> (max 9) on each item. Select a villager to include them in your order command.
                                </div>
                            </div>

                            <div className="row g-3">
                                {filteredItems.length === 0 ? (
                                    <div className="col-12">
                                        <div className="bg-white rounded-5 border p-5 text-center text-muted shadow-sm">
                                            <div className="icon-circle bg-light mx-auto mb-3 text-secondary">
                                                <i className="fa-solid fa-magnifying-glass fs-4"></i>
                                            </div>
                                            <h3 className="h5 fw-bold mb-2">No items match those filters.</h3>
                                            <p className="mb-0">Try a different category, theme, or search term.</p>
                                        </div>
                                    </div>
                                ) : (
                                    pagedItems.map((item) => {
                                        const isVillager = item.entityType === 'villager';
                                        const orderEntry = orderItems.find((s) => s.item.id === item.id);
                                        const dropEntry = dropItems.find((s) => s.item.id === item.id);
                                        const orderQty = orderEntry?.quantity ?? 0;
                                        const dropQty = dropEntry?.quantity ?? 0;
                                        const cardSelected = isVillager ? villagerIds.includes(item.id) : (orderQty > 0 || dropQty > 0);
                                        return (
                                            <div className="col-6 col-md-4 col-lg-3" key={item.id}>
                                                <div
                                                    className={`cb-item-card bg-white rounded-4 shadow-sm h-100 d-flex flex-column overflow-hidden position-relative cursor-pointer ${cardSelected ? 'border-success border-2' : ''}`}
                                                    onClick={() => openDetail(item)}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={cardSelected}
                                                    aria-label={`${isVillager ? 'Villager' : item.category} ${item.name}${item.variantLabel ? ` ${item.variantLabel}` : ''}`}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(item); } }}
                                                >
                                                    {cardSelected && (
                                                        <div className="position-absolute top-0 end-0 m-2 z-index-2 d-flex flex-column gap-1">
                                                            {orderQty > 0 && (
                                                                <div className="bg-success text-white rounded-pill d-flex align-items-center justify-content-center shadow px-2" style={{ fontSize: '0.65rem', fontWeight: 700, height: '20px' }}>
                                                                    O:{orderQty}
                                                                </div>
                                                            )}
                                                            {dropQty > 0 && (
                                                                <div className="bg-info text-dark rounded-pill d-flex align-items-center justify-content-center shadow px-2" style={{ fontSize: '0.65rem', fontWeight: 700, height: '20px' }}>
                                                                    D:{dropQty}
                                                                </div>
                                                            )}
                                                            {isVillager && cardSelected && (
                                                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '22px', height: '22px' }}>
                                                                    <i className="fa-solid fa-check" style={{ fontSize: '0.6rem' }}></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="ratio ratio-1x1 overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                        {isVillager ? (
                                                            <img
                                                                src={(item as any).image || `https://www.pange.ca/itemsearch/villagers/${item.id}.png`}
                                                                alt={item.name}
                                                                className={`cb-item-image w-100 h-100 object-fit-contain ${compactMode ? 'p-1' : 'p-3'} ${cardSelected ? 'opacity-75' : ''}`}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className={`cb-item-image w-100 h-100 object-fit-cover ${compactMode ? 'p-1' : 'p-3'} ${cardSelected ? 'opacity-75' : ''}`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="p-3 d-flex flex-column justify-content-between h-100 text-dark border-top border-light">
                                                        <div>
                                                            <div className="mb-2">
                                                                <span className="badge bg-light text-muted rounded-pill px-2 py-1 x-small fw-bold border">{isVillager ? 'Villager' : item.category}</span>
                                                            </div>
                                                            <h3 className="h6 fw-black mb-1 text-truncate" title={item.name}>{item.name}</h3>
                                                            <p className="text-muted mb-0 text-truncate" style={{ fontSize: '0.75rem' }}>{item.theme} · {item.colour}</p>
                                                        </div>
                                                        <div className="mt-3 d-flex flex-column gap-1" onClick={(e) => e.stopPropagation()}>
                                                            {!isVillager ? (
                                                                <>
                                                                    {/* Order row */}
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        {orderQty > 0 ? (
                                                                            <>
                                                                                <button type="button" className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.7rem' }} onClick={() => decreaseOrderQuantity(item.id)} aria-label="Decrease order">−</button>
                                                                                <span className="badge bg-success text-white rounded-pill fw-bold" style={{ fontSize: '0.7rem', minWidth: '28px' }}>{orderQty}</span>
                                                                                <button type="button" className="btn btn-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.7rem' }} onClick={() => increaseOrderQuantity(item.id)} disabled={!canIncreaseOrder} aria-label="Increase order">+</button>
                                                                            </>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-success rounded-pill fw-bold flex-grow-1"
                                                                                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                                                                                onClick={() => addItemToOrderPockets(item as ItemData)}
                                                                                disabled={totalOrderCount >= 40}
                                                                                aria-label={`Add ${item.name} to Order`}
                                                                            >
                                                                                <i className="fa-solid fa-basket-shopping me-1" style={{ fontSize: '0.65rem' }}></i>Order
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {/* Drop row */}
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        {dropQty > 0 ? (
                                                                            <>
                                                                                <button type="button" className="btn btn-outline-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.7rem' }} onClick={() => decreaseDropQuantity(item.id)} aria-label="Decrease drop">−</button>
                                                                                <span className="badge bg-info text-dark rounded-pill fw-bold" style={{ fontSize: '0.7rem', minWidth: '28px' }}>{dropQty}</span>
                                                                                <button type="button" className="btn btn-info text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.7rem' }} onClick={() => increaseDropQuantity(item.id)} disabled={!canIncreaseDrop} aria-label="Increase drop">+</button>
                                                                            </>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-info rounded-pill fw-bold flex-grow-1"
                                                                                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                                                                                onClick={() => addItemToDropPockets(item as ItemData)}
                                                                                disabled={totalDropCount >= 9}
                                                                                aria-label={`Add ${item.name} to Drop`}
                                                                            >
                                                                                <i className="fa-solid fa-box-open me-1" style={{ fontSize: '0.65rem' }}></i>Drop
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <button type="button" className="btn btn-sm btn-white text-dark rounded-pill fw-bold border" style={{ fontSize: '0.7rem', padding: '3px 8px' }} onClick={() => openDetail(item)} aria-label={`View ${item.name}`}>
                                                                        <i className="fa-solid fa-eye me-1" style={{ fontSize: '0.65rem' }}></i>View
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button type="button" className={`btn btn-sm w-100 rounded-pill fw-bold ${cardSelected ? 'btn-outline-success border-2' : 'btn-outline-primary text-dark'}`} onClick={() => requestVillager(item)} aria-pressed={cardSelected}>{cardSelected ? '✓ Selected' : 'Request Villager'}</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {totalPages > 1 && (
                                <nav className="d-flex align-items-center justify-content-between mt-4 bg-white p-3 rounded-pill shadow-sm border" aria-label="Catalog pagination">
                                    <div className="text-muted small ms-3 fw-bold">Page {currentPage} of {totalPages}</div>
                                    <ul className="pagination pagination-sm mb-0 me-2">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-pill border-0" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
                                        </li>
                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            if (totalPages > 7 && Math.abs(currentPage - (idx + 1)) > 2 && idx !== 0 && idx !== totalPages - 1) {
                                                if (idx === 1 || idx === totalPages - 2) return <li key={idx} className="page-item disabled"><span className="page-link border-0">...</span></li>;
                                                return null;
                                            }
                                            return (
                                                <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                                                    <button className={`page-link rounded-circle border-0 mx-1 ${currentPage === idx + 1 ? 'bg-success text-white shadow-sm' : 'text-dark'}`} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                                                </li>
                                            );
                                        })}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-pill border-0" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>

                        <aside className="col-lg-4">
                            <div className="sticky-top" style={{ top: '90px' }}>
                                <CommandBuilderSummary
                                    orderPockets={orderItems}
                                    dropPockets={dropItems}
                                    savedVillagers={selectedVillagers}
                                    orderCommandText={orderCommandText}
                                    dropCommandText={dropCommandText}
                                    injectVillagerCommandText={injectVillagerCommandText}
                                    copyOrderStatus={copyOrderStatus}
                                    copyDropStatus={copyDropStatus}
                                    copyInjectVillagerStatus={copyInjectVillagerStatus}
                                    onCopyOrder={handleCopyOrder}
                                    onCopyDrop={handleCopyDrop}
                                    onCopyInjectVillager={handleCopyInjectVillager}
                                    onDecreaseOrderQuantity={decreaseOrderQuantity}
                                    onIncreaseOrderQuantity={increaseOrderQuantity}
                                    onRemoveOrderItem={removeOrderItem}
                                    onDecreaseDropQuantity={decreaseDropQuantity}
                                    onIncreaseDropQuantity={increaseDropQuantity}
                                    onRemoveDropItem={removeDropItem}
                                    onRemoveVillager={removeVillager}
                                    onClearOrderPockets={() => setOrderItems([])}
                                    onClearDropPockets={() => setDropItems([])}
                                    onClearVillagers={clearVillagers}
                                    canIncreaseOrder={canIncreaseOrder}
                                    canIncreaseDrop={canIncreaseDrop}
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
        </>
    );
};

export default CommandBuilder;
