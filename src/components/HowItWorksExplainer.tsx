import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { playChimeClick } from '../utils/kkAudioSynthesizer';
import './HowItWorksExplainer.css';

export interface ExplainerStep {
    stepNumber?: number | string;
    icon: string;
    title: string;
    description: string | React.ReactNode;
    tip?: string;
    badge?: string;
}

export interface ExplainerFaq {
    question: string;
    answer: string | React.ReactNode;
}

export interface ExplainerAction {
    label: string;
    to?: string;
    href?: string;
    onClick?: () => void;
    icon?: string;
    variant?: 'primary' | 'outline' | 'warning' | 'info';
}

export interface HowItWorksExplainerProps {
    id?: string;
    title?: string;
    subtitle?: string;
    badge?: string;
    icon?: string;
    steps: ExplainerStep[];
    faqs?: ExplainerFaq[];
    action?: ExplainerAction;
    secondaryAction?: ExplainerAction;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    storageKey?: string;
    className?: string;
    variant?: 'card' | 'compact' | 'minimal';
    modalMode?: boolean;
    triggerLabel?: string;
}

// Maps an action's `variant` to real button classes. `warning` and `info`
// used to be declared in the type but silently ignored by the renderer —
// they're implemented here so the type isn't lying about what's supported.
const ACTION_VARIANT_CLASSES: Record<NonNullable<ExplainerAction['variant']>, string> = {
    primary: 'btn-nook text-white',
    outline: 'btn-outline-success',
    warning: 'btn-warning text-dark',
    info: 'btn-info text-dark',
};

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const HowItWorksExplainer: React.FC<HowItWorksExplainerProps> = ({
    id = 'how-it-works',
    title = 'How does this work?',
    subtitle = 'A quick step-by-step guide to get you up to speed.',
    badge = 'Quick Guide',
    icon = 'fa-circle-question',
    steps,
    faqs = [],
    action,
    secondaryAction,
    collapsible = true,
    defaultExpanded = true,
    storageKey,
    className = '',
    variant = 'card',
    modalMode = false,
    triggerLabel = 'How does this work?',
}) => {
    // Collapsed state — only relevant to the inline (non-modal) variant, so
    // skip the localStorage read entirely when modalMode is on.
    const [isExpanded, setIsExpanded] = useState<boolean>(() => {
        if (modalMode || !collapsible) return true;
        if (storageKey) {
            try {
                const stored = localStorage.getItem(`hiw_${storageKey}`);
                if (stored !== null) return stored === 'true';
            } catch {
                // Ignore storage errors
            }
        }
        return defaultExpanded;
    });

    // Modal state for modalMode
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const triggerButtonRef = useRef<HTMLButtonElement>(null);
    const modalDialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Save collapse state
    useEffect(() => {
        if (!modalMode && storageKey && collapsible) {
            try {
                localStorage.setItem(`hiw_${storageKey}`, String(isExpanded));
            } catch {
                // Ignore storage errors
            }
        }
    }, [isExpanded, storageKey, collapsible, modalMode]);

    // Focus the close button as soon as the dialog mounts, lock background
    // scroll, and restore focus to the trigger on close.
    useEffect(() => {
        if (!isModalOpen) return;

        closeButtonRef.current?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
            triggerButtonRef.current?.focus();
        };
    }, [isModalOpen]);

    // Escape-to-close + a simple Tab focus trap so keyboard users can't
    // tab out of the dialog into the page behind the backdrop.
    const handleModalKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            setIsModalOpen(false);
            return;
        }

        if (e.key !== 'Tab' || !modalDialogRef.current) return;

        const focusable = Array.from(
            modalDialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }, []);

    const handleToggleExpand = () => {
        playChimeClick();
        setIsExpanded((prev) => !prev);
    };

    const handleToggleFaq = (idx: number) => {
        playChimeClick();
        setOpenFaqIndex((prev) => (prev === idx ? null : idx));
    };

    const handleOpenModal = () => {
        playChimeClick();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        playChimeClick();
        setIsModalOpen(false);
    };

    // Render Steps Grid
    const renderSteps = () => (
        <div className={`hiw-steps-grid hiw-steps-${Math.max(1, Math.min(steps.length, 4))}`}>
            {steps.map((step, idx) => {
                const num = step.stepNumber !== undefined ? step.stepNumber : idx + 1;
                const formattedNum = typeof num === 'number' ? String(num).padStart(2, '0') : num;

                return (
                    <div key={idx} className="hiw-step-item">
                        <div className="hiw-step-card">
                            {/* Step Header */}
                            <div className="hiw-step-header">
                                <div className="hiw-step-num-wrap">
                                    <span className="hiw-step-num">{formattedNum}</span>
                                    <div className="hiw-step-icon">
                                        <i className={`fa-solid ${step.icon}`} aria-hidden="true"></i>
                                    </div>
                                </div>
                                {step.badge && (
                                    <span className="hiw-step-badge">{step.badge}</span>
                                )}
                            </div>

                            {/* Step Content */}
                            <h4 className="hiw-step-title">{step.title}</h4>
                            <div className="hiw-step-desc">{step.description}</div>

                            {/* Optional Tip */}
                            {step.tip && (
                                <div className="hiw-step-tip">
                                    <i className="fa-solid fa-lightbulb hiw-tip-icon" aria-hidden="true"></i>
                                    <span>{step.tip}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // Render FAQs if any
    const renderFaqs = () => {
        if (!faqs || faqs.length === 0) return null;

        return (
            <div className="hiw-faqs-section mt-4 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fa-solid fa-comments text-success" aria-hidden="true"></i>
                    <h4 className="h6 fw-bold mb-0 text-dark">Frequently Asked Questions</h4>
                </div>
                <div className="hiw-faqs-list">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div key={idx} className={`hiw-faq-item ${isOpen ? 'open' : ''}`}>
                                <button
                                    type="button"
                                    className="hiw-faq-question"
                                    onClick={() => handleToggleFaq(idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="fw-bold">{faq.question}</span>
                                    <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'} hiw-faq-toggle`} aria-hidden="true"></i>
                                </button>
                                {isOpen && (
                                    <div className="hiw-faq-answer">
                                        {typeof faq.answer === 'string' ? <p className="mb-0">{faq.answer}</p> : faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Single source of truth for rendering an action as Link / <a> / <button>,
    // so primary and secondary actions can't drift apart from each other.
    const renderActionButton = (
        actionConfig: ExplainerAction,
        extraClassName: string
    ) => {
        const variantClass = ACTION_VARIANT_CLASSES[actionConfig.variant ?? 'primary'];
        const sharedClassName = `btn btn-sm ${variantClass} rounded-pill fw-bold px-3 py-2 d-inline-flex align-items-center gap-2 shadow-2xs ${extraClassName}`;
        const content = (
            <>
                {actionConfig.icon && <i className={`fa-solid ${actionConfig.icon}`} aria-hidden="true"></i>}
                <span>{actionConfig.label}</span>
            </>
        );

        if (actionConfig.to) {
            return (
                <Link to={actionConfig.to} className={sharedClassName} onClick={() => playChimeClick()}>
                    {content}
                </Link>
            );
        }

        if (actionConfig.href) {
            return (
                <a
                    href={actionConfig.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={sharedClassName}
                    onClick={() => playChimeClick()}
                >
                    {content}
                </a>
            );
        }

        return (
            <button
                type="button"
                className={sharedClassName}
                onClick={() => {
                    playChimeClick();
                    actionConfig.onClick?.();
                }}
            >
                {content}
            </button>
        );
    };

    // Render Action Buttons
    const renderActions = () => {
        if (!action && !secondaryAction) return null;

        return (
            <div className="hiw-actions-bar mt-4 d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {action && renderActionButton(action, '')}
                    {secondaryAction &&
                        renderActionButton(
                            { ...secondaryAction, variant: secondaryAction.variant ?? 'outline' },
                            secondaryAction.variant ? '' : 'btn-outline-secondary'
                        )}
                </div>

                <div className="tiny-text text-muted d-flex align-items-center gap-1">
                    <i className="fa-solid fa-shield-halved text-success" aria-hidden="true"></i>
                    <span>Chopaeng Community Guide</span>
                </div>
            </div>
        );
    };

    // If modal trigger mode
    if (modalMode) {
        return (
            <>
                <button
                    ref={triggerButtonRef}
                    type="button"
                    className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-2 shadow-2xs"
                    onClick={handleOpenModal}
                >
                    <i className={`fa-solid ${icon} text-success`} aria-hidden="true"></i>
                    <span>{triggerLabel}</span>
                </button>

                {isModalOpen && (
                    <div
                        className="hiw-modal-backdrop"
                        onClick={handleCloseModal}
                        onKeyDown={handleModalKeyDown}
                        role="presentation"
                    >
                        <div
                            ref={modalDialogRef}
                            className="hiw-modal-dialog"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={`${id}-modal-title`}
                            aria-describedby={subtitle ? `${id}-modal-subtitle` : undefined}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="hiw-modal-header">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="hiw-icon-badge">
                                        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
                                    </div>
                                    <div>
                                        <h3 id={`${id}-modal-title`} className="hiw-title mb-0">{title}</h3>
                                        {subtitle && (
                                            <p id={`${id}-modal-subtitle`} className="hiw-subtitle mb-0">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    className="hiw-close-btn"
                                    onClick={handleCloseModal}
                                    aria-label="Close"
                                >
                                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                                </button>
                            </div>

                            <div className="hiw-modal-body">
                                {renderSteps()}
                                {renderFaqs()}
                                {renderActions()}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Default inline Card variant
    return (
        <section id={id} className={`hiw-container hiw-variant-${variant} ${className}`} aria-labelledby={`${id}-heading`}>
            {/* Header / Collapse Bar */}
            <div
                className={`hiw-header ${collapsible ? 'cursor-pointer' : ''}`}
                onClick={collapsible ? handleToggleExpand : undefined}
                role={collapsible ? 'button' : undefined}
                tabIndex={collapsible ? 0 : undefined}
                onKeyDown={collapsible ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleExpand(); } } : undefined}
            >
                <div className="hiw-header-left">
                    <div className="hiw-icon-badge">
                        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
                    </div>
                    <div className="min-w-0">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <span className="hiw-badge">{badge}</span>
                            <h3 id={`${id}-heading`} className="hiw-title mb-0">{title}</h3>
                        </div>
                        {subtitle && <p className="hiw-subtitle mb-0">{subtitle}</p>}
                    </div>
                </div>

                {collapsible && (
                    <button
                        type="button"
                        className="hiw-collapse-btn"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse instructions' : 'Expand instructions'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand();
                        }}
                    >
                        <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>
                    </button>
                )}
            </div>

            {/* Expandable Content Body */}
            {isExpanded && (
                <div className="hiw-body">
                    {renderSteps()}
                    {renderFaqs()}
                    {renderActions()}
                </div>
            )}
        </section>
    );
};

// ─────────────────────────────────────────────────────────────
// PRESET CONFIGURATIONS FOR COMPLEX PAGES
// ─────────────────────────────────────────────────────────────

export const ORDER_BOT_EXPLAINER_CONFIG: HowItWorksExplainerProps = {
    id: 'orderbot-guide',
    title: 'How does the Order Bot work?',
    subtitle: 'Build a custom order of up to 40 items and receive a direct in-game Dodo delivery in minutes.',
    badge: '4-Step Order Guide',
    icon: 'fa-robot',
    storageKey: 'orderbot_explainer',
    steps: [
        {
            stepNumber: 1,
            icon: 'fa-box-open',
            title: '1. Load Your 40 Slots',
            description: 'Search items, materials, recipes, or villagers and load up to 40 pocket slots in Command Builder or Order Bot.',
            tip: 'Use Smart Fill presets like Max Bells or Golden Tools to load a full pocket in 1-click.',
            badge: 'Build Pocket',
        },
        {
            stepNumber: 2,
            icon: 'fa-paper-plane',
            title: '2. Send Your Order',
            description: 'Click "Send Order" or paste your $order command into the order queue. The bot will confirm and assign your spot.',
            tip: 'Keep this tab open or watch the live queue status indicator in the top header.',
            badge: 'Queue Up',
        },
        {
            stepNumber: 3,
            icon: 'fa-plane-departure',
            title: '3. Receive Dodo Code',
            description: 'When it is your turn, your private Dodo code appears automatically on screen. Head to your airport immediately.',
            tip: 'Empty your pockets completely in ACNH before flying so you have space for all 40 items!',
            badge: 'Get Dodo',
        },
        {
            stepNumber: 4,
            icon: 'fa-hand-sparkles',
            title: '4. Grab Items & Fly Home',
            description: 'Land on the delivery island, collect all dropped items on the landing zone, and leave via the airport gate.',
            tip: 'Always leave through the airport (never minus button) to prevent rollbacks for you and other players.',
            badge: 'Deliver & Enjoy',
        },
    ],
    faqs: [
        {
            question: 'How long does an order take?',
            answer: 'Orders usually take 2 to 5 minutes depending on your position in the queue. You can watch your queue count update in real time.',
        },
        {
            question: 'Can I order villagers or max bells?',
            answer: 'Yes! Select any villager in boxes or add a 99,000 Bells sack with max bells enabled to max out your ABD bank account.',
        },
    ],
    action: {
        label: 'Build Custom Order in Command Builder',
        to: '/command-builder',
        icon: 'fa-cubes-stacked',
    },
};

export const TREASURE_ISLANDS_EXPLAINER_CONFIG: HowItWorksExplainerProps = {
    id: 'treasure-islands-guide',
    title: 'How do Treasure Islands work?',
    subtitle: 'Free & Supporter 24/7 Animal Crossing islands stocked with endless items, DIYs, materials, and villagers.',
    badge: 'Island Travel Guide',
    icon: 'fa-island-tropical',
    storageKey: 'treasure_islands_explainer',
    steps: [
        {
            stepNumber: 1,
            icon: 'fa-compass',
            title: '1. Choose an Island',
            description: 'Browse our live island directory. Look for the items you need (DIYs, Materials, Furniture, Villagers, or Catalog).',
            tip: 'Check the live visitor counter (e.g. 3/7) to pick an island with open runway access.',
            badge: 'Pick Destination',
        },
        {
            stepNumber: 2,
            icon: 'fa-key',
            title: '2. Copy Live Dodo Code',
            description: 'Click "Copy Dodo Code" on any active island card. Free public islands are instant; subscriber islands unlock with membership.',
            tip: 'If an island is "REFRESHING", give the bot 30-60 seconds to reset before copying.',
            badge: 'Get Flight Code',
        },
        {
            stepNumber: 3,
            icon: 'fa-plane-departure',
            title: '3. Fly via Dodo Airlines',
            description: 'Talk to Orville at your airport, select "I wanna fly!" → "Via online play" → "Search via Dodo Code™", and enter the code.',
            tip: 'Make sure your Nintendo Switch system clock is synchronized and your Nintendo Switch Online is active.',
            badge: 'Take Off',
        },
        {
            stepNumber: 4,
            icon: 'fa-gift',
            title: '4. Grab Loot & Exit via Gate',
            description: 'Pick up anything you need from the ground. When finished, talk to Wilbur at the dock to fly back safely.',
            tip: 'Never press the minus (-) button to leave, as it disrupts the flight for everyone on the island.',
            badge: 'Safe Landing',
        },
    ],
    faqs: [
        {
            question: 'What is the difference between Public and Sub Only islands?',
            answer: 'Public islands are 100% free for everyone. Sub Only islands have lower traffic, zero wait times, and exclusive requests.',
        },
        {
            question: 'Can I learn DIY recipes directly on the island?',
            answer: 'Yes! You can either learn DIY recipe cards right on the ground or fill your pockets and take them home to learn later.',
        },
    ],
    action: {
        label: 'Plan a Multi-Island Flight Itinerary',
        to: '/trip-planner',
        icon: 'fa-map-location-dot',
    },
};

export const PROFILE_EXPLAINER_CONFIG: HowItWorksExplainerProps = {
    id: 'profile-guide',
    title: 'Managing Your Player Profile & Sync',
    subtitle: 'Keep your in-game details, saved character builds, favorite islands, and collection synchronized in one place.',
    badge: 'Profile Overview',
    icon: 'fa-id-card',
    storageKey: 'profile_explainer',
    steps: [
        {
            stepNumber: 1,
            icon: 'fa-passport',
            title: '1. In-Game Character Info',
            description: 'Set your In-Game Name (IGN), Island Name, and Dream Address (DA) so community islands and Order Bot recognize you.',
            tip: 'Having an exact match on your in-game name ensures priority delivery handling.',
            badge: 'Passport Details',
        },
        {
            stepNumber: 2,
            icon: 'fa-heart',
            title: '2. Track Favorites & Wishlist',
            description: 'Star items and islands across ChoPaeng to build your personal wishlist and quick-access flight bookmarks.',
            tip: 'Import your favorites directly into Island Trip Planner with 1-click.',
            badge: 'Wishlists',
        },
        {
            stepNumber: 3,
            icon: 'fa-users-gear',
            title: '3. Multi-Character Slots',
            description: 'Switch between multiple Switch profiles, family members, or alternate islands with saved character loadouts.',
            tip: 'Click "+ Add Character" to save separate Dodo flight names.',
            badge: 'Character Profiles',
        },
    ],
    action: {
        label: 'View Your Item Collection',
        to: '/my-collection',
        icon: 'fa-clipboard-check',
    },
};

export const TRIP_PLANNER_EXPLAINER_CONFIG: HowItWorksExplainerProps = {
    id: 'trip-planner-guide',
    title: 'How does Island Trip Planner work?',
    subtitle: 'Select all the items, DIYs, materials, or villagers you need, and we map out the shortest route across live islands.',
    badge: 'Route Optimizer',
    icon: 'fa-route',
    storageKey: 'trip_planner_explainer',
    steps: [
        {
            stepNumber: 1,
            icon: 'fa-magnifying-glass',
            title: '1. Select Items to Find',
            description: 'Use the search bar, quick presets, or click "Import Wishlist" to queue up the items you are hunting for.',
            tip: 'You can mix recipes, villagers, clothing, and materials in the same search.',
            badge: 'Build List',
        },
        {
            stepNumber: 2,
            icon: 'fa-map',
            title: '2. Smart Itinerary Generation',
            description: 'Our scoring engine matches each item to dedicated islands (DIYs, Sanrio, Catalog letter ranges, Materials, etc.).',
            tip: 'The greedy set-cover algorithm finds the minimal number of stops to collect 100% of your items.',
            badge: 'Auto Optimize',
        },
        {
            stepNumber: 3,
            icon: 'fa-plane-departure',
            title: '3. Follow Your Flight Stops',
            description: 'Copy Dodo codes for each stop in order, check off items on your interactive checklist, and complete your trip!',
            tip: 'Share your custom flight itinerary link with friends or community members with 1-click.',
            badge: 'Fly & Check Off',
        },
    ],
};

export const COMMAND_BUILDER_EXPLAINER_CONFIG: HowItWorksExplainerProps = {
    id: 'command-builder-guide',
    title: 'How does Command Builder work?',
    subtitle: 'Assemble custom inventory loadouts, villager hex strings, and 40-slot item packages with full variations.',
    badge: 'Builder Guide',
    icon: 'fa-cubes-stacked',
    storageKey: 'command_builder_explainer',
    steps: [
        {
            stepNumber: 1,
            icon: 'fa-magnifying-glass',
            title: '1. Search the 2.0 Catalog',
            description: 'Browse all items, DIY recipes, furniture series, photos, art, fossils, and villagers with real-time translation.',
            tip: 'Pick your exact custom variation (color, fabric, pattern) before adding to pocket.',
            badge: 'Item Search',
        },
        {
            stepNumber: 2,
            icon: 'fa-basket-shopping',
            title: '2. Fill Your 40 Slots',
            description: 'Add items slot-by-slot or load pre-made Community Loadouts (e.g. Ironwood Set, Sanrio Pack, 14M Bells).',
            tip: 'Reorder or duplicate slots easily by clicking on any item in your pocket grid.',
            badge: 'Pocket Management',
        },
        {
            stepNumber: 3,
            icon: 'fa-paper-plane',
            title: '3. Export or Send to Bot',
            description: 'Copy your raw $order hex string or click "Send to Order Bot" to queue delivery in 1-click.',
            tip: 'Share your custom pocket bundles with friends using our shareable bundle links.',
            badge: 'Export & Order',
        },
    ],
};

export default HowItWorksExplainer;