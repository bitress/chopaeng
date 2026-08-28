import { useState, useEffect, useMemo } from 'react';
import type { PocketItem } from '../../hooks/useCommandBuilderPockets';
import { createShortPocketShare } from '../../utils/pocketSharing';

interface CommandBuilderShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderPockets: Array<{ item: PocketItem; quantity: number }>;
    dropPockets: Array<{ item: PocketItem; quantity: number }>;
}

export const CommandBuilderShareModal = ({
    isOpen,
    onClose,
    orderPockets,
    dropPockets,
}: CommandBuilderShareModalProps) => {
    const [pocketName, setPocketName] = useState('My ACNH Pocket');
    const [shareUrl, setShareUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

    const orderCount = useMemo(() => orderPockets.reduce((s, p) => s + p.quantity, 0), [orderPockets]);
    const dropCount = useMemo(() => dropPockets.reduce((s, p) => s + p.quantity, 0), [dropPockets]);
    const totalItems = orderCount + dropCount;

    // Generate short share link when modal opens or name changes
    useEffect(() => {
        if (!isOpen || totalItems === 0) {
            setShareUrl('');
            return;
        }

        let isCancelled = false;
        setIsGenerating(true);

        const generate = async () => {
            try {
                const res = await createShortPocketShare(orderPockets, dropPockets, pocketName);
                if (!isCancelled) {
                    setShareUrl(res.url);
                }
            } catch {
                if (!isCancelled) {
                    setShareUrl(window.location.origin + '/command-builder');
                }
            } finally {
                if (!isCancelled) {
                    setIsGenerating(false);
                }
            }
        };

        const timer = setTimeout(generate, 300);
        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [isOpen, orderPockets, dropPockets, pocketName, totalItems]);

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch {
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
            <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content rounded-5 border-0 shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--paper, #fdfbf7)' }}>
                    
                    {/* Header */}
                    <div className="modal-header border-0 bg-white px-4 py-3 shadow-sm d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                                style={{ width: '40px', height: '40px', background: '#3b82f6' }}
                            >
                                <i className="fa-solid fa-share-nodes fs-5"></i>
                            </div>
                            <div>
                                <h2 className="modal-title h5 fw-black text-dark mb-0 ac-font">Share Pocket</h2>
                                <p className="tiny-text text-muted mb-0">Export & send your exact items to friends</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn-close rounded-circle p-2"
                            onClick={onClose}
                            aria-label="Close"
                        />
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {totalItems === 0 ? (
                            <div className="bg-white rounded-4 border p-4 text-center text-muted">
                                <i className="fa-solid fa-basket-shopping fs-2 mb-2 opacity-50"></i>
                                <p className="small mb-0">Your pockets are empty. Add items first before sharing!</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {/* Pocket Name */}
                                <div>
                                    <label className="form-label small fw-bold text-muted">Pocket Name (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-pill px-3 border shadow-sm"
                                        placeholder="e.g., My Dream Island Kit"
                                        value={pocketName}
                                        onChange={(e) => setPocketName(e.target.value)}
                                        maxLength={50}
                                    />
                                </div>

                                {/* Summary preview */}
                                <div className="bg-white rounded-4 p-3 border shadow-sm">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider">
                                            Pocket Contents
                                        </span>
                                        <div className="d-flex gap-2">
                                            <span className="badge bg-nook-green text-white rounded-pill x-small">
                                                Order: {orderCount}/40
                                            </span>
                                            {dropCount > 0 && (
                                                <span className="badge bg-info text-dark rounded-pill x-small">
                                                    Drop: {dropCount}/9
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview chips */}
                                    <div className="d-flex flex-wrap gap-1 overflow-auto" style={{ maxHeight: '120px' }}>
                                        {orderPockets.slice(0, 10).map((p) => (
                                            <span key={p.item.id} className="badge bg-light text-dark border rounded-pill x-small py-1 px-2">
                                                {p.item.name} ×{p.quantity}
                                            </span>
                                        ))}
                                        {orderPockets.length > 10 && (
                                            <span className="badge bg-light text-muted border rounded-pill x-small py-1 px-2">
                                                +{orderPockets.length - 10} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Generated Link box */}
                                <div>
                                    <label className="form-label small fw-bold text-muted">Shareable Link</label>
                                    <div className="input-group shadow-sm flex-nowrap">
                                        <input
                                            type="text"
                                            readOnly
                                            className="form-control rounded-start-pill bg-light font-monospace small border text-truncate min-w-0"
                                            value={isGenerating ? 'Generating short link...' : shareUrl}
                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                        />
                                        <button
                                            type="button"
                                            disabled={isGenerating || !shareUrl}
                                            className={`btn rounded-end-pill px-3 px-sm-4 fw-bold transition-all flex-shrink-0 ${
                                                copyStatus === 'copied' ? 'btn-success text-white' : 'btn-primary'
                                            }`}
                                            onClick={handleCopy}
                                        >
                                            {isGenerating ? (
                                                <i className="fa-solid fa-spinner fa-spin me-1" />
                                            ) : (
                                                <i className={`fa-solid ${copyStatus === 'copied' ? 'fa-check' : 'fa-copy'} me-1`} />
                                            )}
                                            {copyStatus === 'copied' ? 'Copied!' : isGenerating ? 'Generating...' : 'Copy Link'}
                                        </button>
                                    </div>
                                    <p className="tiny-text text-muted mt-2 mb-0">
                                        <i className="fa-solid fa-circle-info text-primary me-1"></i>
                                        Anyone opening this link will have these exact {totalItems} items loaded into their Command Builder pockets!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 bg-white px-4 py-3 d-flex justify-content-end">
                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold btn-sm" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
