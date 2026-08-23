import React from 'react';

export type MobileTab = 'catalog' | 'pockets' | 'command';

interface MobileCommandBarProps {
    activeTab: MobileTab;
    onTabChange: (tab: MobileTab) => void;
    orderCount: number;
    dropCount: number;
    hasCommand: boolean;
}

// Text/icon colors are darkened versions of the brand palette so they clear
// WCAG AA contrast (4.5:1) at this small font size — the original #37b06d /
// #2ea466 read great as accents but fail as text-on-white.
const COLORS = {
    primary: '#37b06d', // accent only: pill, tint fill — never used for text
    primaryText: '#1a7a45', // active label/icon color, ~5.4:1 on white
    inactiveText: '#6b7280', // inactive label/icon color, ~4.8:1 on white
    primaryTint: 'rgba(55, 176, 109, 0.10)',
    pocketsBadge: '#1f7a4d', // ~5.4:1 with white badge text
    commandBadge: '#b45309', // ~5.0:1 with white badge text
};

export const MobileCommandBar: React.FC<MobileCommandBarProps> = ({
    activeTab,
    onTabChange,
    orderCount,
    dropCount,
    hasCommand,
}) => {
    const totalCount = orderCount + dropCount;

    const tabs: {
        id: MobileTab;
        icon: string;
        label: string;
        badge?: number | string;
        badgeColor?: string;
        badgeDescription?: string;
    }[] = [
            {
                id: 'catalog',
                icon: 'fa-magnifying-glass',
                label: 'Browse',
            },
            {
                id: 'pockets',
                icon: 'fa-boxes-stacked',
                label: 'Pockets',
                badge: totalCount > 0 ? (totalCount > 99 ? '99+' : totalCount) : undefined,
                badgeColor: COLORS.pocketsBadge,
                badgeDescription: `${totalCount} item${totalCount === 1 ? '' : 's'}`,
            },
            {
                id: 'command',
                icon: 'fa-terminal',
                label: 'Command',
                badge: hasCommand ? '!' : undefined,
                badgeColor: COLORS.commandBadge,
                badgeDescription: 'action needed',
            },
        ];

    const activeLabel = tabs.find((t) => t.id === activeTab)?.label ?? '';

    return (
        <>
            <style>{`
                @keyframes mcb-badge-pop {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes mcb-command-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(180, 83, 9, 0.35); }
                    50% { box-shadow: 0 0 0 4px rgba(180, 83, 9, 0); }
                }
                .mcb-tab {
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                .mcb-tab:active { background: rgba(15, 23, 42, 0.045); }
                .mcb-tab:active .mcb-icon-wrap { transform: scale(0.9); }
                .mcb-tab:focus-visible {
                    outline: 2px solid ${COLORS.primaryText};
                    outline-offset: -3px;
                    border-radius: 12px;
                }
                .mcb-label {
                    transition: transform 0.18s ease, font-weight 0.18s ease;
                }
                .mcb-tab[aria-selected="true"] .mcb-label {
                    transform: translateY(-1px);
                }
                @media (prefers-reduced-motion: reduce) {
                    .mcb-tab, .mcb-icon-wrap, .mcb-pill, .mcb-badge, .mcb-label {
                        transition: none !important;
                        animation: none !important;
                    }
                }
            `}</style>

            {/* Screen-reader announcement when the active tab changes */}
            <span className="visually-hidden" aria-live="polite">
                {activeLabel} tab selected
            </span>

            {/* Bottom Tab Bar */}
            <nav
                className="d-lg-none position-fixed bottom-0 start-0 end-0 border-top"
                role="tablist"
                aria-label="Command Builder mobile navigation"
                style={{
                    zIndex: 1050,
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(12px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.06)',
                }}
            >
                <div className="d-flex align-items-stretch" style={{ height: '64px' }}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const fullLabel = tab.badge !== undefined ? `${tab.label}, ${tab.badgeDescription}` : tab.label;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-current={isActive ? 'page' : undefined}
                                aria-label={fullLabel}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => onTabChange(tab.id)}
                                className="mcb-tab flex-fill d-flex flex-column align-items-center justify-content-center gap-1 border-0 bg-transparent position-relative"
                                style={{
                                    color: isActive ? COLORS.primaryText : COLORS.inactiveText,
                                    fontSize: '0.6rem',
                                    fontWeight: isActive ? 700 : 500,
                                    letterSpacing: '0.03em',
                                    textTransform: 'uppercase',
                                    transition: 'color 0.18s ease, background 0.15s ease',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                {/* Active indicator pill */}
                                <span
                                    className="mcb-pill position-absolute top-0 start-50"
                                    style={{
                                        transform: isActive ? 'translate(-50%, 0) scaleX(1)' : 'translate(-50%, 0) scaleX(0)',
                                        transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        width: '32px',
                                        height: '3px',
                                        borderRadius: '0 0 4px 4px',
                                        background: COLORS.primary,
                                    }}
                                    aria-hidden="true"
                                />

                                {/* Icon */}
                                <div
                                    className="mcb-icon-wrap position-relative d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: isActive ? COLORS.primaryTint : 'transparent',
                                        transition: 'background 0.18s ease, transform 0.15s ease',
                                    }}
                                >
                                    <i
                                        className={`fa-solid ${tab.icon}`}
                                        aria-hidden="true"
                                        style={{ fontSize: '1.05rem' }}
                                    />
                                    {/* Badge */}
                                    {tab.badge !== undefined && (
                                        <span
                                            className="mcb-badge position-absolute d-flex align-items-center justify-content-center text-white fw-bold"
                                            aria-hidden="true"
                                            style={{
                                                fontSize: '0.55rem',
                                                top: '-4px',
                                                right: '-6px',
                                                minWidth: '16px',
                                                height: '16px',
                                                padding: '0 4px',
                                                borderRadius: '999px',
                                                background: tab.badgeColor,
                                                border: '2px solid #fff',
                                                lineHeight: 1,
                                                animation:
                                                    'mcb-badge-pop 0.25s ease-out' +
                                                    (tab.id === 'command' ? ', mcb-command-pulse 2s ease-in-out infinite 0.3s' : ''),
                                            }}
                                        >
                                            {tab.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="mcb-label">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom spacer so content isn't hidden behind the fixed nav */}
            <div className="d-lg-none" style={{ height: '72px' }} aria-hidden="true" />
        </>
    );
};

export default MobileCommandBar;