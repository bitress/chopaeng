import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHemisphere } from '../hooks/useHemisphere';
import { playChimeClick } from '../utils/kkAudioSynthesizer';


interface VillagerRaw {
    name: string;
    iconImage?: string;
    birthday?: string;
    species?: string;
    personality?: string;
}


const FALLBACK_IMAGE = 'https://acnhcdn.com/latest/FtrIcon/FtrLeaf.png';

/* ── Scoped styles ──────────────────────────────────────────── */
const styles = `
/* ── Snapshot Card ── */
.snapshot-card {
    position: relative;
    border-radius: 1.25rem;
    overflow: hidden;
    border: none;
    box-shadow: 0 4px 24px rgba(55,176,109,0.10), 0 1.5px 6px rgba(0,0,0,0.04);
    background: var(--card-bg, #fff);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.snapshot-card:hover {
    box-shadow: 0 8px 36px rgba(55,176,109,0.16), 0 2px 10px rgba(0,0,0,0.06);
    transform: translateY(-2px);
}

/* ── Header band ── */
.snapshot-header {
    background-color: var(--nook-green, #37b06d);
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
}
[data-theme="celeste"] .snapshot-header {
    background-color: #7c3aed;
}
[data-theme="roost"] .snapshot-header {
    background-color: #a06b43;
}
[data-theme="sakura"] .snapshot-header {
    background-color: #ec4899;
}
[data-theme="dal"] .snapshot-header {
    background-color: #0284c7;
}
[data-theme="nooklink"] .snapshot-header {
    background-color: #10b981;
}

.snapshot-title {
    font-size: 1.15rem;
    color: #fff !important;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-shadow: 0 1px 4px rgba(0,0,0,0.12);
    position: relative;
    z-index: 1;
}
.snapshot-date-badge {
    background: rgba(255,255,255,0.22);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 2rem;
    padding: 0.35rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    position: relative;
    z-index: 1;
}

/* Sun icon spin */
.snapshot-sun {
    display: inline-block;
    animation: sunPulse 4s ease-in-out infinite;
    font-size: 1.1rem;
}
@keyframes sunPulse {
    0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 4px rgba(255,200,60,0.5)); }
    50%      { transform: rotate(15deg) scale(1.15); filter: drop-shadow(0 0 10px rgba(255,200,60,0.8)); }
}

/* ── Section panels ── */
.snapshot-body {
    padding: 1.25rem 1.5rem 1.5rem;
}
.snapshot-section {
    border-radius: 1rem;
    padding: 1.1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    position: relative;
    overflow: hidden;
}
.snapshot-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.snapshot-section::after {
    content: '';
    position: absolute;
    top: -30px;
    right: -20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    opacity: 0.07;
    pointer-events: none;
}
.snapshot-section--critters {
    background-color: #f0fbf5;
    border: 1px solid rgba(55,176,109,0.18);
}
.snapshot-section--critters::after { background: var(--nook-green); }
[data-theme="celeste"] .snapshot-section--critters {
    background-color: #0f172a;
    border-color: rgba(167,139,250,0.25);
}
[data-theme="roost"] .snapshot-section--critters {
    background-color: #1c1917;
    border-color: rgba(217,119,6,0.25);
}
[data-theme="sakura"] .snapshot-section--critters {
    background-color: #fdf2f8;
    border-color: rgba(236,72,153,0.25);
}
[data-theme="dal"] .snapshot-section--critters {
    background-color: #0f172a;
    border-color: rgba(56,189,248,0.28);
}
[data-theme="nooklink"] .snapshot-section--critters {
    background-color: #090d16;
    border-color: rgba(16,185,129,0.3);
}

.snapshot-section--birthdays {
    background-color: #fffcf0;
    border: 1px solid rgba(240,173,78,0.18);
}
.snapshot-section--birthdays::after { background: var(--nook-yellow); }
[data-theme="celeste"] .snapshot-section--birthdays {
    background-color: #0f172a;
    border-color: rgba(251,191,36,0.25);
}
[data-theme="roost"] .snapshot-section--birthdays {
    background-color: #1c1917;
    border-color: rgba(245,158,11,0.25);
}
[data-theme="sakura"] .snapshot-section--birthdays {
    background-color: #fff1f2;
    border-color: rgba(244,63,94,0.25);
}
[data-theme="dal"] .snapshot-section--birthdays {
    background-color: #0f172a;
    border-color: rgba(251,191,36,0.25);
}
[data-theme="nooklink"] .snapshot-section--birthdays {
    background-color: #090d16;
    border-color: rgba(250,204,21,0.25);
}

/* ── Section headers ── */
.snapshot-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}
.snapshot-section-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 800;
    font-size: 0.82rem;
    color: var(--text, #5e564d);
}
[data-theme="celeste"] .snapshot-section-label {
    color: #f8fafc;
}
[data-theme="roost"] .snapshot-section-label {
    color: #fafaf9;
}
[data-theme="sakura"] .snapshot-section-label {
    color: #3b072c;
}
[data-theme="dal"] .snapshot-section-label {
    color: #f8fafc;
}
[data-theme="nooklink"] .snapshot-section-label {
    color: #f8fafc;
}
.snapshot-section-label i {
    font-size: 0.95rem;
}
.snapshot-count-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.7rem;
    border-radius: 2rem;
    letter-spacing: 0.2px;
}
.snapshot-count-badge--critters {
    background: rgba(55,176,109,0.12);
    color: var(--nook-green);
}
[data-theme="celeste"] .snapshot-count-badge--critters {
    background: rgba(139,92,246,0.22);
    color: #c4b5fd;
}
[data-theme="roost"] .snapshot-count-badge--critters {
    background: rgba(217,119,6,0.22);
    color: #fcd34d;
}
[data-theme="sakura"] .snapshot-count-badge--critters {
    background: rgba(236,72,153,0.18);
    color: #db2777;
}
[data-theme="dal"] .snapshot-count-badge--critters {
    background: rgba(2,132,199,0.22);
    color: #38bdf8;
}
[data-theme="nooklink"] .snapshot-count-badge--critters {
    background: rgba(16,185,129,0.22);
    color: #34d399;
}
.snapshot-count-badge--birthdays {
    background: rgba(240,173,78,0.14);
    color: #c88a2a;
}
[data-theme="celeste"] .snapshot-count-badge--birthdays {
    background: rgba(251,191,36,0.22);
    color: #fde047;
}
[data-theme="roost"] .snapshot-count-badge--birthdays {
    background: rgba(245,158,11,0.22);
    color: #fcd34d;
}
[data-theme="sakura"] .snapshot-count-badge--birthdays {
    background: rgba(244,63,94,0.18);
    color: #e11d48;
}
[data-theme="dal"] .snapshot-count-badge--birthdays {
    background: rgba(251,191,36,0.22);
    color: #fbbf24;
}
[data-theme="nooklink"] .snapshot-count-badge--birthdays {
    background: rgba(250,204,21,0.22);
    color: #facc15;
}

/* ── Creature / villager chips ── */
.snapshot-chip {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background: var(--card-bg, #fff);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 2rem;
    padding: 0.35rem 0.75rem 0.35rem 0.35rem;
    transition: all 0.22s ease;
    cursor: default;
}
.snapshot-chip:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-color: rgba(55,176,109,0.25);
}
[data-theme="celeste"] .snapshot-chip {
    background: #1e293b;
    border-color: rgba(167,139,250,0.25);
}
[data-theme="celeste"] .snapshot-chip:hover {
    border-color: rgba(167,139,250,0.5);
    box-shadow: 0 4px 14px rgba(139,92,246,0.25);
}
[data-theme="roost"] .snapshot-chip {
    background: #292524;
    border-color: rgba(217,119,6,0.25);
}
[data-theme="roost"] .snapshot-chip:hover {
    border-color: rgba(245,158,11,0.5);
    box-shadow: 0 4px 14px rgba(217,119,6,0.25);
}
[data-theme="sakura"] .snapshot-chip {
    background: #ffffff;
    border-color: rgba(236,72,153,0.25);
}
[data-theme="sakura"] .snapshot-chip:hover {
    border-color: #ec4899;
    box-shadow: 0 4px 14px rgba(236,72,153,0.25);
}
[data-theme="dal"] .snapshot-chip {
    background: #1e293b;
    border-color: rgba(56,189,248,0.28);
}
[data-theme="dal"] .snapshot-chip:hover {
    border-color: #38bdf8;
    box-shadow: 0 4px 14px rgba(56,189,248,0.28);
}
[data-theme="nooklink"] .snapshot-chip {
    background: #111827;
    border-color: rgba(16,185,129,0.3);
}
[data-theme="nooklink"] .snapshot-chip:hover {
    border-color: #10b981;
    box-shadow: 0 4px 14px rgba(16,185,129,0.3);
}

.snapshot-chip-icon {
    width: 30px;
    height: 30px;
    object-fit: contain;
    border-radius: 50%;
    background: #f8f9fa;
    padding: 2px;
    flex-shrink: 0;
}
[data-theme="celeste"] .snapshot-chip-icon {
    background: rgba(139,92,246,0.18);
}
[data-theme="roost"] .snapshot-chip-icon {
    background: rgba(217,119,6,0.18);
}
[data-theme="sakura"] .snapshot-chip-icon {
    background: rgba(236,72,153,0.15);
}
[data-theme="dal"] .snapshot-chip-icon {
    background: rgba(56,189,248,0.18);
}
[data-theme="nooklink"] .snapshot-chip-icon {
    background: rgba(16,185,129,0.18);
}

.snapshot-chip-name {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text, #5e564d);
    line-height: 1.1;
}
[data-theme="celeste"] .snapshot-chip-name {
    color: #f8fafc;
}
[data-theme="roost"] .snapshot-chip-name {
    color: #fafaf9;
}
[data-theme="sakura"] .snapshot-chip-name {
    color: #3b072c;
}
[data-theme="dal"] .snapshot-chip-name {
    color: #f8fafc;
}
[data-theme="nooklink"] .snapshot-chip-name {
    color: #f8fafc;
}

.snapshot-chip-price {
    font-size: 0.65rem;
    font-weight: 800;
    color: #c88a2a;
    display: flex;
    align-items: center;
    gap: 2px;
}
[data-theme="celeste"] .snapshot-chip-price { color: #fde047; }
[data-theme="roost"] .snapshot-chip-price { color: #fcd34d; }
[data-theme="sakura"] .snapshot-chip-price { color: #db2777; }
[data-theme="dal"] .snapshot-chip-price { color: #fbbf24; }
[data-theme="nooklink"] .snapshot-chip-price { color: #facc15; }

.snapshot-chip-species {
    font-size: 0.62rem;
    color: #999;
    font-weight: 600;
}
[data-theme="celeste"] .snapshot-chip-species { color: #a5b4fc; }
[data-theme="roost"] .snapshot-chip-species { color: #fed7aa; }
[data-theme="sakura"] .snapshot-chip-species { color: #9d4e7f; }
[data-theme="dal"] .snapshot-chip-species { color: #94a3b8; }
[data-theme="nooklink"] .snapshot-chip-species { color: #94a3b8; }

/* ── Empty state ── */
.snapshot-empty {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0;
    font-size: 0.78rem;
    color: #aaa;
    font-weight: 600;
}
[data-theme="celeste"] .snapshot-empty { color: #94a3b8; }
[data-theme="roost"] .snapshot-empty { color: #a8a29e; }
[data-theme="sakura"] .snapshot-empty { color: #9d4e7f; }
[data-theme="dal"] .snapshot-empty { color: #94a3b8; }
[data-theme="nooklink"] .snapshot-empty { color: #94a3b8; }
.snapshot-empty i { font-size: 1.1rem; opacity: 0.5; }

/* ── Section CTA button ── */
.snapshot-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: auto;
    padding-top: 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--nook-green);
    background: none;
    border: none;
    text-decoration: none;
    transition: color 0.2s ease, gap 0.2s ease;
}
.snapshot-cta:hover {
    color: var(--nook-dark, #27844f);
    gap: 0.55rem;
}
.snapshot-cta--warn { color: #c88a2a; }
.snapshot-cta--warn:hover { color: #a87420; }
[data-theme="celeste"] .snapshot-cta { color: #a78bfa; }
[data-theme="celeste"] .snapshot-cta:hover { color: #c4b5fd; }
[data-theme="celeste"] .snapshot-cta--warn { color: #fbbf24; }
[data-theme="celeste"] .snapshot-cta--warn:hover { color: #fcd34d; }
[data-theme="roost"] .snapshot-cta { color: #f59e0b; }
[data-theme="roost"] .snapshot-cta:hover { color: #fbbf24; }
[data-theme="roost"] .snapshot-cta--warn { color: #f59e0b; }
[data-theme="roost"] .snapshot-cta--warn:hover { color: #fbbf24; }
[data-theme="sakura"] .snapshot-cta { color: #ec4899; }
[data-theme="sakura"] .snapshot-cta:hover { color: #db2777; }
[data-theme="sakura"] .snapshot-cta--warn { color: #f43f5e; }
[data-theme="sakura"] .snapshot-cta--warn:hover { color: #e11d48; }
[data-theme="dal"] .snapshot-cta { color: #0284c7; }
[data-theme="dal"] .snapshot-cta:hover { color: #38bdf8; }
[data-theme="dal"] .snapshot-cta--warn { color: #fbbf24; }
[data-theme="dal"] .snapshot-cta--warn:hover { color: #fcd34d; }
[data-theme="nooklink"] .snapshot-cta { color: #10b981; }
[data-theme="nooklink"] .snapshot-cta:hover { color: #34d399; }
[data-theme="nooklink"] .snapshot-cta--warn { color: #facc15; }
[data-theme="nooklink"] .snapshot-cta--warn:hover { color: #fde047; }

/* ── Quick links ── */
.snapshot-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem 1.5rem 1.25rem;
    justify-content: center;
    border-top: 1px solid rgba(0,0,0,0.05);
}
[data-theme="celeste"] .snapshot-links { border-color: rgba(167,139,250,0.15); }
[data-theme="roost"] .snapshot-links { border-color: rgba(217,119,6,0.15); }
[data-theme="sakura"] .snapshot-links { border-color: rgba(236,72,153,0.2); }
[data-theme="dal"] .snapshot-links { border-color: rgba(56,189,248,0.2); }
[data-theme="nooklink"] .snapshot-links { border-color: rgba(16,185,129,0.2); }

.snapshot-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 1rem;
    border-radius: 2rem;
    font-size: 0.73rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.22s ease;
    border: 1.5px solid;
    background: transparent;
    position: relative;
    overflow: hidden;
}
.snapshot-link-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.22s ease;
}
.snapshot-link-btn:hover::before { opacity: 1; }
.snapshot-link-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

.snapshot-link-btn--events {
    color: var(--nook-green);
    border-color: var(--nook-green);
}
.snapshot-link-btn--events::before { background: rgba(55,176,109,0.06); }
.snapshot-link-btn--events:hover {
    background: var(--nook-green);
    color: #fff;
    box-shadow: 0 4px 14px rgba(55,176,109,0.25);
}

.snapshot-link-btn--collection {
    color: var(--dal-blue, #4090bd);
    border-color: var(--dal-blue, #4090bd);
}
.snapshot-link-btn--collection::before { background: rgba(64,144,189,0.06); }
.snapshot-link-btn--collection:hover {
    background: var(--dal-blue, #4090bd);
    color: #fff;
    box-shadow: 0 4px 14px rgba(64,144,189,0.25);
}

.snapshot-link-btn--wishlist {
    color: #e85d75;
    border-color: #e85d75;
}
.snapshot-link-btn--wishlist::before { background: rgba(232,93,117,0.06); }
.snapshot-link-btn--wishlist:hover {
    background: #e85d75;
    color: #fff;
    box-shadow: 0 4px 14px rgba(232,93,117,0.25);
}

/* Stagger entrance */
.snapshot-stagger-1 { animation: snapshotSlideUp 0.45s 0.05s ease both; }
.snapshot-stagger-2 { animation: snapshotSlideUp 0.45s 0.15s ease both; }
.snapshot-stagger-3 { animation: snapshotSlideUp 0.45s 0.25s ease both; }

@keyframes snapshotSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;

const TodaySnapshot: React.FC = () => {
    const { hemisphere } = useHemisphere();
    const [availableCount, setAvailableCount] = useState(0);
    const [topCreatures, setTopCreatures] = useState<{ name: string; icon: string; sell: number }[]>([]);
    const [todayBirthdays, setTodayBirthdays] = useState<{ name: string; icon: string; species: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const now = useMemo(() => new Date(), []);
    const currentMonth = now.getMonth() + 1;
    const currentHour = now.getHours();
    const currentDay = now.getDate();

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [creaturesMod, villagersMod] = await Promise.all([
                    import('@bitress/animal-crossing/lib/data/Creatures.json'),
                    import('@bitress/animal-crossing/lib/data/Villagers.json'),
                ]);
                const creatures = (creaturesMod.default || creaturesMod) as any[];
                const villagers = (villagersMod.default || villagersMod) as any[];
                if (!mounted) return;

                // Available creatures right now
                if (Array.isArray(creatures)) {
                    const available = (creatures as any[]).filter((c: any) => {
                        const hemi = hemisphere === 'north' ? c.hemispheres?.north : c.hemispheres?.south;
                        return hemi?.monthsArray?.includes(currentMonth) && hemi?.timeArray?.includes(currentHour);
                    });
                    setAvailableCount(available.length);

                    // Top 4 by sell price
                    const sorted = [...available].sort((a: any, b: any) => (b.sell ?? 0) - (a.sell ?? 0));
                    setTopCreatures(sorted.slice(0, 4).map((c: any) => ({
                        name: String(c.name).split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        icon: c.iconImage || FALLBACK_IMAGE,
                        sell: c.sell ?? 0,
                    })));
                }

                // Today's birthdays
                if (Array.isArray(villagers)) {
                    const bdays = (villagers as any[]).filter((v: any) => {
                        if (!v.birthday) return false;
                        const parts = v.birthday.split('/');
                        return parseInt(parts[0]) === currentMonth && parseInt(parts[1]) === currentDay;
                    }).map((v: VillagerRaw) => ({
                        name: v.name,
                        icon: v.iconImage || FALLBACK_IMAGE,
                        species: v.species || '',
                    }));
                    setTodayBirthdays(bdays);
                }
            } catch (err) {
                console.error('Failed to load snapshot data:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [hemisphere, currentMonth, currentHour, currentDay]);

    if (loading) return null;

    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <>
            <style>{styles}</style>
            <div className="snapshot-card mb-4 animate-up">
                {/* ── Gradient Header ── */}
                <div className="snapshot-header">
                    <h2 className="snapshot-title ac-font fw-black">
                        <span className="snapshot-sun">
                            <i className={`fa-solid ${currentHour < 6 || currentHour >= 19 ? 'fa-moon' : 'fa-sun'}`} aria-hidden="true" />
                        </span>
                        {greeting} — Today's Snapshot
                    </h2>
                    <span className="snapshot-date-badge">
                        <i className="fa-regular fa-calendar me-1" aria-hidden="true" />
                        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {/* ── Body ── */}
                <div className="snapshot-body">
                    <div className="row g-3">
                        {/* Catchable Critters */}
                        <div className="col-12 col-md-6 snapshot-stagger-1">
                            <div className="snapshot-section snapshot-section--critters">
                                <div className="snapshot-section-header">
                                    <span className="snapshot-section-label">
                                        <i className="fa-solid fa-fish text-success" aria-hidden="true" />
                                        Catchable Right Now
                                    </span>
                                    <span className="snapshot-count-badge snapshot-count-badge--critters">
                                        {availableCount} critters
                                    </span>
                                </div>

                                {topCreatures.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {topCreatures.map((c, idx) => (
                                            <div key={idx} className="snapshot-chip">
                                                <img
                                                    src={c.icon}
                                                    alt={c.name}
                                                    className="snapshot-chip-icon"
                                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                />
                                                <div>
                                                    <div className="snapshot-chip-name">{c.name}</div>
                                                    <div className="snapshot-chip-price text-warning">
                                                        <i className="fa-solid fa-coins text-warning" aria-hidden="true" />
                                                        {c.sell.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="snapshot-empty">
                                        <i className="fa-solid fa-cloud-moon" aria-hidden="true" />
                                        No rare critters at this hour
                                    </div>
                                )}

                                <Link
                                    to="/critters"
                                    className="snapshot-cta"
                                    onClick={() => playChimeClick()}
                                >
                                    See all critters <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        {/* Today's Birthdays */}
                        <div className="col-12 col-md-6 snapshot-stagger-2">
                            <div className="snapshot-section snapshot-section--birthdays">
                                <div className="snapshot-section-header">
                                    <span className="snapshot-section-label">
                                        <i className="fa-solid fa-cake-candles text-warning" aria-hidden="true" />
                                        Today's Birthdays
                                    </span>
                                    <span className="snapshot-count-badge snapshot-count-badge--birthdays">
                                        {todayBirthdays.length} {todayBirthdays.length === 1 ? 'villager' : 'villagers'}
                                    </span>
                                </div>

                                {todayBirthdays.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {todayBirthdays.map((v, idx) => (
                                            <div key={idx} className="snapshot-chip">
                                                <img
                                                    src={v.icon}
                                                    alt={v.name}
                                                    className="snapshot-chip-icon rounded-circle"
                                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                />
                                                <div>
                                                    <div className="snapshot-chip-name">{v.name}</div>
                                                    {v.species && <div className="snapshot-chip-species">{v.species}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="snapshot-empty">
                                        <i className="fa-regular fa-face-sad-tear" aria-hidden="true" />
                                        No villager birthdays today
                                    </div>
                                )}

                                <Link
                                    to="/npcs"
                                    className="snapshot-cta snapshot-cta--warn"
                                    onClick={() => playChimeClick()}
                                >
                                    Birthday calendar <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Quick Links ── */}
                <div className="snapshot-links snapshot-stagger-3">
                    <Link to="/events" className="snapshot-link-btn snapshot-link-btn--events" onClick={() => playChimeClick()}>
                        <i className="fa-solid fa-calendar-days text-success" aria-hidden="true" /> Events
                    </Link>
                    <Link to="/my-collection" className="snapshot-link-btn snapshot-link-btn--collection" onClick={() => playChimeClick()}>
                        <i className="fa-solid fa-clipboard-check text-primary" aria-hidden="true" /> My Collection
                    </Link>
                    <Link to="/wishlist" className="snapshot-link-btn snapshot-link-btn--wishlist" onClick={() => playChimeClick()}>
                        <i className="fa-solid fa-heart text-danger" aria-hidden="true" /> Wishlist
                    </Link>
                </div>
            </div>
        </>
    );
};

export default TodaySnapshot;
