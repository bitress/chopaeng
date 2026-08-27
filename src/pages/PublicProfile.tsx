import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPublicPassportFromDb, type PublicPassportData } from '../utils/userProfileApi';
import { useCatalogData } from '../hooks/useCatalogData';
import { playChimeClick } from '../utils/kkAudioSynthesizer';

const FRUIT_ICONS: Record<string, string> = {
    Apple: 'https://dodo.ac/np/images/2/22/Apple_NH_Inv_Icon.png',
    Cherry: 'https://dodo.ac/np/images/2/20/Cherry_NH_Inv_Icon.png',
    Orange: 'https://dodo.ac/np/images/8/87/Orange_NH_Inv_Icon.png',
    Peach: 'https://dodo.ac/np/images/8/86/Peach_NH_Inv_Icon.png',
    Pear: 'https://dodo.ac/np/images/e/e0/Pear_NH_Inv_Icon.png',
    Coconut: 'https://dodo.ac/np/images/2/2f/Coconut_NH_Inv_Icon.png',
};

const ZODIAC_SIGNS: Record<string, string> = {
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

export const PublicProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { data: catalogData } = useCatalogData();

    const [passport, setPassport] = useState<PublicPassportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        if (!username) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetchPublicPassportFromDb(username).then((data) => {
            setPassport(data);
            setLoading(false);
        });
    }, [username]);

    const handleCopyLink = () => {
        playChimeClick();
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    if (loading) {
        return (
            <div className="nook-bg min-vh-100 d-flex align-items-center justify-content-center p-4">
                <div className="text-center bg-white rounded-4 shadow-sm border p-5">
                    <div className="spinner-border text-success mb-3" role="status" />
                    <p className="fw-bold text-muted mb-0">Loading Resident Passport...</p>
                </div>
            </div>
        );
    }

    if (!passport || (!passport.isPublic && passport.username.toLowerCase() !== (username || '').toLowerCase())) {
        return (
            <div className="nook-bg min-vh-100 py-5 px-3 d-flex align-items-center justify-content-center">
                <Helmet>
                    <title>Private Resident Profile · Chopaeng</title>
                </Helmet>
                <div className="container" style={{ maxWidth: 540 }}>
                    <div className="bg-white rounded-5 shadow-sm border p-4 p-md-5 text-center">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-muted mb-3"
                            style={{ width: 72, height: 72, fontSize: '2rem' }}
                        >
                            <i className="fa-solid fa-lock" />
                        </div>
                        <h1 className="h4 fw-black text-dark mb-2 ac-font">This Profile is Private</h1>
                        <p className="text-muted small mb-4">
                            @{username} hasn't made their ACNH resident passport public yet, or this user does not exist.
                        </p>
                        <Link to="/" className="btn btn-success rounded-pill px-4 fw-bold shadow-2xs">
                            <i className="fa-solid fa-house me-1" /> Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const zodiac = ZODIAC_SIGNS[passport.birthMonth] || 'Island Star';
    const allVillagers = catalogData?.villagers || [];

    return (
        <div className="nook-bg min-vh-100 py-5 px-3 font-nunito">
            <Helmet>
                <title>{passport.username}'s ACNH Passport · Chopaeng</title>
                <meta
                    name="description"
                    content={`View ${passport.username}'s public Animal Crossing: New Horizons resident passport, favourite villagers, native fruit, and island details.`}
                />
            </Helmet>

            <div className="container" style={{ maxWidth: 840 }}>
                {/* Top Share Bar */}
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                    <Link to="/islands" className="btn btn-sm btn-light rounded-pill border fw-bold px-3 shadow-2xs">
                        <i className="fa-solid fa-arrow-left me-1" /> Explore Treasure Islands
                    </Link>

                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`btn btn-sm rounded-pill fw-bold px-3 shadow-2xs d-inline-flex align-items-center gap-1 ${
                            copiedLink ? 'btn-success text-white' : 'btn-dark text-white'
                        }`}
                    >
                        <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-share-nodes'}`} />
                        <span>{copiedLink ? 'Passport Link Copied!' : 'Share Passport'}</span>
                    </button>
                </div>

                {/* ════ MAIN PASSPORT BOOKLET CARD ════ */}
                <div className="card rounded-5 border-2 shadow-lg overflow-hidden bg-white mb-4">
                    {/* Passport Header Banner */}
                    <div
                        className="p-4 p-md-5 text-white position-relative"
                        style={{
                            background: '#1e293b',
                            borderBottom: '4px solid #37b06d',
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 position-relative" style={{ zIndex: 2 }}>
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white border-2 border-white shadow-sm flex-shrink-0"
                                    style={{
                                        width: 72,
                                        height: 72,
                                        backgroundColor: '#37b06d',
                                        fontSize: '1.8rem',
                                    }}
                                >
                                    <i className="fa-solid fa-passport" />
                                </div>
                                <div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="badge bg-success text-white rounded-pill x-small fw-bold text-uppercase tracking-wider">
                                            ACNH RESIDENT PASSPORT
                                        </span>
                                        {passport.pronouns && (
                                            <span className="badge bg-secondary text-white rounded-pill x-small">
                                                {passport.pronouns}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="h3 fw-black text-white mb-0 ac-font mt-1">{passport.username}</h1>
                                    {passport.showCharacterAndIsland && passport.primaryIsland && (
                                        <span className="text-white-50 tiny-text d-inline-flex align-items-center gap-1 mt-1">
                                            <i className="fa-solid fa-mountain-sun text-success" />
                                            <span>
                                                Island: <strong>{passport.primaryIsland}</strong>
                                                {passport.primaryIgn ? ` · Rep: ${passport.primaryIgn}` : ''}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-end d-none d-sm-block">
                                <span className="d-block tiny-text text-white-50 text-uppercase tracking-wider fw-bold">
                                    Nook Inc. Verified
                                </span>
                                <span className="font-monospace text-success fw-bold small">PASSPORT #{passport.username.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Passport Body Grid */}
                    <div className="p-4 p-md-5">
                        {/* Bio / About You Quote */}
                        {passport.aboutYou && (
                            <div className="card rounded-4 p-3 bg-light border mb-4 text-center">
                                <div className="text-muted fst-italic small">
                                    "{passport.aboutYou}"
                                </div>
                            </div>
                        )}

                        <div className="row g-4 mb-4">
                            {/* Birthday & Zodiac */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="p-3 rounded-4 bg-light border h-100">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                        <i className="fa-solid fa-cake-candles text-warning me-1" /> Birthday:
                                    </span>
                                    <strong className="text-dark d-block">
                                        {passport.birthMonth} {passport.birthDay}
                                    </strong>
                                    <span className="tiny-text text-muted">{zodiac}</span>
                                </div>
                            </div>

                            {/* Native Fruit */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="p-3 rounded-4 bg-light border h-100">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                        <i className="fa-solid fa-apple-whole text-danger me-1" /> Native Fruit:
                                    </span>
                                    <div className="d-flex align-items-center gap-2">
                                        {FRUIT_ICONS[passport.nativeFruit] && (
                                            <img
                                                src={FRUIT_ICONS[passport.nativeFruit]}
                                                alt=""
                                                style={{ width: 24, height: 24, objectFit: 'contain' }}
                                            />
                                        )}
                                        <strong className="text-dark">{passport.nativeFruit}</strong>
                                    </div>
                                    <span className="tiny-text text-muted">Island Orchard Origin</span>
                                </div>
                            </div>

                            {/* Personality */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="p-3 rounded-4 bg-light border h-100">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                        <i className="fa-solid fa-smile text-info me-1" /> Personality:
                                    </span>
                                    <strong className="text-dark d-block">{passport.personality}</strong>
                                    <span className="tiny-text text-muted">Island Vibe &amp; Spirit</span>
                                </div>
                            </div>

                            {/* Favourite Colour */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="p-3 rounded-4 bg-light border h-100">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                        <i className="fa-solid fa-palette text-primary me-1" /> Favourite Colour:
                                    </span>
                                    <div className="d-flex align-items-center gap-2">
                                        <span
                                            className="rounded-circle border"
                                            style={{
                                                width: 18,
                                                height: 18,
                                                backgroundColor: passport.favouriteColour || '#37b06d',
                                            }}
                                        />
                                        <strong className="text-dark">{passport.favouriteColour || 'Green'}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Favourite Song */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="p-3 rounded-4 bg-light border h-100">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                        <i className="fa-solid fa-music text-success me-1" /> Favourite Song:
                                    </span>
                                    <strong className="text-dark d-block">{passport.favouriteSong || 'K.K. Cruisin\''}</strong>
                                    <span className="tiny-text text-muted">K.K. Slider Jams</span>
                                </div>
                            </div>

                            {/* Location / Country */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="p-3 rounded-4 bg-light border h-100">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                        <i className="fa-solid fa-globe text-secondary me-1" /> Region &amp; Lang:
                                    </span>
                                    <strong className="text-dark d-block">{passport.country || 'Island Paradise'}</strong>
                                    <span className="tiny-text text-muted">{passport.language || 'English'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hobbies & Shows */}
                        {(passport.hobbies || passport.favouriteShowsFilms) && (
                            <div className="row g-3 mb-4">
                                {passport.hobbies && (
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-4 bg-light border h-100">
                                            <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                                <i className="fa-solid fa-icons text-warning me-1" /> Hobbies &amp; Interests:
                                            </span>
                                            <div className="small text-dark fw-bold">{passport.hobbies}</div>
                                        </div>
                                    </div>
                                )}
                                {passport.favouriteShowsFilms && (
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-4 bg-light border h-100">
                                            <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider d-block mb-1">
                                                <i className="fa-solid fa-film text-danger me-1" /> Favourite Shows &amp; Films:
                                            </span>
                                            <div className="small text-dark fw-bold">{passport.favouriteShowsFilms}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Favourite Villagers Showcase */}
                        {passport.favouriteVillagers && passport.favouriteVillagers.length > 0 && (
                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h3 className="h6 fw-black text-dark mb-0 ac-font d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-paw text-warning" />
                                        Favourite Villagers ({passport.favouriteVillagers.length})
                                    </h3>
                                    <span className="tiny-text text-muted">Island Besties</span>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    {passport.favouriteVillagers.map((vName) => {
                                        const matched = allVillagers.find((v) => v.name.toLowerCase() === vName.toLowerCase());
                                        const sprite = matched?.image || matched?.variations?.[0]?.imageUrl;

                                        return (
                                            <div
                                                key={vName}
                                                className="badge bg-light text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-2xs"
                                                style={{ fontSize: '0.82rem' }}
                                            >
                                                {sprite ? (
                                                    <img
                                                        src={sprite}
                                                        alt={vName}
                                                        style={{ width: 22, height: 22, objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <i className="fa-solid fa-paw text-warning small" />
                                                )}
                                                <span className="fw-bold">{vName}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="text-center text-muted tiny-text">
                    <span>Create your own custom ACNH Resident Passport on </span>
                    <Link to="/profile" className="text-success fw-bold">
                        Chopaeng Profile &amp; Passport Manager
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
