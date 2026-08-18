import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { CatalogEntity } from "../data/commandBuilderData";
import { getVariantCommandParts, getVariantKey, getVariantLabel } from "../utils/commandBuilderHex";
import { useCommandBuilderPockets, type PocketItem } from "../hooks/useCommandBuilderPockets";
import { useCatalogData } from "../hooks/useCatalogData";
import {
    getSavedCommandBuilderState,
    saveCommandBuilderState,
    clearCommandBuilderPosition,
    clearCommandBuilderState
} from "../utils/commandBuilderState";
import CommandBuilderSummary from "../components/CommandBuilderSummary";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { CommandBuilderFilters } from "../components/command-builder/CommandBuilderFilters";
import { CommandBuilderItemCard } from "../components/command-builder/CommandBuilderItemCard";
import { CommandBuilderVariantModal } from "../components/command-builder/CommandBuilderVariantModal";
import { CommandBuilderPocketBundlesModal } from "../components/command-builder/CommandBuilderPocketBundlesModal";
import { CommandBuilderShareModal } from "../components/command-builder/CommandBuilderShareModal";
import { decodePocketShareData } from "../utils/pocketSharing";
import { useFavorites } from "../hooks/useFavorites";

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

    // Initial state restored from session if available
    const savedState = useMemo(() => getSavedCommandBuilderState(), []);

    // --- Filters ---
    const [category, setCategory] = useState(savedState?.category || "All");
    const [theme, setTheme] = useState(savedState?.theme || "All");
    const [series, setSeries] = useState(savedState?.series || "All");
    const [interactivity, setInteractivity] = useState(savedState?.interactivity || "All");
    const [colour, setColour] = useState(savedState?.colour || "All");
    const [kindFilter, setKindFilter] = useState(savedState?.kindFilter || "All");
    const [villagerType, setVillagerType] = useState(savedState?.villagerType || "All");

    // --- UI State ---
    const [hideVariants, setHideVariants] = useState(savedState?.hideVariants !== undefined ? savedState.hideVariants : true);
    const [compactMode, setCompactMode] = useState(savedState?.compactMode !== undefined ? savedState.compactMode : true);
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const { isFavorite, toggleFavorite, favoriteCount } = useFavorites();

    // --- Search & Pagination ---
    const [searchInput, setSearchInput] = useState(savedState?.searchInput || "");
    const [debouncedSearch, setDebouncedSearch] = useState(savedState?.debouncedSearch || savedState?.searchInput || "");
    const [currentPage, setCurrentPage] = useState(savedState?.currentPage || 1);

    // --- Highlighting spot restoration ---
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

    // --- Quick Variant Modal State ---
    const [variantModalItem, setVariantModalItem] = useState<ItemData | null>(null);

    // --- Feature Modals State ---
    const [isBundlesModalOpen, setIsBundlesModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharedNotice, setSharedNotice] = useState<string | null>(null);

    // --- Data State ---
    const { data, isLoading: isLoadingData } = useCatalogData();
    const catalogEntities = data?.all || [];
    const explorerItems = data?.items || [];
    const villagerEntities = data?.villagers || [];

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
        loadBundleIntoOrder,
        loadBundleIntoDrop,
        loadSharedPocket,
        addItemToOrderPockets,
        addItemToDropPockets,
        orderCommandText,
        dropCommandText,
        copyOrderStatus,
        copyDropStatus,
        handleCopyOrder,
        handleCopyDrop,
        getOrderPocketQuantity,
        getDropPocketQuantity,
    } = useCommandBuilderPockets();

    // 0. Load shared pocket from URL if ?pocket= is present
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pocketParam = urlParams.get('pocket');
        if (pocketParam) {
            const decoded = decodePocketShareData(pocketParam);
            if (decoded) {
                loadSharedPocket(decoded);
                const count = (decoded.orderItems?.length || 0) + (decoded.dropItems?.length || 0);
                setSharedNotice(`✨ Shared pocket loaded: "${decoded.name || 'Custom'}" (${count} items)`);
                setTimeout(() => setSharedNotice(null), 5000);
            }
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }, [loadSharedPocket]);


    // 1. Debounce Search (Saves UI threads from exploding)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // 2. Track whether this is the initial mount to prevent resetting the restored currentPage
    const isInitialMountRef = useRef(true);

    // 3. Reset Pagination when ANY filter changes, skipping initial mount
    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }
        setCurrentPage(1);
    }, [category, theme, series, interactivity, colour, kindFilter, villagerType, debouncedSearch, hideVariants]);

    // 4. Sync view state to sessionStorage whenever filters / page change
    useEffect(() => {
        saveCommandBuilderState({
            category,
            theme,
            series,
            interactivity,
            colour,
            kindFilter,
            villagerType,
            hideVariants,
            compactMode,
            searchInput,
            debouncedSearch,
            currentPage,
        });
    }, [category, theme, series, interactivity, colour, kindFilter, villagerType, hideVariants, compactMode, searchInput, debouncedSearch, currentPage]);

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

    const itemCategories = useMemo(() => uniqueValues(explorerItems.filter(i => i.entityType === 'item'), 'category'), [explorerItems]);
    const villagerTypes = useMemo(() => uniqueValues(villagerEntities, 'category'), [villagerEntities]);
    const uniqueThemes = useMemo(() => uniqueValues(catalogEntities, 'theme'), [catalogEntities]);
    const uniqueSeries = useMemo(() => uniqueValues(catalogEntities, 'series'), [catalogEntities]);
    const uniqueInteractivity = useMemo(() => uniqueValues(catalogEntities, 'interactivity'), [catalogEntities]);
    const uniqueColours = useMemo(() => uniqueValues(catalogEntities, 'colour'), [catalogEntities]);

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
            const matchesFavorites = !onlyFavorites || isFavorite(item.id) || isFavorite(item.id.split(':')[0]);

            return matchesSearch && matchesCategory && matchesTheme && matchesSeries && matchesInteractivity && matchesColour && matchesKind && matchesVillagerType && matchesFavorites;
        });
    }, [expandedCatalogItems, category, theme, series, interactivity, colour, debouncedSearch, kindFilter, villagerType, onlyFavorites, isFavorite]);

    // 5. Restore scroll & card focus when catalog data is ready
    const hasRestoredSpotRef = useRef(false);

    useEffect(() => {
        if (isLoadingData || hasRestoredSpotRef.current || filteredItems.length === 0) return;

        const state = getSavedCommandBuilderState();
        if (state?.lastViewedItemId || (state?.scrollY !== undefined && state.scrollY > 0)) {
            hasRestoredSpotRef.current = true;
            const targetId = state.lastViewedItemId;
            const targetScrollY = state.scrollY;

            const timer = setTimeout(() => {
                let foundElement = false;
                if (targetId) {
                    const el = document.getElementById(`item-card-${targetId}`);
                    if (el) {
                        foundElement = true;
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHighlightedItemId(targetId);
                        setTimeout(() => setHighlightedItemId(null), 2500);
                    }
                }

                if (!foundElement && targetScrollY !== undefined && targetScrollY > 0) {
                    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
                }

                // Clear the one-time scroll target so subsequent filtering won't jump back
                clearCommandBuilderPosition();
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [isLoadingData, filteredItems.length]);

    const itemsPerPage = compactMode ? 50 : 26;
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const pagedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openDetail = (item: ItemData, variantKey?: string) => {
        const baseId = item.id.split(":")[0];
        saveCommandBuilderState({
            category,
            theme,
            series,
            interactivity,
            colour,
            kindFilter,
            villagerType,
            hideVariants,
            compactMode,
            searchInput,
            debouncedSearch,
            currentPage,
            scrollY: window.scrollY,
            lastViewedItemId: baseId,
        });

        const [, itemVariantId] = item.id.split(":");
        const effectiveVariant = variantKey || (itemVariantId && itemVariantId !== 'NA' ? itemVariantId : '');
        const query = effectiveVariant ? `?variantId=${encodeURIComponent(effectiveVariant)}` : '';
        navigate(`/command-builder/${item.entityType}/${baseId}${query}`);
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
        clearCommandBuilderState();
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
            <Helmet>
                <title>Chopaeng | Command Builder</title>
                <meta name="description" content="Browse items by category, theme, series, interactivity, colour, or name. Add up to 40 items to your pockets and build your ACNH command with a villager option." />
                <link rel="canonical" href="https://www.chopaeng.com/command-builder" />
            </Helmet>

            <div className="bg-pattern font-nunito min-vh-100 pb-5">
                <section className="container mt-n5 position-relative" style={{ zIndex: 10 }}>
                    <CommandBuilderFilters
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        showFiltersMobile={showFiltersMobile}
                        setShowFiltersMobile={setShowFiltersMobile}
                        activeFilterCount={activeFilterCount}
                        activeFilterChips={activeFilterChips}
                        hideVariants={hideVariants}
                        setHideVariants={setHideVariants}
                        compactMode={compactMode}
                        setCompactMode={setCompactMode}
                        kindFilter={kindFilter}
                        setKindFilter={setKindFilter}
                        category={category}
                        setCategory={setCategory}
                        villagerType={villagerType}
                        setVillagerType={setVillagerType}
                        theme={theme}
                        setTheme={setTheme}
                        series={series}
                        setSeries={setSeries}
                        interactivity={interactivity}
                        setInteractivity={setInteractivity}
                        colour={colour}
                        setColour={setColour}
                        itemCategories={itemCategories}
                        villagerTypes={villagerTypes}
                        uniqueThemes={uniqueThemes}
                        uniqueSeries={uniqueSeries}
                        uniqueInteractivity={uniqueInteractivity}
                        uniqueColours={uniqueColours}
                        onlyFavorites={onlyFavorites}
                        setOnlyFavorites={setOnlyFavorites}
                        favoriteCount={favoriteCount}
                        clearFilters={clearFilters}
                    />
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
                                        const orderEntry = orderItems.find((s) => s.item.id === item.id);
                                        const dropEntry = dropItems.find((s) => s.item.id === item.id);
                                        const orderQty = orderEntry?.quantity ?? 0;
                                        const dropQty = dropEntry?.quantity ?? 0;

                                        return (
                                            <CommandBuilderItemCard
                                                key={item.id}
                                                item={item}
                                                orderQty={orderQty}
                                                dropQty={dropQty}
                                                compactMode={compactMode}
                                                hideVariants={hideVariants}
                                                canIncreaseOrder={canIncreaseOrder}
                                                canIncreaseDrop={canIncreaseDrop}
                                                totalOrderCount={totalOrderCount}
                                                totalDropCount={totalDropCount}
                                                isHighlighted={highlightedItemId === item.id || highlightedItemId === item.id.split(':')[0]}
                                                openDetail={openDetail}
                                                openVariantPicker={(targetItem) => setVariantModalItem(targetItem)}
                                                decreaseOrderQuantity={decreaseOrderQuantity}
                                                increaseOrderQuantity={increaseOrderQuantity}
                                                addItemToOrderPockets={addItemToOrderPockets}
                                                decreaseDropQuantity={decreaseDropQuantity}
                                                increaseDropQuantity={increaseDropQuantity}
                                                addItemToDropPockets={addItemToDropPockets}
                                                isFavorite={isFavorite(item.id) || isFavorite(item.id.split(':')[0])}
                                                onToggleFavorite={toggleFavorite}
                                            />
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
                                    onOpenBundlesModal={() => setIsBundlesModalOpen(true)}
                                    onOpenShareModal={() => setIsShareModalOpen(true)}
                                />
                            </div>
                        </aside>
                    </div>

                </section>
                <div className="container">
                    {sharedNotice && (
                        <div className="alert alert-success rounded-4 shadow-sm p-3 mb-3 d-flex align-items-center justify-content-between animate-fade">
                            <div>
                                <i className="fa-solid fa-circle-check fs-5 text-success me-2 align-middle"></i>
                                <strong className="text-dark small">{sharedNotice}</strong>
                            </div>
                            <button type="button" className="btn-close" onClick={() => setSharedNotice(null)} />
                        </div>
                    )}
                    <DisclaimerBanner className="mb-3" />
                </div>
            </div>

            {/* Quick Variant Selection Modal */}
            <CommandBuilderVariantModal
                item={variantModalItem}
                isOpen={Boolean(variantModalItem)}
                onClose={() => setVariantModalItem(null)}
                onOpenFullDetail={(targetItem, vKey) => {
                    setVariantModalItem(null);
                    openDetail(targetItem as ItemData, vKey);
                }}
                addItemToOrderPockets={addItemToOrderPockets}
                addItemToDropPockets={addItemToDropPockets}
                decreaseOrderQuantity={decreaseOrderQuantity}
                increaseOrderQuantity={increaseOrderQuantity}
                decreaseDropQuantity={decreaseDropQuantity}
                increaseDropQuantity={increaseDropQuantity}
                totalOrderCount={totalOrderCount}
                totalDropCount={totalDropCount}
                canIncreaseOrder={canIncreaseOrder}
                canIncreaseDrop={canIncreaseDrop}
                getOrderPocketQuantity={getOrderPocketQuantity}
                getDropPocketQuantity={getDropPocketQuantity}
                isFavorite={variantModalItem ? (isFavorite(variantModalItem.id) || isFavorite(variantModalItem.id.split(':')[0])) : false}
                onToggleFavorite={toggleFavorite}
            />

            {/* Pocket Bundles Modal */}
            <CommandBuilderPocketBundlesModal
                isOpen={isBundlesModalOpen}
                onClose={() => setIsBundlesModalOpen(false)}
                currentOrderPockets={orderItems}
                currentDropPockets={dropItems}
                onApplyBundleToOrder={(items, mode) => loadBundleIntoOrder(items, mode)}
                onApplyBundleToDrop={(items, mode) => loadBundleIntoDrop(items, mode)}
            />

            {/* Share Pocket Modal */}
            <CommandBuilderShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                orderPockets={orderItems}
                dropPockets={dropItems}
            />

        </>
    );
};

export default CommandBuilder;