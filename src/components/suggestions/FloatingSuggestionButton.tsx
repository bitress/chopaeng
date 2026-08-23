import { useState } from 'react';
import { openSuggestionModal } from '../../utils/suggestionsApi';

export const FloatingSuggestionButton = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="position-fixed"
            style={{
                bottom: '24px',
                right: '24px',
                zIndex: 1040,
            }}
        >
            <button
                type="button"
                className="btn btn-success text-white rounded-pill d-flex align-items-center gap-2 px-3 py-2 border-0 shadow-sm transition-all cursor-pointer hover-lift"
                style={{
                    backgroundColor: '#198754',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => openSuggestionModal()}
                title="Resident Suggestion Box • Click to share ideas or feedback"
            >
                {/* Lightbulb Icon Squircle */}
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-white text-success shadow-2xs position-relative"
                    style={{
                        width: '28px',
                        height: '28px',
                        fontSize: '0.85rem',
                    }}
                >
                    <i className="fa-solid fa-lightbulb text-warning"></i>
                    {/* Live Online Dot */}
                    <span
                        className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"
                        style={{ width: '7px', height: '7px' }}
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
            </button>
        </div>
    );
};
