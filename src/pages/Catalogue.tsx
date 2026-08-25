import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCatalogData } from "../hooks/useCatalogData";
import { playChimeClick } from "../utils/kkAudioSynthesizer";
import type { CatalogEntity } from "../data/commandBuilderData";

type CatalogueTab = 'items' | 'diys' | 'villagers';

const ITEMS_PER_PAGE = 24;

const FALLBACK_IMAGE =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f3f5'/%3E%3Cpath d='M30 65 L45 45 L58 58 L68 42 L75 65 Z' fill='%23ced4da'/%3E%3Ccircle cx='38' cy='35' r='7' fill='%23ced4da'/%3E%3C/svg%3E";

const PERSONALITY_COLORS: Record<string, string> = {
    Normal: 'success',
    Peppy: 'warning',
    Lazy: 'info',
    Jock: 'primary',
    Snooty: 'danger',
    Cranky: 'secondary',
    Smug: 'primary',
    Sisterly: 'info',
};

const PERSONALITY_SCHEDULES: Record<string, string> = {
    Normal: '6:00 AM – 12:00 AM',
    Peppy: '7:00 AM – 1:20 AM',
    Lazy: '8:00 AM – 11:00 PM',
    Jock: '6:30 AM – 12:30 AM',
    Snooty: '8:30 AM – 2:30 AM',
    Cranky: '9:00 AM – 3:30 AM',
    Smug: '7:00 AM – 2:00 AM',
    Sisterly: '9:30 AM – 3:00 AM',
};

const DIY_SERIES_PRESETS = [
    { name: 'Celestial & Star', icon: 'fa-wand-magic-sparkles', query: 'Star' },
    { name: 'Ironwood Series', icon: 'fa-hammer', query: 'Ironwood' },
    { name: 'Golden Set', icon: 'fa-crown', query: 'Golden' },
    { name: 'Mermaid & Shell', icon: 'fa-water', query: 'Mermaid' },
    { name: 'Cherry Blossom', icon: 'fa-tree', query: 'Cherry' },
    { name: 'Spooky & Halloween', icon: 'fa-ghost', query: 'Spooky' },
    { name: 'Mushroom & Autumn', icon: 'fa-leaf', query: 'Mush' },
    { name: 'Festive & Winter', icon: 'fa-snowflake', query: 'Frozen' },
];

const Catalogue: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as CatalogueTab | null;
    const [activeTab, setActiveTab] = useState<CatalogueTab>(
        tabParam && ['items', 'diys', 'villagers'].includes(tabParam) ? tabParam : 'items'
    );

    const { data: catalogData, isLoading: catalogLoading } = useCatalogData();

    // ── Item Catalogue State ──
    const [itemSearch, setItemSearch] = useState("");
    const [itemCategory, setItemCategory] = useState("All");
    const [itemPage, setItemPage] = useState(1);

    // ── DIY Catalogue State ──
    const [diySearch, setDiySearch] = useState("");
    const [diySeries, setDiySeries] = useState("All");
    const [diyPage, setDiyPage] = useState(1);

    // ── Villager Database State ──
    const [villagerSearch, setVillagerSearch] = useState("");
    const [villagerPersonality, setVillagerPersonality] = useState("All");
    const [villagerPage, setVillagerPage] = useState(1);

    const handleTabChange = (tab: CatalogueTab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
        playChimeClick();
    };

    // ── Extracted Datasets ──
    const allItems = useMemo<CatalogEntity[]>(() => {
        return catalogData?.items.filter((i) => i.category !== 'Recipes') || [];
    }, [catalogData]);

    const allDiys = useMemo<CatalogEntity[]>(() => {
        return catalogData?.items.filter((i) => i.category === 'Recipes' || i.name.toLowerCase().includes('recipe') || i.name.toLowerCase().includes('diy')) || [];
    }, [catalogData]);

    const allVillagers = useMemo<CatalogEntity[]>(() => {
        return catalogData?.villagers || [];
    }, [catalogData]);

    // ── Items Filter ──
    const itemCategories = useMemo(() => {
        const cats = new Set<string>();
        allItems.forEach((i) => {
            if (i.category) cats.add(i.category);
        });
        return ['All', ...Array.from(cats).sort()];
    }, [allItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter((i) => {
            if (itemCategory !== 'All' && i.category !== itemCategory) return false;
            if (itemSearch.trim() && !i.name.toLowerCase().includes(itemSearch.toLowerCase())) return false;
            return true;
        });
    }, [allItems, itemCategory, itemSearch]);

    const totalItemPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const pagedItems = useMemo(() => {
        const start = (itemPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredItems, itemPage]);

    // ── DIYs Filter ──
    const diySeriesList = useMemo(() => {
        const seriesSet = new Set<string>();
        allDiys.forEach((d) => {
            if (d.series) seriesSet.add(d.series);
            else if (d.theme) seriesSet.add(d.theme);
        });
        return ['All', ...Array.from(seriesSet).sort()];
    }, [allDiys]);

    const filteredDIYs = useMemo(() => {
        return allDiys.filter((d) => {
            if (diySeries !== 'All' && d.series !== diySeries && d.theme !== diySeries) return false;
            if (diySearch.trim() && !d.name.toLowerCase().includes(diySearch.toLowerCase())) return false;
            return true;
        });
    }, [allDiys, diySeries, diySearch]);

    const totalDiyPages = Math.max(1, Math.ceil(filteredDIYs.length / ITEMS_PER_PAGE));
    const pagedDIYs = useMemo(() => {
        const start = (diyPage - 1) * ITEMS_PER_PAGE;
        return filteredDIYs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredDIYs, diyPage]);

    // ── Villagers Filter ──
    const personalityTypes = ['All', 'Normal', 'Peppy', 'Lazy', 'Jock', 'Snooty', 'Cranky', 'Smug', 'Sisterly'];

    const filteredVillagers = useMemo(() => {
        return allVillagers.filter((v) => {
            const pers = v.personality || v.category || '';
            if (villagerPersonality !== 'All' && pers.toLowerCase() !== villagerPersonality.toLowerCase()) return false;
            if (villagerSearch.trim()) {
                const q = villagerSearch.toLowerCase();
                const matchName = v.name.toLowerCase().includes(q);
                const matchTheme = v.theme?.toLowerCase().includes(q);
                const matchCategory = v.category?.toLowerCase().includes(q);
                if (!matchName && !matchTheme && !matchCategory) return false;
            }
            return true;
        });
    }, [allVillagers, villagerPersonality, villagerSearch]);

    const totalVillagerPages = Math.max(1, Math.ceil(filteredVillagers.length / ITEMS_PER_PAGE));
    const pagedVillagers = useMemo(() => {
        const start = (villagerPage - 1) * ITEMS_PER_PAGE;
        return filteredVillagers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredVillagers, villagerPage]);

    const site = typeof window !== 'undefined' ? window.location.origin : 'https://www.chopaeng.com';
    const pageTitle =
        activeTab === 'items'
            ? 'ACNH Item Catalogue & Database Explorer | Chopaeng'
            : activeTab === 'diys'
            ? 'ACNH DIY Recipes Catalogue & Crafting Guide | Chopaeng'
            : 'ACNH Villager Database & Schedules | Chopaeng';

    const pageDesc =
        activeTab === 'items'
            ? 'Browse the complete Animal Crossing: New Horizons item catalogue database with furniture, clothing, tools, variations, and 1-click builder shortcuts.'
            : activeTab === 'diys'
            ? 'Explore ACNH DIY crafting recipes, required materials, and themed collections including Celestial, Ironwood, Mermaid, and Golden sets.'
            : 'Comprehensive 400+ ACNH villager database with personality types, wake/sleep hours, favorite styles, and move-in tips.';

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href={`${site}/catalog`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:image" content={`${site}/banner.png`} />
                <meta property="og:url" content={`${site}/catalog`} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                <meta name="twitter:image" content={`${site}/banner.png`} />
            </Helmet>

            <div className="min-vh-100 nook-bg py-5">
                <div className="container py-4">
                    {/* Header */}
                    <div className="text-center mb-5 animate-up">
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fw-bold text-uppercase tracking-wider mb-2">
                            <i className="fa-solid fa-book-bookmark me-1" aria-hidden="true" /> Complete ACNH Database
                        </span>
                        <h1 className="display-5 fw-black text-dark ac-font mb-2">
                            ACNH Catalogue
                        </h1>
                        <p className="lead text-muted mx-auto fw-bold" style={{ maxWidth: '640px' }}>
                            Search over 7,000+ items, DIY recipes, and all 400+ villagers in Animal Crossing: New Horizons.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="nav-pills-custom bg-white p-2 rounded-pill shadow-sm border d-inline-flex flex-wrap gap-2 justify-content-center" role="tablist">
                            <button
                                type="button"
                                className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${
                                    activeTab === 'items'
                                        ? 'btn-nook text-white shadow-sm'
                                        : 'btn-light text-muted hover-bg-light'
                                }`}
                                role="tab"
                                aria-selected={activeTab === 'items'}
                                onClick={() => handleTabChange('items')}
                            >
                                <i className="fa-solid fa-boxes-stacked me-2" aria-hidden="true" />
                                Items ({allItems.length || '…'})
                            </button>
                            <button
                                type="button"
                                className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${
                                    activeTab === 'diys'
                                        ? 'btn-nook text-white shadow-sm'
                                        : 'btn-light text-muted hover-bg-light'
                                }`}
                                role="tab"
                                aria-selected={activeTab === 'diys'}
                                onClick={() => handleTabChange('diys')}
                            >
                                <i className="fa-solid fa-scroll me-2" aria-hidden="true" />
                                DIY Recipes ({allDiys.length || '…'})
                            </button>
                            <button
                                type="button"
                                className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${
                                    activeTab === 'villagers'
                                        ? 'btn-nook text-white shadow-sm'
                                        : 'btn-light text-muted hover-bg-light'
                                }`}
                                role="tab"
                                aria-selected={activeTab === 'villagers'}
                                onClick={() => handleTabChange('villagers')}
                            >
                                <i className="fa-solid fa-users me-2" aria-hidden="true" />
                                Villagers ({allVillagers.length || '…'})
                            </button>
                        </div>
                    </div>

                    {/* ════════════ TAB 1: ITEMS ════════════ */}
                    {activeTab === 'items' && (
                        <div className="animate-fade-in">
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                <div>
                                    <h2 className="h4 ac-font fw-black mb-1 text-dark">
                                        <i className="fa-solid fa-bag-shopping text-success me-2" aria-hidden="true" />
                                        ACNH Item Catalogue
                                    </h2>
                                    <p className="text-muted small mb-0 fw-bold">
                                        Browse items across furniture, clothing, tools, and materials.
                                    </p>
                                </div>
                                <Link
                                    to="/command-builder"
                                    className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs d-inline-flex align-items-center gap-1"
                                    onClick={() => playChimeClick()}
                                >
                                    <i className="fa-solid fa-cubes-stacked" aria-hidden="true" />
                                    <span>Open Command Builder</span>
                                </Link>
                            </div>

                            {/* Search & Category Filter Bar */}
                            <div className="bg-white p-3 rounded-4 border shadow-2xs mb-4">
                                <div className="row g-2">
                                    <div className="col-12 col-md-7">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill" aria-hidden="true">
                                                <i className="fa-solid fa-magnifying-glass text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 rounded-end-pill"
                                                placeholder="Search item name (e.g. Froggy Chair, Royal Crown, Nook Miles Ticket)..."
                                                value={itemSearch}
                                                aria-label="Search catalog items"
                                                onChange={(e) => {
                                                    setItemSearch(e.target.value);
                                                    setItemPage(1);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <select
                                            className="form-select rounded-pill"
                                            value={itemCategory}
                                            aria-label="Filter items by category"
                                            onChange={(e) => {
                                                setItemCategory(e.target.value);
                                                setItemPage(1);
                                            }}
                                        >
                                            {itemCategories.map((c) => (
                                                <option key={c} value={c}>
                                                    Category: {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Item Grid */}
                            {catalogLoading ? (
                                <div className="text-center py-5" role="status" aria-live="polite">
                                    <div className="spinner-border text-success mb-2" aria-hidden="true" />
                                    <div className="fw-bold text-muted">Loading Item Catalogue…</div>
                                </div>
                            ) : pagedItems.length === 0 ? (
                                <div className="text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-box-open fs-1 mb-2 opacity-50" aria-hidden="true" />
                                    <p className="fw-bold">No items found matching your filter.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedItems.map((item) => (
                                            <div key={item.id} className="col-6 col-md-4 col-lg-3">
                                                <div className="card h-100 rounded-4 border bg-white shadow-2xs hover-shadow-sm p-3 text-center transition-all">
                                                    <img
                                                        src={item.image || FALLBACK_IMAGE}
                                                        alt={item.name}
                                                        className="mx-auto mb-2"
                                                        style={{ width: 56, height: 56, objectFit: 'contain' }}
                                                        onError={(ev) => {
                                                            (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                        }}
                                                    />
                                                    <h3 className="fw-bold text-dark small mb-1 text-truncate" title={item.name} style={{ fontSize: '0.85rem' }}>
                                                        {item.name}
                                                    </h3>
                                                    <span className="badge bg-light text-muted border rounded-pill x-small mb-2">
                                                        {item.category || 'General'}
                                                    </span>
                                                    <Link
                                                        to={`/item/${item.id}`}
                                                        className="btn btn-xs btn-outline-success rounded-pill fw-bold mt-auto"
                                                        onClick={() => playChimeClick()}
                                                    >
                                                        Details & Code →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalItemPages > 1 && (
                                        <nav className="d-flex justify-content-between align-items-center pt-3 border-top" aria-label="Item catalogue pagination">
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                                                disabled={itemPage <= 1}
                                                aria-disabled={itemPage <= 1}
                                                tabIndex={itemPage <= 1 ? -1 : 0}
                                                onClick={() => {
                                                    playChimeClick();
                                                    setItemPage((p) => Math.max(1, p - 1));
                                                }}
                                            >
                                                ← Prev
                                            </button>
                                            <span className="tiny-text fw-bold text-muted" role="status" aria-live="polite">
                                                Page {itemPage} of {totalItemPages} ({filteredItems.length} items)
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                                                disabled={itemPage >= totalItemPages}
                                                aria-disabled={itemPage >= totalItemPages}
                                                tabIndex={itemPage >= totalItemPages ? -1 : undefined}
                                                onClick={() => {
                                                    playChimeClick();
                                                    setItemPage((p) => Math.min(totalItemPages, p + 1));
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </nav>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ════════════ TAB 2: DIY RECIPES ════════════ */}
                    {activeTab === 'diys' && (
                        <div className="animate-fade-in">
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                <div>
                                    <h2 className="h4 ac-font fw-black mb-1 text-dark">
                                        <i className="fa-solid fa-scroll text-warning me-2" aria-hidden="true" />
                                        ACNH DIY Recipes Catalogue
                                    </h2>
                                    <p className="text-muted small mb-0 fw-bold">
                                        Crafting recipes database with materials, tools, and popular series.
                                    </p>
                                </div>
                                <Link
                                    to="/command-builder"
                                    className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs d-inline-flex align-items-center gap-1"
                                    onClick={() => playChimeClick()}
                                >
                                    <i className="fa-solid fa-hammer" aria-hidden="true" />
                                    <span>Build DIY Order</span>
                                </Link>
                            </div>

                            {/* Series Quick Presets */}
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {DIY_SERIES_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        className={`btn btn-xs rounded-pill fw-bold border d-flex align-items-center gap-1 ${
                                            diySearch === preset.query
                                                ? 'btn-warning text-dark border-warning'
                                                : 'btn-white text-muted hover-bg-light'
                                        }`}
                                        onClick={() => {
                                            playChimeClick();
                                            setDiySearch(diySearch === preset.query ? '' : preset.query);
                                            setDiyPage(1);
                                        }}
                                    >
                                        <i className={`fa-solid ${preset.icon}`} aria-hidden="true" />
                                        <span>{preset.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Search & Series Filter Bar */}
                            <div className="bg-white p-3 rounded-4 border shadow-2xs mb-4">
                                <div className="row g-2">
                                    <div className="col-12 col-md-7">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill" aria-hidden="true">
                                                <i className="fa-solid fa-magnifying-glass text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 rounded-end-pill"
                                                placeholder="Search DIY recipe name (e.g. Nova Light, Moon, Ironwood Kitchenette)..."
                                                value={diySearch}
                                                aria-label="Search DIY recipes"
                                                onChange={(e) => {
                                                    setDiySearch(e.target.value);
                                                    setDiyPage(1);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <select
                                            className="form-select rounded-pill"
                                            value={diySeries}
                                            aria-label="Filter DIY recipes by series"
                                            onChange={(e) => {
                                                setDiySeries(e.target.value);
                                                setDiyPage(1);
                                            }}
                                        >
                                            {diySeriesList.map((c) => (
                                                <option key={c} value={c}>
                                                    Series: {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* DIY Grid */}
                            {catalogLoading ? (
                                <div className="text-center py-5" role="status" aria-live="polite">
                                    <div className="spinner-border text-warning mb-2" aria-hidden="true" />
                                    <div className="fw-bold text-muted">Loading DIY Recipes…</div>
                                </div>
                            ) : pagedDIYs.length === 0 ? (
                                <div className="text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-scroll fs-1 mb-2 opacity-50" aria-hidden="true" />
                                    <p className="fw-bold">No DIY recipes found matching your filter.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedDIYs.map((diy: CatalogEntity) => (
                                            <div key={diy.id} className="col-6 col-md-4 col-lg-3">
                                                <div className="card h-100 rounded-4 border bg-white shadow-2xs hover-shadow-sm p-3 text-center transition-all">
                                                    <img
                                                        src={diy.image || FALLBACK_IMAGE}
                                                        alt={diy.name}
                                                        className="mx-auto mb-2"
                                                        style={{ width: 56, height: 56, objectFit: 'contain' }}
                                                        onError={(ev) => {
                                                            (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                        }}
                                                    />
                                                    <h3 className="fw-bold text-dark small mb-1 text-truncate" title={diy.name} style={{ fontSize: '0.85rem' }}>
                                                        {diy.name}
                                                    </h3>
                                                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill x-small mb-2">
                                                        {diy.series || diy.theme || 'Recipe'}
                                                    </span>
                                                    <Link
                                                        to={`/item/${diy.id}`}
                                                        className="btn btn-xs btn-outline-warning rounded-pill fw-bold mt-auto"
                                                        onClick={() => playChimeClick()}
                                                    >
                                                        Recipe Details →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalDiyPages > 1 && (
                                        <nav className="d-flex justify-content-between align-items-center pt-3 border-top" aria-label="DIY catalogue pagination">
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                                                disabled={diyPage <= 1}
                                                aria-disabled={diyPage <= 1}
                                                tabIndex={diyPage <= 1 ? -1 : 0}
                                                onClick={() => {
                                                    playChimeClick();
                                                    setDiyPage((p) => Math.max(1, p - 1));
                                                }}
                                            >
                                                ← Prev
                                            </button>
                                            <span className="tiny-text fw-bold text-muted" role="status" aria-live="polite">
                                                Page {diyPage} of {totalDiyPages} ({filteredDIYs.length} recipes)
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                                                disabled={diyPage >= totalDiyPages}
                                                aria-disabled={diyPage >= totalDiyPages}
                                                tabIndex={diyPage >= totalDiyPages ? -1 : undefined}
                                                onClick={() => {
                                                    playChimeClick();
                                                    setDiyPage((p) => Math.min(totalDiyPages, p + 1));
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </nav>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ════════════ TAB 3: VILLAGERS ════════════ */}
                    {activeTab === 'villagers' && (
                        <div className="animate-fade-in">
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                <div>
                                    <h2 className="h4 ac-font fw-black mb-1 text-dark">
                                        <i className="fa-solid fa-users text-primary me-2" aria-hidden="true" />
                                        ACNH Villager Database
                                    </h2>
                                    <p className="text-muted small mb-0 fw-bold">
                                        Personality profiles, schedules, birthdays, and resident island finders.
                                    </p>
                                </div>
                                <Link
                                    to="/command-builder"
                                    className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs d-inline-flex align-items-center gap-1"
                                    onClick={() => playChimeClick()}
                                >
                                    <i className="fa-solid fa-user-plus" aria-hidden="true" />
                                    <span>Order Villager</span>
                                </Link>
                            </div>

                            {/* Search & Personality Filter Bar */}
                            <div className="bg-white p-3 rounded-4 border shadow-2xs mb-4">
                                <div className="row g-2">
                                    <div className="col-12 col-md-7">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 rounded-start-pill" aria-hidden="true">
                                                <i className="fa-solid fa-magnifying-glass text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 rounded-end-pill"
                                                placeholder="Search villager or personality (e.g. Raymond, Shino, Cat, Deer)..."
                                                value={villagerSearch}
                                                aria-label="Search villagers by name"
                                                onChange={(e) => {
                                                    setVillagerSearch(e.target.value);
                                                    setVillagerPage(1);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <select
                                            className="form-select rounded-pill"
                                            value={villagerPersonality}
                                            aria-label="Filter villagers by personality"
                                            onChange={(e) => {
                                                setVillagerPersonality(e.target.value);
                                                setVillagerPage(1);
                                            }}
                                        >
                                            {personalityTypes.map((p) => (
                                                <option key={p} value={p}>
                                                    Personality: {p}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Villagers Grid */}
                            {catalogLoading ? (
                                <div className="text-center py-5" role="status" aria-live="polite">
                                    <div className="spinner-border text-primary mb-2" aria-hidden="true" />
                                    <div className="fw-bold text-muted">Loading Villagers…</div>
                                </div>
                            ) : pagedVillagers.length === 0 ? (
                                <div className="text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-user-slash fs-1 mb-2 opacity-50" aria-hidden="true" />
                                    <p className="fw-bold">No villagers found matching your filter.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedVillagers.map((v: CatalogEntity) => {
                                            const pers = v.personality || v.category || 'Normal';
                                            const badgeColor = PERSONALITY_COLORS[pers] || 'secondary';
                                            const schedule = PERSONALITY_SCHEDULES[pers] || 'Standard Hours';
                                            return (
                                                <div key={v.id} className="col-6 col-md-4 col-lg-3">
                                                    <div className="card h-100 rounded-4 border bg-white shadow-2xs hover-shadow-sm p-3 text-center transition-all">
                                                        <img
                                                            src={v.image || FALLBACK_IMAGE}
                                                            alt={v.name}
                                                            className="mx-auto mb-2 rounded-circle bg-light p-1 border"
                                                            style={{ width: 64, height: 64, objectFit: 'contain' }}
                                                            onError={(ev) => {
                                                                (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                        <h3 className="fw-bold text-dark small mb-1 text-truncate" title={v.name} style={{ fontSize: '0.9rem' }}>
                                                            {v.name}
                                                        </h3>
                                                        <div className="d-flex justify-content-center gap-1 mb-2 flex-wrap">
                                                            {pers && (
                                                                <span className={`badge bg-${badgeColor}-subtle text-${badgeColor}-emphasis border border-${badgeColor}-subtle rounded-pill x-small`}>
                                                                    {pers}
                                                                </span>
                                                            )}
                                                            {v.theme && (
                                                                <span className="badge bg-light text-muted border rounded-pill x-small">
                                                                    {v.theme}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="tiny-text text-muted mb-3" title="Active Hours">
                                                            <i className="fa-solid fa-clock me-1 text-secondary" aria-hidden="true" />
                                                            {schedule}
                                                        </div>
                                                        <Link
                                                            to={`/villager/${v.id}`}
                                                            className="btn btn-xs btn-outline-primary rounded-pill fw-bold mt-auto"
                                                            onClick={() => playChimeClick()}
                                                        >
                                                            Villager Profile →
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {totalVillagerPages > 1 && (
                                        <nav className="d-flex justify-content-between align-items-center pt-3 border-top" aria-label="Villagers catalogue pagination">
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                                                disabled={villagerPage <= 1}
                                                aria-disabled={villagerPage <= 1}
                                                tabIndex={villagerPage <= 1 ? -1 : 0}
                                                onClick={() => {
                                                    playChimeClick();
                                                    setVillagerPage((p) => Math.max(1, p - 1));
                                                }}
                                            >
                                                ← Prev
                                            </button>
                                            <span className="tiny-text fw-bold text-muted" role="status" aria-live="polite">
                                                Page {villagerPage} of {totalVillagerPages} ({filteredVillagers.length} villagers)
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                                                disabled={villagerPage >= totalVillagerPages}
                                                aria-disabled={villagerPage >= totalVillagerPages}
                                                tabIndex={villagerPage >= totalVillagerPages ? -1 : undefined}
                                                onClick={() => {
                                                    playChimeClick();
                                                    setVillagerPage((p) => Math.min(totalVillagerPages, p + 1));
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </nav>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Catalogue;
