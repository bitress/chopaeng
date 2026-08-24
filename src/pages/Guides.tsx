import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCatalogData } from "../hooks/useCatalogData";
import { playChimeClick } from "../utils/kkAudioSynthesizer";

type GuideTab = 'steps' | 'rules' | 'items' | 'diys' | 'villagers' | 'chobot' | 'faq';

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

const Guide = () => {
    const [activeTab, setActiveTab] = useState<GuideTab>("steps");
    const { data: catalogData, isLoading: catalogLoading } = useCatalogData();

    // ── Item Catalogue State ──
    const [itemSearch, setItemSearch] = useState("");
    const [itemCategory, setItemCategory] = useState("All");
    const [itemPage, setItemPage] = useState(1);

    // ── DIY Catalogue State ──
    const [diySearch, setDiySearch] = useState("");
    const [diyCategory, setDiyCategory] = useState("All");
    const [diyPage, setDiyPage] = useState(1);

    // ── Villager Database State ──
    const [villagerSearch, setVillagerSearch] = useState("");
    const [villagerPersonality, setVillagerPersonality] = useState("All");
    const [villagerPage, setVillagerPage] = useState(1);

    useEffect(() => {
        const site = window.location.origin;
        const url = `${site}/guide`;
        const img = `${site}/banner.png`;

        const title =
            activeTab === "steps"
                ? "How to Join ACNH Treasure Islands – Step-by-Step Guide | Chopaeng"
                : activeTab === "rules"
                ? "ACNH Treasure Island Rules – Sub Rules & Order Bot Rules | Chopaeng"
                : activeTab === "items"
                ? "ACNH Item Catalogue & Database Explorer | Chopaeng"
                : activeTab === "diys"
                ? "ACNH DIY Recipes Catalogue & Crafting Guide | Chopaeng"
                : activeTab === "villagers"
                ? "ACNH Villager Database & Schedules | Chopaeng"
                : activeTab === "chobot"
                ? "ChoBot Overview – Community Request Bot | Chopaeng"
                : "ACNH Treasure Island FAQ – Help & Common Issues | Chopaeng";

        const desc =
            activeTab === "steps"
                ? "Step-by-step guide on how to join Chopaeng ACNH treasure islands. Learn Dodo code entry, airport tips, and best practices for smooth Animal Crossing visits."
                : activeTab === "rules"
                ? "Review the sub rules and order bot rules for visiting Chopaeng ACNH treasure islands. Proper airport exits, code confidentiality, and ChoBot etiquette keep islands running smoothly."
                : activeTab === "items"
                ? "Browse the complete Animal Crossing: New Horizons item catalogue database with furniture, clothing, tools, variations, and 1-click builder shortcuts."
                : activeTab === "diys"
                ? "Explore ACNH DIY crafting recipes, required materials, and themed collections including Celestial, Ironwood, Mermaid, and Golden sets."
                : activeTab === "villagers"
                ? "Comprehensive 400+ ACNH villager database with personality types, wake/sleep hours, favorite styles, and move-in tips."
                : activeTab === "chobot"
                ? "Learn what ChoBot is and how Chopaeng members use it to request items, DIY recipes, and villagers."
                : "Find answers to common ACNH treasure island issues on Chopaeng — interference errors, communication errors, and bot usage.";

        document.title = title;

        const setMeta = (attr: string, key: string, value: string) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute("content", value);
        };

        const setLink = (rel: string, href: string) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement("link");
                el.setAttribute("rel", rel);
                document.head.appendChild(el);
            }
            el.setAttribute("href", href);
        };

        setMeta("name", "description", desc);
        setLink("canonical", url);
        setMeta("property", "og:type", "website");
        setMeta("property", "og:site_name", "Chopaeng");
        setMeta("property", "og:url", url);
        setMeta("property", "og:title", title);
        setMeta("property", "og:description", desc);
        setMeta("property", "og:image", img);
        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", title);
        setMeta("name", "twitter:description", desc);
        setMeta("name", "twitter:image", img);
    }, [activeTab]);

    // ── Filtered Items ──
    const allItems = useMemo(() => catalogData?.items.filter(i => i.category !== 'Recipes') || [], [catalogData]);
    const itemCategories = useMemo(() => ['All', ...Array.from(new Set(allItems.map(i => i.category))).sort()], [allItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesSearch = !itemSearch.trim() || item.name.toLowerCase().includes(itemSearch.toLowerCase());
            const matchesCat = itemCategory === 'All' || item.category === itemCategory;
            return matchesSearch && matchesCat;
        });
    }, [allItems, itemSearch, itemCategory]);

    const pagedItems = useMemo(() => {
        return filteredItems.slice((itemPage - 1) * ITEMS_PER_PAGE, itemPage * ITEMS_PER_PAGE);
    }, [filteredItems, itemPage]);

    const totalItemPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

    // ── Filtered DIYs ──
    const allDiys = useMemo(() => catalogData?.items.filter(i => i.category === 'Recipes' || i.name.toLowerCase().includes('recipe') || i.name.toLowerCase().includes('diy')) || [], [catalogData]);

    const filteredDiys = useMemo(() => {
        return allDiys.filter(item => {
            const matchesSearch = !diySearch.trim() || item.name.toLowerCase().includes(diySearch.toLowerCase());
            const matchesSeries = diyCategory === 'All' || item.series === diyCategory || item.theme === diyCategory;
            return matchesSearch && matchesSeries;
        });
    }, [allDiys, diySearch, diyCategory]);

    const pagedDiys = useMemo(() => {
        return filteredDiys.slice((diyPage - 1) * ITEMS_PER_PAGE, diyPage * ITEMS_PER_PAGE);
    }, [filteredDiys, diyPage]);

    const totalDiyPages = Math.max(1, Math.ceil(filteredDiys.length / ITEMS_PER_PAGE));

    // ── Filtered Villagers ──
    const allVillagers = useMemo(() => catalogData?.villagers || [], [catalogData]);
    const personalityTypes = ['All', 'Normal', 'Peppy', 'Lazy', 'Jock', 'Snooty', 'Cranky', 'Smug', 'Sisterly'];

    const filteredVillagers = useMemo(() => {
        return allVillagers.filter(v => {
            const matchesSearch = !villagerSearch.trim() || v.name.toLowerCase().includes(villagerSearch.toLowerCase()) || v.category?.toLowerCase().includes(villagerSearch.toLowerCase());
            const personality = v.category || v.personality || '';
            const matchesPersonality = villagerPersonality === 'All' || personality.toLowerCase() === villagerPersonality.toLowerCase();
            return matchesSearch && matchesPersonality;
        });
    }, [allVillagers, villagerSearch, villagerPersonality]);

    const pagedVillagers = useMemo(() => {
        return filteredVillagers.slice((villagerPage - 1) * ITEMS_PER_PAGE, villagerPage * ITEMS_PER_PAGE);
    }, [filteredVillagers, villagerPage]);

    const totalVillagerPages = Math.max(1, Math.ceil(filteredVillagers.length / ITEMS_PER_PAGE));

    const handleTabSwitch = (tab: GuideTab) => {
        playChimeClick();
        setActiveTab(tab);
    };

    const steps = [
        {
            num: "01",
            title: "Empty Pockets",
            desc: "Leave everything at home. You need all 40 empty slots to collect as much as possible. Tools, nets, rods, and shovels are provided on the island.",
            icon: "fa-solid fa-box-open",
        },
        {
            num: "02",
            title: "Find a Live Island",
            desc: "Visit the Chopaeng Treasure Islands page to check live island status, current visitor count, and featured catalog categories.",
            icon: "fa-solid fa-desktop",
        },
        {
            num: "03",
            title: "Talk to Orville",
            desc: "At Dodo Airlines: Speak to Orville → 'I want to fly' → 'Visit someone' → 'Online play' → 'Search via Dodo Code'.",
            icon: "fa-solid fa-plane-departure",
        },
        {
            num: "04",
            title: "Enter Dodo Code",
            desc: "Type the live code. If you receive 'Interference', retry immediately — someone is landing. If you get 'Communication Error', wait 60s for the island reboot.",
            icon: "fa-solid fa-keyboard",
        },
        {
            num: "05",
            title: "Arrival Cutscene",
            desc: "Wait for the arrival cutscene to complete fully before moving so all island items and terrain spawn properly.",
            icon: "fa-solid fa-location-dot",
        },
        {
            num: "06",
            title: "Collect & Fly Home",
            desc: "Pick up your desired items, tools, and recipes. When your 40 slots are full, always leave properly through the airport counter.",
            icon: "fa-solid fa-bag-shopping",
        },
    ];

    const rules = [
        {
            num: "C1",
            title: "Strict Code Confidentiality",
            desc: "Do NOT share the Dodo Code with anyone — including alternate accounts, friends, or family. The code is exclusively for you.",
            type: "danger",
            icon: "fa-solid fa-shield-halved",
        },
        {
            num: "C2",
            title: "Set Your Nickname",
            desc: "Set your server nickname to the format: ACNH Character Name | Your ACNH Island Name in the 👑 set-nick channel.",
            type: "info",
            icon: "fa-solid fa-id-badge",
        },
        {
            num: "C3",
            title: "Always Leave via Airport (No Minus Button)",
            desc: "NEVER press the minus (–) button or sleep your console to leave. Always walk to the airport gate to avoid crashing the island for other players.",
            type: "danger",
            icon: "fa-solid fa-circle-xmark",
        },
        {
            num: "C4",
            title: "Stable Internet Required",
            desc: "NAT Type A or B with a stable connection is required for smooth island visits without dropped sessions.",
            type: "primary",
            icon: "fa-solid fa-wifi",
        },
        {
            num: "C5",
            title: "Read Pinned Messages",
            desc: "Check the pinned messages in each Discord channel for up-to-date island schedules and announcements before asking.",
            type: "secondary",
            icon: "fa-solid fa-thumbtack",
        },
        {
            num: "C6",
            title: "No Littering",
            desc: "Do not drop unwanted items on the ground. Use the trash bins placed across the island to maintain item spawn points.",
            type: "warning",
            icon: "fa-solid fa-trash",
        },
        {
            num: "C7",
            title: "ChoBot & Order Etiquette",
            desc: "Review the ChoBot guide in the 🍄 chobot-how channel. Only request items or villagers when you are prepared to collect them.",
            type: "success",
            icon: "fa-solid fa-robot",
        },
        {
            num: "C8",
            title: "Order Only What You Need",
            desc: "Order items you actively need to keep queue wait times short and fair for all community members.",
            type: "warning",
            icon: "fa-solid fa-box-open",
        },
    ];

    return (
        <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">
            <Helmet>
                <title>Island Guide & Catalog Database · Chopaeng</title>
                <meta
                    name="description"
                    content="ACNH Treasure Island guides, complete Item Catalogue, DIY Recipes catalogue, and Villager database."
                />
            </Helmet>

            <style>{`
                .guide-nav-group {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 4px;
                    border-radius: 999px;
                }
                .guide-nav-tab {
                    color: #475569;
                    font-size: 0.82rem;
                    font-weight: 700;
                    border: 1.5px solid transparent;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    padding: 0.42rem 0.75rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                }
                .guide-nav-tab:hover {
                    color: #0f172a;
                    background: #ffffff;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                .guide-nav-tab.active {
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
                    color: #ffffff !important;
                    box-shadow: 0 3px 12px rgba(22, 163, 74, 0.3) !important;
                    border-color: #16a34a !important;
                    transform: translateY(-1px);
                }
                .guide-nav-tab:focus-visible, .btn-tab:focus-visible, .btn-xs:focus-visible {
                    outline: 2px solid #16a34a !important;
                    outline-offset: 2px;
                }
            `}</style>

            <div className="app-container w-100" style={{ maxWidth: '1000px' }}>
                {/* 1. APP HEADER */}
                <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="app-icon bg-success text-white shadow-sm" aria-hidden="true">
                            <i className="fa-solid fa-book-open fs-4"></i>
                        </div>
                        <div>
                            <h1 className="h2 mb-0 ac-font fw-black text-dark lh-1">Island Guides & Database</h1>
                            <p className="mb-0 small text-muted fw-bold text-uppercase tracking-wide">
                                Chopaeng Nook Guidebook
                            </p>
                        </div>
                    </div>
                    <div className="d-none d-md-flex align-items-center gap-2">
                        <Link
                            to="/command-builder"
                            className="btn btn-sm btn-outline-success rounded-pill fw-bold px-3 py-1 shadow-2xs"
                            onClick={() => playChimeClick()}
                        >
                            <i className="fa-solid fa-cubes-stacked me-1" aria-hidden="true" /> Command Builder
                        </Link>
                        <Link
                            to="/order"
                            className="btn btn-sm btn-nook text-white rounded-pill fw-bold px-3 py-1 shadow-2xs"
                            onClick={() => playChimeClick()}
                        >
                            <i className="fa-solid fa-paper-plane me-1" aria-hidden="true" /> Order Bot
                        </Link>
                    </div>
                </div>

                {/* 2. NAVIGATION TABS (Dual-Grouped Segmented Pill Bars) */}
                <div className="bg-white p-2 rounded-4 shadow-sm border mb-4">
                    <div className="d-flex flex-column flex-lg-row gap-2">
                        {/* Group 1: Guides & Info */}
                        <div
                            className="guide-nav-group d-flex flex-grow-1 gap-1"
                            style={{ flex: '1.15' }}
                            role="tablist"
                            aria-label="Island Guides and Rules navigation"
                        >
                            {[
                                { id: 'steps' as GuideTab, label: 'How to Join', icon: 'fa-solid fa-plane' },
                                { id: 'rules' as GuideTab, label: 'Sub Rules', icon: 'fa-solid fa-shield-halved' },
                                { id: 'chobot' as GuideTab, label: 'ChoBot Guide', icon: 'fa-solid fa-robot' },
                                { id: 'faq' as GuideTab, label: 'Help & FAQ', icon: 'fa-solid fa-comment-dots' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    id={`guide-tab-${tab.id}`}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls={`guide-panel-${tab.id}`}
                                    onClick={() => handleTabSwitch(tab.id)}
                                    className={`btn guide-nav-tab rounded-pill flex-grow-1 ${
                                        activeTab === tab.id ? 'active' : ''
                                    }`}
                                >
                                    <i className={`${tab.icon}`} aria-hidden="true" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Group 2: Databases */}
                        <div
                            className="guide-nav-group d-flex flex-grow-1 gap-1"
                            style={{ flex: '0.85' }}
                            role="tablist"
                            aria-label="ACNH Database navigation"
                        >
                            {[
                                { id: 'items' as GuideTab, label: 'Item Catalogue', icon: 'fa-solid fa-bag-shopping' },
                                { id: 'diys' as GuideTab, label: 'DIY Catalogue', icon: 'fa-solid fa-scroll' },
                                { id: 'villagers' as GuideTab, label: 'Villager Database', icon: 'fa-solid fa-people-roof' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    id={`guide-tab-${tab.id}`}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls={`guide-panel-${tab.id}`}
                                    onClick={() => handleTabSwitch(tab.id)}
                                    className={`btn guide-nav-tab rounded-pill flex-grow-1 ${
                                        activeTab === tab.id ? 'active' : ''
                                    }`}
                                >
                                    <i className={`${tab.icon}`} aria-hidden="true" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. CONTENT AREA */}
                <div
                    className="content-card bg-white rounded-4 shadow-sm border p-4 p-md-5 position-relative overflow-hidden"
                    role="tabpanel"
                    id={`guide-panel-${activeTab}`}
                    aria-labelledby={`guide-tab-${activeTab}`}
                >
                    {/* ════ TAB: STEPS ════ */}
                    {activeTab === 'steps' && (
                        <div className="animate-fade-in">
                            <h2 className="h4 ac-font fw-black mb-4 text-center text-dark">Ready for Takeoff?</h2>
                            <div className="d-flex flex-column gap-4">
                                {steps.map((step, i) => (
                                    <div
                                        key={i}
                                        className="d-flex align-items-start gap-4 p-3 rounded-4 hover-bg-light transition-all border border-transparent hover-border"
                                    >
                                        <div className="step-circle flex-shrink-0 ac-font" aria-hidden="true">
                                            {step.num}
                                        </div>
                                        <div>
                                            <h3 className="h5 fw-black text-dark mb-1">{step.title}</h3>
                                            <p className="text-muted fw-bold mb-0 small lh-base">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 d-flex align-items-center gap-3">
                                <i className="fa-solid fa-piggy-bank text-success fs-2" aria-hidden="true"></i>
                                <div>
                                    <h4 className="h6 fw-black text-success mb-0">Looking for Bells?</h4>
                                    <p className="small text-success mb-0 fw-bold opacity-75">
                                        Visit our dedicated Bell islands to pick up Bell bundles for your home loans.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ TAB: RULES ════ */}
                    {activeTab === 'rules' && (
                        <div className="animate-fade-in">
                            <h2 className="h4 ac-font fw-black mb-4 text-center text-dark">Island Sub Rules</h2>
                            <div className="row g-3 mb-4">
                                {rules.map((rule, i) => (
                                    <div key={i} className="col-12">
                                        <div
                                            className={`p-4 rounded-4 bg-${rule.type}-subtle border border-${rule.type} border-opacity-25 d-flex align-items-center gap-3`}
                                        >
                                            <div className={`icon-box text-${rule.type} bg-white shadow-sm flex-shrink-0`} aria-hidden="true">
                                                <i className={`${rule.icon} fs-4`}></i>
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span
                                                        className={`badge bg-${rule.type} bg-opacity-25 text-${rule.type} rounded-pill fw-black x-small`}
                                                    >
                                                        {rule.num}
                                                    </span>
                                                    <h3 className={`h5 fw-black text-${rule.type} mb-0`}>{rule.title}</h3>
                                                </div>
                                                <p className="small text-dark opacity-75 fw-bold mb-0">{rule.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ════ TAB: ITEM CATALOGUE ════ */}
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
                            <div className="bg-light p-3 rounded-4 border mb-4">
                                <div className="row g-2">
                                    <div className="col-12 col-md-7">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 rounded-start-pill" aria-hidden="true">
                                                <i className="fa-solid fa-magnifying-glass text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 rounded-end-pill"
                                                placeholder="Search item name (e.g. Froggy Chair, Royal Crown)..."
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
                                                        to={`/command-builder/item/${item.id}`}
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

                    {/* ════ TAB: DIY CATALOGUE ════ */}
                    {activeTab === 'diys' && (
                        <div className="animate-fade-in">
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                <div>
                                    <h2 className="h4 ac-font fw-black mb-1 text-dark">
                                        <i className="fa-solid fa-scroll text-warning me-2" aria-hidden="true" />
                                        DIY Recipes Catalogue
                                    </h2>
                                    <p className="text-muted small mb-0 fw-bold">
                                        Explore craftable furniture, seasonal series, and required materials.
                                    </p>
                                </div>
                                <Link
                                    to="/command-builder"
                                    className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs d-inline-flex align-items-center gap-1"
                                    onClick={() => playChimeClick()}
                                >
                                    <i className="fa-solid fa-hammer" aria-hidden="true" />
                                    <span>Craft in Builder</span>
                                </Link>
                            </div>

                            {/* DIY Presets Chips */}
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                {DIY_SERIES_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        className={`btn btn-xs rounded-pill px-3 py-1 fw-bold border shadow-2xs d-inline-flex align-items-center gap-1 ${
                                            diySearch === preset.query
                                                ? 'btn-warning text-dark'
                                                : 'btn-white bg-white text-dark'
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
                            <div className="bg-light p-3 rounded-4 border mb-4">
                                <div className="row g-2">
                                    <div className="col-12 col-md-7">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 rounded-start-pill" aria-hidden="true">
                                                <i className="fa-solid fa-magnifying-glass text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 rounded-end-pill"
                                                placeholder="Search DIY name (e.g. Nova Light, Crescent-Moon Chair, Cutting Board)..."
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
                                            value={diyCategory}
                                            aria-label="Filter DIY recipes by series"
                                            onChange={(e) => {
                                                setDiyCategory(e.target.value);
                                                setDiyPage(1);
                                            }}
                                        >
                                            <option value="All">Series: All DIYs</option>
                                            <option value="Ironwood">Series: Ironwood</option>
                                            <option value="Golden">Series: Golden</option>
                                            <option value="Stars">Series: Celestial & Stars</option>
                                            <option value="Mermaid">Series: Mermaid & Shell</option>
                                            <option value="Spooky">Series: Spooky</option>
                                            <option value="Mush">Series: Mushroom</option>
                                            <option value="Frozen">Series: Festive & Frozen</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* DIY Grid */}
                            {catalogLoading ? (
                                <div className="text-center py-5" role="status" aria-live="polite">
                                    <div className="spinner-border text-warning mb-2" aria-hidden="true" />
                                    <div className="fw-bold text-muted">Loading DIY Catalogue…</div>
                                </div>
                            ) : pagedDiys.length === 0 ? (
                                <div className="text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-scroll fs-1 mb-2 opacity-50" aria-hidden="true" />
                                    <p className="fw-bold">No DIY recipes found matching your query.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedDiys.map((diy) => (
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
                                                    <span className="badge bg-warning bg-opacity-20 text-dark border border-warning border-opacity-30 rounded-pill x-small mb-2">
                                                        DIY Recipe
                                                    </span>
                                                    <Link
                                                        to={`/command-builder/item/${diy.id}`}
                                                        className="btn btn-xs btn-outline-warning text-dark rounded-pill fw-bold mt-auto"
                                                        onClick={() => playChimeClick()}
                                                    >
                                                        View Recipe →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalDiyPages > 1 && (
                                        <nav className="d-flex justify-content-between align-items-center pt-3 border-top" aria-label="DIY recipes pagination">
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
                                                Page {diyPage} of {totalDiyPages} ({filteredDiys.length} recipes)
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

                    {/* ════ TAB: VILLAGER DATABASE ════ */}
                    {activeTab === 'villagers' && (
                        <div className="animate-fade-in">
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                <div>
                                    <h2 className="h4 ac-font fw-black mb-1 text-dark">
                                        <i className="fa-solid fa-people-roof text-danger me-2" aria-hidden="true" />
                                        Villager Database & Schedules
                                    </h2>
                                    <p className="text-muted small mb-0 fw-bold">
                                        Look up all 400+ villagers, personality traits, and wake-up hours.
                                    </p>
                                </div>
                                <Link
                                    to="/command-builder"
                                    className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs d-inline-flex align-items-center gap-1"
                                    onClick={() => playChimeClick()}
                                >
                                    <i className="fa-solid fa-house-chimney-user" aria-hidden="true" />
                                    <span>Invite via Builder</span>
                                </Link>
                            </div>

                            {/* Personality Filter Chips */}
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                {personalityTypes.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`btn btn-xs rounded-pill px-3 py-1 fw-bold border shadow-2xs ${
                                            villagerPersonality === p
                                                ? 'btn-success text-white'
                                                : 'btn-white bg-white text-dark'
                                        }`}
                                        onClick={() => {
                                            playChimeClick();
                                            setVillagerPersonality(p);
                                            setVillagerPage(1);
                                        }}
                                    >
                                        {p === 'All' ? '🌟 All Personalities' : p}
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <div className="input-group mb-4">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill" aria-hidden="true">
                                    <i className="fa-solid fa-magnifying-glass text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 rounded-end-pill"
                                    placeholder="Search villager name (e.g. Raymond, Marshal, Judy, Sasha, Shino)..."
                                    value={villagerSearch}
                                    aria-label="Search villagers by name"
                                    onChange={(e) => {
                                        setVillagerSearch(e.target.value);
                                        setVillagerPage(1);
                                    }}
                                />
                            </div>

                            {/* Villager Cards Grid */}
                            {catalogLoading ? (
                                <div className="text-center py-5" role="status" aria-live="polite">
                                    <div className="spinner-border text-danger mb-2" aria-hidden="true" />
                                    <div className="fw-bold text-muted">Loading Villager Database…</div>
                                </div>
                            ) : pagedVillagers.length === 0 ? (
                                <div className="text-center py-5 text-muted" role="status" aria-live="polite">
                                    <i className="fa-solid fa-user-slash fs-1 mb-2 opacity-50" aria-hidden="true" />
                                    <p className="fw-bold">No villagers found matching your search.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-4">
                                        {pagedVillagers.map((v) => {
                                            const personality = v.category || v.personality || 'Normal';
                                            const color = PERSONALITY_COLORS[personality] || 'success';
                                            const schedule = PERSONALITY_SCHEDULES[personality] || '6:00 AM – 12:00 AM';

                                            return (
                                                <div key={v.id} className="col-6 col-md-4 col-lg-3">
                                                    <div className="card h-100 rounded-4 border bg-white shadow-2xs hover-shadow-sm p-3 text-center transition-all">
                                                        <img
                                                            src={v.image || FALLBACK_IMAGE}
                                                            alt={v.name}
                                                            className="mx-auto mb-2 rounded-circle border shadow-2xs"
                                                            style={{ width: 64, height: 64, objectFit: 'contain' }}
                                                            onError={(ev) => {
                                                                (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                        <h3 className="fw-bold text-dark small mb-1" style={{ fontSize: '0.88rem' }}>{v.name}</h3>
                                                        <span
                                                            className={`badge bg-${color} bg-opacity-20 text-${color} border rounded-pill x-small mb-1`}
                                                        >
                                                            {personality}
                                                        </span>
                                                        <div className="tiny-text text-muted mb-2">
                                                            <i className="fa-solid fa-clock me-1 text-secondary" aria-hidden="true" />
                                                            {schedule}
                                                        </div>
                                                        <Link
                                                            to={`/command-builder/villager/${v.id}`}
                                                            className="btn btn-xs btn-outline-danger rounded-pill fw-bold mt-auto"
                                                            onClick={() => playChimeClick()}
                                                        >
                                                            Profile & Code →
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {totalVillagerPages > 1 && (
                                        <nav className="d-flex justify-content-between align-items-center pt-3 border-top" aria-label="Villager database pagination">
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
                                                Page {villagerPage} of {totalVillagerPages} ({filteredVillagers.length}{' '}
                                                villagers)
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

                    {/* ════ TAB: CHOBOT ════ */}
                    {activeTab === 'chobot' && (
                        <div className="animate-fade-in">
                            <h2 className="h4 ac-font fw-black mb-2 text-center text-dark">
                                <i className="fa-solid fa-robot text-success me-2" aria-hidden="true" />What Is ChoBot?
                            </h2>
                            <p className="text-muted fw-bold small text-center mb-5">
                                ChoBot is Chopaeng's Discord bot that helps members coordinate item, DIY, and villager
                                requests on our community islands.
                            </p>

                            <div className="p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 mb-5">
                                <h3 className="h6 fw-black text-success mb-2">
                                    <i className="fa-solid fa-circle-info me-2" aria-hidden="true" />Good to Know
                                </h3>
                                <ul className="mb-0 small fw-bold text-success d-flex flex-column gap-1 ps-3">
                                    <li>You need to be on the island before ChoBot can process your request.</li>
                                    <li>ChoBot covers furniture, DIY recipes, wallpaper/flooring, and villager requests.</li>
                                    <li>Garbage bins are available everywhere — use them for anything you don't keep.</li>
                                    <li>
                                        Full command syntax and tutorials are posted in our Discord's 🍄 chobot-how channel.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* ════ TAB: FAQ ════ */}
                    {activeTab === 'faq' && (
                        <div className="animate-fade-in">
                            <h2 className="h4 ac-font fw-black mb-4 text-center text-dark">Troubleshooting & Help</h2>
                            <div className="d-flex flex-column gap-3">
                                {[
                                    {
                                        q: "Wuh-oh! Interference?",
                                        a: "Someone is flying in or out of the island, or a visitor has a menu open. Keep pressing 'A' to retry — you'll be let in as soon as the interference clears, usually within a few seconds.",
                                    },
                                    {
                                        q: "Communication Error?",
                                        a: "The island crashed, most likely because a visitor pressed the minus button to quit instead of leaving through the airport. Wait about 60 seconds for the host to reboot the island.",
                                    },
                                    {
                                        q: "How do I request a specific item?",
                                        a: "Use our Command Builder or Order Bot right on the website, or join the Chopaeng Discord server for on-island bot requests.",
                                    },
                                    {
                                        q: "How do I request a specific villager?",
                                        a: "Look up your favorite villager in the Villager Database tab, copy their ID or load them in the Command Builder, and speak to them in boxes when you arrive.",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="dialogue-container">
                                        <div className="dialogue-bubble bg-light border p-3 rounded-4 position-relative">
                                            <span className="badge bg-dark text-white rounded-pill mb-2 px-3">Question</span>
                                            <h3 className="h6 fw-bold text-dark mb-2">{item.q}</h3>
                                            <p className="small text-success fw-bold mb-0 bg-white p-2 rounded-3 border">
                                                <i className="fa-solid fa-quote-left me-2" aria-hidden="true" />
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Guide;