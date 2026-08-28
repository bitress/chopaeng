import React from 'react';
import type { PublicPassportData } from '../../utils/userProfileApi';
import { playChimeClick } from '../../utils/kkAudioSynthesizer';

export const FRUIT_ICONS: Record<string, string> = {
    Apple: 'https://dodo.ac/np/images/2/22/Apple_NH_Inv_Icon.png',
    Cherry: 'https://dodo.ac/np/images/2/20/Cherry_NH_Inv_Icon.png',
    Orange: 'https://dodo.ac/np/images/8/87/Orange_NH_Inv_Icon.png',
    Peach: 'https://dodo.ac/np/images/8/86/Peach_NH_Inv_Icon.png',
    Pear: 'https://dodo.ac/np/images/e/e0/Pear_NH_Inv_Icon.png',
    Coconut: 'https://dodo.ac/np/images/2/2f/Coconut_NH_Inv_Icon.png',
};

export const ZODIAC_SIGNS: Record<string, string> = {
    January: '♑ Capricorn / ♒ Aquarius',
    February: '♒ Aquarius / ♓ Pisces',
    March: '♓ Pisces / ♈ Aries',
    April: '♈ Aries / ♉ Taurus',
    May: '♉ Taurus / ♊ Gemini',
    June: '♊ Gemini / ♋ Cancer',
    July: '♋ Cancer / ♌ Leo',
    August: '♌ Leo / ♍ Virgo',
    September: '♍ Virgo / ♎ Libra',
    October: '♎ Libra / ♏ Scorpio',
    November: '♏ Scorpio / ♐ Sagittarius',
    December: '♐ Sagittarius / ♑ Capricorn',
};

export const PERSONALITY_THEMES: Record<string, { bg: string; text: string; icon: string }> = {
    Lazy: { bg: '#fef3c7', text: '#b45309', icon: 'fa-bed' },
    Jock: { bg: '#fee2e2', text: '#b91c1c', icon: 'fa-dumbbell' },
    Cranky: { bg: '#f3e8ff', text: '#7e22ce', icon: 'fa-bolt' },
    Smug: { bg: '#dbeafe', text: '#1d4ed8', icon: 'fa-glasses' },
    Normal: { bg: '#d1fae5', text: '#047857', icon: 'fa-book-open' },
    Peppy: { bg: '#fce7f3', text: '#be185d', icon: 'fa-sparkles' },
    Snooty: { bg: '#e0e7ff', text: '#4338ca', icon: 'fa-gem' },
    'Big Sister': { bg: '#ccfbf1', text: '#0f766e', icon: 'fa-shield-heart' },
};

interface VillagerCatalogItem {
    name: string;
    image?: string | null;
    variations?: Array<{ imageUrl?: string | null }>;
    species?: string;
    personality?: string;
}

interface ResidentPassportCardProps {
    passport: PublicPassportData;
    allVillagers?: VillagerCatalogItem[];
    avatarUrl?: string | null;
    interactive?: boolean;
    onShareClick?: () => void;
    shareCopied?: boolean;
}

export const ResidentPassportCard: React.FC<ResidentPassportCardProps> = ({
    passport,
    allVillagers = [],
    avatarUrl,
    interactive = true,
    onShareClick,
    shareCopied = false,
}) => {
    const [imgError, setImgError] = React.useState(false);
    const displayAvatar = avatarUrl || passport.avatarUrl;

    const zodiac = ZODIAC_SIGNS[passport.birthMonth] || 'Island Star';
    const personalityStyle = PERSONALITY_THEMES[passport.personality] || PERSONALITY_THEMES.Normal;
    const fruitIcon = FRUIT_ICONS[passport.nativeFruit] || FRUIT_ICONS.Apple;

    const passportNumber = `CP-${(passport.username || 'RESIDENT').toUpperCase().slice(0, 8)}-${passport.birthDay || '01'}`;

    return (
        <div className="ac-passport-wrapper">
            <div className="ac-passport-booklet">
                {/* DAL Circular Watermark Seal */}
                <div className="ac-passport-stamp-seal d-none d-md-flex">
                    <span className="stamp-top">DAL PASSPORT</span>
                    <span className="stamp-mid">DODO</span>
                    <span className="stamp-bot">VERIFIED 2026</span>
                </div>

                {/* 1. Header Banner */}
                <div className="ac-passport-header">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3">
                            <div className="ac-passport-leaf-seal">
                                <i className="fa-solid fa-leaf"></i>
                            </div>
                            <div>
                                <h1 className="ac-passport-title text-white mb-0">
                                    ChoPaeng Resident Passport
                                </h1>
                                <div className="ac-passport-subtitle">
                                    Nook Inc. Deserted Island Getaway Package
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="ac-passport-seal-badge">
                                <i className="fa-solid fa-plane-departure text-warning"></i>
                                <span>{passportNumber}</span>
                            </span>
                            {onShareClick && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        playChimeClick();
                                        onShareClick();
                                    }}
                                    className={`btn btn-xs rounded-pill fw-bold px-3 py-1 d-inline-flex align-items-center gap-1 shadow-2xs ${
                                        shareCopied ? 'btn-success text-white' : 'btn-light text-dark'
                                    }`}
                                    title="Share Passport Link"
                                >
                                    <i className={`fa-solid ${shareCopied ? 'fa-check' : 'fa-share-nodes'}`}></i>
                                    <span>{shareCopied ? 'Copied!' : 'Share'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Passport Body */}
                <div className="p-3 p-md-4 position-relative" style={{ zIndex: 2 }}>
                    <div className="row g-4">
                        {/* Left: Polaroid Portrait Frame */}
                        <div className="col-12 col-md-4 col-lg-3">
                            <div className="ac-passport-polaroid text-center mx-auto" style={{ maxWidth: 220 }}>
                                <div className="ac-tape-strip"></div>
                                <div className="ac-passport-avatar-box">
                                    {displayAvatar && !imgError ? (
                                        <img
                                            src={displayAvatar}
                                            alt={`${passport.username || 'Resident'}'s avatar`}
                                            className="ac-passport-avatar-img"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <i className="fa-solid fa-crown ac-passport-avatar-icon"></i>
                                    )}
                                </div>
                                <div className="ac-passport-polaroid-caption">
                                    <div className="ac-passport-ign text-truncate">
                                        {passport.primaryIgn || passport.username || "Resident"}
                                    </div>
                                    <div className="tiny-text text-muted fw-bold">
                                        Island Representative
                                    </div>
                                    {passport.showCharacterAndIsland && (
                                        <div className="ac-passport-island-pill text-truncate">
                                            <i className="fa-solid fa-tree text-success"></i>
                                            <span>{passport.primaryIsland || "Cho Island"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Resident Details & Quote Bubble */}
                        <div className="col-12 col-md-8 col-lg-9">
                            {/* In-Game Comment Bubble */}
                            <div className="ac-passport-quote-bubble">
                                <div className="d-flex align-items-start gap-2">
                                    <i className="fa-solid fa-quote-left text-success mt-1 opacity-50"></i>
                                    <p className="ac-passport-quote-text mb-0">
                                        {passport.aboutYou || "Living my best island life in Animal Crossing: New Horizons!"}
                                    </p>
                                </div>
                            </div>

                            {/* 6-Pill Field Grid */}
                            <div className="row g-2 g-md-3">
                                {/* Birthday & Zodiac */}
                                <div className="col-6 col-md-4">
                                    <div className="ac-passport-data-pill">
                                        <span className="ac-passport-data-label">
                                            <i className="fa-solid fa-cake-candles text-warning"></i> Birthday
                                        </span>
                                        <span className="ac-passport-data-val">
                                            {passport.birthMonth} {passport.birthDay}
                                        </span>
                                        <span className="tiny-text text-muted">{zodiac}</span>
                                    </div>
                                </div>

                                {/* Native Fruit */}
                                <div className="col-6 col-md-4">
                                    <div className="ac-passport-data-pill">
                                        <span className="ac-passport-data-label">
                                            <i className="fa-solid fa-apple-whole text-danger"></i> Native Fruit
                                        </span>
                                        <span className="ac-passport-data-val">
                                            <img
                                                src={fruitIcon}
                                                alt=""
                                                style={{ width: 20, height: 20, objectFit: 'contain' }}
                                                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                            />
                                            <span>{passport.nativeFruit}</span>
                                        </span>
                                        <span className="tiny-text text-muted">Island Orchard Origin</span>
                                    </div>
                                </div>

                                {/* Personality */}
                                <div className="col-6 col-md-4">
                                    <div className="ac-passport-data-pill">
                                        <span className="ac-passport-data-label">
                                            <i className="fa-solid fa-smile text-info"></i> Personality
                                        </span>
                                        <span className="ac-passport-data-val">
                                            <span
                                                className="badge rounded-pill x-small fw-bold px-2 py-1"
                                                style={{ backgroundColor: personalityStyle.bg, color: personalityStyle.text }}
                                            >
                                                <i className={`fa-solid ${personalityStyle.icon} me-1`}></i>
                                                {passport.personality}
                                            </span>
                                        </span>
                                        <span className="tiny-text text-muted">Island Spirit</span>
                                    </div>
                                </div>

                                {/* Favorite Song */}
                                <div className="col-6 col-md-4">
                                    <div className="ac-passport-data-pill">
                                        <span className="ac-passport-data-label">
                                            <i className="fa-solid fa-music text-success"></i> K.K. Favorite
                                        </span>
                                        <span className="ac-passport-data-val text-truncate" title={passport.favouriteSong}>
                                            <i className="fa-solid fa-compact-disc text-muted small"></i>
                                            <span className="text-truncate">{passport.favouriteSong || "K.K. Cruisin'"}</span>
                                        </span>
                                        <span className="tiny-text text-muted">Aircheck Track</span>
                                    </div>
                                </div>

                                {/* Island Theme / Color */}
                                <div className="col-6 col-md-4">
                                    <div className="ac-passport-data-pill">
                                        <span className="ac-passport-data-label">
                                            <i className="fa-solid fa-palette text-primary"></i> Theme Color
                                        </span>
                                        <span className="ac-passport-data-val">
                                            <span
                                                className="rounded-circle border d-inline-block"
                                                style={{ width: 16, height: 16, backgroundColor: passport.favouriteColour || '#37b06d' }}
                                            ></span>
                                            <span>{passport.favouriteColour || "#37b06d"}</span>
                                        </span>
                                        <span className="tiny-text text-muted">Signature Palette</span>
                                    </div>
                                </div>

                                {/* Country & Language */}
                                <div className="col-6 col-md-4">
                                    <div className="ac-passport-data-pill">
                                        <span className="ac-passport-data-label">
                                            <i className="fa-solid fa-globe text-secondary"></i> Origin &amp; Lang
                                        </span>
                                        <span className="ac-passport-data-val text-truncate">
                                            {passport.country || "Island Paradise"}
                                        </span>
                                        <span className="tiny-text text-muted">{passport.language || "English"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Favorite Villager Besties Gallery (Up to 10) */}
                    {passport.favouriteVillagers && passport.favouriteVillagers.length > 0 && (
                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h3 className="h6 fw-black text-dark mb-0 ac-font d-flex align-items-center gap-2">
                                    <i className="fa-solid fa-paw text-warning"></i>
                                    Island Besties &amp; Favorite Villagers ({passport.favouriteVillagers.length}/10)
                                </h3>
                                <span className="tiny-text text-muted">Deserted Island Crew</span>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                                {passport.favouriteVillagers.map((vName) => {
                                    const matched = allVillagers.find((v) => v.name.toLowerCase() === vName.toLowerCase());
                                    const sprite = matched?.image || matched?.variations?.[0]?.imageUrl;

                                    return (
                                        <div
                                            key={vName}
                                            className="ac-passport-villager-chip"
                                            onClick={() => {
                                                if (interactive) playChimeClick();
                                            }}
                                            title={`${vName}${matched?.species ? ` · ${matched.species}` : ''}`}
                                        >
                                            {sprite ? (
                                                <img
                                                    src={sprite}
                                                    alt={vName}
                                                    className="ac-passport-villager-img"
                                                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="ac-passport-villager-img d-flex align-items-center justify-content-center">
                                                    <i className="fa-solid fa-paw text-success tiny-text"></i>
                                                </div>
                                            )}
                                            <span className="ac-passport-villager-name">{vName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 4. DAL Boarding Barcode & Official Stamp Line */}
                    <div className="ac-passport-barcode-bar">
                        <div className="d-flex align-items-center gap-3">
                            <div className="ac-passport-fake-barcode">
                                |||| | ||| ||||| || |||||| | |||
                            </div>
                            <span className="tiny-text text-muted font-monospace d-none d-sm-inline">
                                DAL-FLIGHT-2026-CHOPAENG
                            </span>
                        </div>

                        <div className="d-flex align-items-center gap-2 tiny-text fw-bold text-success">
                            <i className="fa-solid fa-shield-check"></i>
                            <span>OFFICIAL NOOK INC. PASSPORT</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
