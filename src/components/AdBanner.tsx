import { useEffect, useRef } from "react";

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

interface AdBannerProps {
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const AdBanner = ({
    adSlot,
    adFormat = "auto",
    fullWidthResponsive = true,
    className = "",
    style = {},
}: AdBannerProps) => {
    const insRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            if (insRef.current && insRef.current.getAttribute("data-adsbygoogle-status") === null) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch {
            // AdSense may throw in development
        }
    }, []);

    return (
        <div className={`ad-banner-container text-center overflow-hidden ${className}`}>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: "block", ...style }}
                data-ad-client="ca-pub-7041376585192512"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
            />
        </div>
    );
};

export default AdBanner;
