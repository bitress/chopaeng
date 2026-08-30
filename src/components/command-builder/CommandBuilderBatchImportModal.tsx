import React, { useState, useMemo } from 'react';
import type { CatalogEntity } from '../../data/commandBuilderData';
import type { PocketBundleItem } from '../../data/pocketBundles';
import { parseItemCodes, type ParsedItemCodeResult } from '../../utils/itemCodeParser';
import { playChimeClick } from '../../utils/kkAudioSynthesizer';
import { ORDER_MAX, DROP_MAX } from '../../constants/limits';

interface CommandBuilderBatchImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    catalogItems: CatalogEntity[];
    onImportOrder: (items: PocketBundleItem[], mode: 'replace' | 'append') => void;
    onImportDrop: (items: PocketBundleItem[], mode: 'replace' | 'append') => void;
    currentOrderCount: number;
    currentDropCount: number;
}

const SAMPLE_COMMANDS = [
    {
        label: '👑 Max Wealth Pack',
        code: '!order 14BBx20 08A4x20',
        desc: '20x Royal Crowns + 20x 99k Bells',
    },
    {
        label: '🎫 NMT Flight Pack',
        code: '!order 16DBx40',
        desc: '40x Nook Miles Tickets',
    },
    {
        label: '⚒️ Gold Tools & Mats',
        code: '!order 0DB5 0DB6 0DB7 0DB8 0DB9 0DBA 0BD4x10 08A4x10 16DBx10',
        desc: '6 Golden Tools + Gold Nuggets + Bells + NMTs',
    },
    {
        label: '🐱 Raymond Villager',
        code: '!order villager:raymond 16DBx10',
        desc: 'Raymond + 10x NMTs',
    },
];

export const CommandBuilderBatchImportModal: React.FC<CommandBuilderBatchImportModalProps> = ({
    isOpen,
    onClose,
    catalogItems,
    onImportOrder,
    onImportDrop,
    currentOrderCount,
    currentDropCount,
}) => {
    const [rawInput, setRawInput] = useState('');
    const [targetPocket, setTargetPocket] = useState<'order' | 'drop'>('order');
    const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

    const parsedResult: ParsedItemCodeResult = useMemo(() => {
        return parseItemCodes(rawInput, catalogItems);
    }, [rawInput, catalogItems]);

    if (!isOpen) return null;

    const maxLimit = targetPocket === 'order' ? ORDER_MAX : DROP_MAX;
    const currentCount = targetPocket === 'order' ? currentOrderCount : currentDropCount;
    const projectedSlots = importMode === 'replace' ? parsedResult.totalSlots : currentCount + parsedResult.totalSlots;
    const isExceeded = projectedSlots > maxLimit;

    const handleExecuteImport = () => {
        if (parsedResult.items.length === 0) return;
        playChimeClick();

        if (targetPocket === 'order') {
            onImportOrder(parsedResult.items, importMode);
        } else {
            onImportDrop(parsedResult.items, importMode);
        }

        onClose();
        setRawInput('');
    };

    return (
        <div
            className="modal show d-block animate-fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1060, backdropFilter: 'blur(6px)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="batch-import-title"
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--paper, #fdfbf7)' }}>
                    {/* Header */}
                    <div
                        className="modal-header border-bottom px-4 py-3 text-white"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-white text-success rounded-circle p-2 d-flex align-items-center justify-content-center shadow-xs" style={{ width: 36, height: 36 }}>
                                <i className="fa-solid fa-file-import" aria-hidden="true" />
                            </div>
                            <div>
                                <h5 className="modal-title fw-black mb-0" id="batch-import-title">
                                    Batch Hex / SysBot Command Importer
                                </h5>
                                <span className="tiny-text text-white-50">
                                    Paste raw hex codes, !order commands, item lists, or multipliers
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            aria-label="Close modal"
                        />
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        {/* Quick Preset Samples */}
                        <div className="mb-3">
                            <label className="form-label tiny-text fw-bold text-uppercase text-muted mb-1">
                                Quick Preset Examples (Click to test)
                            </label>
                            <div className="d-flex flex-wrap gap-2">
                                {SAMPLE_COMMANDS.map((sample, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="btn btn-sm btn-light border rounded-pill fw-bold text-dark px-3 py-1 shadow-2xs"
                                        style={{ fontSize: '0.78rem' }}
                                        onClick={() => {
                                            playChimeClick();
                                            setRawInput(sample.code);
                                        }}
                                        title={sample.desc}
                                    >
                                        {sample.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label htmlFor="batch-input-area" className="form-label tiny-text fw-bold text-uppercase text-muted mb-0">
                                    Input Commands, Hexes, or Names
                                </label>
                                {rawInput && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                                        onClick={() => setRawInput('')}
                                    >
                                        <i className="fa-solid fa-trash-can me-1" /> Clear
                                    </button>
                                )}
                            </div>
                            <textarea
                                id="batch-input-area"
                                className="form-control font-monospace rounded-3 border p-3"
                                rows={4}
                                placeholder="Paste here (e.g. !order 14BBx10 16DBx20 08A4x10, or 'Royal Crown x5', or 'villager:raymond')..."
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                                style={{ fontSize: '0.85rem' }}
                            />
                        </div>

                        {/* Destination & Mode Options */}
                        <div className="row g-2 mb-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label tiny-text fw-bold text-uppercase text-muted mb-1">
                                    Target Pocket Destination
                                </label>
                                <div className="btn-group w-100" role="group" aria-label="Target Pocket">
                                    <button
                                        type="button"
                                        className={`btn btn-sm fw-bold rounded-start-pill ${targetPocket === 'order' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setTargetPocket('order')}
                                    >
                                        <i className="fa-solid fa-bag-shopping me-1" /> Order Bot (40 Max)
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm fw-bold rounded-end-pill ${targetPocket === 'drop' ? 'btn-info text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setTargetPocket('drop')}
                                    >
                                        <i className="fa-solid fa-arrows-down-to-line me-1" /> Drop Bot (9 Max)
                                    </button>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label tiny-text fw-bold text-uppercase text-muted mb-1">
                                    Import Behavior
                                </label>
                                <div className="btn-group w-100" role="group" aria-label="Import Behavior">
                                    <button
                                        type="button"
                                        className={`btn btn-sm fw-bold rounded-start-pill ${importMode === 'replace' ? 'btn-dark text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setImportMode('replace')}
                                    >
                                        <i className="fa-solid fa-rotate me-1" /> Replace Pockets
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm fw-bold rounded-end-pill ${importMode === 'append' ? 'btn-dark text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setImportMode('append')}
                                    >
                                        <i className="fa-solid fa-plus me-1" /> Append to Current
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Live Parser Feedback */}
                        {rawInput.trim() && (
                            <div className="card rounded-3 border bg-light p-3 mb-2 animate-fade">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-list-check text-success" />
                                        <span>{parsedResult.parsedSummary}</span>
                                    </div>
                                    <span className={`badge rounded-pill ${isExceeded ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                                        {projectedSlots} / {maxLimit} Slots
                                    </span>
                                </div>

                                {isExceeded && (
                                    <div className="alert alert-warning py-2 px-3 small rounded-3 mb-2">
                                        <i className="fa-solid fa-triangle-exclamation me-1" />
                                        Exceeds max limit ({maxLimit} slots). Slots beyond {maxLimit} will be clipped when importing.
                                    </div>
                                )}

                                {/* Preview of Parsed Items */}
                                {parsedResult.items.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 max-h-40 overflow-y-auto pt-1 pb-1" style={{ maxHeight: '160px' }}>
                                        {parsedResult.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="badge bg-white text-dark border p-2 rounded-3 d-flex align-items-center gap-2 shadow-2xs"
                                                style={{ fontSize: '0.78rem' }}
                                            >
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={22}
                                                        height={22}
                                                        className="rounded-circle object-fit-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <span className="fw-bold">{item.name}</span>
                                                <span className="badge bg-dark text-white rounded-pill px-2">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Unrecognized Tokens */}
                                {parsedResult.unrecognizedTokens.length > 0 && (
                                    <div className="mt-2 pt-2 border-top">
                                        <span className="tiny-text fw-bold text-danger text-uppercase d-block mb-1">
                                            Unrecognized Tokens ({parsedResult.unrecognizedTokens.length})
                                        </span>
                                        <div className="d-flex flex-wrap gap-1">
                                            {parsedResult.unrecognizedTokens.map((t, idx) => (
                                                <span key={idx} className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill font-monospace">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
                        <button type="button" className="btn btn-light rounded-pill px-3 fw-bold" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-nook text-white rounded-pill px-4 fw-bold shadow-2xs d-flex align-items-center gap-2"
                            disabled={parsedResult.items.length === 0}
                            onClick={handleExecuteImport}
                        >
                            <i className="fa-solid fa-check" />
                            <span>Import {parsedResult.totalSlots} Slots into {targetPocket === 'order' ? 'Order Pockets' : 'Drop Pockets'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandBuilderBatchImportModal;
