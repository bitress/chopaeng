import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import {
    SUGGESTION_CATEGORIES,
    type SuggestionCategory,
    type SuggestionFormData,
} from '../../types/suggestion';
import {
    sendDiscordSuggestion,
    getSuggestionCooldownRemaining,
} from '../../utils/suggestionsApi';

interface SuggestionModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    initialCategory?: SuggestionCategory;
}

const SAMPLE_IDEA_CHIPS: Record<SuggestionCategory, string[]> = {
    feature: [
        '✨ Add Sanrio / 2.0 filter in Catalog',
        '📦 1-Click max stack button for pockets',
        '⭐ Favorite items list on profile',
    ],
    island: [
        '🏝️ Cottagecore botanical forest island',
        '🎃 Spooky Halloween DIY & furniture set',
        '🌸 Cherry blossom & festive holiday island',
    ],
    bot: [
        '🤖 Real-time queue ETA timer in Discord',
        '📦 Auto drop delivery confirmation ping',
    ],
    bug: [
        '🐛 Mobile navbar menu cut off on iPhone',
        '🐛 Item thumbnail failed to load in builder',
    ],
    general: [
        '❤️ Love the treasure islands and fast bot!',
        '💬 Keep up the amazing work Kuya Cho!',
    ],
};

export const SuggestionModal = ({
    isOpen: controlledIsOpen,
    onClose: controlledOnClose,
    initialCategory = 'feature',
}: SuggestionModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<SuggestionCategory>(initialCategory);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discordUsername, setDiscordUsername] = useState('');
    const [inGameName, setInGameName] = useState('');
    const [islandName, setIslandName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const { user } = useAuth();

    // Auto-fill username if logged in
    useEffect(() => {
        if (user?.username) {
            setDiscordUsername(user.username);
        }
    }, [user]);

    // Handle global event trigger
    useEffect(() => {
        const handleOpenEvent = (e: Event) => {
            const customEvent = e as CustomEvent<{ category?: SuggestionCategory }>;
            if (customEvent.detail?.category) {
                setCategory(customEvent.detail.category);
            }
            setIsOpen(true);
            setIsSubmitted(false);
            setErrorMessage(null);
            setCooldown(getSuggestionCooldownRemaining());
        };

        window.addEventListener('chopaeng_open_suggestions', handleOpenEvent);
        return () => window.removeEventListener('chopaeng_open_suggestions', handleOpenEvent);
    }, []);

    // Controlled prop sync
    useEffect(() => {
        if (controlledIsOpen !== undefined) {
            setIsOpen(controlledIsOpen);
            if (controlledIsOpen) {
                setIsSubmitted(false);
                setErrorMessage(null);
                setCooldown(getSuggestionCooldownRemaining());
            }
        }
    }, [controlledIsOpen]);

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    const handleClose = () => {
        setIsOpen(false);
        controlledOnClose?.();
    };

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setIsSubmitted(false);
        setErrorMessage(null);
    };

    const handleChipClick = (chipText: string) => {
        if (!title.trim()) {
            setTitle(chipText.replace(/^[^\w\s]+\s*/, ''));
        } else {
            setDescription((prev) => (prev ? `${prev}\n- ${chipText}` : chipText));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setErrorMessage('Please fill in both a title and details.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        const payload: SuggestionFormData = {
            category,
            title: title.trim(),
            description: description.trim(),
            discordUsername: discordUsername.trim() || undefined,
            inGameName: inGameName.trim() || undefined,
            islandName: islandName.trim() || undefined,
            pageUrl: window.location.href,
        };

        const result = await sendDiscordSuggestion(payload);

        setIsSubmitting(false);

        if (result.success) {
            setIsSubmitted(true);
            setCooldown(15);
        } else {
            setErrorMessage(result.error || 'Failed to send suggestion to Discord.');
            if (result.cooldownSeconds) {
                setCooldown(result.cooldownSeconds);
            }
        }
    };

    if (!isOpen) return null;

    const currentCat = SUGGESTION_CATEGORIES[category] || SUGGESTION_CATEGORIES.feature;
    const charPercentage = Math.min(100, Math.round((description.length / 1000) * 100));

    return (
        <div
            className="modal show d-block fade-in"
            style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                zIndex: 1060,
                backdropFilter: 'blur(10px)',
            }}
            onClick={handleClose}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable my-3"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '720px' }}
            >
                <div
                    className="modal-content rounded-5 border-0 shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: '#f8faf7',
                        backgroundImage: 'radial-gradient(#dce2c8 10%, transparent 11%)',
                        backgroundSize: '24px 24px',
                    }}
                >
                    {/* ── Modal Header with Rich AC Styling ────────────────── */}
                    <div
                        className="modal-header py-4 px-4 border-0 position-relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #0f4c2e 0%, #166534 50%, #064e3b 100%)',
                            color: '#ffffff',
                            borderBottom: '3px solid rgba(255, 255, 255, 0.15)',
                        }}
                    >
                        {/* Decorative Leaf Shapes */}
                        <div
                            className="position-absolute opacity-10 pointer-events-none"
                            style={{ top: '-30px', right: '-20px', fontSize: '9rem' }}
                        >
                            <i className="fa-solid fa-leaf"></i>
                        </div>

                        <div className="d-flex align-items-center gap-3 z-1">
                            <div
                                className="rounded-4 d-flex align-items-center justify-content-center shadow-md position-relative"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                    color: '#ffd166',
                                    backdropFilter: 'blur(8px)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    transform: 'rotate(-4deg)',
                                }}
                            >
                                <i className="fa-solid fa-lightbulb fs-4"></i>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <h4 className="modal-title fw-black ac-font mb-0 text-white" style={{ fontSize: '1.25rem' }}>
                                        Resident Suggestion Box
                                    </h4>
                                    <span
                                        className="badge rounded-pill x-small fw-black d-flex align-items-center gap-1 shadow-2xs"
                                        style={{
                                            backgroundColor: 'rgba(88, 101, 242, 0.85)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                        }}
                                    >
                                        <i className="fa-brands fa-discord"></i>
                                        <span>Direct to Staff</span>
                                    </span>
                                </div>
                                <p className="tiny-text mb-0 text-white-50">
                                    Have a cool feature idea, island theme, or bug to report? We read every submission!
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn-close btn-close-white shadow-none opacity-75 hover-opacity-100 position-relative z-1"
                            onClick={handleClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* ── Modal Body ───────────────────────────────────────── */}
                    <div className="modal-body p-4 p-md-4">
                        {isSubmitted ? (
                            /* ── Celebratory Stamped Letter Receipt ────────────── */
                            <div className="text-center py-4 px-3 animate-scale-up">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-lg position-relative"
                                    style={{
                                        width: '84px',
                                        height: '84px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: '#ffffff',
                                        border: '4px solid #ffffff',
                                    }}
                                >
                                    <i className="fa-solid fa-envelope-circle-check fs-1"></i>
                                    <span
                                        className="position-absolute top-0 end-0 p-1 bg-warning rounded-circle border border-white"
                                        style={{ width: '14px', height: '14px' }}
                                    ></span>
                                </div>

                                <h3 className="fw-black ac-font text-dark mb-2" style={{ fontSize: '1.4rem' }}>
                                    Delivered to Staff Discord!
                                </h3>
                                <p className="text-muted small mb-4" style={{ maxWidth: '460px', margin: '0 auto' }}>
                                    Thank you for your feedback! Your message has been formatted into a live embed and dispatched directly to the moderator & development channels.
                                </p>

                                {/* Stamped Ticket Card */}
                                <div
                                    className="rounded-4 p-3 bg-white border border-light-subtle shadow-sm mb-4 text-start position-relative overflow-hidden"
                                    style={{ maxWidth: '500px', margin: '0 auto' }}
                                >
                                    {/* Cute Wax Stamp Badge */}
                                    <div
                                        className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded-pill text-success border border-success border-opacity-50 fw-black tiny-text font-monospace text-uppercase"
                                        style={{ backgroundColor: '#ecfdf5', transform: 'rotate(5deg)' }}
                                    >
                                        <i className="fa-solid fa-stamp me-1"></i>Delivered
                                    </div>

                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span
                                            className="badge rounded-pill text-white px-2 py-1 tiny-text fw-bold"
                                            style={{ backgroundColor: currentCat.color }}
                                        >
                                            {currentCat.badgeText}
                                        </span>
                                        <span className="fw-black text-dark font-monospace text-truncate pe-5" style={{ fontSize: '0.9rem' }}>
                                            {title}
                                        </span>
                                    </div>

                                    <p className="text-muted mb-2 small text-truncate-3" style={{ fontSize: '0.85rem' }}>
                                        {description}
                                    </p>

                                    <div className="tiny-text text-muted font-monospace border-top pt-2 d-flex align-items-center justify-content-between">
                                        <span>From: <strong>{discordUsername || 'Anonymous Resident'}</strong></span>
                                        <span>Sent just now</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-pill px-4 fw-bold border hover-bg-light"
                                        onClick={handleClose}
                                    >
                                        Done
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success text-white rounded-pill px-4 fw-black shadow-2xs"
                                        onClick={handleReset}
                                    >
                                        <i className="fa-solid fa-plus me-1"></i>Submit Another Idea
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── Rich Form View ───────────────────────────────── */
                            <form onSubmit={handleSubmit}>
                                {/* 1. Category Selection Cards */}
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <label className="form-label fw-black text-uppercase text-muted tiny-text letter-spacing-1 mb-0">
                                            1. Choose Topic Category
                                        </label>
                                        <span className="tiny-text text-muted font-monospace">
                                            {currentCat.name}
                                        </span>
                                    </div>

                                    <div className="row g-2">
                                        {(Object.keys(SUGGESTION_CATEGORIES) as SuggestionCategory[]).map((catKey) => {
                                            const meta = SUGGESTION_CATEGORIES[catKey];
                                            const isSelected = category === catKey;

                                            return (
                                                <div key={catKey} className="col-6 col-md-4">
                                                    <button
                                                        type="button"
                                                        className={`card w-100 p-2 text-start rounded-4 transition-all position-relative overflow-hidden cursor-pointer ${
                                                            isSelected
                                                                ? 'shadow-sm border-2'
                                                                : 'bg-white border-light-subtle hover-shadow-2xs'
                                                        }`}
                                                        style={{
                                                            borderColor: isSelected ? meta.color : undefined,
                                                            backgroundColor: isSelected ? '#ffffff' : '#ffffff',
                                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                        }}
                                                        onClick={() => setCategory(catKey)}
                                                    >
                                                        {/* Top Accent Strip */}
                                                        {isSelected && (
                                                            <div
                                                                className="position-absolute top-0 start-0 w-100"
                                                                style={{ height: '3px', backgroundColor: meta.color }}
                                                            ></div>
                                                        )}

                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-2xs"
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    backgroundColor: meta.color,
                                                                    fontSize: '0.85rem',
                                                                }}
                                                            >
                                                                <i className={`fa-solid ${meta.icon}`}></i>
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <div
                                                                    className="fw-black text-dark text-truncate"
                                                                    style={{ fontSize: '0.82rem' }}
                                                                >
                                                                    {meta.name}
                                                                </div>
                                                                <div
                                                                    className="tiny-text text-muted text-truncate"
                                                                    style={{ fontSize: '0.68rem' }}
                                                                >
                                                                    {meta.badgeText}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. Title & Helper Chips */}
                                <div className="mb-3">
                                    <label className="form-label fw-black text-uppercase text-muted tiny-text letter-spacing-1 mb-1">
                                        2. Suggestion Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg rounded-4 fw-bold border shadow-none"
                                        placeholder="e.g. Add 1-Click Pocket Autofill Filter"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={120}
                                        required
                                        style={{ fontSize: '0.95rem' }}
                                    />

                                    {/* Inspiration shortcut pills */}
                                    <div className="d-flex gap-1 flex-wrap mt-2 align-items-center">
                                        <span className="tiny-text text-muted fw-bold me-1">Quick ideas:</span>
                                        {SAMPLE_IDEA_CHIPS[category].map((chip, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className="btn btn-sm btn-light bg-white border rounded-pill px-2 py-0 tiny-text text-muted hover-text-dark"
                                                style={{ fontSize: '0.72rem' }}
                                                onClick={() => handleChipClick(chip)}
                                                title="Click to insert idea"
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Details & Explanation */}
                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <label className="form-label fw-black text-uppercase text-muted tiny-text letter-spacing-1 mb-0">
                                            3. Details & Notes <span className="text-danger">*</span>
                                        </label>
                                        <span
                                            className={`tiny-text font-monospace ${
                                                description.length > 900 ? 'text-danger fw-black' : 'text-muted'
                                            }`}
                                        >
                                            {description.length} / 1000
                                        </span>
                                    </div>

                                    <textarea
                                        className="form-control rounded-4 border shadow-none"
                                        rows={4}
                                        placeholder={currentCat.placeholder}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        maxLength={1000}
                                        required
                                        style={{ fontSize: '0.88rem', lineHeight: '1.5' }}
                                    ></textarea>

                                    {/* Character Progress Bar */}
                                    <div className="progress mt-1 rounded-pill" style={{ height: '3px' }}>
                                        <div
                                            className={`progress-bar transition-all ${
                                                charPercentage > 90
                                                    ? 'bg-danger'
                                                    : charPercentage > 60
                                                    ? 'bg-warning'
                                                    : 'bg-success'
                                            }`}
                                            style={{ width: `${charPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* 4. Resident Passport / Contact Card */}
                                <div className="card rounded-4 p-3 bg-white border border-light-subtle shadow-2xs mb-4">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
                                            style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}
                                        >
                                            <i className="fa-solid fa-id-card"></i>
                                        </div>
                                        <span className="tiny-text fw-black text-uppercase text-muted letter-spacing-1">
                                            Resident Passport (Optional)
                                        </span>
                                    </div>

                                    <div className="row g-2">
                                        <div className="col-12 col-md-5">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-light border-light-subtle text-muted">
                                                    <i className="fa-brands fa-discord text-primary"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-none"
                                                    placeholder="Discord tag (e.g. Cho#0001)"
                                                    value={discordUsername}
                                                    onChange={(e) => setDiscordUsername(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-3">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-light border-light-subtle text-muted">
                                                    <i className="fa-solid fa-user text-success"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-none"
                                                    placeholder="In-Game Name"
                                                    value={inGameName}
                                                    onChange={(e) => setInGameName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-4">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-light border-light-subtle text-muted">
                                                    <i className="fa-solid fa-umbrella-beach text-warning"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-none"
                                                    placeholder="Island Name"
                                                    value={islandName}
                                                    onChange={(e) => setIslandName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Alert */}
                                {errorMessage && (
                                    <div className="alert alert-danger py-2 px-3 small rounded-4 mb-3 animate-fade-in d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-triangle-exclamation text-danger fs-5"></i>
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                                    <div className="tiny-text text-muted d-flex align-items-center gap-1">
                                        <i className="fa-solid fa-shield-halved text-success"></i>
                                        <span className="d-none d-sm-inline">Dispatches directly to Discord staff channel</span>
                                        <span className="d-inline d-sm-none">To Discord staff</span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-light rounded-pill px-3 fw-bold border hover-bg-light"
                                            onClick={handleClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || cooldown > 0 || !title.trim() || !description.trim()}
                                            className="btn btn-success text-white rounded-pill px-4 fw-black shadow-sm d-flex align-items-center gap-2 hover-lift"
                                            style={{
                                                minWidth: '150px',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                    <span>Sending...</span>
                                                </>
                                            ) : cooldown > 0 ? (
                                                <>
                                                    <i className="fa-solid fa-clock"></i>
                                                    <span>Wait {cooldown}s</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-paper-plane"></i>
                                                    <span>Send Idea</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .animate-scale-up {
                    animation: scaleUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes scaleUpModal {
                    from { opacity: 0; transform: scale(0.94); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
