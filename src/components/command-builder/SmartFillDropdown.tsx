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
                className={`btn btn-sm rounded-pill fw-black px-3 py-2 shadow-2xs d-flex align-items-center gap-2 transition-all ${
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
                }}
            >
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
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
                    className={`fa-solid fa-chevron-down x-small transition-transform ${
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
                    className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-xl border bg-white animate-fade-in"
                    style={{
                        minWidth: '290px',
                        zIndex: 1060,
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        borderColor: 'var(--card-border, #d2f0dd)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    {/* Header */}
                    <div className="px-2 py-1 mb-1 d-flex align-items-center justify-content-between">
                        <span
                            className="tiny-text fw-black text-uppercase text-muted d-flex align-items-center gap-1"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.8px' }}
                        >
                            <i className="fa-solid fa-bolt text-warning" aria-hidden="true"></i>
                            <span>Optimization Tools</span>
                        </span>
                        <span className="badge bg-light text-muted border rounded-pill x-small">
                            ACNH Stacks
                        </span>
                    </div>

                    {/* Maximize Stacks */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1"
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
                                width: '34px',
                                height: '34px',
                                background: '#e8f7ec',
                                color: '#198754',
                            }}
                        >
                            <i className="fa-solid fa-layer-group small"></i>
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark">Maximize Stacks</div>
                            <div className="tiny-text text-muted">Auto-max materials (30×) &amp; tickets (10×)</div>
                        </div>
                    </button>

                    {/* Sort & Organize */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1"
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
                                width: '34px',
                                height: '34px',
                                background: '#e7f1ff',
                                color: '#0d6efd',
                            }}
                        >
                            <i className="fa-solid fa-arrow-down-a-z small"></i>
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark">Sort &amp; Organize</div>
                            <div className="tiny-text text-muted">Tools → Materials → Furniture → DIYs</div>
                        </div>
                    </button>

                    {/* Section Divider */}
                    <div className="px-2 pt-2 pb-1 border-top mt-1 mb-1 d-flex align-items-center justify-content-between">
                        <span
                            className="tiny-text fw-black text-uppercase text-muted d-flex align-items-center gap-1"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.8px' }}
                        >
                            <i className="fa-solid fa-coins text-warning" aria-hidden="true"></i>
                            <span>Fill Empty Pocket Slots</span>
                        </span>
                        {isOrderFull && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill x-small">
                                Full (40/40)
                            </span>
                        )}
                    </div>

                    {/* NMT Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1"
                        onClick={() => {
                            onFillNmt();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '34px', height: '34px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/MilePlaneTicket.png"
                                alt="NMT"
                                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between">
                                <span>Nook Miles Tickets</span>
                                <span className="badge bg-success-subtle text-success x-small font-monospace">10×</span>
                            </div>
                            <div className="tiny-text text-muted">Fill empty slots with NMT stacks</div>
                        </div>
                    </button>

                    {/* Gold Nuggets Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1"
                        onClick={() => {
                            onFillGold();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '34px', height: '34px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/DIYGold.png"
                                alt="Gold Nugget"
                                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between">
                                <span>Gold Nuggets</span>
                                <span className="badge bg-warning-subtle text-warning-emphasis x-small font-monospace">30×</span>
                            </div>
                            <div className="tiny-text text-muted">Fill with Gold stacks</div>
                        </div>
                    </button>

                    {/* Royal Crowns Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1"
                        onClick={() => {
                            onFillCrowns();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '34px', height: '34px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/CapHatCrownRed.png"
                                alt="Crown"
                                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between">
                                <span>Royal Crowns</span>
                                <span className="badge bg-warning-subtle text-warning-emphasis x-small font-monospace">300k</span>
                            </div>
                            <div className="tiny-text text-muted">Fill with 300k Bell Crowns</div>
                        </div>
                    </button>

                    {/* 99k Bells Fill */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light mb-1"
                        onClick={() => {
                            onFillBells();
                            setIsOpen(false);
                        }}
                        disabled={isOrderFull}
                    >
                        <div
                            className="rounded-3 p-1 bg-white border shadow-2xs d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '34px', height: '34px' }}
                        >
                            <img
                                src="https://www.pange.ca/itemsearch/items/img/1000Bell.png"
                                alt="Bells"
                                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                            />
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark d-flex align-items-center justify-content-between">
                                <span>99,000 Bells</span>
                                <span className="badge bg-success-subtle text-success x-small font-monospace">99k</span>
                            </div>
                            <div className="tiny-text text-muted">Fill with 99k Bell bags</div>
                        </div>
                    </button>

                    {/* Repeat Current Pattern */}
                    <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-dark fw-semibold transition-all hover-bg-light"
                        onClick={() => {
                            onFillRepeat();
                            setIsOpen(false);
                        }}
                        disabled={!hasItems || isOrderFull}
                    >
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-2xs"
                            style={{
                                width: '34px',
                                height: '34px',
                                background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
                                color: '#856404',
                            }}
                        >
                            <i className="fa-solid fa-repeat small"></i>
                        </div>
                        <div className="text-start flex-grow-1">
                            <div className="small fw-black text-dark">Repeat Current Items</div>
                            <div className="tiny-text text-muted">Duplicate current items to 40 slots</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
