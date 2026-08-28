import { useState, useRef, useEffect } from 'react';

interface SmartFillDropdownProps {
    onFillNmt: () => void;
    onFillCrowns: () => void;
    onFillBells: () => void;
    onFillGold: () => void;
    onFillRepeat: () => void;
    onMaximizeStacks: () => void;
    onSortPockets: () => void;
    isOrderFull: boolean;
    hasItems: boolean;
    align?: 'start' | 'end';
}

export const SmartFillDropdown = ({
    onFillNmt,
    onFillCrowns,
    onFillBells,
    onFillGold,
    onFillRepeat,
    onMaximizeStacks,
    onSortPockets,
    isOrderFull,
    hasItems,
    align = 'end',
}: SmartFillDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="position-relative d-inline-block" ref={dropdownRef}>
            {/* ── Trigger Button ────────────────────────────────────────────── */}
            <button
                type="button"
                className={`btn btn-sm rounded-pill fw-black px-3 py-2 shadow-2xs d-flex align-items-center gap-2 transition-all text-nowrap ${
                    isOpen
                        ? 'btn-success text-white shadow-sm ring-2 ring-success-subtle'
                        : 'btn-outline-success bg-white text-success border border-success-subtle hover-shadow'
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                title="Smart Pocket Optimizer & 1-Click Autofill"
                style={{
                    fontSize: '0.82rem',
                    letterSpacing: '0.2px',
                    borderColor: isOpen ? '#198754' : 'rgba(25, 135, 84, 0.35)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '34px',
                }}
            >
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: isOpen ? 'rgba(255,255,255,0.25)' : '#e8f7ec',
                        color: isOpen ? '#ffffff' : '#198754',
                    }}
                >
                    <i className="fa-solid fa-wand-magic-sparkles x-small"></i>
                </div>
                <span>Smart Tools</span>
                <i
                    className={`fa-solid fa-chevron-down x-small transition-transform flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    style={{
                        transition: 'transform 0.25s ease',
                        opacity: 0.7,
                    }}
                ></i>
            </button>

            {/* ── Dropdown Popover ─────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className={`position-absolute ${align === 'start' ? 'start-0' : 'end-0'} mt-2 p-2 rounded-4 shadow-xl border bg-white animate-fade-in`}
                    style={{
                        width: 'max-content',
                        minWidth: '260px',
                        maxWidth: 'min(310px, calc(100vw - 28px))',
                        maxHeight: 'min(500px, 80vh)',
                        overflowY: 'auto',
                        zIndex: 1060,
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        borderColor: 'var(--card-border, #d2f0dd)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.05)',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Header */}
                    <div className="px-2 py-1 mb-1 d-flex align-items-center justify-content-between gap-2 flex-wrap">
                        <span
                            className="tiny-text fw-black text-uppercase text-muted d-flex align-items-center gap-1 min-w-0 text-truncate"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.8px' }}
                        >
                            <i className="fa-solid fa-bolt text-warning flex-shrink-0" aria-hidden="true"></i>
                            <span className="text-truncate">Optimization Tools</span>
                        </span>
                        <span className="badge bg-light text-muted border rounded-pill x-small flex-shrink-0">
                            ACNH Stacks
                        </span>
                    </div>

                    {/* Maximize Stacks */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1 text-wrap"
                        onClick={() => {
                            onMaximizeStacks();
                            setIsOpen(false);
                        }}
                        disabled={!hasItems || isOrderFull}
                        style={{ cursor: !hasItems || isOrderFull ? 'not-allowed' : 'pointer' }}
                    >
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-2xs"
                            style={{
                                width: '32px',
                                height: '32px',
                                background: '#e8f7ec',
                                color: '#198754',
                            }}
                        >
                            <i className="fa-solid fa-layer-group small"></i>
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark text-truncate">Maximize Stacks</div>
                            <div className="tiny-text text-muted text-truncate">Auto-max materials (30×) &amp; tickets (10×)</div>
                        </div>
                    </button>

                    {/* Sort & Organize */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1 text-wrap"
                        onClick={() => {
                            onSortPockets();
                            setIsOpen(false);
                        }}
                        disabled={!hasItems}
                        style={{ cursor: !hasItems ? 'not-allowed' : 'pointer' }}
                    >
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-2xs"
                            style={{
                                width: '32px',
                                height: '32px',
                                background: '#e7f1ff',
                                color: '#0d6efd',
                            }}
                        >
                            <i className="fa-solid fa-arrow-down-a-z small"></i>
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark text-truncate">Sort &amp; Organize</div>
                            <div className="tiny-text text-muted text-truncate">Tools → Materials → Furniture → DIYs</div>
                        </div>
                    </button>

                    {/* Section Divider */}
                    <div className="px-2 pt-2 pb-1 border-top mt-1 mb-1 d-flex align-items-center justify-content-between gap-2 flex-wrap">
                        <span
                            className="tiny-text fw-black text-uppercase text-muted d-flex align-items-center gap-1 min-w-0 text-truncate"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.8px' }}
                        >
                            <i className="fa-solid fa-coins text-warning flex-shrink-0" aria-hidden="true"></i>
                            <span className="text-truncate">Fill Empty Pocket Slots</span>
                        </span>
                        {isOrderFull && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill x-small flex-shrink-0">
                                Full (40/40)
                            </span>
                        )}
                    </div>

                    {/* NMT Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1 text-wrap"
                        onClick={() => {
                            onFillNmt();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/MilePlaneTicket.png"
                                alt="NMT"
                                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between gap-1">
                                <span className="text-truncate">Nook Miles Tickets</span>
                                <span className="badge bg-success-subtle text-success x-small font-monospace flex-shrink-0">10×</span>
                            </div>
                            <div className="tiny-text text-muted text-truncate">Fill empty slots with NMT stacks</div>
                        </div>
                    </button>

                    {/* Gold Nuggets Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1 text-wrap"
                        onClick={() => {
                            onFillGold();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/DIYGold.png"
                                alt="Gold Nugget"
                                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between gap-1">
                                <span className="text-truncate">Gold Nuggets</span>
                                <span className="badge bg-warning-subtle text-warning-emphasis x-small font-monospace flex-shrink-0">30×</span>
                            </div>
                            <div className="tiny-text text-muted text-truncate">Fill with Gold stacks</div>
                        </div>
                    </button>

                    {/* Royal Crowns Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1 text-wrap"
                        onClick={() => {
                            onFillCrowns();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/CapHatCrownRed.png"
                                alt="Crown"
                                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between gap-1">
                                <span className="text-truncate">Royal Crowns</span>
                                <span className="badge bg-warning-subtle text-warning-emphasis x-small font-monospace flex-shrink-0">300k</span>
                            </div>
                            <div className="tiny-text text-muted text-truncate">Fill with 300k Bell Crowns</div>
                        </div>
                    </button>

                    {/* 99k Bells Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1 text-wrap"
                        onClick={() => {
                            onFillBells();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/1000Bell.png"
                                alt="Bells"
                                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between gap-1">
                                <span className="text-truncate">99,000 Bells</span>
                                <span className="badge bg-success-subtle text-success x-small font-monospace flex-shrink-0">99k</span>
                            </div>
                            <div className="tiny-text text-muted text-truncate">Fill with 99k Bell bags</div>
                        </div>
                    </button>

                    {/* Repeat Current Pattern */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light text-wrap"
                        onClick={() => {
                            onFillRepeat();
                            setIsOpen(false);
                        }}
                        disabled={!hasItems || isOrderFull}
                    >
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-2xs"
                            style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
                                color: '#856404',
                            }}
                        >
                            <i className="fa-solid fa-repeat small"></i>
                        </div>
                        <div className="text-start flex-grow-1 min-w-0">
                            <div className="small fw-black text-dark text-truncate">Repeat Current Items</div>
                            <div className="tiny-text text-muted text-truncate">Duplicate current items to 40 slots</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
