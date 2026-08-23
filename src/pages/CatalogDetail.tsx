import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { loadExplorerItems } from "../data/explorerDataLoader";
import { loadVillagers } from "../data/villagerDataLoader";
import type { CatalogEntity } from "../data/commandBuilderData";
import { getVariantCommandParts, getVariantKey, getVariantLabel } from "../utils/commandBuilderHex";
import { useCommandBuilderPockets } from "../hooks/useCommandBuilderPockets";
import { useFavorites } from "../hooks/useFavorites";
import CommandBuilderSummary from "../components/CommandBuilderSummary";
import CatalogAvailability from "../components/CatalogAvailability";
import { FINDER_API_BASE } from "../config/api";

type NookipediaNhDetails = {
    catchphrase?: string;
    clothing?: string;
    clothing_variation?: string;
    fav_colors?: string[];
    fav_styles?: string[];
    hobby?: string;
    house_exterior_url?: string;
    house_flooring?: string;
    house_interior_url?: string;
    house_music?: string;
    house_music_note?: string;
    house_wallpaper?: string;
    icon_url?: string;
    image_url?: string;
    photo_url?: string;
    quote?: string;
    "sub-personality"?: string;
    umbrella?: string;
};

type NookipediaVillager = {
    alt_name?: string;
    appearances?: string[];
    birthday_day?: string;
    birthday_month?: string;
    clothing?: string;
    debut?: string;
    gender?: string;
    id: string;
    image_url?: string;
    islander?: boolean;
    name: string;
    nh_details?: NookipediaNhDetails;
    personality?: string;
    phrase?: string;
    prev_phrases?: string[];
    quote?: string;
    sign?: string;
    species?: string;
    text_color?: string;
    title_color?: string;
    url?: string;
};

const CatalogDetail = () => {
    const { entityType, id } = useParams<{ entityType?: string; id?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const variantIdParam = searchParams.get('variantId') || '';

    const [items, setItems] = useState<CatalogEntity[]>([]);
    const [villagers, setVillagers] = useState<CatalogEntity[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const [loadedItems, loadedVillagers] = await Promise.all([
                    loadExplorerItems(),
                    loadVillagers()
                ]);
                if (mounted) {
                    setItems(loadedItems);
                    setVillagers(loadedVillagers);
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
    const type = entityType === 'villager' ? 'villager' : 'item';
    const entry = useMemo<CatalogEntity | null>(() => {
        if (!id) return null;
        return (type === 'villager'
            ? villagers.find((villager) => villager.id === id)
            : items.find((item) => item.id === id)) || null;
    }, [id, type, items, villagers]);

    const [detailStatus, setDetailStatus] = useState('');
    const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [villagerData, setVillagerData] = useState<NookipediaVillager | null>(null);
    const [loadingVillager, setLoadingVillager] = useState(false);
    const [activeHouseTab, setActiveHouseTab] = useState<'interior' | 'exterior' | 'photo'>('interior');
    const detailStatusRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!entry || entry.entityType !== 'villager') {
            setVillagerData(null);
            setLoadingVillager(false);
            return;
        }

        let isMounted = true;
        setLoadingVillager(true);

        const fetchVillagerInfo = async () => {
            try {
                const response = await fetch(`${FINDER_API_BASE}/api/v1/villager/${encodeURIComponent(entry.name)}`);
                if (!response.ok) throw new Error("Failed to fetch villager details");
                const data = await response.json();
                if (isMounted) {
                    if (data.success && data.villager) {
                        setVillagerData(data.villager);
                    } else if (data.name) {
                        setVillagerData(data);
                    }
                }
            } catch (error) {
                console.error("Villager API Error:", error);
            } finally {
                if (isMounted) setLoadingVillager(false);
            }
        };

        fetchVillagerInfo();

        return () => {
            isMounted = false;
        };
    }, [entry]);

    const {
        orderItems,
        setOrderItems,
        dropItems,
        setDropItems,
        totalOrderCount,
        totalDropCount,
        canIncreaseOrder,
        canIncreaseDrop,
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
        decreaseOrderQuantity,
        increaseOrderQuantity,
        removeOrderItem,
        decreaseDropQuantity,
        increaseDropQuantity,
        removeDropItem,
    } = useCommandBuilderPockets();



    const { isFavorite, toggleFavorite } = useFavorites();
    const isItemFavorited = entry ? (isFavorite(entry.id) || isFavorite(entry.id.split(':')[0])) : false;

    useEffect(() => {
        if (entry?.entityType !== 'item') {
            setSelectedVariantKey(null);
            return;
        }

        const validKeys = entry.variations?.map((variant) => getVariantKey(variant)) || [];
        if (variantIdParam && validKeys.includes(variantIdParam)) {
            setSelectedVariantKey(variantIdParam);
            return;
        }

        setSelectedVariantKey(validKeys[0] || null);
    }, [entry, variantIdParam]);

    // Scroll to top whenever a different catalog entry is opened
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    // Keep the browser tab title in sync with the entry being viewed
    useEffect(() => {
        if (entry) {
            document.title = `${entry.name} · Command Builder`;
        }
        return () => {
            document.title = 'Command Builder';
        };
    }, [entry]);

    if (isLoadingData) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-pattern font-nunito py-5">
                <div className="text-center">
                    <div className="spinner-border text-success mb-3" role="status"></div>
                    <h3 className="h5 fw-bold text-muted">Loading Entry...</h3>
                </div>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-pattern font-nunito py-5">
                <div className="bg-white rounded-5 shadow-sm border p-5 text-center" style={{ maxWidth: '560px' }}>
                    <h1 className="h3 fw-black mb-3">Entry not found</h1>
                    <p className="text-muted mb-4">This item or villager could not be found. Return to the command builder and try again.</p>
                    <Link to="/command-builder" className="btn btn-nook-primary rounded-pill px-4 py-3 fw-black">Back to Command Builder</Link>
                </div>
            </div>
        );
    }

    const selectedVariant = entry.entityType === 'item'
        ? entry.variations?.find((variant) => getVariantKey(variant) === selectedVariantKey) || null
        : null;

    const variantLabel = getVariantLabel(selectedVariant);
    const detailImage = selectedVariant?.imageUrl || entry.image;
    const detailTitle = entry.entityType === 'item' && variantLabel ? `${entry.name} (${variantLabel})` : entry.name;
    const selectedVariantCommandParts = entry.entityType === 'item'
        ? getVariantCommandParts(entry.id, selectedVariant)
        : null;
    const selectedVariantPocketKey = selectedVariant ? getVariantKey(selectedVariant) : 'NA';

    const pocketItemId = entry.entityType === 'item'
        ? (selectedVariant ? `${entry.id}:${selectedVariantPocketKey}` : entry.id)
        : entry.id;
    const inOrderQty = getOrderPocketQuantity(pocketItemId);
    const inDropQty = getDropPocketQuantity(pocketItemId);

    const handleVariantSelect = (variantKey: string) => {
        setSelectedVariantKey(variantKey);
        const basePath = `/command-builder/${entry.entityType}/${entry.id}`;
        const query = variantKey && variantKey !== 'NA' ? `?variantId=${encodeURIComponent(variantKey)}` : '';
        navigate(`${basePath}${query}`, { replace: true });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            setLinkCopied(false);
        }
    };

    const addToOrder = () => {
        const itemToSave = {
            ...entry,
            id: pocketItemId,
            baseId: selectedVariantCommandParts?.baseId || entry.id,
            variantId: selectedVariantCommandParts?.variantId || 'NA',
            variantLabel,
            image: detailImage,
        };
        const result = addItemToOrderPockets(itemToSave as any);
        setDetailStatus(result.message);
        setTimeout(() => {
            detailStatusRef.current?.focus();
        }, 50);
        setTimeout(() => setDetailStatus(''), 2800);
    };

    const addToDrop = () => {
        const itemToSave = {
            ...entry,
            id: pocketItemId,
            baseId: selectedVariantCommandParts?.baseId || entry.id,
            variantId: selectedVariantCommandParts?.variantId || 'NA',
            variantLabel,
            image: detailImage,
        };
        const result = addItemToDropPockets(itemToSave as any);
        setDetailStatus(result.message);
        setTimeout(() => {
            detailStatusRef.current?.focus();
        }, 50);
        setTimeout(() => setDetailStatus(''), 2800);
    };

    const handleBackToCatalog = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/command-builder');
        }
    };

    return (
        <div className="bg-pattern font-nunito min-vh-100 pb-5">
            <section className="container py-5">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-5">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 small fw-bold align-items-center">
                            <li className="breadcrumb-item">
                                <button
                                    type="button"
                                    onClick={handleBackToCatalog}
                                    className="btn btn-link text-decoration-none text-nook transition-all p-0 fw-bold d-inline-flex align-items-center"
                                    title="Return to catalog (saves your spot)"
                                >
                                    <i className="fa-solid fa-arrow-left me-2"></i>Command Builder
                                </button>
                            </li>
                            <li className="breadcrumb-item text-muted" aria-current="page">
                                {entry.entityType === 'item' ? entry.category : 'Villagers'}
                            </li>
                            <li className="breadcrumb-item active text-truncate text-dark" style={{ maxWidth: '220px' }} aria-current="page">
                                {entry.name}
                            </li>
                        </ol>
                    </nav>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="button"
                            onClick={(e) => toggleFavorite(entry.id, e)}
                            className={`btn btn-sm rounded-pill fw-bold px-3 shadow-sm transition-all d-flex align-items-center gap-2 ${
                                isItemFavorited 
                                    ? 'btn-warning text-white' 
                                    : 'btn-white bg-white text-muted border'
                            }`}
                            title={isItemFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                            aria-label={isItemFavorited ? `Remove ${entry.name} from favorites` : `Add ${entry.name} to favorites`}
                        >
                            <i className={`fa-${isItemFavorited ? 'solid' : 'regular'} fa-star`} />
                            <span>{isItemFavorited ? 'Favorited' : 'Favorite'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleBackToCatalog}
                            className="btn btn-sm btn-outline-success bg-white rounded-pill fw-bold px-3 shadow-sm transition-all"
                            title="Return to catalog (saves your spot)"
                        >
                            <i className="fa-solid fa-arrow-left me-1"></i> Back to Catalog
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="btn btn-sm btn-white border rounded-pill fw-bold px-3 shadow-sm transition-all flex-shrink-0"
                        >
                            <i className={`fa-solid ${linkCopied ? 'fa-check' : 'fa-link'} me-2`}></i>
                            {linkCopied ? 'Link copied!' : 'Copy link'}
                        </button>
                    </div>
                </div>

                <div className="row gy-4">
                    <div className="col-lg-8">
                        <div className="bg-cream rounded-4 border-0 shadow-sm overflow-hidden mb-4" style={{ borderTop: '4px solid var(--nook-green)' }}>
                            <div className="row g-0 align-items-stretch">
                                <div className="col-12 col-md-5 col-lg-4 bg-light p-4 position-relative d-flex align-items-center justify-content-center border-end">
                                    <div className="ratio ratio-1x1 w-100" style={{ maxWidth: '280px' }}>
                                        <img
                                            src={entry.entityType === 'villager' ? (villagerData?.nh_details?.image_url || villagerData?.image_url || entry.image) : detailImage}
                                            alt={detailTitle}
                                            className="w-100 h-100 object-fit-contain"
                                            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
                                        />
                                    </div>
                                    {entry.entityType === 'villager' && villagerData?.nh_details?.icon_url && (
                                        <div className="position-absolute bottom-0 end-0 p-3">
                                            <div className="bg-white rounded-circle p-2 shadow-sm border" style={{ width: '56px', height: '56px' }}>
                                                <img src={villagerData.nh_details.icon_url} alt={`${entry.name} Icon`} className="w-100 h-100 object-fit-contain" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-7 col-lg-8 p-4 p-sm-5 d-flex flex-column justify-content-center bg-white">
                                    <div className="mb-4">
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                            <span className="badge bg-nook-green text-white rounded-pill px-3 py-2 fw-black x-small shadow-sm">
                                                <i className={`fa-solid ${entry.entityType === 'villager' ? 'fa-user' : 'fa-box'} me-1`}></i>
                                                {entry.entityType === 'item' ? 'Item Details' : 'Villager Details'}
                                            </span>
                                            {entry.entityType === 'villager' && loadingVillager && (
                                                <span className="badge bg-light text-muted border rounded-pill px-3 py-2 fw-bold x-small">
                                                    <i className="fa-solid fa-spinner fa-spin me-1 text-nook"></i> Loading details...
                                                </span>
                                            )}
                                        </div>

                                        <h1 className="ac-font fw-black mb-2 text-nook" style={{ fontSize: '2.2rem', letterSpacing: '0.5px' }}>{detailTitle}</h1>

                                        {entry.entityType === 'item' ? (
                                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                                {(entry.description && entry.description !== 'NA') ? entry.description : 'Choose a variation and add this item to your pockets.'}
                                            </p>
                                        ) : (
                                            <p className="text-muted small mb-0" style={{ fontSize: '0.95rem' }}>
                                                Explore {entry.name}'s personality, profile, and house details.
                                            </p>
                                        )}
                                    </div>

                                    {entry.entityType === 'villager' && (villagerData?.quote || villagerData?.nh_details?.quote) && (
                                        <div className="p-3 rounded-4 bg-cream border-2 border-success border-opacity-25 shadow-sm mb-4">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <i className="fa-solid fa-quote-left text-nook opacity-75"></i>
                                                <span className="x-small fw-black text-nook tracking-wide text-uppercase" style={{ fontSize: '0.65rem' }}>Quote</span>
                                            </div>
                                            <p className="fst-italic fw-bold text-dark mb-0 ms-4" style={{ fontFamily: 'var(--font-accent)', fontSize: '0.9rem' }}>
                                                "{villagerData?.quote || villagerData?.nh_details?.quote}"
                                            </p>
                                        </div>
                                    )}
                                    {(inOrderQty > 0 || inDropQty > 0) && (
                                        <div className="alert rounded-4 py-3 px-4 mb-4 small border-2" style={{ background: '#f0fdf4', borderColor: '#88e0a0', color: '#1e7e34' }} role="status">
                                            <i className="fa-solid fa-basket-shopping me-2 fw-black"></i>
                                            {inOrderQty > 0 && <span>Order: <strong>{entry.entityType === 'villager' ? entry.name : `${inOrderQty} × ${entry.name}`}</strong>{inDropQty > 0 ? '  ·  ' : ''}</span>}
                                            {inDropQty > 0 && <span>Drop: <strong>{entry.entityType === 'villager' ? entry.name : `${inDropQty} × ${entry.name}`}</strong></span>}
                                        </div>
                                    )}

                                    <div className="d-flex flex-column flex-sm-row gap-2 mb-2">
                                        {/* Add to Order */}
                                        <button
                                            type="button"
                                            onClick={addToOrder}
                                            className="btn rounded-pill px-4 py-2 fw-black flex-grow-1 transition-all"
                                            disabled={totalOrderCount >= 40}
                                            style={{
                                                background: totalOrderCount >= 40
                                                    ? '#f8f9fa'
                                                    : 'linear-gradient(135deg, #37b06d 0%, #2ea466 100%)',
                                                color: totalOrderCount >= 40 ? '#adb5bd' : 'white',
                                                border: 'none',
                                                boxShadow: totalOrderCount >= 40 ? 'none' : '0 4px 12px rgba(55,176,109,0.3)',
                                                cursor: totalOrderCount >= 40 ? 'not-allowed' : 'pointer',
                                                fontSize: '0.95rem'
                                            }}
                                            onMouseEnter={(e) => { if (totalOrderCount < 40) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(55,176,109,0.4)'; } }}
                                            onMouseLeave={(e) => { if (totalOrderCount < 40) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(55,176,109,0.3)'; } }}
                                        >
                                            <i className="fa-solid fa-basket-shopping me-2"></i>
                                            {totalOrderCount >= 40 ? 'Order Full (40/40)' : `Add to Order${inOrderQty > 0 && entry.entityType !== 'villager' ? ` (${inOrderQty})` : ''}`}
                                        </button>
                                        {/* Add to Drop */}
                                        <button
                                            type="button"
                                            onClick={addToDrop}
                                            className="btn rounded-pill px-4 py-2 fw-black flex-grow-1 transition-all"
                                            disabled={totalDropCount >= 9}
                                            style={{
                                                background: totalDropCount >= 9
                                                    ? '#f8f9fa'
                                                    : 'linear-gradient(135deg, #5bc0de 0%, #31b0d5 100%)',
                                                color: totalDropCount >= 9 ? '#adb5bd' : 'white',
                                                border: 'none',
                                                boxShadow: totalDropCount >= 9 ? 'none' : '0 4px 12px rgba(91,192,222,0.3)',
                                                cursor: totalDropCount >= 9 ? 'not-allowed' : 'pointer',
                                                fontSize: '0.95rem'
                                            }}
                                            onMouseEnter={(e) => { if (totalDropCount < 9) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(91,192,222,0.4)'; } }}
                                            onMouseLeave={(e) => { if (totalDropCount < 9) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,192,222,0.3)'; } }}
                                        >
                                            <i className="fa-solid fa-box-open me-2"></i>
                                            {totalDropCount >= 9 ? 'Drop Full (9/9)' : `Add to Drop${inDropQty > 0 && entry.entityType !== 'villager' ? ` (${inDropQty})` : ''}`}
                                        </button>
                                    </div>

                                    <div className="text-center mt-2">
                                        <button
                                            type="button"
                                            onClick={handleBackToCatalog}
                                            className="btn btn-link text-muted p-0 x-small fw-bold text-decoration-none"
                                            title="Return to your saved spot in the catalog"
                                        >
                                            <i className="fa-solid fa-arrow-left me-1 text-nook"></i> Return to Catalog (Spot Saved)
                                        </button>
                                    </div>

                                    {detailStatus && (
                                        <div ref={detailStatusRef} tabIndex={-1} aria-live="polite" className="alert rounded-4 py-3 px-4 mt-4 mb-0 small border-2" style={{ background: '#f0fdf4', borderColor: '#88e0a0', color: '#1e7e34' }} role="alert">
                                            <i className="fa-solid fa-circle-check me-2 fw-black"></i>{detailStatus}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-0">
                            {entry.entityType === 'item' ? (
                                <>

                                    {entry.variations && entry.variations.length > 0 && (
                                        <div className="mb-3 p-4 rounded-4 bg-light-green border-2" style={{ borderColor: '#88e0a0' }}>
                                            <label className="fw-black small text-nook mb-3 d-block" style={{ fontSize: '0.95rem' }}>
                                                <i className="fa-solid fa-palette me-2"></i>Choose a variation
                                            </label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {(entry.variations || []).map((variant) => {
                                                    const variantKey = getVariantKey(variant);
                                                    const variantText = getVariantLabel(variant) || 'Default';
                                                    const isSelected = variantKey === selectedVariantKey;
                                                    const thumbUrl = variant.imageUrl || entry.image;

                                                    if (thumbUrl) {
                                                        return (
                                                            <button
                                                                key={variantKey}
                                                                type="button"
                                                                onClick={() => handleVariantSelect(variantKey)}
                                                                className={`variant-thumb-btn btn p-2 rounded-3 d-flex flex-column align-items-center gap-1 ${isSelected ? 'variant-thumb-btn--selected' : 'btn-outline-secondary'}`}
                                                                title={variantText}
                                                                aria-pressed={isSelected}
                                                                aria-label={`Select variation ${variantText}`}
                                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVariantSelect(variantKey); } }}
                                                            >
                                                                <div className="ratio ratio-1x1" style={{ width: '48px' }}>
                                                                    <img src={thumbUrl} alt={variantText} className="w-100 h-100 object-fit-contain rounded-3" />
                                                                </div>
                                                                <span className="x-small fw-bold text-truncate" style={{ maxWidth: '72px' }}>{variantText}</span>
                                                            </button>
                                                        );
                                                    }

                                                    return (
                                                        <button
                                                            key={variantKey}
                                                            type="button"
                                                            onClick={() => handleVariantSelect(variantKey)}
                                                            className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${isSelected ? 'bg-nook-green text-white border-0' : 'btn-outline-secondary text-dark border-2'}`}
                                                            aria-pressed={isSelected}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVariantSelect(variantKey); } }}
                                                            style={isSelected ? { boxShadow: '0 3px 8px rgba(40, 167, 69, 0.3)' } : {}}
                                                        >
                                                            {variantText}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white rounded-4 p-4 mb-2 border shadow-sm">
                                        <h3 className="h6 fw-black text-nook mb-2 text-uppercase tracking-wide" style={{ fontSize: '0.8rem' }}>
                                            <i className="fa-solid fa-list-ul me-2 opacity-75"></i>Item Properties
                                        </h3>
                                        <div className="row g-4">
                                            <div className="col-6 col-md-3">
                                                <span className="x-small fw-bold text-muted d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-tag opacity-50"></i>Category
                                                </span>
                                                <div className="fw-black text-nook text-truncate" style={{ fontSize: '1rem' }} title={entry.category}>{entry.category || 'None'}</div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <span className="x-small fw-bold text-muted d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-palette opacity-50"></i>Theme
                                                </span>
                                                <div className="fw-black text-nook text-truncate" style={{ fontSize: '1rem' }} title={entry.theme}>{entry.theme || 'None'}</div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <span className="x-small fw-bold text-muted d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-layer-group opacity-50"></i>Series
                                                </span>
                                                <div className="fw-black text-nook text-truncate" style={{ fontSize: '1rem' }} title={entry.series}>{entry.series || 'None'}</div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <span className="x-small fw-bold text-muted d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-swatchbook opacity-50"></i>Colour
                                                </span>
                                                <div className="fw-black text-nook text-truncate" style={{ fontSize: '1rem' }} title={entry.colour}>{entry.colour || 'None'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Structured Villager Info */}
                                    <div className="bg-white rounded-4 p-4 mb-4 border shadow-sm">
                                        <div className="row g-4">
                                            {/* Column 1: Core Info & Personality */}
                                            <div className="col-12 col-md-6">
                                                <h3 className="h6 fw-black text-nook mb-3 text-uppercase tracking-wide" style={{ fontSize: '0.8rem' }}><i className="fa-solid fa-address-card me-2 opacity-75"></i>Profile</h3>
                                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                                                    <li className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-muted fw-semibold">Species</span>
                                                        <span className="fw-black text-dark">{villagerData?.species || entry.theme || 'Unknown'}</span>
                                                    </li>
                                                    <li className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-muted fw-semibold">Personality</span>
                                                        <span className="fw-black text-dark">
                                                            {villagerData?.personality || entry.category}
                                                            {villagerData?.nh_details?.['sub-personality'] ? ` (Sub ${villagerData.nh_details['sub-personality']})` : ''}
                                                        </span>
                                                    </li>
                                                    <li className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-muted fw-semibold">Gender</span>
                                                        <span className="fw-black text-dark">{villagerData?.gender || entry.interactivity || 'Unknown'}</span>
                                                    </li>
                                                    <li className="d-flex justify-content-between border-bottom pb-2">
                                                        <span className="text-muted fw-semibold">Catchphrase</span>
                                                        <span className="fw-black text-nook">"{villagerData?.phrase || villagerData?.nh_details?.catchphrase || 'arfer'}"</span>
                                                    </li>
                                                    {(villagerData?.birthday_month || villagerData?.birthday_day) && (
                                                        <li className="d-flex justify-content-between pb-1">
                                                            <span className="text-muted fw-semibold">Birthday</span>
                                                            <span className="fw-black text-dark">{villagerData.birthday_month} {villagerData.birthday_day}</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            {/* Column 2: House & Details */}
                                            <div className="col-12 col-md-6">
                                                <h3 className="h6 fw-black text-nook mb-3 text-uppercase tracking-wide" style={{ fontSize: '0.8rem' }}><i className="fa-solid fa-house me-2 opacity-75"></i>Details & House</h3>
                                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                                                    {villagerData?.nh_details?.hobby && (
                                                        <li className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted fw-semibold">Hobby</span>
                                                            <span className="fw-black text-dark">{villagerData.nh_details.hobby}</span>
                                                        </li>
                                                    )}
                                                    {villagerData?.nh_details?.house_flooring && (
                                                        <li className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted fw-semibold">Flooring</span>
                                                            <span className="fw-black text-dark">{villagerData.nh_details.house_flooring}</span>
                                                        </li>
                                                    )}
                                                    {villagerData?.nh_details?.house_wallpaper && (
                                                        <li className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted fw-semibold">Wallpaper</span>
                                                            <span className="fw-black text-dark">{villagerData.nh_details.house_wallpaper}</span>
                                                        </li>
                                                    )}
                                                    {villagerData?.nh_details?.house_music && (
                                                        <li className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted fw-semibold">Music</span>
                                                            <span className="fw-black text-dark">
                                                                <i className="fa-solid fa-music me-1 text-primary"></i>
                                                                {villagerData.nh_details.house_music}
                                                            </span>
                                                        </li>
                                                    )}
                                                    {villagerData?.nh_details?.fav_colors && villagerData.nh_details.fav_colors.length > 0 && (
                                                        <li className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted fw-semibold">Colors</span>
                                                            <span className="fw-black text-dark">{villagerData.nh_details.fav_colors.join(', ')}</span>
                                                        </li>
                                                    )}
                                                    {villagerData?.nh_details?.fav_styles && villagerData.nh_details.fav_styles.length > 0 && (
                                                        <li className="d-flex justify-content-between pb-1">
                                                            <span className="text-muted fw-semibold">Styles</span>
                                                            <span className="fw-black text-dark">{villagerData.nh_details.fav_styles.join(', ')}</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Previews Tabs (Interior / Exterior / Photo) */}
                                    {(villagerData?.nh_details?.house_interior_url || villagerData?.nh_details?.house_exterior_url || villagerData?.nh_details?.photo_url) && (
                                        <div className="mb-4 p-4 rounded-4 bg-white border shadow-sm">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                                <span className="fw-black small text-nook text-uppercase tracking-wide">
                                                    <i className="fa-solid fa-images me-2"></i>Image Previews
                                                </span>
                                                <div className="btn-group btn-group-sm rounded-pill p-1 bg-light border" role="group" aria-label="House image previews">
                                                    {villagerData.nh_details?.house_interior_url && (
                                                        <button
                                                            type="button"
                                                            className={`btn rounded-pill px-3 fw-bold ${activeHouseTab === 'interior' ? 'bg-nook-green text-white border-0 shadow-sm' : 'btn-light text-muted border-0'}`}
                                                            onClick={() => setActiveHouseTab('interior')}
                                                        >
                                                            Interior
                                                        </button>
                                                    )}
                                                    {villagerData.nh_details?.house_exterior_url && (
                                                        <button
                                                            type="button"
                                                            className={`btn rounded-pill px-3 fw-bold ${activeHouseTab === 'exterior' ? 'bg-nook-green text-white border-0 shadow-sm' : 'btn-light text-muted border-0'}`}
                                                            onClick={() => setActiveHouseTab('exterior')}
                                                        >
                                                            Exterior
                                                        </button>
                                                    )}
                                                    {villagerData.nh_details?.photo_url && (
                                                        <button
                                                            type="button"
                                                            className={`btn rounded-pill px-3 fw-bold ${activeHouseTab === 'photo' ? 'bg-nook-green text-white border-0 shadow-sm' : 'btn-light text-muted border-0'}`}
                                                            onClick={() => setActiveHouseTab('photo')}
                                                        >
                                                            Photo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="ratio ratio-16x9 bg-light rounded-4 overflow-hidden border">
                                                <img
                                                    src={
                                                        activeHouseTab === 'interior'
                                                            ? villagerData.nh_details?.house_interior_url
                                                            : activeHouseTab === 'exterior'
                                                                ? villagerData.nh_details?.house_exterior_url
                                                                : villagerData.nh_details?.photo_url
                                                    }
                                                    alt={`${entry.name} ${activeHouseTab}`}
                                                    className="w-100 h-100 object-fit-contain p-2"
                                                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                        </div>

                        <div className="mt-4">
                            <CatalogAvailability
                                mode={entry.entityType === 'villager' ? 'villager' : 'item'}
                                query={entry.name}
                            />
                        </div>
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
                                showTerminal={true}
                            />
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
};

export default CatalogDetail;