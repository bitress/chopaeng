import React, { useState } from "react";

interface FilterChip {
    key: string;
    label: string;
    clear: () => void;
}

interface CommandBuilderFiltersProps {
    searchInput: string;
    setSearchInput: (val: string) => void;
    showFiltersMobile: boolean;
    setShowFiltersMobile: (val: boolean) => void;
    activeFilterCount: number;
    activeFilterChips: FilterChip[];
    hideVariants: boolean;
    setHideVariants: (val: boolean) => void;
    compactMode: boolean;
    setCompactMode: (val: boolean) => void;
    kindFilter: string;
    setKindFilter: (val: string) => void;
    category: string;
    setCategory: (val: string) => void;
    villagerType: string;
    setVillagerType: (val: string) => void;
    theme: string;
    setTheme: (val: string) => void;
    series: string;
    setSeries: (val: string) => void;
    interactivity: string;
    setInteractivity: (val: string) => void;
    colour: string;
    setColour: (val: string) => void;
    itemCategories: string[];
    villagerTypes: string[];
    uniqueThemes: string[];
    uniqueSeries: string[];
    uniqueInteractivity: string[];
    uniqueColours: string[];
    onlyFavorites?: boolean;
    setOnlyFavorites?: (val: boolean) => void;
    favoriteCount?: number;
    clearFilters: () => void;
}

interface QuickPill {
    id: string;
    label: string;
    icon: string;
    kind?: string;
    category?: string;
}

const QUICK_CATEGORY_PILLS: QuickPill[] = [
    { id: 'all', label: 'All Items', icon: 'fa-border-all', kind: 'All', category: 'All' },
    { id: 'furniture', label: 'Furniture', icon: 'fa-couch', kind: 'Items', category: 'Housewares' },
    { id: 'fashion', label: 'Fashion', icon: 'fa-shirt', kind: 'Items', category: 'Tops' },
    { id: 'recipes', label: 'DIY Recipes', icon: 'fa-scroll', kind: 'Recipes', category: 'All' },
    { id: 'materials', label: 'Materials', icon: 'fa-cubes', kind: 'Items', category: 'Materials' },
    { id: 'villagers', label: 'Villagers', icon: 'fa-paw', kind: 'Villagers', category: 'All' },
    { id: 'art', label: 'Art', icon: 'fa-palette', kind: 'Items', category: 'Art' },
    { id: 'fossils', label: 'Fossils', icon: 'fa-bone', kind: 'Items', category: 'Fossils' },
];

export const CommandBuilderFilters: React.FC<CommandBuilderFiltersProps> = ({
    searchInput, setSearchInput, showFiltersMobile, setShowFiltersMobile,
    activeFilterCount, activeFilterChips, hideVariants, setHideVariants,
    compactMode, setCompactMode, kindFilter, setKindFilter,
    category, setCategory, villagerType, setVillagerType,
    theme, setTheme, series, setSeries, interactivity, setInteractivity,
    colour, setColour, itemCategories, villagerTypes,
    uniqueThemes, uniqueSeries, uniqueInteractivity, uniqueColours,
    onlyFavorites = false, setOnlyFavorites, favoriteCount = 0,
    clearFilters
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSelectQuickPill = (pill: QuickPill) => {
        if (onlyFavorites && setOnlyFavorites) {
            setOnlyFavorites(false);
        }
        if (pill.kind) setKindFilter(pill.kind);
        if (pill.category) setCategory(pill.category);
    };

    const isPillActive = (pill: QuickPill) => {
        if (onlyFavorites) return false;
        if (pill.id === 'all') {
            return kindFilter === 'All' && category === 'All';
        }
        if (pill.kind === 'Villagers') return kindFilter === 'Villagers';
        if (pill.kind === 'Recipes') return kindFilter === 'Recipes';
        return category === pill.category;
    };

    return (
        <div className="glass-filter rounded-4 p-3 p-md-4 border mb-4 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            {/* Top Search Bar & Mobile Filter Toggle */}
            <div className="row g-2 align-items-center mb-3">
                <div className="col">
                    <div className="position-relative">
                        <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="search"
                            className="form-control bg-white rounded-pill border shadow-xs ps-5 pe-5 py-2 fw-medium"
                            placeholder="Search by item, recipe, or villager name (e.g. Ironwood, Raymond)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            aria-label="Search catalog"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                className="btn btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-1 border-0"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search input"
                            >
                                <i className="fa-solid fa-circle-xmark fs-6"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Button */}
                <div className="col-auto d-md-none">
                    <button
                        className={`btn border rounded-pill shadow-xs px-3 py-2 ${activeFilterCount > 0 ? 'btn-nook text-white' : 'btn-white'}`}
                        onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                        aria-label="Toggle Filters"
                        aria-expanded={showFiltersMobile}
                    >
                        <i className="fa-solid fa-sliders me-1"></i>
                        {activeFilterCount > 0 && <span className="badge bg-white text-dark ms-1">{activeFilterCount}</span>}
                    </button>
                </div>
            </div>

            {/* Quick Category Navigation Pills (One-tap fast browsing) */}
            <div className="d-flex align-items-center gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                {QUICK_CATEGORY_PILLS.map((pill) => {
                    const active = isPillActive(pill);
                    return (
                        <button
                            key={pill.id}
                            type="button"
                            onClick={() => handleSelectQuickPill(pill)}
                            className={`btn btn-sm rounded-pill text-nowrap fw-bold d-inline-flex align-items-center gap-2 px-3 py-1 transition-all ${
                                active
                                    ? 'btn-nook text-white shadow-xs'
                                    : 'btn-white bg-white text-dark border hover-border-success'
                            }`}
                            style={{ fontSize: '0.8rem' }}
                        >
                            <i className={`fa-solid ${pill.icon} ${active ? 'text-white' : 'text-success'}`} style={{ fontSize: '0.75rem' }}></i>
                            <span>{pill.label}</span>
                        </button>
                    );
                })}

                {/* Favorites Quick Pill */}
                {setOnlyFavorites && (
                    <button
                        type="button"
                        onClick={() => setOnlyFavorites(!onlyFavorites)}
                        className={`btn btn-sm rounded-pill text-nowrap fw-bold d-inline-flex align-items-center gap-2 px-3 py-1 transition-all ${
                            onlyFavorites
                                ? 'bg-warning text-dark border-warning shadow-xs'
                                : 'btn-white bg-white text-dark border hover-border-warning'
                        }`}
                        style={{ fontSize: '0.8rem' }}
                    >
                        <i className={`fa-${onlyFavorites ? 'solid' : 'regular'} fa-star ${onlyFavorites ? 'text-dark' : 'text-warning'}`} style={{ fontSize: '0.75rem' }}></i>
                        <span>Favorites</span>
                        {favoriteCount > 0 && (
                            <span className={`badge rounded-pill ${onlyFavorites ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ fontSize: '0.65rem' }}>
                                {favoriteCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Active Filters Row & Toggles */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                <div className="d-flex flex-wrap align-items-center gap-2">
                    {/* Advanced Filters Drawer Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`btn btn-xs rounded-pill px-3 py-1 fw-bold border transition-all d-inline-flex align-items-center gap-1 ${
                            showAdvanced ? 'btn-dark text-white' : 'btn-white bg-white text-muted hover-text-dark'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                    >
                        <i className="fa-solid fa-filter small"></i>
                        <span>More Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="badge bg-success text-white rounded-pill ms-1 font-monospace">
                                {activeFilterCount}
                            </span>
                        )}
                        <i className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'} x-small ms-1`}></i>
                    </button>

                    {/* View Option Switches */}
                    <div className="d-flex align-items-center gap-2 ms-2">
                        <button
                            type="button"
                            onClick={() => setHideVariants(!hideVariants)}
                            className={`btn btn-xs rounded-pill px-2 py-1 fw-bold border transition-all ${
                                !hideVariants ? 'bg-success text-white border-success' : 'bg-white text-muted'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                            title="Show all color variations separately in catalog"
                        >
                            <i className="fa-solid fa-layer-group me-1"></i>
                            <span>{!hideVariants ? 'All Variants Expanded' : 'Group Variants'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCompactMode(!compactMode)}
                            className={`btn btn-xs rounded-pill px-2 py-1 fw-bold border transition-all ${
                                compactMode ? 'bg-dark text-white' : 'bg-white text-muted'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                            title="Toggle between compact and spacious item cards"
                        >
                            <i className={`fa-solid ${compactMode ? 'fa-table-cells' : 'fa-table-cells-large'} me-1`}></i>
                            <span>{compactMode ? 'Compact Grid' : 'Spacious Grid'}</span>
                        </button>
                    </div>
                </div>

                {/* Reset Filters Action */}
                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        className="btn btn-xs text-danger rounded-pill px-2 py-1 fw-bold border-0 hover-underline"
                        onClick={clearFilters}
                        style={{ fontSize: '0.75rem' }}
                    >
                        <i className="fa-solid fa-rotate-left me-1"></i>
                        <span>Reset All</span>
                    </button>
                )}
            </div>

            {/* Dismissible Active Filter Chips */}
            {activeFilterChips.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-2 pt-2">
                    {activeFilterChips.map((chip) => (
                        <button
                            key={chip.key}
                            type="button"
                            onClick={chip.clear}
                            className="badge bg-light text-dark border rounded-pill px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 hover-bg-danger hover-text-white transition-all cursor-pointer"
                            style={{ fontSize: '0.72rem' }}
                            title="Click to remove filter"
                        >
                            <span>{chip.label}</span>
                            <i className="fa-solid fa-xmark x-small ms-1"></i>
                        </button>
                    ))}
                </div>
            )}

            {/* Advanced Filters Grid (Collapsible) */}
            {(showAdvanced || showFiltersMobile) && (
                <div className="row g-2 mt-2 pt-3 border-top animate-fade">
                    <div className="col-6 col-md-3">
                        <label className="form-label text-muted small fw-bold mb-1">Item Category</label>
                        <select
                            className="form-select form-select-sm rounded-pill border bg-white shadow-2xs fw-medium text-dark"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {itemCategories.filter(v => v !== 'All').map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label text-muted small fw-bold mb-1">Villager Personality</label>
                        <select
                            className="form-select form-select-sm rounded-pill border bg-white shadow-2xs fw-medium text-dark"
                            value={villagerType}
                            onChange={(e) => setVillagerType(e.target.value)}
                        >
                            <option value="All">All Personalities</option>
                            {villagerTypes.filter(v => v !== 'All').map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label text-muted small fw-bold mb-1">Item Theme</label>
                        <select
                            className="form-select form-select-sm rounded-pill border bg-white shadow-2xs fw-medium text-dark"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="All">All Themes</option>
                            {uniqueThemes.filter(v => v !== 'All').map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label text-muted small fw-bold mb-1">Series</label>
                        <select
                            className="form-select form-select-sm rounded-pill border bg-white shadow-2xs fw-medium text-dark"
                            value={series}
                            onChange={(e) => setSeries(e.target.value)}
                        >
                            <option value="All">All Series</option>
                            {uniqueSeries.filter(v => v !== 'All').map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label text-muted small fw-bold mb-1">Interactivity</label>
                        <select
                            className="form-select form-select-sm rounded-pill border bg-white shadow-2xs fw-medium text-dark"
                            value={interactivity}
                            onChange={(e) => setInteractivity(e.target.value)}
                        >
                            <option value="All">All Interactivity</option>
                            {uniqueInteractivity.filter(v => v !== 'All').map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label text-muted small fw-bold mb-1">Color Palette</label>
                        <select
                            className="form-select form-select-sm rounded-pill border bg-white shadow-2xs fw-medium text-dark"
                            value={colour}
                            onChange={(e) => setColour(e.target.value)}
                        >
                            <option value="All">All Colours</option>
                            {uniqueColours.filter(v => v !== 'All').map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommandBuilderFilters;
