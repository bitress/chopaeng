import React from 'react';

interface DisclaimerBannerProps {
    className?: string;
    variant?: 'alert' | 'text' | 'footer';
    style?: React.CSSProperties;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
    className = "mt-4 mb-0",
    variant = "alert",
    style
}) => {
    if (variant === "footer") {
        return (
            <footer className={`container py-4 mt-4 border-top text-center text-muted small fw-bold position-relative z-2 ${className}`} style={style}>
                <p className="mb-0">
                    <strong>Disclaimer:</strong> Chopaeng is an unofficial fan community website and is not affiliated with, sponsored by, or endorsed by Nintendo Co., Ltd. Animal Crossing, Animal Crossing: New Horizons, and Nintendo Switch are registered trademarks of Nintendo.
                </p>
            </footer>
        );
    }

    if (variant === "text") {
        return (
            <p className={`x-small text-muted fw-bold ${className}`}>
                <strong>Disclaimer:</strong> Chopaeng is an unofficial fan community website and is not affiliated with, sponsored by, or endorsed by Nintendo Co., Ltd. Animal Crossing and Nintendo Switch are trademarks of Nintendo.
            </p>
        );
    }

    return (
        <div 
            className={`disclaimer-banner-card border text-center small py-3 px-4 rounded-4 shadow-sm ${className}`}
            style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text)',
                ...style
            }}
        >
            <i className="fa-solid fa-circle-info me-2 text-muted opacity-75"></i>
            <span className="opacity-90">
                <strong>Disclaimer:</strong> Chopaeng is an unofficial fan community website and is not affiliated with, sponsored by, or endorsed by Nintendo Co., Ltd. Animal Crossing and Nintendo Switch are trademarks of Nintendo.
            </span>
        </div>
    );
};

export default DisclaimerBanner;
