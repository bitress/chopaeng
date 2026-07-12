import { useMemo, useState, useEffect } from "react";
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
    
    // --- Filters ---
    const [category, setCategory] = useState("All");
    const [theme, setTheme] = useState("All");
    const [series, setSeries] = useState("All");
    const [interactivity, setInteractivity] = useState("All");
    const [colour, setColour] = useState("All");
    const [kindFilter, setKindFilter] = useState("All");
    const [villagerType, setVillagerType] = useState("All");
    
    // --- UI State ---
    const [hideVariants, setHideVariants] = useState(true);
    const [compactMode, setCompactMode] = useState(true);
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);
    
    // --- Search & Pagination ---
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

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

    // 1. Debounce Search (Saves UI threads from exploding)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // 2. Reset Pagination when ANY filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [category, theme, series, interactivity, colour, kindFilter, villagerType, debouncedSearch, hideVariants]);

    const expandedCatalogItems = useMemo(() => {
        return catalogEntities.flatMap((item) => {
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
            const matchesSearch = lowerName.includes(debouncedSearch.toLowerCase());
            const matchesCategory = category === "All" || item.category === category;
            const matchesTheme = theme === "All" || item.theme === theme;
            const matchesSeries = series === "All" || item.series === series;
            const matchesInteractivity = interactivity === "All" || item.interactivity === interactivity;
            const matchesColour = colour === "All" || item.colour === colour;
            const matchesKind = kindFilter === 'All' || 
                (kindFilter === 'Items' && item.entityType === 'item' && item.category !== 'Recipes') || 
                (kindFilter === 'Recipes' && item.entityType === 'item' && item.category === 'Recipes') || 
                (kindFilter === 'Villagers' && item.entityType === 'villager');
            const matchesVillagerType = villagerType === 'All' || item.entityType !== 'villager' || item.category === villagerType;
            
            return matchesSearch && matchesCategory && matchesTheme && matchesSeries && matchesInteractivity && matchesColour && matchesKind && matchesVillagerType;
        });
    }, [expandedCatalogItems, category, theme, series, interactivity, colour, debouncedSearch, kindFilter, villagerType]);

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
        setSearchInput("");
        setDebouncedSearch("");
        setKindFilter("All");
        setVillagerType("All");
        setCompactMode(true);
        setHideVariants(true);
        setCurrentPage(1);
    };

    return (
        <>
            <title>Chopaeng | Command Builder</title>
            <meta name="description" content="Browse items by category, theme, series, interactivity, colour, or name. Add up to 40 items to your pockets and build your ACNH command with a villager option." />
            <link rel="canonical" href="https://www.chopaeng.com/command-builder" />

            <div className="bg-pattern font-nunito min-vh-100 pb-5">
                <section className="container mt-n5 position-relative" style={{ zIndex: 10 }}>
                    <div className="glass-filter rounded-5 p-4 border mb-4 shadow-sm">
                        
                        {/* Mobile Search & Filter Toggle Row */}
                        <div className="d-flex gap-2 mb-3">
                            <div className="flex-grow-1 position-relative">
                                <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                                <input
                                    type="search"
                                    className="form-control bg-white rounded-pill border-0 shadow-sm ps-5 pe-4 py-2"
                                    placeholder="Search catalog (e.g. Ironwood)..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <button 
                                className="btn btn-white border rounded-pill shadow-sm d-md-none px-4"
                                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                                aria-label="Toggle Filters"
                            >
                                <i className="fa-solid fa-filter"></i>
                            </button>
                        </div>

                        {/* Collapsible Advanced Filters */}
                        <div className={`row g-3 ${showFiltersMobile ? 'd-flex' : 'd-none d-md-flex'}`}>
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-layer-group me-1 text-muted"></i> Type</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
                                    <option value="All">All</option>
                                    <option value="Items">Items</option>
                                    <option value="Recipes">Recipes</option>
                                    <option value="Villagers">Villagers</option>
                                </select>
                            </div>
                            
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-tags me-1 text-muted"></i> Category</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {itemCategories.map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-user-astronaut me-1 text-muted"></i> Villager</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={villagerType} onChange={(e) => setVillagerType(e.target.value)}>
                                    {villagerTypes.map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-palette me-1 text-muted"></i> Theme</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                    {uniqueValues(catalogEntities, 'theme').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-cubes me-1 text-muted"></i> Series</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={series} onChange={(e) => setSeries(e.target.value)}>
                                    {uniqueValues(catalogEntities, 'series').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-hand-pointer me-1 text-muted"></i> Interact</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={interactivity} onChange={(e) => setInteractivity(e.target.value)}>
                                    {uniqueValues(catalogEntities, 'interactivity').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <label className="form-label fw-bold text-dark small mb-1"><i className="fa-solid fa-droplet me-1 text-muted"></i> Colour</label>
                                <select className="form-select rounded-pill border-0 shadow-sm cursor-pointer" value={colour} onChange={(e) => setColour(e.target.value)}>
                                    {uniqueValues(catalogEntities, 'colour').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-12 col-md-auto ms-md-auto d-flex flex-wrap align-items-end gap-3 mt-3 mt-md-0">
                                <div className="form-check form-switch">
                                    <input className="form-check-input cursor-pointer" type="checkbox" id="hideVariants" checked={hideVariants} onChange={(e) => setHideVariants(e.target.checked)} />
                                    <label className="form-check-label small text-dark cursor-pointer fw-bold" htmlFor="hideVariants">Hide variants</label>
                                </div>
                                <div className="form-check form-switch">
                                    <input className="form-check-input cursor-pointer" type="checkbox" id="compactMode" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} />
                                    <label className="form-check-label small text-dark cursor-pointer fw-bold" htmlFor="compactMode">Compact</label>
                                </div>
                                <button type="button" className="btn btn-white text-dark rounded-pill px-4 py-1 small fw-bold shadow-sm border ms-auto ms-md-0" onClick={clearFilters}>
                                    <i className="fa-solid fa-rotate-left me-1"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container py-4">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h2 className="h4 fw-black mb-1">Catalog</h2>
                                    <p className="mb-0 text-muted small">Select items or a villager to build your command.</p>
                                </div>
                                <span className="badge bg-white text-dark rounded-pill px-3 py-2 border shadow-sm">
                                    {filteredItems.length} results
                                </span>
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
                                            <div className="col-6 col-md-4 col-xl-3" key={item.id}>
                                                <div 
                                                    className={`bg-white rounded-4 shadow-sm d-flex flex-column overflow-hidden position-relative h-100 border ${cardSelected ? 'border-success border-2' : 'border-light'} cursor-pointer transition-all`}
                                                    onClick={() => openDetail(item)}
                                                >
                                                    {/* Selection Badges */}
                                                    {cardSelected && (
                                                        <div className="position-absolute top-0 end-0 m-2 z-index-2 d-flex flex-column gap-1 pointer-events-none">
                                                            {orderQty > 0 && <div className="badge bg-success shadow-sm">O:{orderQty}</div>}
                                                            {dropQty > 0 && <div className="badge bg-info text-dark shadow-sm">D:{dropQty}</div>}
                                                            {isVillager && <div className="badge bg-success rounded-circle p-1"><i className="fa-solid fa-check"></i></div>}
                                                        </div>
                                                    )}

                                                    {/* Image Container */}
                                                    <div className="ratio ratio-1x1 bg-light d-flex align-items-center justify-content-center">
                                                        <img
                                                            src={isVillager ? ((item as any).image || `https://www.pange.ca/itemsearch/villagers/${item.id}.png`) : item.image}
                                                            alt={item.name}
                                                            className={`w-100 h-100 ${compactMode ? 'p-2' : 'p-4'} ${cardSelected ? 'opacity-75' : ''} ${isVillager ? 'object-fit-contain' : 'object-fit-cover'}`}
                                                        />
                                                    </div>

                                                    {/* Info Block */}
                                                    <div className="p-2 d-flex flex-column flex-grow-1 border-top">
                                                        <div className="mb-auto">
                                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                                <span className="badge bg-light text-muted rounded-pill px-2 py-1" style={{fontSize: "0.65rem", border: "1px solid #dee2e6"}}>{isVillager ? 'Villager' : item.category}</span>
                                                                {!isVillager && <button type="button" className="btn btn-link text-muted p-0 m-0" onClick={(e) => { e.stopPropagation(); openDetail(item); }}><i className="fa-solid fa-circle-info" style={{fontSize: "0.85rem"}}></i></button>}
                                                            </div>
                                                            <h3 className="h6 fw-black mb-0 text-truncate" title={item.name} style={{fontSize: "0.85rem"}}>{item.name}</h3>
                                                            <p className="text-muted mb-2 text-truncate" style={{ fontSize: '0.7rem' }}>{item.theme} · {item.colour}</p>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="mt-2 w-100" onClick={(e) => e.stopPropagation()}>
                                                            {!isVillager ? (
                                                                <div className="d-flex gap-1">
                                                                    {/* Order Button Group */}
                                                                    {orderQty > 0 ? (
                                                                        <div className="btn-group border border-success rounded-pill overflow-hidden flex-grow-1 bg-white">
                                                                            <button type="button" className="btn btn-sm text-success px-2 py-1" onClick={() => decreaseOrderQuantity(item.id)}>−</button>
                                                                            <div className="bg-success text-white d-flex align-items-center justify-content-center fw-bold px-1" style={{fontSize: "0.75rem", minWidth: "24px"}}>{orderQty}</div>
                                                                            <button type="button" className="btn btn-sm text-success px-2 py-1" onClick={() => increaseOrderQuantity(item.id)} disabled={!canIncreaseOrder}>+</button>
                                                                        </div>
                                                                    ) : (
                                                                        <button type="button" className="btn btn-sm btn-outline-success rounded-pill py-1 flex-grow-1 fw-bold" style={{fontSize: "0.75rem"}} onClick={() => addItemToOrderPockets(item as ItemData)} disabled={totalOrderCount >= 40}>Order</button>
                                                                    )}

                                                                    {/* Drop Button Group */}
                                                                    {dropQty > 0 ? (
                                                                        <div className="btn-group border border-info rounded-pill overflow-hidden flex-grow-1 bg-white">
                                                                            <button type="button" className="btn btn-sm text-info px-2 py-1" onClick={() => decreaseDropQuantity(item.id)}>−</button>
                                                                            <div className="bg-info text-dark d-flex align-items-center justify-content-center fw-bold px-1" style={{fontSize: "0.75rem", minWidth: "24px"}}>{dropQty}</div>
                                                                            <button type="button" className="btn btn-sm text-info px-2 py-1" onClick={() => increaseDropQuantity(item.id)} disabled={!canIncreaseDrop}>+</button>
                                                                        </div>
                                                                    ) : (
                                                                        <button type="button" className="btn btn-sm btn-outline-info rounded-pill py-1 flex-grow-1 fw-bold" style={{fontSize: "0.75rem"}} onClick={() => addItemToDropPockets(item as ItemData)} disabled={totalDropCount >= 9}>Drop</button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <button type="button" className={`btn btn-sm w-100 rounded-pill fw-bold py-1 ${cardSelected ? 'btn-success text-white' : 'btn-outline-primary'}`} onClick={() => requestVillager(item)} aria-pressed={cardSelected}>
                                                                    {cardSelected ? '✓ Selected' : 'Request'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Pagination Logic Remains Unchanged */}
                            {totalPages > 1 && (
                                <nav className="d-flex align-items-center justify-content-between mt-4 bg-white p-3 rounded-pill shadow-sm border" aria-label="Catalog pagination">
                                    <div className="text-muted small ms-3 fw-bold">Page {currentPage} of {totalPages}</div>
                                    <ul className="pagination pagination-sm mb-0 me-2">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-pill border-0" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
                                        </li>
                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            if (totalPages > 7 && Math.abs(currentPage - (idx + 1)) > 2 && idx !== 0 && idx !== totalPages - 1) {
                                                if (idx === 1 || idx === totalPages - 2) return <li key={idx} className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>;
                                                return null;
                                            }
                                            return (
                                                <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                                                    <button className={`page-link rounded-circle border-0 mx-1 ${currentPage === idx + 1 ? 'bg-dark text-white shadow-sm' : 'text-dark'}`} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
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