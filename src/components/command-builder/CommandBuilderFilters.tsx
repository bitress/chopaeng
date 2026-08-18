import React from "react";

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
    return (
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
                {setOnlyFavorites && (
                    <button
                        type="button"
                        onClick={() => setOnlyFavorites(!onlyFavorites)}
                        className={`badge rounded-pill border px-3 py-2 fw-bold transition-all d-inline-flex align-items-center gap-1 cursor-pointer ${
                            onlyFavorites 
                                ? 'bg-warning text-dark border-warning shadow-sm' 
                                : 'bg-white text-muted border'
                        }`}
                        title={onlyFavorites ? "Show all items" : "Show starred favorites only"}
                    >
                        <i className={`fa-${onlyFavorites ? 'solid' : 'regular'} fa-star ${onlyFavorites ? 'text-dark' : 'text-warning'}`}></i>
                        <span>Favorites ({favoriteCount})</span>
                    </button>
                )}
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
                        {uniqueThemes.filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={series} onChange={(e) => setSeries(e.target.value)}>
                        <option value="All">All Series</option>
                        {uniqueSeries.filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={interactivity} onChange={(e) => setInteractivity(e.target.value)}>
                        <option value="All">All Interactivity</option>
                        {uniqueInteractivity.filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <select className="form-select form-select-sm rounded-pill border-0 shadow-sm cursor-pointer fw-bold text-muted" value={colour} onChange={(e) => setColour(e.target.value)}>
                        <option value="All">All Colours</option>
                        {uniqueColours.filter(v => v !== 'All').map((value) => <option key={value} value={value}>{value}</option>)}
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
    );
};
