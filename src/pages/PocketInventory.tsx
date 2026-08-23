import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useCommandBuilderPockets } from '../hooks/useCommandBuilderPockets';
import { useCatalogData } from '../hooks/useCatalogData';
import { VisualPocketGrid } from '../components/command-builder/VisualPocketGrid';
import { parseItemCodes } from '../utils/itemCodeParser';
import { playChimeClick } from '../utils/kkAudioSynthesizer';
import { CommandBuilderPocketBundlesModal } from '../components/command-builder/CommandBuilderPocketBundlesModal';
import { CommandBuilderShareModal } from '../components/command-builder/CommandBuilderShareModal';
import { QuickAddItemModal } from '../components/command-builder/QuickAddItemModal';
import { SmartFillDropdown } from '../components/command-builder/SmartFillDropdown';

export const PocketInventory: React.FC = () => {
    const {
        orderItems,
        setOrderItems,
        dropItems,
        setDropItems,
        addItemToOrderPockets,
        addItemToDropPockets,
        decreaseOrderQuantity,
        increaseOrderQuantity,
        removeOrderItem,
        decreaseDropQuantity,
        increaseDropQuantity,
        removeDropItem,
        canIncreaseOrder,
        canIncreaseDrop,
        totalOrderCount,
        totalDropCount,
        handleFillTickets,
        handleFillCrowns,
        handleFillBells,
        handleMaximizeStacks,
        handleSortPockets,
        handleFillRemaining,
        loadBundleIntoOrder,
        loadBundleIntoDrop,
        orderCommandText,
        dropCommandText,
        copyOrderStatus,
        copyDropStatus,
        handleCopyOrder,
        handleCopyDrop,
        reorderOrderPockets,
        reorderDropPockets,
    } = useCommandBuilderPockets();

    const { data: catalogData } = useCatalogData();

    // Modals
    const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
    const [quickAddTarget, setQuickAddTarget] = useState<'order' | 'drop'>('order');
    const [bundlesModalOpen, setBundlesModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [batchPasteModalOpen, setBatchPasteModalOpen] = useState(false);
    const [batchPasteText, setBatchPasteText] = useState('');
    const [copiedFlowType, setCopiedFlowType] = useState<'order' | 'drop' | null>(null);

    // Live parse batch input
    const parsedBatch = useMemo(() => {
        return parseItemCodes(batchPasteText, catalogData?.all || []);
    }, [batchPasteText, catalogData]);

    const handleCopyOrderWithFlow = () => {
        handleCopyOrder();
        setCopiedFlowType('order');
        playChimeClick();
    };

    const handleCopyDropWithFlow = () => {
        handleCopyDrop();
        setCopiedFlowType('drop');
        playChimeClick();
    };

    const handleApplyBatchPaste = (target: 'order' | 'drop', mode: 'replace' | 'append') => {
        if (parsedBatch.items.length === 0) return;
        const bundleItems = parsedBatch.items.map((item) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            image: item.image,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
        }));

        if (target === 'order') {
            loadBundleIntoOrder(bundleItems, mode === 'replace' ? 'replace' : 'merge');
        } else {
            loadBundleIntoDrop(bundleItems, mode === 'replace' ? 'replace' : 'merge');
        }
        setBatchPasteModalOpen(false);
        setBatchPasteText('');
        playChimeClick();
    };

    return (
        <div className="pocket-inventory-page py-4 px-3 px-md-5" style={{ backgroundColor: '#fbfcf9', minHeight: '100vh' }}>
            <Helmet>
                <title>Full Pocket Inventory & Command Builder | Chopaeng</title>
                <meta name="description" content="Large in-game style Animal Crossing pocket inventory grid with 40-slot order bot, 9-slot drop radius, and villager adoption showcase." />
            </Helmet>

            <div className="container-fluid" style={{ maxWidth: '1400px' }}>
                {/* Breadcrumb & Header */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item">
                                    <Link to="/" className="text-decoration-none text-muted">Home</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to="/command-builder" className="text-decoration-none text-muted">Command Builder</Link>
                                </li>
                                <li className="breadcrumb-item active fw-bold text-success" aria-current="page">
                                    Pocket Inventory
                                </li>
                            </ol>
                        </nav>
                        <h1 className="h2 fw-black text-dark mb-1 ac-font d-flex align-items-center gap-2">
                            <i className="fa-solid fa-boxes-packing text-success"></i>
                            Pocket Inventory Manager
                        </h1>
                        <p className="small text-muted mb-0">
                            Full-screen visual Animal Crossing inventory grid. Manage your 40-slot Order Bot pockets, 9-slot Drop Bot radius, and Villager adoptions.
                        </p>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-nook text-white rounded-pill fw-bold btn-sm shadow-sm"
                            onClick={() => {
                                setQuickAddTarget('order');
                                setQuickAddModalOpen(true);
                                playChimeClick();
                            }}
                        >
                            <i className="fa-solid fa-plus me-1"></i>
                            Add Items
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-success rounded-pill fw-bold btn-sm shadow-xs"
                            onClick={() => setBatchPasteModalOpen(true)}
                        >
                            <i className="fa-solid fa-paste me-1"></i>
                            Batch Paste Codes
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill fw-bold btn-sm shadow-2xs"
                            onClick={() => setBundlesModalOpen(true)}
                        >
                            <i className="fa-solid fa-box-open me-1"></i>
                            Bundles
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill fw-bold btn-sm shadow-xs"
                            onClick={() => setShareModalOpen(true)}
                        >
                            <i className="fa-solid fa-share-nodes me-1"></i>
                            Share Pockets
                        </button>

                        <Link to="/command-builder" className="btn btn-dark rounded-pill fw-bold btn-sm">
                            <i className="fa-solid fa-magnifying-glass me-1"></i>
                            Catalog
                        </Link>
                    </div>
                </div>

                {/* Main 2-Column Responsive Layout */}
                <div className="row g-4">
                    {/* LEFT COLUMN: Large In-Game Visual Grid & Tools */}
                    <div className="col-lg-8">
                        {/* Capacity Overview Banner */}
                        <div className="card rounded-4 border-0 shadow-sm p-3 mb-4 bg-white">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-6 border-end-md">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold text-dark d-flex align-items-center gap-1">
                                            <i className="fa-solid fa-cart-flatbed text-success"></i>
                                            Order Bot Capacity
                                        </span>
                                        <span className={`badge rounded-pill ${totalOrderCount >= 40 ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                                            {totalOrderCount} / 40 Slots
                                        </span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                        <div
                                            className={`progress-bar transition-all ${totalOrderCount >= 40 ? 'bg-danger' : 'bg-success'}`}
                                            role="progressbar"
                                            style={{ width: `${(totalOrderCount / 40) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold text-dark d-flex align-items-center gap-1">
                                            <i className="fa-solid fa-layer-group text-info"></i>
                                            Drop Bot Ground Radius
                                        </span>
                                        <span className={`badge rounded-pill ${totalDropCount >= 9 ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                            {totalDropCount} / 9 Ground Spots
                                        </span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                        <div
                                            className="progress-bar bg-info"
                                            role="progressbar"
                                            style={{ width: `${(totalDropCount / 9) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Visual Pocket Grid Component */}
                        <VisualPocketGrid
                            orderPockets={orderItems}
                            dropPockets={dropItems}
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
                            onMaximizeStacks={handleMaximizeStacks}
                            onSortPockets={handleSortPockets}
                            onReorderOrderPockets={reorderOrderPockets}
                            onReorderDropPockets={reorderDropPockets}
                            onOpenAddItem={(target) => {
                                setQuickAddTarget(target);
                                setQuickAddModalOpen(true);
                                playChimeClick();
                            }}
                        />

                        {/* Smart Tools & Presets Card */}
                        <div className="card rounded-4 border p-3 shadow-2xs bg-white mt-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <strong className="d-block text-dark small">Smart Fill Tools</strong>
                                    <span className="tiny-text text-muted">Auto-optimize your inventory layout</span>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    <SmartFillDropdown
                                        onFillNmt={handleFillTickets}
                                        onFillCrowns={handleFillCrowns}
                                        onFillBells={handleFillBells}
                                        onFillGold={() => handleFillRemaining('gold')}
                                        onFillRepeat={() => handleFillRemaining('repeat')}
                                        onMaximizeStacks={handleMaximizeStacks}
                                        onSortPockets={handleSortPockets}
                                        isOrderFull={totalOrderCount >= 40}
                                        hasItems={totalOrderCount > 0}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-white border rounded-pill fw-bold text-dark"
                                        onClick={() => {
                                            handleMaximizeStacks();
                                            playChimeClick();
                                        }}
                                    >
                                        <i className="fa-solid fa-layer-group text-success me-1"></i>
                                        Max Stacks
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-white border rounded-pill fw-bold text-dark"
                                        onClick={() => {
                                            handleSortPockets();
                                            playChimeClick();
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-down-a-z text-primary me-1"></i>
                                        Sort A-Z
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Terminal Commands & Detailed Bot Execution Flow */}
                    <div className="col-lg-4">
                        {/* Terminal Box */}
                        <div
                            className="card rounded-4 border-0 shadow-sm overflow-hidden mb-4"
                            style={{ backgroundColor: '#1c2420', color: '#ffffff' }}
                        >
                            <div
                                className="px-3 py-2 d-flex align-items-center justify-content-between"
                                style={{ background: 'linear-gradient(90deg, #18201b 0%, #202b24 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <div className="d-flex gap-1">
                                        <span className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#ff5f56' }} />
                                        <span className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#ffbd2e' }} />
                                        <span className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#27c93f' }} />
                                    </div>
                                    <span className="font-monospace text-light fw-bold small ms-1">
                                        <i className="fa-solid fa-terminal text-success me-1"></i>Bot Command Terminal
                                    </span>
                                </div>
                            </div>

                            <div className="p-3">
                                {/* Order Bot Command */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="badge rounded-pill fw-bold font-monospace x-small bg-success text-white">
                                            !order command ({totalOrderCount} items)
                                        </span>
                                    </div>
                                    <div
                                        className="p-2 rounded-3 font-monospace mb-2 text-break select-all"
                                        style={{
                                            backgroundColor: '#111713',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '0.78rem',
                                            maxHeight: '80px',
                                            overflowY: 'auto',
                                            color: '#a3e635',
                                        }}
                                    >
                                        {orderCommandText || <span className="text-muted fst-italic">&gt; Add items to generate command...</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn w-100 rounded-pill py-2 fw-bold btn-sm shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 ${
                                            copyOrderStatus === 'Copied!' ? 'btn-success text-white' : 'btn-light text-dark'
                                        }`}
                                        onClick={handleCopyOrderWithFlow}
                                        disabled={!orderCommandText}
                                    >
                                        <i className={`fa-solid ${copyOrderStatus === 'Copied!' ? 'fa-check' : 'fa-copy'}`}></i>
                                        <span>{copyOrderStatus === 'Copied!' ? 'Copied !order Command!' : 'Copy Order Command'}</span>
                                    </button>
                                </div>

                                {/* Drop Bot Command */}
                                <div className="pt-3 border-top border-secondary border-opacity-25">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="badge rounded-pill fw-bold font-monospace x-small bg-info text-dark">
                                            !drop command ({totalDropCount} items)
                                        </span>
                                    </div>
                                    <div
                                        className="p-2 rounded-3 font-monospace mb-2 text-break select-all"
                                        style={{
                                            backgroundColor: '#111713',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '0.78rem',
                                            maxHeight: '80px',
                                            overflowY: 'auto',
                                            color: '#38bdf8',
                                        }}
                                    >
                                        {dropCommandText || <span className="text-muted fst-italic">&gt; Add items to generate command...</span>}
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn w-100 rounded-pill py-2 fw-bold btn-sm shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 ${
                                            copyDropStatus === 'Copied!' ? 'btn-info text-dark' : 'btn-light text-dark'
                                        }`}
                                        onClick={handleCopyDropWithFlow}
                                        disabled={!dropCommandText}
                                    >
                                        <i className={`fa-solid ${copyDropStatus === 'Copied!' ? 'fa-check' : 'fa-copy'}`}></i>
                                        <span>{copyDropStatus === 'Copied!' ? 'Copied !drop Command!' : 'Copy Drop Command'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FLOW STEP INSTRUCTION CARDS (ORDER FLOW & DROP FLOW) */}
                        <div className="card rounded-4 border p-3 shadow-sm bg-white mb-3">
                            <h5 className="h6 fw-black text-dark mb-2 d-flex align-items-center gap-2">
                                <i className="fa-solid fa-route text-success"></i>
                                How Bot Delivery Works
                            </h5>

                            {/* ORDER BOT FLOW */}
                            <div className={`p-3 rounded-4 mb-3 border transition-all ${copiedFlowType === 'order' ? 'bg-success-subtle border-success' : 'bg-light'}`}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <strong className="small text-dark fw-bold d-flex align-items-center gap-1">
                                        <span className="badge bg-success text-white rounded-pill px-2">1</span>
                                        Order Bot Flow (40 Items / Villager)
                                    </strong>
                                    {copiedFlowType === 'order' && (
                                        <span className="badge bg-success text-white rounded-pill x-small animate-fade">
                                            ✓ Active Copy
                                        </span>
                                    )}
                                </div>

                                <ol className="tiny-text text-dark ps-3 mb-0" style={{ lineHeight: 1.6 }}>
                                    <li className="mb-1"><strong>Copy your <code>!order</code> command</strong> from the terminal above.</li>
                                    <li className="mb-1">Go to our Discord server's <strong>#order-bot</strong> channel.</li>
                                    <li className="mb-1">Paste & send your command. The bot will queue your request and DM you a private <strong>Dodo Code</strong>.</li>
                                    <li><strong>Empty your inventory pockets</strong> before departure and fly to the private island to collect your 40 items!</li>
                                </ol>
                            </div>

                            {/* DROP BOT FLOW */}
                            <div className={`p-3 rounded-4 border transition-all ${copiedFlowType === 'drop' ? 'bg-info-subtle border-info' : 'bg-light'}`}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <strong className="small text-dark fw-bold d-flex align-items-center gap-1">
                                        <span className="badge bg-info text-dark rounded-pill px-2">2</span>
                                        Drop Bot Flow (9 Ground Tiles)
                                    </strong>
                                    {copiedFlowType === 'drop' && (
                                        <span className="badge bg-info text-dark rounded-pill x-small animate-fade">
                                            ✓ Active Copy
                                        </span>
                                    )}
                                </div>

                                <ol className="tiny-text text-dark ps-3 mb-0" style={{ lineHeight: 1.6 }}>
                                    <li className="mb-1"><strong>Copy your <code>!drop</code> command</strong> with up to 9 item codes.</li>
                                    <li className="mb-1">Fly to any active <strong>Drop Bot Island</strong> using the live Dodo Code.</li>
                                    <li className="mb-1">Stand on an open, clear <strong>3×3 tile ground area</strong>.</li>
                                    <li>Send <code>!drop</code> in the channel or in-game chat — the bot will drop all 9 items around your feet!</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BATCH PASTE & PARSE MODAL */}
            {batchPasteModalOpen && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)', zIndex: 1070 }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                            <div className="modal-header border-0 bg-dark text-white px-4 py-3 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-success rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                                        <i className="fa-solid fa-paste text-white small"></i>
                                    </div>
                                    <div>
                                        <h5 className="modal-title fw-black mb-0">Batch Paste Item Codes</h5>
                                        <span className="tiny-text opacity-75">Auto-parse bot commands, hexes, and multipliers</span>
                                    </div>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setBatchPasteModalOpen(false)} />
                            </div>

                            <div className="modal-body p-4 bg-light">
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-dark">
                                        Paste Command or Hex List:
                                    </label>
                                    <textarea
                                        className="form-control font-monospace border-2 rounded-3 text-dark"
                                        rows={5}
                                        style={{ fontSize: '0.85rem' }}
                                        placeholder={"!order 1431 3438 0BF1 11F4\nor\n1431x10, 3438x20, Gold Nugget x10"}
                                        value={batchPasteText}
                                        onChange={(e) => setBatchPasteText(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="bg-white rounded-4 border p-3 shadow-2xs mb-2">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="badge bg-success rounded-pill px-3 py-1 fw-bold">
                                            {parsedBatch.items.length} Item Types ({parsedBatch.totalSlots} Slots)
                                        </span>
                                        <span className="tiny-text text-muted fw-bold">{parsedBatch.parsedSummary}</span>
                                    </div>

                                    {parsedBatch.items.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                                            {parsedBatch.items.map((item, idx) => (
                                                <div key={idx} className="badge bg-light text-dark border rounded-pill px-3 py-2 d-flex align-items-center gap-2">
                                                    {item.image && <img src={item.image} alt={item.name} style={{ width: 20, height: 20, objectFit: 'contain' }} />}
                                                    <span className="font-monospace text-muted x-small">[{item.itemId}]</span>
                                                    <span className="fw-bold">{item.name}</span>
                                                    <span className="badge bg-dark text-white rounded-pill px-2">×{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 text-muted tiny-text">
                                            Paste item codes above to preview.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer border-0 bg-white px-4 py-3 d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold btn-sm" onClick={() => setBatchPasteModalOpen(false)}>
                                    Cancel
                                </button>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-success rounded-pill px-3 fw-bold btn-sm"
                                        disabled={parsedBatch.items.length === 0}
                                        onClick={() => handleApplyBatchPaste('order', 'append')}
                                    >
                                        + Append to Order ({parsedBatch.items.length})
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-nook text-white rounded-pill px-4 fw-bold btn-sm shadow-sm"
                                        disabled={parsedBatch.items.length === 0}
                                        onClick={() => handleApplyBatchPaste('order', 'replace')}
                                    >
                                        Replace Order Pockets ({parsedBatch.items.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK ADD ITEM MODAL */}
            <QuickAddItemModal
                isOpen={quickAddModalOpen}
                onClose={() => setQuickAddModalOpen(false)}
                catalog={catalogData?.all || []}
                initialTarget={quickAddTarget}
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
                orderItems={orderItems}
                dropItems={dropItems}
            />

            {/* POCKET BUNDLES MODAL */}
            <CommandBuilderPocketBundlesModal
                isOpen={bundlesModalOpen}
                onClose={() => setBundlesModalOpen(false)}
                currentOrderPockets={orderItems}
                currentDropPockets={dropItems}
                onApplyBundleToOrder={(items, mode) => loadBundleIntoOrder(items, mode)}
                onApplyBundleToDrop={(items, mode) => loadBundleIntoDrop(items, mode)}
            />

            {/* SHARE POCKETS MODAL */}
            <CommandBuilderShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                orderPockets={orderItems}
                dropPockets={dropItems}
            />
        </div>
    );
};

export default PocketInventory;
