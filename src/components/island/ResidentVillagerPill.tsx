import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FINDER_API_BASE } from "../../config/api";
import { useVillagersData } from "../../hooks/useVillagersData";
import { PERSONALITY_COLORS, FALLBACK_PALETTE } from "../../config/constants";

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getPersonalityStyle(personality: string | undefined, seed: string) {
    const key = personality?.toLowerCase().trim();
    if (key && PERSONALITY_COLORS[key]) return PERSONALITY_COLORS[key];
    return FALLBACK_PALETTE[hashString(seed) % FALLBACK_PALETTE.length];
}

export const ResidentVillagerPill = ({ villagerName }: { villagerName: string }) => {
    const navigate = useNavigate();
    const { getVillagerByName } = useVillagersData();
    const matched = getVillagerByName(villagerName) || null;

    const fallbackImg =
        matched?.image ||
        `https://www.pange.ca/itemsearch/villagers/${matched?.id || villagerName.toLowerCase()}.png`;

    const [iconUrl, setIconUrl] = useState<string | null>(matched?.image || null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const localImg = matched?.image || null;
        setIconUrl(localImg);
        setImgError(false);

        // If local high-res icon is already available, skip expensive network call
        if (localImg) return;

        let isMounted = true;
        const fetchIcon = async () => {
            try {
                const res = await fetch(`${FINDER_API_BASE}/api/v1/villager/${encodeURIComponent(villagerName)}`);
                if (!res.ok) return;

                const data = await res.json();
                const fetchedIcon =
                    data.villager?.nh_details?.icon_url ||
                    data.villager?.image_url ||
                    data.icon_url ||
                    data.image_url;

                if (fetchedIcon && isMounted) {
                    setIconUrl(fetchedIcon);
                }
            } catch {
                // Let the fallback handle the apocalypse
            }
        };

        fetchIcon();

        return () => {
            isMounted = false;
        };
    }, [villagerName, matched?.image]);

    const displayImg = iconUrl || fallbackImg;
    const style = getPersonalityStyle(matched?.personality, villagerName.toLowerCase());
    const personalityLabel = matched?.personality
        ? matched.personality.charAt(0).toUpperCase() + matched.personality.slice(1)
        : null;

    const handleClick = () => {
        const pathId = matched ? matched.id : encodeURIComponent(villagerName.toLowerCase());
        navigate(`/villager/${pathId}`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="villager-pill border-0 d-inline-flex align-items-center gap-2"
            title={personalityLabel ? `${villagerName} · ${personalityLabel}` : `View ${villagerName} details`}
            style={{
                background: style.bg,
                borderRadius: "999px",
                padding: "6px 14px 6px 6px",
                transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
        >
            <div
                className="rounded-circle overflow-hidden bg-white d-flex align-items-center justify-content-center flex-shrink-0 position-relative"
                style={{
                    width: "36px",
                    height: "36px",
                    border: `2px solid ${style.ring}`,
                    boxShadow: `0 0 0 2px ${style.bg}`,
                }}
            >
                {!imgError && displayImg ? (
                    <img
                        src={displayImg}
                        alt={villagerName}
                        className="w-100 h-100 object-fit-contain"
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <i className="fa-solid fa-paw small" style={{ color: style.ring }} role="img" aria-label={villagerName}></i>
                )}
            </div>
            <span className="d-flex flex-column align-items-start lh-sm">
                <span className="fw-bold small" style={{ color: style.text }}>
                    {villagerName}
                </span>
                {personalityLabel && (
                    <span className="text-uppercase" style={{ fontSize: "9px", letterSpacing: "0.04em", color: style.text, opacity: 0.75 }}>
                        {personalityLabel}
                    </span>
                )}
            </span>
        </button>
    );
};
