import { useState, useEffect, useMemo } from 'react';
import type { CommunityLoadout, LoadoutCategory } from '../../types/pocketLoadout';
import {
    fetchCommunityLoadouts,
    fetchLoadoutByCode,
    saveCommunityLoadout,
    upvoteCommunityLoadout,
    isLoadoutUpvoted,
} from '../../utils/communityLoadoutsApi';
import type { PocketEntry } from '../../hooks/useCommandBuilderPockets';
import { getAuthToken } from '../../context/authToken';

interface CommunityLoadoutsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadItems: (items: any[], mode?: 'replace' | 'merge') => void;
    currentOrderPockets: PocketEntry[];
    currentDropPockets: PocketEntry[];
}

const CATEGORIES: LoadoutCategory[] = [
    'All',
    'Starter Kits',
    'Aesthetic & Themes',
    'Wealth & Currencies',
    'Materials & DIY',
    'Seasonal & Events',
    'Custom Builds',
];

export const CommunityLoadoutsModal = ({
    isOpen,
    onClose,
    onLoadItems,
    currentOrderPockets,
    currentDropPockets,
}: CommunityLoadoutsModalProps) => {
    const [activeTab, setActiveTab] = useState<'community' | 'official' | 'saved' | 'code'>('community');
    const [loadouts, setLoadouts] = useState<CommunityLoadout[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<LoadoutCategory>('All');
    const [previewLoadout, setPreviewLoadout] = useState<CommunityLoadout | null>(null);

    // Save current pocket form state
    const [saveName, setSaveName] = useState('');
    const [saveDesc, setSaveDesc] = useState('');
    const [saveCategory, setSaveCategory] = useState<LoadoutCategory>('Custom Builds');
    const [saveTags, setSaveTags] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveNotice, setSaveNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Short code lookup state
    const [codeInput, setCodeInput] = useState('');
    const [codeLookupLoading, setCodeLookupLoading] = useState(false);
    const [codeLookupError, setCodeLookupError] = useState<string | null>(null);
    const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

    const token = getAuthToken();

    // Load community loadouts
    const refreshLoadouts = async () => {
        setLoading(true);
        try {
            const data = await fetchCommunityLoadouts(token);
            setLoadouts(data);
        } catch {
            // Ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            refreshLoadouts();
        }
    }, [isOpen]);

    // Filtered loadouts
    const filteredLoadouts = useMemo(() => {
        return loadouts.filter((l) => {
            if (activeTab === 'official' && !l.isOfficial) return false;
            if (activeTab === 'saved' && l.author !== 'You' && !l.userId) return false;
            if (activeTab === 'community' && l.isOfficial) return false;

            if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesName = l.name.toLowerCase().includes(q);
                const matchesDesc = l.description.toLowerCase().includes(q);
                const matchesAuthor = l.author.toLowerCase().includes(q);
                const matchesCode = l.shortCode.toLowerCase().includes(q);
                const matchesTag = l.tags?.some((t) => t.toLowerCase().includes(q));
                if (!matchesName && !matchesDesc && !matchesAuthor && !matchesCode && !matchesTag) {
                    return false;
                }
            }

            return true;
        });
    }, [loadouts, activeTab, selectedCategory, searchQuery]);

    // Handle Upvoting
    const handleUpvote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await upvoteCommunityLoadout(id, token);
        if (result.success) {
            setLoadouts((prev) =>
                prev.map((l) => (l.id === id ? { ...l, upvotes: result.newCount, hasUpvoted: result.upvoted } : l))
            );
            if (previewLoadout?.id === id) {
                setPreviewLoadout((prev) => (prev ? { ...prev, upvotes: result.newCount, hasUpvoted: result.upvoted } : null));
            }
        }
    };

    // Handle Copy Share Code
    const handleCopyCode = (code: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedCodeId(id);
        setTimeout(() => setCopiedCodeId(null), 2500);
    };

    // Handle Save Current Pocket
    const handleSaveCurrentPocket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!saveName.trim()) {
            setSaveNotice({ text: 'Please enter a loadout name', type: 'error' });
            return;
        }

        const orderItemsPayload = currentOrderPockets.map((p) => ({
            itemId: String(p.item.baseId || p.item.id),
            name: p.item.name,
            quantity: p.quantity,
            category: p.item.category,
            variantId: p.item.variantId !== undefined && p.item.variantId !== null ? String(p.item.variantId) : undefined,
            variantLabel: p.item.variantLabel || undefined,
            image: p.item.image,
            entityType: p.item.entityType,
        }));

        const dropItemsPayload = (currentDropPockets || []).map((p) => ({
            itemId: String(p.item.baseId || p.item.id),
            name: p.item.name,
            quantity: p.quantity,
            category: p.item.category,
            variantId: p.item.variantId !== undefined && p.item.variantId !== null ? String(p.item.variantId) : undefined,
            variantLabel: p.item.variantLabel || undefined,
            image: p.item.image,
            entityType: p.item.entityType,
        }));

        if (orderItemsPayload.length === 0 && dropItemsPayload.length === 0) {
            setSaveNotice({ text: 'Your current pocket is empty. Add items first!', type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            const tagsArray = saveTags
                .split(',')
                .map((t) => t.trim().replace(/^#/, ''))
                .filter(Boolean);

            const saved = await saveCommunityLoadout(
                {
                    name: saveName.trim(),
                    description: saveDesc.trim(),
                    category: saveCategory,
                    tags: tagsArray.length > 0 ? tagsArray : ['custom'],
                    orderItems: orderItemsPayload,
                    dropItems: dropItemsPayload,
                    author: 'You',
                },
                token
            );

            setSaveNotice({ text: `Saved! Short code: ${saved.shortCode}`, type: 'success' });
            setSaveName('');
            setSaveDesc('');
            setSaveTags('');
            refreshLoadouts();
            setActiveTab('saved');
        } catch {
            setSaveNotice({ text: 'Failed to save loadout', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Lookup by code
    const handleLookupCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!codeInput.trim()) return;

        setCodeLookupLoading(true);
        setCodeLookupError(null);
        try {
            const found = await fetchLoadoutByCode(codeInput.trim(), token);
            if (found) {
                setPreviewLoadout(found);
            } else {
                setCodeLookupError(`No loadout found for code "${codeInput.trim().toUpperCase()}"`);
            }
        } catch {
            setCodeLookupError('Could not reach loadout server. Try again.');
        } finally {
            setCodeLookupLoading(false);
        }
    };

    if (!isOpen) return null;

    const officialCount = loadouts.filter((l) => l.isOfficial).length;
    const currentTotalItems = currentOrderPockets.reduce((s, p) => s + p.quantity, 0);

    return (
        <div
            className="modal show d-block fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)', zIndex: 1050, backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '1100px' }}
            >
                <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden">
                    {/* ── Modal Header ──────────────────────────────────────── */}
                    <div
                        className="modal-header py-3 px-4 border-0 position-relative"
                        style={{
                            background: 'linear-gradient(135deg, #113824 0%, #1e5a38 50%, #0d2c1a 100%)',
                            color: '#ffffff',
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    color: '#ffd166',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                }}
                            >
                                <i className="fa-solid fa-boxes-stacked fs-5"></i>
                            </div>
                            <div>
                                <h4 className="modal-title fw-black ac-font mb-0 text-white d-flex align-items-center gap-2">
                                    <span>Community Loadouts & Bundles</span>
                                    <span className="badge bg-white bg-opacity-20 text-white rounded-pill x-small fw-bold font-monospace">
                                        40-Slot Sets
                                    </span>
                                </h4>
                                <p className="tiny-text mb-0 text-white-50">
                                    Discover, clone, and share curated 40-slot island order builds
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white shadow-none opacity-75 hover-opacity-100"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* ── Segmented Navigation Tabs ─────────────────────────── */}
                    <div
                        className="px-4 pt-3 pb-2 border-bottom"
                        style={{ backgroundColor: '#f8faf9' }}
                    >
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                            {/* Tabs Switcher */}
                            <div className="d-flex p-1 bg-white rounded-pill border shadow-2xs gap-1 flex-wrap">
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${
                                        activeTab === 'community'
                                            ? 'btn-success text-white shadow-2xs'
                                            : 'text-muted border-0 hover-text-dark'
                                    }`}
                                    onClick={() => {
                                        setActiveTab('community');
                                        setPreviewLoadout(null);
                                    }}
                                >
                                    <i className="fa-solid fa-earth-americas me-1"></i>
                                    <span>Community Hub</span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${
                                        activeTab === 'official'
                                            ? 'btn-warning text-dark shadow-2xs'
                                            : 'text-muted border-0 hover-text-dark'
                                    }`}
                                    onClick={() => {
                                        setActiveTab('official');
                                        setPreviewLoadout(null);
                                    }}
                                >
                                    <i className="fa-solid fa-crown me-1 text-warning-emphasis"></i>
                                    <span>Staff Curated</span>
                                    <span className="badge bg-dark bg-opacity-10 text-dark rounded-pill ms-1 x-small font-monospace">
                                        {officialCount}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${
                                        activeTab === 'saved'
                                            ? 'btn-success text-white shadow-2xs'
                                            : 'text-muted border-0 hover-text-dark'
                                    }`}
                                    onClick={() => {
                                        setActiveTab('saved');
                                        setPreviewLoadout(null);
                                    }}
                                >
                                    <i className="fa-solid fa-bookmark me-1"></i>
                                    <span>My Saved Builds</span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${
                                        activeTab === 'code'
                                            ? 'btn-primary text-white shadow-2xs'
                                            : 'text-muted border-0 hover-text-dark'
                                    }`}
                                    onClick={() => {
                                        setActiveTab('code');
                                        setPreviewLoadout(null);
                                    }}
                                >
                                    <i className="fa-solid fa-key me-1"></i>
                                    <span>Enter Short Code</span>
                                </button>
                            </div>

                            {/* Active Pocket Status Indicator */}
                            <div className="d-none d-md-flex align-items-center gap-2 tiny-text bg-white px-3 py-1 rounded-pill border shadow-2xs">
                                <span className="text-muted fw-bold">Active Pocket:</span>
                                <span
                                    className={`fw-black font-monospace ${
                                        currentOrderPockets.length === 40 ? 'text-danger' : 'text-success'
                                    }`}
                                >
                                    {currentOrderPockets.length}/40 slots ({currentTotalItems} items)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Modal Body ───────────────────────────────────────── */}
                    <div className="modal-body p-3 p-md-4" style={{ backgroundColor: '#fdfefe' }}>
                        {/* ── TAB 1, 2, 3: Gallery Views ────────────────────── */}
                        {(activeTab === 'community' || activeTab === 'official' || activeTab === 'saved') && (
                            <div>
                                {/* Search & Category Filters */}
                                <div className="row g-2 mb-4 align-items-center">
                                    <div className="col-12 col-md-5">
                                        <div className="input-group input-group-sm rounded-pill overflow-hidden border bg-white shadow-2xs">
                                            <span className="input-group-text bg-white border-0 ps-3 text-muted">
                                                <i className="fa-solid fa-magnifying-glass"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-0 shadow-none ps-1 fw-semibold"
                                                placeholder="Search loadouts by name, tag, author, or code..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-muted border-0 pe-3 text-decoration-none"
                                                    onClick={() => setSearchQuery('')}
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category Filter Pills */}
                                    <div className="col-12 col-md-7">
                                        <div className="d-flex gap-1 overflow-auto pb-1 no-scrollbar">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    className={`btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-bold transition-all ${
                                                        selectedCategory === cat
                                                            ? 'btn-success text-white shadow-2xs'
                                                            : 'btn-light bg-white text-muted border hover-shadow-sm'
                                                    }`}
                                                    style={{ fontSize: '0.74rem' }}
                                                    onClick={() => setSelectedCategory(cat)}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Save active pocket card inside "My Builds" */}
                                {activeTab === 'saved' && (
                                    <div
                                        className="rounded-4 p-3 mb-4 shadow-sm border"
                                        style={{
                                            background: 'linear-gradient(135deg, #eefbf3 0%, #e2f7ea 100%)',
                                            borderColor: '#a3e6b9',
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center bg-success text-white shadow-2xs"
                                                    style={{ width: '30px', height: '30px' }}
                                                >
                                                    <i className="fa-solid fa-cloud-arrow-up small"></i>
                                                </div>
                                                <div>
                                                    <span className="fw-black text-success" style={{ fontSize: '0.95rem' }}>
                                                        Publish Current Pocket as a Cloud Loadout
                                                    </span>
                                                    <div className="tiny-text text-muted">
                                                        Save your active 40-slot order grid for quick re-use or sharing
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge bg-success text-white rounded-pill px-3 py-1 fw-bold shadow-2xs">
                                                {currentOrderPockets.length}/40 Slots ({currentTotalItems} items)
                                            </span>
                                        </div>

                                        <form onSubmit={handleSaveCurrentPocket} className="row g-2 mt-1">
                                            <div className="col-12 col-md-4">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm rounded-3 fw-semibold border-success-subtle shadow-none"
                                                    placeholder="Loadout Title (e.g. Zen Bamboo Garden)"
                                                    value={saveName}
                                                    onChange={(e) => setSaveName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 col-md-3">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm rounded-3 fw-semibold border-success-subtle shadow-none"
                                                    placeholder="Tags (#zen, #bamboo, #diy)"
                                                    value={saveTags}
                                                    onChange={(e) => setSaveTags(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-12 col-md-3">
                                                <select
                                                    className="form-select form-select-sm rounded-3 fw-semibold border-success-subtle shadow-none"
                                                    value={saveCategory}
                                                    onChange={(e) => setSaveCategory(e.target.value as LoadoutCategory)}
                                                >
                                                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                                                        <option key={c} value={c}>
                                                            {c}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-md-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSaving || currentOrderPockets.length === 0}
                                                    className="btn btn-sm btn-success text-white w-100 rounded-3 fw-black shadow-2xs"
                                                >
                                                    {isSaving ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-floppy-disk me-1"></i>Save
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>

                                        {saveNotice && (
                                            <div
                                                className={`mt-2 alert alert-${
                                                    saveNotice.type === 'success' ? 'success' : 'danger'
                                                } py-1 px-3 mb-0 tiny-text rounded-3 fw-bold animate-fade-in`}
                                            >
                                                {saveNotice.text}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Main Loadout Grid */}
                                {loading ? (
                                    <div className="text-center py-5 text-muted">
                                        <div
                                            className="spinner-border text-success mb-2"
                                            style={{ width: '2.5rem', height: '2.5rem' }}
                                        ></div>
                                        <p className="fw-bold small text-muted">Loading community collections...</p>
                                    </div>
                                ) : filteredLoadouts.length === 0 ? (
                                    <div className="text-center py-5 rounded-4 bg-light border p-4">
                                        <i className="fa-solid fa-box-open fs-1 text-muted opacity-50 mb-3 d-block"></i>
                                        <h6 className="fw-black text-dark">No matching loadouts found</h6>
                                        <p className="small text-muted mb-0">
                                            Try searching with different tags or clear the category filter.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {filteredLoadouts.map((loadout) => {
                                            const totalItems = (loadout.orderItems || []).reduce(
                                                (s, i) => s + (i.quantity || 1),
                                                0
                                            );
                                            const upvoted = isLoadoutUpvoted(loadout.id, loadout.hasUpvoted);
                                            const isSelected = previewLoadout?.id === loadout.id;

                                            return (
                                                <div key={loadout.id} className="col-12 col-md-6 col-xl-4">
                                                    <div
                                                        className={`card h-100 rounded-4 border transition-all cursor-pointer overflow-hidden ${
                                                            isSelected
                                                                ? 'border-success shadow-md ring-2 ring-success-subtle'
                                                                : 'bg-white hover-shadow-md border-light-subtle'
                                                        }`}
                                                        style={{
                                                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        }}
                                                        onClick={() => setPreviewLoadout(loadout)}
                                                    >
                                                        <div className="card-body p-3 d-flex flex-column">
                                                            {/* Top Badges & Upvotes */}
                                                            <div className="d-flex align-items-start justify-content-between mb-2">
                                                                <div className="d-flex flex-wrap gap-1 align-items-center">
                                                                    {loadout.isOfficial ? (
                                                                        <span
                                                                            className="badge rounded-pill text-dark fw-bold x-small d-flex align-items-center gap-1 shadow-2xs"
                                                                            style={{
                                                                                background: 'linear-gradient(135deg, #ffd166 0%, #ffbe0b 100%)',
                                                                            }}
                                                                        >
                                                                            <i className="fa-solid fa-crown"></i>
                                                                            <span>Staff Pick</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge bg-light text-muted border rounded-pill x-small">
                                                                            {loadout.category}
                                                                        </span>
                                                                    )}
                                                                    <span className="tiny-text text-muted font-monospace">
                                                                        by {loadout.author}
                                                                    </span>
                                                                </div>

                                                                {/* Upvote Button */}
                                                                <button
                                                                    type="button"
                                                                    className={`btn btn-sm rounded-pill px-2 py-0 d-flex align-items-center gap-1 border transition-all ${
                                                                        upvoted
                                                                            ? 'btn-danger text-white shadow-2xs'
                                                                            : 'btn-light text-muted border-light-subtle hover-bg-danger-subtle'
                                                                    }`}
                                                                    style={{ fontSize: '0.72rem' }}
                                                                    onClick={(e) => handleUpvote(loadout.id, e)}
                                                                    title={upvoted ? 'Upvoted!' : 'Upvote this build'}
                                                                >
                                                                    <i
                                                                        className={`fa-${
                                                                            upvoted ? 'solid text-white' : 'regular text-danger'
                                                                        } fa-heart`}
                                                                    ></i>
                                                                    <span className="fw-bold">{loadout.upvotes || 0}</span>
                                                                </button>
                                                            </div>

                                                            {/* Title & Description */}
                                                            <h6 className="fw-black mb-1 text-dark ac-font" style={{ fontSize: '0.98rem' }}>
                                                                {loadout.name}
                                                            </h6>
                                                            <p className="tiny-text text-muted mb-2 text-truncate-2" style={{ minHeight: '32px' }}>
                                                                {loadout.description || 'Community pocket build.'}
                                                            </p>

                                                            {/* Item Visual Thumbnails Grid */}
                                                            <div className="d-flex gap-1 mb-3 overflow-hidden rounded-3 p-1 bg-light border">
                                                                {(loadout.orderItems || []).slice(0, 6).map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="ratio ratio-1x1 bg-white rounded-2 border d-flex align-items-center justify-content-center p-1 shadow-2xs position-relative"
                                                                        style={{
                                                                            width: '34px',
                                                                            minWidth: '34px',
                                                                        }}
                                                                        title={`${item.name} (${item.quantity}×)`}
                                                                    >
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'contain',
                                                                            }}
                                                                        />
                                                                        {item.quantity > 1 && (
                                                                            <span
                                                                                className="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 end-0 p-0 px-1 rounded-1 font-monospace"
                                                                                style={{ fontSize: '0.55rem' }}
                                                                            >
                                                                                {item.quantity}×
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {(loadout.orderItems || []).length > 6 && (
                                                                    <div
                                                                        className="d-flex align-items-center justify-content-center bg-white rounded-2 border tiny-text text-muted fw-black px-1"
                                                                        style={{ minWidth: '34px', fontSize: '0.72rem' }}
                                                                    >
                                                                        +{(loadout.orderItems || []).length - 6}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Card Footer Actions */}
                                                            <div className="mt-auto d-flex align-items-center justify-content-between pt-2 border-top">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-light border rounded-pill px-2 py-0 tiny-text font-monospace fw-bold text-muted transition-all hover-text-dark"
                                                                    onClick={(e) =>
                                                                        handleCopyCode(
                                                                            loadout.shortCode,
                                                                            loadout.id,
                                                                            e
                                                                        )
                                                                    }
                                                                    title="Click to copy short code"
                                                                >
                                                                    <i
                                                                        className={`fa-solid ${
                                                                            copiedCodeId === loadout.id
                                                                                ? 'fa-check text-success'
                                                                                : 'fa-hashtag text-muted'
                                                                        } me-1`}
                                                                    ></i>
                                                                    <span>
                                                                        {copiedCodeId === loadout.id
                                                                            ? 'Copied!'
                                                                            : loadout.shortCode}
                                                                    </span>
                                                                </button>

                                                                <div className="d-flex gap-1">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-success rounded-pill px-2 py-1 fw-bold"
                                                                        style={{ fontSize: '0.74rem' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPreviewLoadout(loadout);
                                                                        }}
                                                                    >
                                                                        <i className="fa-solid fa-eye me-1"></i>Preview
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success text-white rounded-pill px-3 py-1 fw-black shadow-2xs"
                                                                        style={{ fontSize: '0.74rem' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onLoadItems(loadout.orderItems, 'replace');
                                                                            onClose();
                                                                        }}
                                                                    >
                                                                        <i className="fa-solid fa-check me-1"></i>Load ({totalItems})
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── TAB 4: Enter Code ───────────────────────────────── */}
                        {activeTab === 'code' && (
                            <div className="py-4 px-md-5 text-center" style={{ maxWidth: '580px', margin: '0 auto' }}>
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-md"
                                    style={{
                                        width: '68px',
                                        height: '68px',
                                        background: 'linear-gradient(135deg, #e7f1ff 0%, #cfe2ff 100%)',
                                        color: '#0d6efd',
                                    }}
                                >
                                    <i className="fa-solid fa-key fs-3"></i>
                                </div>
                                <h4 className="fw-black mb-1 ac-font text-dark">Load by Community Share Code</h4>
                                <p className="small text-muted mb-4">
                                    Enter a 6-character code (e.g. <code className="bg-light px-2 py-1 rounded text-primary fw-bold">CHOP-COTT</code>) to instantly preview and import the 40-slot build.
                                </p>

                                <form onSubmit={handleLookupCode} className="d-flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg text-center font-monospace fw-black uppercase-input rounded-4 border-2 shadow-sm"
                                        placeholder="CHOP-XXXX"
                                        value={codeInput}
                                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                                        style={{ letterSpacing: '3px', fontSize: '1.2rem' }}
                                        maxLength={10}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-black px-4 rounded-4 shadow-sm"
                                        disabled={codeLookupLoading || !codeInput.trim()}
                                    >
                                        {codeLookupLoading ? (
                                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        ) : (
                                            'Find'
                                        )}
                                    </button>
                                </form>

                                {codeLookupError && (
                                    <div className="alert alert-danger py-2 rounded-3 small fw-bold animate-fade-in">
                                        <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                        {codeLookupError}
                                    </div>
                                )}

                                {loadouts.length > 0 && (
                                    <div className="mt-4 pt-3 border-top d-flex justify-content-center gap-2 flex-wrap">
                                        <span className="tiny-text text-muted fw-bold">Recent Loadout Codes:</span>
                                        {loadouts.slice(0, 4).map((l) => (
                                            <button
                                                key={l.id}
                                                type="button"
                                                className="btn btn-sm btn-light border rounded-pill px-2 py-0 tiny-text font-monospace fw-bold text-muted hover-text-dark"
                                                onClick={() => setCodeInput(l.shortCode)}
                                            >
                                                {l.shortCode}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Interactive 40-Slot Preview Drawer ──────────────── */}
                        {previewLoadout && (
                            <div
                                className="mt-4 p-3 p-md-4 rounded-4 border shadow-md animate-fade-in"
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderTop: '5px solid #198754',
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span className="badge bg-success text-white rounded-pill px-2 py-1 fw-bold">
                                                {previewLoadout.category}
                                            </span>
                                            <span className="badge bg-light text-dark border font-monospace fw-bold">
                                                {previewLoadout.shortCode}
                                            </span>
                                            <span className="tiny-text text-muted">
                                                • {previewLoadout.orderItems?.length || 0} slots
                                            </span>
                                        </div>
                                        <h5 className="fw-black mb-0 text-dark ac-font">{previewLoadout.name}</h5>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm rounded-pill fw-bold px-3 shadow-2xs"
                                            onClick={() => {
                                                onLoadItems(previewLoadout.orderItems, 'merge');
                                                onClose();
                                            }}
                                            title="Add items to your existing pocket"
                                        >
                                            <i className="fa-solid fa-plus me-1"></i>Append to Pocket
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm rounded-pill fw-black px-4 shadow-sm text-white"
                                            onClick={() => {
                                                onLoadItems(previewLoadout.orderItems, 'replace');
                                                onClose();
                                            }}
                                            title="Replace active pocket with this build"
                                        >
                                            <i className="fa-solid fa-arrow-down-to-bracket me-1"></i>Replace Inventory
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-light border rounded-pill px-2"
                                            onClick={() => setPreviewLoadout(null)}
                                            title="Close preview"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* 40-Slot Item Grid */}
                                <div className="row g-2 overflow-auto" style={{ maxHeight: '220px' }}>
                                    {(previewLoadout.orderItems || []).map((item, idx) => (
                                        <div key={idx} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                            <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 border shadow-2xs">
                                                <div
                                                    className="bg-white rounded-2 border p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div className="text-truncate" style={{ fontSize: '0.72rem' }}>
                                                    <div className="fw-bold text-truncate text-dark">{item.name}</div>
                                                    <div className="text-success font-monospace fw-bold">{item.quantity}×</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
