import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { CatalogEntity } from "../data/commandBuilderData";
import { loadExplorerItems } from "../data/explorerDataLoader";
import { loadVillagers } from "../data/villagerDataLoader";
import { getVariantCommandParts, getVariantKey, getVariantLabel } from "../utils/commandBuilderHex";
import { useCommandBuilderPockets, type PocketItem } from "../hooks/useCommandBuilderPockets";
import CommandBuilderSummary from "../components/CommandBuilderSummary";
import DisclaimerBanner from "../components/DisclaimerBanner";

type ItemData = PocketItem;

type CatalogStringKey = Exclude<keyof CatalogEntity, 'variations'>;

const uniqueValues = (items: CatalogEntity[], key: CatalogStringKey) => [
    "All",
    ...Array.from(new Set(items.map((item) => String(item[key])))).sort(),
];

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f3f5'/%3E%3Cpath d='M30 65 L45 45 L58 58 L68 42 L75 65 Z' fill='%23ced4da'/%3E%3Ccircle cx='38' cy='35' r='7' fill='%23ced4da'/%3E%3C/svg%3E";

const getAcnhcdnUrl = (url: string | undefined): string => {
    if (!url) return FALLBACK_IMAGE;
    if (url.includes('acnhcdn.com')) return url;
    
    if (url.includes('/villagers/')) {
        const file = url.split('/').pop();
        return `https://acnhcdn.com/latest/NpcIcon/${file}`;
    }

    if (url.includes('/items/img/')) {
        const file = url.split('/').pop() || '';
        const match = file.match(/^([A-Z][a-z]+)/);
        const prefix = match ? match[1] : '';
        
        const iconFolders = ['Ftr', 'Room', 'Rug', 'Cap', 'Tops', 'Bottoms', 'Shoes', 'Socks', 'Accessory', 'Bag', 'Umbrella', 'Tool'];
        if (iconFolders.includes(prefix)) {
            return `https://acnhcdn.com/latest/${prefix}Icon/${file}`;
        }
        return `https://acnhcdn.com/latest/MenuIcon/${file}`;
    }

    return url;
};

// Data is now loaded asynchronously inside the component

const CommandBuilder = () => {
    const navigate = useNavigate();
    const catalogHeadingRef = useRef<HTMLDivElement | null>(null);

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

    // --- Data State ---
    const [catalogEntities, setCatalogEntities] = useState<CatalogEntity[]>([]);
    const [explorerItems, setExplorerItems] = useState<CatalogEntity[]>([]);
    const [villagerEntities, setVillagerEntities] = useState<CatalogEntity[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const [items, villagers] = await Promise.all([
                    loadExplorerItems(),
                    loadVillagers()
                ]);
                if (mounted) {
                    setExplorerItems(items);
                    setVillagerEntities(villagers);
                    setCatalogEntities([...items, ...villagers]);
                }
            } catch (err) {
                console.error("Failed to load catalog data", err);
            } finally {
                if (mounted) setIsLoadingData(false);
            }
        };
        loadData();
        return () => { mounted = false; };
    }, []);

    const {
        orderItems,
        setOrderItems,
        dropItems,
        setDropItems,
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
        orderCommandText,
        dropCommandText,
        copyOrderStatus,
        copyDropStatus,
        handleCopyOrder,
        handleCopyDrop,
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
                return [{ ...item, image: getAcnhcdnUrl(item.image) } as ItemData];
            }

            return item.variations.map((variant) => {
                const variantKey = getVariantKey(variant);
                const commandParts = getVariantCommandParts(item.id, variant);
                return {
                    ...item,
                    id: `${item.id}:${variantKey}`,
                    baseId: commandParts.baseId,
                    variantId: commandParts.variantId,
                    variantLabel: getVariantLabel(variant),
                    image: getAcnhcdnUrl(variant.imageUrl || item.image),
                };
            });
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

    const goToPage = (page: number) => {
        setCurrentPage(page);
        catalogHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const activeFilterChips = [
        kindFilter !== 'All' && { key: 'kind', label: `Type: ${kindFilter}`, clear: () => setKindFilter('All') },
        category !== 'All' && { key: 'category', label: `Category: ${category}`, clear: () => setCategory('All') },
        villagerType !== 'All' && { key: 'villagerType', label: `Villager: ${villagerType}`, clear: () => setVillagerType('All') },
        theme !== 'All' && { key: 'theme', label: `Theme: ${theme}`, clear: () => setTheme('All') },
        series !== 'All' && { key: 'series', label: `Series: ${series}`, clear: () => setSeries('All') },
        interactivity !== 'All' && { key: 'interactivity', label: `Interact: ${interactivity}`, clear: () => setInteractivity('All') },
        colour !== 'All' && { key: 'colour', label: `Colour: ${colour}`, clear: () => setColour('All') },
        searchInput.trim() && { key: 'search', label: `"${searchInput.trim()}"`, clear: () => { setSearchInput(''); setDebouncedSearch(''); } },
    ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

    const activeFilterCount = activeFilterChips.length;

    return (
        <>
            <title>Chopaeng | Command Builder</title>
            <meta name="description" content="Browse items by category, theme, series, interactivity, colour, or name. Add up to 40 items to your pockets and build your ACNH command with a villager option." />
            <link rel="canonical" href="https://www.chopaeng.com/command-builder" />

            <div className="bg-pattern font-nunito min-vh-100 pb-5">
                <section className="container mt-n5 position-relative" style={{ zIndex: 10 }}>
                    <div className="glass-filter rounded-4 p-4 border mb-4 shadow-sm">

                        {/* Mobile Search & Filter Toggle Row */}
                        <div className="d-flex gap-2 mb-3">
                            <div className="flex-grow-1 position-relative">
                                <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                                <input
                                    type="search"
                                    className="form-control bg-white rounded-pill border shadow-sm ps-5 pe-5 py-2"
                                    placeholder="Search catalog (e.g. Ironwood)..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    aria-label="Search catalog"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        className="btn btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-3 p-0"
                                        onClick={() => setSearchInput('')}
                                        aria-label="Clear search"
                                    >
                                        <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                )}
                            </div>
                            <button
                                className={`btn border rounded-pill shadow-sm d-md-none px-4 ${activeFilterCount > 0 ? 'btn-nook text-white' : 'btn-white'}`}
                                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                                aria-label="Toggle Filters"
                                aria-expanded={showFiltersMobile}
                            >
                                <i className="fa-solid fa-filter"></i>
                            </button>
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                            <span className="badge bg-white text-dark rounded-pill border px-3 py-2 fw-bold" aria-live="polite">
                                <i className="fa-solid fa-sliders me-1 text-success"></i>
                                {activeFilterCount === 0 ? 'No active filters' : `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`}
                            </span>
                            {!hideVariants && (
                                <span className="badge bg-success-subtle text-success rounded-pill border border-success-subtle px-3 py-2 fw-bold">
                                    Showing variants
                                </span>
                            )}
                            {!compactMode && (
                                <span className="badge bg-info-subtle text-info-emphasis rounded-pill border border-info-subtle px-3 py-2 fw-bold">
                                    Spacious cards
                                </span>
                            )}
                        </div>

                        {/* Dismissible active-filter chips */}
                        {activeFilterChips.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {activeFilterChips.map((chip) => (
                                    <button
                                        key={chip.key}
                                        type="button"
                                        onClick={chip.clear}
                                        className="badge bg-nook-green text-white rounded-pill border-0 px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 transition-all"
                                        aria-label={`Remove filter ${chip.label}`}
                                    >
                                        {chip.label}
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Collapsible Advanced Filters */}
                        <div className={`row g-3 ${showFiltersMobile ? 'd-flex' : 'd-none d-md-flex'}`}>
                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
                                    <option value="All">All Types</option>
                                    <option value="Items">Items</option>
                                    <option value="Recipes">Recipes</option>
                                    <option value="Villagers">Villagers</option>
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="All">All Categories</option>
                                    {itemCategories.filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={villagerType} onChange={(e) => setVillagerType(e.target.value)}>
                                    <option value="All">All Villager Types</option>
                                    {villagerTypes.filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                    <option value="All">All Themes</option>
                                    {uniqueValues(catalogEntities, 'theme').filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={series} onChange={(e) => setSeries(e.target.value)}>
                                    <option value="All">All Series</option>
                                    {uniqueValues(catalogEntities, 'series').filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={interactivity} onChange={(e) => setInteractivity(e.target.value)}>
                                    <option value="All">All Interactivity</option>
                                    {uniqueValues(catalogEntities, 'interactivity').filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>

                            <div className="col-6 col-md-3">
                                <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={colour} onChange={(e) => setColour(e.target.value)}>
                                    <option value="All">All Colours</option>
                                    {uniqueValues(catalogEntities, 'colour').filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
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
                                <button type="button" className="btn btn-white text-dark rounded-pill px-4 py-2 small fw-bold shadow-sm border ms-auto ms-md-0" onClick={clearFilters} disabled={activeFilterCount === 0}>
                                    <i className="fa-solid fa-rotate-left me-1"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container py-4">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="d-flex align-items-center justify-content-between mb-3" ref={catalogHeadingRef} style={{ scrollMarginTop: '90px' }}>
                                <div>
                                    <h2 className="h4 fw-black mb-1">Catalog</h2>
                                    <p className="mb-0 text-muted small">Select items or a villager to build your command.</p>
                                </div>
                                <span className="badge bg-white text-dark rounded-pill px-3 py-2 border shadow-sm" aria-live="polite">
                                    {filteredItems.length} results
                                </span>
                            </div>

                            <div className="row g-3">
                                {isLoadingData ? (
                                    <div className="col-12 py-5 text-center">
                                        <div className="spinner-border text-success mb-3" role="status"></div>
                                        <h3 className="h5 fw-bold text-muted">Loading Catalog...</h3>
                                        <p className="small text-muted">Fetching items and villagers...</p>
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="col-12">
                                        <div className="bg-white rounded-5 border p-5 text-center text-muted shadow-sm">
                                            <div className="icon-circle bg-light mx-auto mb-3 text-secondary">
                                                <i className="fa-solid fa-magnifying-glass fs-4"></i>
                                            </div>
                                            <h3 className="h5 fw-bold mb-2">No items match those filters.</h3>
                                            <p className="mb-3">Try a different category, theme, or search term.</p>
                                            {activeFilterCount > 0 && (
                                                <button type="button" className="btn btn-nook rounded-pill fw-bold px-4" onClick={clearFilters}>
                                                    <i className="fa-solid fa-rotate-left me-2"></i>Reset filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    pagedItems.map((item) => {
                                        const isVillager = item.entityType === 'villager';
                                        const orderEntry = orderItems.find((s) => s.item.id === item.id);
                                        const dropEntry = dropItems.find((s) => s.item.id === item.id);
                                        const orderQty = orderEntry?.quantity ?? 0;
                                        const dropQty = dropEntry?.quantity ?? 0;
                                        const cardSelected = orderQty > 0 || dropQty > 0;

                                        return (
                                            <div className="col-6 col-md-4 col-xl-3" key={item.id}>
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
                                                                    <button type="button" className="btn btn-sm btn-light text-success rounded-pill py-1 flex-grow-1 fw-bold border-0" style={{ fontSize: "0.75rem" }} onClick={() => addItemToOrderPockets(item as ItemData)} disabled={totalOrderCount >= 40} title={totalOrderCount >= 40 ? 'Order bot full (40/40)' : undefined}>Order</button>
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
                                                                    <button type="button" className="btn btn-sm btn-light text-info rounded-pill py-1 flex-grow-1 fw-bold border-0" style={{ fontSize: "0.75rem" }} onClick={() => addItemToDropPockets(item as ItemData)} disabled={totalDropCount >= 9} title={totalDropCount >= 9 ? 'Drop bot full (9/9)' : undefined}>Drop</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="d-flex align-items-center justify-content-between mt-4 bg-white p-3 rounded-pill shadow-sm border" aria-label="Catalog pagination">
                                    <div className="text-muted small ms-3 fw-bold">Page {currentPage} of {totalPages}</div>
                                    <ul className="pagination pagination-sm mb-0 me-2">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link rounded-pill border-0"
                                                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                                                aria-label="Previous page"
                                                aria-disabled={currentPage === 1}
                                                tabIndex={currentPage === 1 ? -1 : undefined}
                                            >
                                                Prev
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            if (totalPages > 7 && Math.abs(currentPage - (idx + 1)) > 2 && idx !== 0 && idx !== totalPages - 1) {
                                                if (idx === 1 || idx === totalPages - 2) return <li key={idx} className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>;
                                                return null;
                                            }
                                            const isActive = currentPage === idx + 1;
                                            return (
                                                <li key={idx} className={`page-item ${isActive ? 'active' : ''}`}>
                                                    <button
                                                        className={`page-link rounded-circle border-0 mx-1 ${isActive ? 'bg-dark text-white shadow-sm' : 'text-dark'}`}
                                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => goToPage(idx + 1)}
                                                        aria-label={`Go to page ${idx + 1}`}
                                                        aria-current={isActive ? 'page' : undefined}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link rounded-pill border-0"
                                                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                                                aria-label="Next page"
                                                aria-disabled={currentPage === totalPages}
                                                tabIndex={currentPage === totalPages ? -1 : undefined}
                                            >
                                                Next
                                            </button>
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
                                    orderCommandText={orderCommandText}
                                    dropCommandText={dropCommandText}
                                    copyOrderStatus={copyOrderStatus}
                                    copyDropStatus={copyDropStatus}
                                    onCopyOrder={handleCopyOrder}
                                    onCopyDrop={handleCopyDrop}
                                    onDecreaseOrderQuantity={decreaseOrderQuantity}
                                    onIncreaseOrderQuantity={increaseOrderQuantity}
                                    onRemoveOrderItem={removeOrderItem}
                                    onDecreaseDropQuantity={decreaseDropQuantity}
                                    onIncreaseDropQuantity={increaseDropQuantity}
                                    onRemoveDropItem={removeDropItem}
                                    onClearOrderPockets={() => setOrderItems([])}
                                    onClearDropPockets={() => setDropItems([])}
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
                <div className="container">
                    <DisclaimerBanner className="mb-3" />
                </div>
            </div>

        </>
    );
};

export default CommandBuilder;