import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCatalogData } from "../hooks/useCatalogData";
import { useCollection } from "../hooks/useCollection";
import { playChimeClick } from "../utils/kkAudioSynthesizer";
import type { CatalogEntity } from "../data/commandBuilderData";
import { SUPPORTED_LANGUAGES, buildTranslationIndex, searchByTranslation, type TranslationIndex } from "../utils/translationSearch";

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
    const [itemSort, setItemSort] = useState<'name' | 'buy-asc' | 'buy-desc' | 'sell-asc' | 'sell-desc'>('name');
    const [itemPage, setItemPage] = useState(1);
    const [searchLang, setSearchLang] = useState('en');
    const [translationIndex, setTranslationIndex] = useState<Map<string, TranslationIndex> | null>(null);
    const [loadingTranslations, setLoadingTranslations] = useState(false);

    const { isCollected, toggleCollected } = useCollection();

    // ── DIY Catalogue State ──
    const [diySearch, setDiySearch] = useState("");
    const [diySeries, setDiySeries] = useState("All");
    const [diyPage, setDiyPage] = useState(1);

    // ── Villager Database State ──
    const [villagerSearch, setVillagerSearch] = useState("");
    const [villagerPersonality, setVillagerPersonality] = useState("All");
    const [villagerPage, setVillagerPage] = useState(1);

    // Lazy-load translation index when non-English language is selected
    useEffect(() => {
        if (searchLang === 'en' || translationIndex) return;
        let mounted = true;
        setLoadingTranslations(true);
        buildTranslationIndex().then(idx => {
            if (mounted) {
                setTranslationIndex(idx);
                setLoadingTranslations(false);
            }
        }).catch(() => {
            if (mounted) setLoadingTranslations(false);
        });
        return () => { mounted = false; };
    }, [searchLang, translationIndex]);

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
        return catalogData?.items.filter((i) => i.category === 'Recipes') || [];
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
            if (itemSearch.trim()) {
                const query = itemSearch.toLowerCase();
                if (searchLang === 'en') {
                    if (!i.name.toLowerCase().includes(query)) return false;
                } else {
                    // Match via translation index
                    const langIdx = translationIndex?.get(searchLang);
                    if (langIdx) {
                        const matches = searchByTranslation(langIdx, query);
                        const matchNames = new Set(matches.map((m: { name: string; translatedName: string }) => m.name.toLowerCase()));
                        if (!matchNames.has(i.name.toLowerCase())) return false;
                    } else {
                        // Fallback to English if index not loaded yet
                        if (!i.name.toLowerCase().includes(query)) return false;
                    }
                }
            }
            return true;
        });
    }, [allItems, itemCategory, itemSearch, searchLang, translationIndex]);

    const totalItemPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const sortedItems = useMemo(() => {
        const sorted = [...filteredItems];
        switch (itemSort) {
            case 'buy-asc': sorted.sort((a, b) => (a.buy ?? 0) - (b.buy ?? 0)); break;
            case 'buy-desc': sorted.sort((a, b) => (b.buy ?? 0) - (a.buy ?? 0)); break;
            case 'sell-asc': sorted.sort((a, b) => (a.sell ?? 0) - (b.sell ?? 0)); break;
            case 'sell-desc': sorted.sort((a, b) => (b.sell ?? 0) - (a.sell ?? 0)); break;
            default: sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        return sorted;
    }, [filteredItems, itemSort]);
    const pagedItems = useMemo(() => {
        const start = (itemPage - 1) * ITEMS_PER_PAGE;
        return sortedItems.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedItems, itemPage]);

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
                        <p className="lead text-muted mx-auto fw-bold mb-3" style={{ maxWidth: '640px' }}>
                            Search over 7,000+ items, DIY recipes, and all 400+ villagers in Animal Crossing: New Horizons.
                        </p>
                        <Link
                            to="/command-builder"
                            className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs d-inline-flex align-items-center gap-2"
                            onClick={() => playChimeClick()}
                        >
                            <i className="fa-solid fa-cubes-stacked" aria-hidden="true" />
                            <span>Command Builder</span>
                        </Link>
                    </div>

                    {/* Tab Navigation */}
                    <div className="text-center mb-4">
                        <div className="ac-nav-tabs-pill d-inline-flex flex-wrap justify-content-center" role="tablist">
                            <button
                                type="button"
                                className={`ac-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                                role="tab"
                                aria-selected={activeTab === 'items'}
                                onClick={() => handleTabChange('items')}
                            >
                                <i className="fa-solid fa-boxes-stacked" aria-hidden="true" />
                                <span>Items</span>
                                <span className="badge rounded-pill bg-white text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                                    {catalogLoading ? '…' : allItems.length.toLocaleString()}
                                </span>
                            </button>
                            <button
                                type="button"
                                className={`ac-tab-btn ${activeTab === 'diys' ? 'active' : ''}`}
                                role="tab"
                                aria-selected={activeTab === 'diys'}
                                onClick={() => handleTabChange('diys')}
                            >
                                <i className="fa-solid fa-scroll" aria-hidden="true" />
                                <span>DIY Recipes</span>
                                <span className="badge rounded-pill bg-white text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                                    {catalogLoading ? '…' : allDiys.length.toLocaleString()}
                                </span>
                            </button>
                            <button
                                type="button"
                                className={`ac-tab-btn ${activeTab === 'villagers' ? 'active' : ''}`}
                                role="tab"
                                aria-selected={activeTab === 'villagers'}
                                onClick={() => handleTabChange('villagers')}
                            >
                                <i className="fa-solid fa-users" aria-hidden="true" />
                                <span>Villagers</span>
                                <span className="badge rounded-pill bg-white text-dark ms-1" style={{ fontSize: '0.65rem' }}>
                                    {catalogLoading ? '…' : allVillagers.length.toLocaleString()}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* ════════════ TAB 1: ITEMS ════════════ */}
                    {activeTab === 'items' && (
                        <div className="animate-fade-in">
                            {/* Search & Category Filter Bar */}
                            <div className="ac-filter-bar mb-4">
                                <div className="row g-2 align-items-center">
                                    <div className="col-12 col-md-5">
                                        <div className="ac-search-input-group">
                                            <i className="fa-solid fa-magnifying-glass text-muted" aria-hidden="true" />
                                            <input
                                                type="text"
                                                className="ac-search-input"
                                                placeholder={searchLang === 'en' ? 'Search item name (e.g. Froggy Chair)...' : `Search in ${SUPPORTED_LANGUAGES.find(l => l.code === searchLang)?.label || searchLang}...`}
                                                value={itemSearch}
                                                aria-label="Search catalog items"
                                                onChange={(e) => {
                                                    setItemSearch(e.target.value);
                                                    setItemPage(1);
                                                }}
                                            />
                                            {itemSearch && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-muted p-0 me-2"
                                                    onClick={() => { setItemSearch(''); setItemPage(1); }}
                                                >
                                                    <i className="fa-solid fa-xmark" />
                                                </button>
                                            )}
                                            <select
                                                className="form-select form-select-sm rounded-pill border-0 bg-light"
                                                value={searchLang}
                                                aria-label="Search language"
                                                style={{ maxWidth: '110px', fontSize: '0.78rem', fontWeight: 700 }}
                                                onChange={(e) => {
                                                    setSearchLang(e.target.value);
                                                    setItemPage(1);
                                                }}
                                            >
                                                {SUPPORTED_LANGUAGES.map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {loadingTranslations && searchLang !== 'en' && (
                                            <div className="tiny-text text-muted mt-1 ps-2">
                                                <i className="fa-solid fa-spinner fa-spin me-1" /> Loading translations...
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <select
                                            className="ac-select-pill"
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
                                    <div className="col-6 col-md-3">
                                        <select
                                            className="ac-select-pill"
                                            value={itemSort}
                                            aria-label="Sort items"
                                            onChange={(e) => {
                                                setItemSort(e.target.value as typeof itemSort);
                                                setItemPage(1);
                                            }}
                                        >
                                            <option value="name">Sort: Name A-Z</option>
                                            <option value="buy-asc">Sort: Buy Price Low</option>
                                            <option value="buy-desc">Sort: Buy Price High</option>
                                            <option value="sell-asc">Sort: Sell Price Low</option>
                                            <option value="sell-desc">Sort: Sell Price High</option>
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
                                <div className="ac-filter-bar text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-box-open fs-1 mb-2 opacity-50 text-success" aria-hidden="true" />
                                    <p className="fw-bold mb-0">No items found matching your filter.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedItems.map((item) => (
                                            <div key={item.id} className="col-6 col-md-4 col-lg-3">
                                                <div className={`ac-grid-card text-center ${isCollected(item.id) ? 'ac-grid-card--collected' : ''}`}>
                                                    <div className="d-flex justify-content-end mb-1">
                                                        <button
                                                            type="button"
                                                            className={`btn btn-xs p-0 border-0 ${isCollected(item.id) ? 'text-success' : 'text-muted opacity-50'}`}
                                                            title={isCollected(item.id) ? 'Remove from collection' : 'Mark as collected'}
                                                            onClick={(e) => { playChimeClick(); toggleCollected(item.id, e); }}
                                                            style={{ fontSize: '0.85rem' }}
                                                        >
                                                            <i className={`fa-solid ${isCollected(item.id) ? 'fa-circle-check' : 'fa-circle-plus'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="ac-card-img-frame">
                                                        <img
                                                            src={item.image || FALLBACK_IMAGE}
                                                            alt={item.name}
                                                            className="w-100 h-100 object-fit-contain"
                                                            onError={(ev) => {
                                                                (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                    </div>
                                                    <h3 className="fw-black text-dark mb-1 text-truncate" title={item.name} style={{ fontSize: '0.9rem' }}>
                                                        {item.name}
                                                    </h3>
                                                    <span className="badge bg-light text-muted border rounded-pill x-small mb-3">
                                                        {item.category || 'General'}
                                                    </span>
                                                    <Link
                                                        to={`/item/${item.id}`}
                                                        className="btn btn-xs btn-outline-success rounded-pill fw-bold mt-auto"
                                                        onClick={() => playChimeClick()}
                                                    >
                                                        Details & Code &rarr;
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
                                                Page {itemPage} of {totalItemPages} ({filteredItems.length.toLocaleString()} items)
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
                            {/* Series Quick Presets */}
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {DIY_SERIES_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        className={`btn btn-xs rounded-pill fw-bold border d-flex align-items-center gap-1 ${
                                            diySearch === preset.query
                                                ? 'bg-warning text-dark border-warning'
                                                : 'bg-white text-muted hover-bg-light'
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
                            <div className="ac-filter-bar mb-4">
                                <div className="row g-2 align-items-center">
                                    <div className="col-12 col-md-7">
                                        <div className="ac-search-input-group">
                                            <i className="fa-solid fa-magnifying-glass text-muted" aria-hidden="true" />
                                            <input
                                                type="text"
                                                className="ac-search-input"
                                                placeholder="Search DIY recipe name (e.g. Nova Light, Moon, Ironwood)..."
                                                value={diySearch}
                                                aria-label="Search DIY recipes"
                                                onChange={(e) => {
                                                    setDiySearch(e.target.value);
                                                    setDiyPage(1);
                                                }}
                                            />
                                            {diySearch && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-muted p-0"
                                                    onClick={() => { setDiySearch(''); setDiyPage(1); }}
                                                >
                                                    <i className="fa-solid fa-xmark" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <select
                                            className="ac-select-pill"
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
                                <div className="ac-filter-bar text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-scroll fs-1 mb-2 opacity-50 text-warning" aria-hidden="true" />
                                    <p className="fw-bold mb-0">No DIY recipes found matching your filter.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedDIYs.map((diy: CatalogEntity) => (
                                            <div key={diy.id} className="col-6 col-md-4 col-lg-3">
                                                <div className="ac-grid-card text-center">
                                                    <div className="ac-card-img-frame">
                                                        <img
                                                            src={diy.image || FALLBACK_IMAGE}
                                                            alt={diy.name}
                                                            className="w-100 h-100 object-fit-contain"
                                                            onError={(ev) => {
                                                                (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                    </div>
                                                    <h3 className="fw-black text-dark mb-1 text-truncate" title={diy.name} style={{ fontSize: '0.9rem' }}>
                                                        {diy.name}
                                                    </h3>
                                                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill x-small mb-3">
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
                                                Page {diyPage} of {totalDiyPages} ({filteredDIYs.length.toLocaleString()} recipes)
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
                            {/* Search & Personality Filter Bar */}
                            <div className="ac-filter-bar mb-4">
                                <div className="row g-2 align-items-center">
                                    <div className="col-12 col-md-7">
                                        <div className="ac-search-input-group">
                                            <i className="fa-solid fa-magnifying-glass text-muted" aria-hidden="true" />
                                            <input
                                                type="text"
                                                className="ac-search-input"
                                                placeholder="Search villager or personality (e.g. Raymond, Shino, Cat)..."
                                                value={villagerSearch}
                                                aria-label="Search villagers by name"
                                                onChange={(e) => {
                                                    setVillagerSearch(e.target.value);
                                                    setVillagerPage(1);
                                                }}
                                            />
                                            {villagerSearch && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-muted p-0"
                                                    onClick={() => { setVillagerSearch(''); setVillagerPage(1); }}
                                                >
                                                    <i className="fa-solid fa-xmark" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <select
                                            className="ac-select-pill"
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
                                <div className="ac-filter-bar text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-user-slash fs-1 mb-2 opacity-50 text-primary" aria-hidden="true" />
                                    <p className="fw-bold mb-0">No villagers found matching your filter.</p>
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
                                                    <div className="ac-grid-card text-center">
                                                        <div className="position-relative mx-auto mb-2">
                                                            <img
                                                                src={v.image || FALLBACK_IMAGE}
                                                                alt={v.name}
                                                                className="rounded-circle bg-light p-1 border shadow-2xs"
                                                                style={{ width: 68, height: 68, objectFit: 'contain' }}
                                                                onError={(ev) => {
                                                                    (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                                }}
                                                            />
                                                        </div>
                                                        <h3 className="fw-black text-dark mb-1 text-truncate" title={v.name} style={{ fontSize: '0.95rem' }}>
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
                                                Page {villagerPage} of {totalVillagerPages} ({filteredVillagers.length.toLocaleString()} villagers)
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
