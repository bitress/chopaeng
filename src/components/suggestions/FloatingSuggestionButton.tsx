import { useState } from 'react';
import { openSuggestionModal } from '../../utils/suggestionsApi';
import type { SuggestionCategory } from '../../types/suggestion';

export const FloatingSuggestionButton = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [showQuickMenu, setShowQuickMenu] = useState(false);

    const handleQuickOpen = (cat?: SuggestionCategory) => {
        setShowQuickMenu(false);
        openSuggestionModal(cat);
    };

    return (
        <div
            className="position-fixed"
            style={{
                bottom: '24px',
                right: '24px',
                zIndex: 1040,
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                setShowQuickMenu(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowQuickMenu(false);
            }}
        >
            {/* ── Quick Category Flyout Menu (Desktop Hover) ────────────────── */}
            {showQuickMenu && (
                <div
                    className="position-absolute bottom-100 end-0 mb-3 bg-white rounded-4 shadow-xl border border-light-subtle p-2 animate-slide-up d-none d-md-flex flex-column gap-1"
                    style={{
                        minWidth: '220px',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <div className="px-2 py-1 tiny-text fw-black text-uppercase text-muted letter-spacing-1 d-flex align-items-center justify-content-between border-bottom pb-1 mb-1">
                        <span>Resident Services</span>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-0">Online</span>
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-light bg-transparent text-start rounded-3 px-2 py-1 d-flex align-items-center gap-2 hover-bg-light transition-all"
                        onClick={() => handleQuickOpen('feature')}
                    >
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '24px', height: '24px', backgroundColor: '#10b981', fontSize: '0.7rem' }}
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        <div>
                            <div className="fw-black text-dark" style={{ fontSize: '0.8rem' }}>Feature Request</div>
                            <div className="tiny-text text-muted" style={{ fontSize: '0.68rem' }}>Suggest a new website tool</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-light bg-transparent text-start rounded-3 px-2 py-1 d-flex align-items-center gap-2 hover-bg-light transition-all"
                        onClick={() => handleQuickOpen('island')}
                    >
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '24px', height: '24px', backgroundColor: '#f59e0b', fontSize: '0.7rem' }}
                        >
                            <i className="fa-solid fa-umbrella-beach"></i>
                        </div>
                        <div>
                            <div className="fw-black text-dark" style={{ fontSize: '0.8rem' }}>Island & Items</div>
                            <div className="tiny-text text-muted" style={{ fontSize: '0.68rem' }}>Request themes, items, DIYs</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-light bg-transparent text-start rounded-3 px-2 py-1 d-flex align-items-center gap-2 hover-bg-light transition-all"
                        onClick={() => handleQuickOpen('bug')}
                    >
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '24px', height: '24px', backgroundColor: '#ef4444', fontSize: '0.7rem' }}
                        >
                            <i className="fa-solid fa-bug"></i>
                        </div>
                        <div>
                            <div className="fw-black text-dark" style={{ fontSize: '0.8rem' }}>Report Glitch</div>
                            <div className="tiny-text text-muted" style={{ fontSize: '0.68rem' }}>Found a bug or broken button</div>
                        </div>
                    </button>
                </div>
            )}

            {/* ── Main Floating Trigger Button ──────────────────────────────── */}
            <button
                type="button"
                className="btn btn-success text-white rounded-pill d-flex align-items-center gap-2 px-3 py-2 border-2 border-white transition-all position-relative overflow-hidden cursor-pointer"
                style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    boxShadow: isHovered
                        ? '0 12px 28px rgba(16, 185, 129, 0.45), 0 0 0 4px rgba(16, 185, 129, 0.2)'
                        : '0 8px 20px rgba(16, 185, 129, 0.35)',
                    transform: isHovered ? 'translateY(-3px) scale(1.04)' : 'translateY(0) scale(1)',
                    transition: 'all 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
                onClick={() => handleQuickOpen()}
                title="Resident Suggestion Box • Click to share ideas or feedback"
            >
                {/* Subtle Shimmer Background */}
                <div
                    className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none opacity-25"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, transparent 70%)',
                    }}
                ></div>

                {/* Squircle Lightbulb / Leaf Icon */}
                <div
                    className="rounded-3 d-flex align-items-center justify-content-center bg-white text-success shadow-2xs position-relative"
                    style={{
                        width: '30px',
                        height: '30px',
                        fontSize: '0.9rem',
                        transform: 'rotate(-4deg)',
                    }}
                >
                    <i className="fa-solid fa-lightbulb text-warning animate-pulse"></i>
                    {/* Live Online Ping Indicator */}
                    <span
                        className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"
                        style={{ width: '8px', height: '8px' }}
                    ></span>
                </div>

                <div className="d-flex flex-column text-start lh-1">
                    <span className="fw-black ac-font text-white d-none d-sm-inline" style={{ fontSize: '0.88rem' }}>
                        Feedback & Ideas
                    </span>
                    <span className="fw-black ac-font text-white d-inline d-sm-none" style={{ fontSize: '0.82rem' }}>
                        Ideas
                    </span>
                    <span className="tiny-text text-white-50 d-none d-sm-inline mt-1" style={{ fontSize: '0.65rem' }}>
                        <i className="fa-brands fa-discord me-1"></i>To Discord Staff
                    </span>
                </div>

                <div className="d-none d-sm-flex align-items-center ms-1 text-white-50 opacity-75">
                    <i className="fa-solid fa-chevron-up x-small"></i>
                </div>
            </button>

            <style>{`
                .animate-slide-up {
                    animation: slideUpQuick 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUpQuick {
                    from { opacity: 0; transform: translateY(10px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};
