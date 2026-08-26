import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/logo.webp';
import { useAuth } from "../context/useAuth";
import { THEME_OPTIONS, getStoredTheme, setStoredTheme, type ThemeMode } from "../utils/theme";
import { openSuggestionModal } from "../utils/suggestionsApi";
import { KKSliderJukebox } from "./audio/KKSliderJukebox";
import { playChimeClick } from "../utils/kkAudioSynthesizer";

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme);
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showExploreDropdown, setShowExploreDropdown] = useState(false);

    const themeDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const exploreDropdownRef = useRef<HTMLDivElement>(null);
    const exploreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();

    useEffect(() => {
        const handleThemeUpdate = () => setCurrentTheme(getStoredTheme());
        window.addEventListener('chopaeng_theme_updated', handleThemeUpdate);
        return () => window.removeEventListener('chopaeng_theme_updated', handleThemeUpdate);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 15);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu and dropdowns on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowThemeDropdown(false);
        setShowUserDropdown(false);
        setShowExploreDropdown(false);
    }, [pathname]);

    // Handle body scroll locking on mobile menu open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);

    // Click outside listener for dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
                setShowThemeDropdown(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
                setShowUserDropdown(false);
            }
            if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(e.target as Node)) {
                setShowExploreDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            playChimeClick();
            await logout();
            setShowUserDropdown(false);
            navigate("/");
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const userAvatarUrl = useMemo(() => {
        if (!user || !user.avatar) return null;
        if (user.avatar.startsWith("http")) return user.avatar;
        return `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=64`;
    }, [user]);

    // Primary nav links — always visible in the pill
    const primaryLinks = useMemo(() => [
        { name: "Home", path: "/", icon: "fa-house" },
        { name: "Islands", path: "/islands", icon: "fa-map-location-dot" },
        { name: "Catalogue", path: "/catalog", icon: "fa-boxes-stacked" },
        { name: "Builder", path: "/command-builder", icon: "fa-cubes-stacked" },
    ], []);

    // "Explore" dropdown links — secondary features
    const exploreLinks = useMemo(() => [
        { name: "Find Items", path: "/find", icon: "fa-magnifying-glass", color: "#6366f1", desc: "Instant item search" },
        { name: "Critters", path: "/critters", icon: "fa-fish", color: "#0ea5e9", desc: "Availability calendar" },
        { name: "Events", path: "/events", icon: "fa-calendar-days", color: "#f59e0b", desc: "Seasons & holidays" },
        { name: "NPCs", path: "/npcs", icon: "fa-users", color: "#ec4899", desc: "Villager gallery" },
        { name: "Guides", path: "/guides", icon: "fa-book-open", color: "#8b5cf6", desc: "Tips & tutorials" },
    ], []);

    // User-only quick links for the dropdown
    const userQuickLinks = useMemo(() => [
        { name: "My Profile", path: "/profile", icon: "fa-user", color: "#16a34a" },
        { name: "My Wishlist", path: "/wishlist", icon: "fa-heart", color: "#ef4444" },
        { name: "My Collection", path: "/my-collection", icon: "fa-clipboard-check", color: "#f59e0b" },
        { name: "Pocket Inventory", path: "/pockets", icon: "fa-boxes-packing", color: "#3b82f6" },
        { name: "Order Bot", path: "/order", icon: "fa-paper-plane", color: "#06b6d4" },
    ], []);

    // All links for mobile
    const allNavLinks = useMemo(() => [
        { name: "Home", path: "/", icon: "fa-house" },
        { name: "Islands", path: "/islands", icon: "fa-map-location-dot" },
        { name: "Find", path: "/find", icon: "fa-magnifying-glass" },
        { name: "Catalogue", path: "/catalog", icon: "fa-boxes-stacked" },
        { name: "Critters", path: "/critters", icon: "fa-fish" },
        { name: "Events", path: "/events", icon: "fa-calendar-days" },
        { name: "NPCs", path: "/npcs", icon: "fa-users" },
        { name: "Builder", path: "/command-builder", icon: "fa-cubes-stacked" },
        { name: "Guides", path: "/guides", icon: "fa-book-open" },
    ], []);

    // Is the current route one of the "Explore" dropdown routes?
    const isExploreActive = exploreLinks.some(l => pathname === l.path || pathname.startsWith(l.path + '/'));

    const handleExploreEnter = () => {
        if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
        setShowExploreDropdown(true);
    };
    const handleExploreLeave = () => {
        exploreTimeoutRef.current = setTimeout(() => setShowExploreDropdown(false), 200);
    };

    return (
        <>
            <style>{`
                .chopaeng-navbar {
                    transition: background-color 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease, box-shadow 0.25s ease;
                }

                .chopaeng-navbar.scrolled {
                    background-color: var(--nav-scrolled-bg, rgba(255, 255, 255, 0.92));
                    border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
                    backdrop-filter: blur(18px) saturate(180%);
                    -webkit-backdrop-filter: blur(18px) saturate(180%);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.03);
                }

                .chopaeng-nav-pill-container {
                    background: var(--nav-pill-bg, rgba(255, 255, 255, 0.85));
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
                    padding: 3px;
                    border-radius: 50px;
                    gap: 1px;
                }

                .chopaeng-nav-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 14px;
                    border-radius: 50px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--text-muted, #64748b);
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    position: relative;
                }

                .chopaeng-nav-item:hover {
                    color: var(--text-dark, #1e293b);
                    background-color: rgba(0, 0, 0, 0.04);
                }

                .chopaeng-nav-item.active {
                    color: #ffffff !important;
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
                }

                .chopaeng-nav-item.active i {
                    color: #ffffff !important;
                }

                /* Explore "More" trigger */
                .chopaeng-explore-trigger {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 12px;
                    border-radius: 50px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--text-muted, #64748b);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    border: none;
                    background: transparent;
                }

                .chopaeng-explore-trigger:hover,
                .chopaeng-explore-trigger.open {
                    color: var(--text-dark, #1e293b);
                    background-color: rgba(0, 0, 0, 0.04);
                }

                .chopaeng-explore-trigger.has-active {
                    color: #16a34a;
                }

                .chopaeng-explore-trigger .chevron-icon {
                    font-size: 0.6rem;
                    transition: transform 0.2s ease;
                }

                .chopaeng-explore-trigger.open .chevron-icon {
                    transform: rotate(180deg);
                }

                /* Explore mega dropdown */
                .chopaeng-explore-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 10px;
                    width: 340px;
                    background: var(--card-bg, #ffffff);
                    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04);
                    padding: 6px;
                    z-index: 1060;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateX(-50%) translateY(4px);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .chopaeng-explore-dropdown.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                }

                .chopaeng-explore-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: var(--text-dark, #1e293b);
                    transition: all 0.15s ease;
                }

                .chopaeng-explore-link:hover {
                    background: var(--bg-cream, #f8faf6);
                    transform: translateX(2px);
                }

                .chopaeng-explore-link.active-link {
                    background: rgba(22, 163, 74, 0.08);
                }

                .chopaeng-explore-link .explore-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }

                .chopaeng-action-btn {
                    width: 36px;
                    height: 36px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--card-bg, #ffffff);
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.07));
                    color: var(--text-dark, #334155);
                    transition: all 0.18s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    font-size: 0.85rem;
                }

                .chopaeng-action-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    color: var(--nook-green, #16a34a);
                    border-color: rgba(22, 163, 74, 0.2);
                }

                /* Mobile Flyout Navigation */
                .chopaeng-mobile-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(6px);
                    z-index: 1040;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.25s ease, visibility 0.25s ease;
                }

                .chopaeng-mobile-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .chopaeng-mobile-drawer {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 88%;
                    max-width: 380px;
                    background: var(--card-bg, #ffffff);
                    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.12);
                    z-index: 1045;
                    transform: translateX(100%);
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }

                .chopaeng-mobile-drawer.open {
                    transform: translateX(0);
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: var(--text-dark, #1e293b);
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.15s ease;
                }

                .mobile-nav-link:hover {
                    background: rgba(0, 0, 0, 0.03);
                }

                .mobile-nav-link.active {
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    color: #ffffff !important;
                }

                .mobile-nav-link.active i {
                    color: #ffffff !important;
                }

                .mobile-nav-link .mobile-nav-icon {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: var(--bg-cream, #f1f5f0);
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }

                .mobile-nav-link.active .mobile-nav-icon {
                    background: rgba(255, 255, 255, 0.2);
                }

                /* Hamburger Button */
                .chopaeng-hamburger {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    background: var(--card-bg, #ffffff);
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
                    border-radius: 50%;
                    padding: 0;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .chopaeng-hamburger span {
                    display: block;
                    width: 16px;
                    height: 2px;
                    background: var(--text-dark, #334155);
                    border-radius: 2px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .chopaeng-hamburger.open span:nth-child(1) {
                    transform: translateY(7px) rotate(45deg);
                }

                .chopaeng-hamburger.open span:nth-child(2) {
                    opacity: 0;
                    transform: translateX(-10px);
                }

                .chopaeng-hamburger.open span:nth-child(3) {
                    transform: translateY(-7px) rotate(-45deg);
                }

                /* User pill button */
                .chopaeng-user-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 3px 10px 3px 3px;
                    border-radius: 50px;
                    background: var(--card-bg, #ffffff);
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.07));
                    cursor: pointer;
                    transition: all 0.18s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    height: 36px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--text-dark, #1e293b);
                }

                .chopaeng-user-pill:hover {
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
                    border-color: rgba(22, 163, 74, 0.2);
                }

                /* User dropdown menu */
                .chopaeng-user-dropdown {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    margin-top: 8px;
                    width: 240px;
                    background: var(--card-bg, #ffffff);
                    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04);
                    padding: 6px;
                    z-index: 1060;
                    animation: dropdownSlideUp 0.18s ease;
                }

                .chopaeng-user-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 12px;
                    border-radius: 10px;
                    text-decoration: none;
                    color: var(--text-dark, #1e293b);
                    font-weight: 600;
                    font-size: 0.84rem;
                    transition: all 0.12s ease;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                }

                .chopaeng-user-dropdown-item:hover {
                    background: var(--bg-cream, #f8faf6);
                }

                .chopaeng-user-dropdown-item.danger {
                    color: #ef4444;
                }

                .chopaeng-user-dropdown-item .dropdown-icon {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    flex-shrink: 0;
                }

                @keyframes dropdownSlideUp {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Mobile user quick links grid */
                .mobile-quick-links {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }

                .mobile-quick-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 12px 6px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: var(--text-dark, #1e293b);
                    font-weight: 600;
                    font-size: 0.7rem;
                    background: var(--bg-cream, #f8faf6);
                    border: 1px solid var(--card-border, rgba(0,0,0,0.05));
                    transition: all 0.15s ease;
                }

                .mobile-quick-link:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
            `}</style>

            <nav
                className={`navbar sticky-top py-2 chopaeng-navbar ${isScrolled || isMobileMenuOpen ? "scrolled" : ""}`}
                style={{ zIndex: 1050 }}
                role="navigation"
                aria-label="Main Navigation"
            >
                <div className="container-xl d-flex align-items-center justify-content-between gap-2">
                    {/* Brand Logo */}
                    <Link
                        to="/"
                        className="d-flex align-items-center gap-2 text-decoration-none flex-shrink-0"
                        onClick={() => {
                            playChimeClick();
                            setIsMobileMenuOpen(false);
                        }}
                        aria-label="Chopaeng Home"
                    >
                        <div
                            className="logo-box shadow-xs rounded-circle overflow-hidden bg-white p-1 d-flex align-items-center justify-content-center"
                            style={{ width: 34, height: 34, border: '2px solid rgba(22, 163, 74, 0.15)' }}
                        >
                            <img src={logo} alt="Chopaeng Leaf Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="d-flex flex-column d-none d-sm-flex">
                            <span className="ac-font text-dark fw-black lh-1" style={{ letterSpacing: '0.02em', fontSize: '1.1rem' }}>
                                CHOPAENG
                            </span>
                            <span className="fw-bold text-success text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.58rem' }}>
                                Treasure Islands
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation — Primary Pills + Explore Dropdown */}
                    <div className="d-none d-lg-flex align-items-center chopaeng-nav-pill-container" role="menubar">
                        {primaryLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"}
                                className={({ isActive }) => `chopaeng-nav-item ${isActive ? "active" : ""}`}
                                onClick={() => playChimeClick()}
                                role="menuitem"
                            >
                                <i className={`fa-solid ${link.icon}`} style={{ fontSize: '0.72rem' }} aria-hidden="true" />
                                <span>{link.name}</span>
                            </NavLink>
                        ))}

                        {/* Explore "More" Dropdown Trigger */}
                        <div
                            className="position-relative"
                            ref={exploreDropdownRef}
                            onMouseEnter={handleExploreEnter}
                            onMouseLeave={handleExploreLeave}
                        >
                            <button
                                type="button"
                                className={`chopaeng-explore-trigger ${showExploreDropdown ? 'open' : ''} ${isExploreActive ? 'has-active' : ''}`}
                                onClick={() => {
                                    playChimeClick();
                                    setShowExploreDropdown(prev => !prev);
                                }}
                                aria-expanded={showExploreDropdown}
                                aria-label="More navigation options"
                            >
                                <i className="fa-solid fa-compass" style={{ fontSize: '0.72rem' }} aria-hidden="true" />
                                <span>Explore</span>
                                <i className="fa-solid fa-chevron-down chevron-icon" aria-hidden="true" />
                            </button>

                            <div
                                className={`chopaeng-explore-dropdown ${showExploreDropdown ? 'show' : ''}`}
                                onMouseEnter={handleExploreEnter}
                                onMouseLeave={handleExploreLeave}
                            >
                                {exploreLinks.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        className={({ isActive }) => `chopaeng-explore-link ${isActive ? 'active-link' : ''}`}
                                        onClick={() => {
                                            playChimeClick();
                                            setShowExploreDropdown(false);
                                        }}
                                    >
                                        <div
                                            className="explore-icon"
                                            style={{ backgroundColor: `${link.color}15`, color: link.color }}
                                        >
                                            <i className={`fa-solid ${link.icon}`} />
                                        </div>
                                        <div>
                                            <div className="fw-bold" style={{ fontSize: '0.84rem' }}>{link.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{link.desc}</div>
                                        </div>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                        {/* User Account */}
                        {user ? (
                            <div className="position-relative" ref={userDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        playChimeClick();
                                        setShowUserDropdown((prev) => !prev);
                                    }}
                                    className="chopaeng-user-pill"
                                    aria-expanded={showUserDropdown}
                                    aria-label="User Account Menu"
                                >
                                    {userAvatarUrl ? (
                                        <img
                                            src={userAvatarUrl}
                                            alt={user.username}
                                            className="rounded-circle"
                                            style={{ width: 28, height: 28, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: 28, height: 28, fontSize: '0.72rem' }}
                                        >
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="d-none d-md-inline text-truncate" style={{ maxWidth: '80px' }}>
                                        {user.username}
                                    </span>
                                    <i className={`fa-solid fa-chevron-down text-muted`} style={{ fontSize: '0.55rem', transition: 'transform 0.2s', transform: showUserDropdown ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
                                </button>

                                {/* User Dropdown */}
                                {showUserDropdown && (
                                    <div className="chopaeng-user-dropdown">
                                        <div className="px-3 py-2 border-bottom mb-1" style={{ borderColor: 'var(--card-border, rgba(0,0,0,0.06))' }}>
                                            <div className="fw-black text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{user.username}</div>
                                            <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                                                {user.is_admin ? "Administrator" : user.is_mod ? "Moderator" : "Member"}
                                            </div>
                                        </div>

                                        {userQuickLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className="chopaeng-user-dropdown-item"
                                                onClick={() => setShowUserDropdown(false)}
                                            >
                                                <div className="dropdown-icon" style={{ backgroundColor: `${link.color}12`, color: link.color }}>
                                                    <i className={`fa-solid ${link.icon}`} />
                                                </div>
                                                <span>{link.name}</span>
                                            </Link>
                                        ))}

                                        <div className="border-top mt-1 pt-1" style={{ borderColor: 'var(--card-border, rgba(0,0,0,0.06))' }}>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="chopaeng-user-dropdown-item danger"
                                            >
                                                <div className="dropdown-icon" style={{ backgroundColor: '#ef444412', color: '#ef4444' }}>
                                                    <i className="fa-solid fa-right-from-bracket" />
                                                </div>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={login}
                                className="btn btn-nook text-white rounded-pill fw-bold btn-sm shadow-2xs d-none d-md-inline-flex align-items-center gap-2 px-3"
                                style={{ height: '36px', fontSize: '0.82rem' }}
                                title="Login with Discord"
                            >
                                <i className="fa-brands fa-discord" style={{ fontSize: '0.95rem' }} aria-hidden="true" />
                                <span>Login</span>
                            </button>
                        )}

                        {/* K.K. Slider Jukebox */}
                        <button
                            type="button"
                            onClick={() => {
                                playChimeClick();
                                window.dispatchEvent(new CustomEvent('chopaeng_toggle_jukebox'));
                            }}
                            className="chopaeng-action-btn d-none d-sm-inline-flex"
                            title="K.K. Slider Jukebox"
                            aria-label="Open K.K. Slider Jukebox"
                        >
                            <i className="fa-solid fa-guitar text-success" aria-hidden="true" />
                        </button>

                        {/* Theme Switcher */}
                        <div className="position-relative d-none d-sm-block" ref={themeDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    playChimeClick();
                                    setShowThemeDropdown((prev) => !prev);
                                }}
                                className="chopaeng-action-btn"
                                title={`Theme: ${currentTheme === 'celeste' ? 'Celeste Stargazing' : currentTheme === 'roost' ? 'The Roost Cozy' : 'Nook Day'}`}
                                aria-label="Toggle Theme"
                                aria-expanded={showThemeDropdown}
                            >
                                <i className={`fa-solid ${
                                    currentTheme === 'celeste' ? 'fa-star text-warning' :
                                    currentTheme === 'roost' ? 'fa-mug-hot text-amber' :
                                    'fa-leaf text-success'
                                }`} aria-hidden="true" />
                            </button>

                            {showThemeDropdown && (
                                <div
                                    className="chopaeng-user-dropdown"
                                    style={{ width: '230px' }}
                                >
                                    <div className="px-3 py-2 mb-1">
                                        <div className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                                            Island Theme
                                        </div>
                                    </div>
                                    {THEME_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                playChimeClick();
                                                setStoredTheme(opt.id);
                                                setCurrentTheme(opt.id);
                                                setShowThemeDropdown(false);
                                            }}
                                            className={`chopaeng-user-dropdown-item ${currentTheme === opt.id ? 'fw-bold' : ''}`}
                                        >
                                            <div className="dropdown-icon" style={{ backgroundColor: `${opt.badgeColor}15`, color: opt.badgeColor }}>
                                                <i className={`fa-solid ${opt.icon}`} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div style={{ fontSize: '0.82rem' }}>{opt.name}</div>
                                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>{opt.description}</div>
                                            </div>
                                            {currentTheme === opt.id && (
                                                <i className="fa-solid fa-circle-check text-success" style={{ fontSize: '0.75rem' }} aria-hidden="true" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Discord Link */}
                        <a
                            href="https://discord.gg/chopaeng"
                            target="_blank"
                            rel="noreferrer"
                            className="chopaeng-action-btn d-none d-md-inline-flex"
                            title="Join our Discord Community"
                            aria-label="Discord Community"
                        >
                            <i className="fa-brands fa-discord text-primary" aria-hidden="true" />
                        </a>

                        {/* Mobile Menu Toggle */}
                        <button
                            type="button"
                            className={`chopaeng-hamburger d-lg-none ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => {
                                playChimeClick();
                                setIsMobileMenuOpen(!isMobileMenuOpen);
                            }}
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle Mobile Navigation Menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Backdrop */}
            <div
                className={`chopaeng-mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <aside
                className={`chopaeng-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
                aria-label="Mobile Navigation Drawer"
            >
                {/* Drawer Header */}
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ background: 'var(--bg-cream, #f8faf6)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <img src={logo} alt="Logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                        <span className="ac-font fw-black text-dark" style={{ fontSize: '1rem' }}>CHOPAENG</span>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close menu"
                        style={{ fontSize: '0.7rem' }}
                    />
                </div>

                {/* Drawer User Card */}
                <div className="p-3 border-bottom">
                    {user ? (
                        <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2 min-w-0">
                                {userAvatarUrl ? (
                                    <img src={userAvatarUrl} alt={user.username} className="rounded-circle" style={{ width: 34, height: 34 }} />
                                ) : (
                                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <strong className="d-block text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{user.username}</strong>
                                    <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                                        {user.is_admin ? "Admin" : user.is_mod ? "Moderator" : "Member"}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn btn-xs btn-outline-danger rounded-pill fw-bold px-2.5 py-1"
                                style={{ fontSize: '0.72rem' }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                login();
                            }}
                            className="btn btn-nook text-white rounded-pill fw-bold btn-sm w-100 py-2 shadow-2xs d-flex align-items-center justify-content-center gap-2"
                        >
                            <i className="fa-brands fa-discord fs-6" aria-hidden="true" />
                            <span>Login with Discord</span>
                        </button>
                    )}
                </div>

                {/* User Quick Links (mobile) */}
                {user && (
                    <div className="px-3 pt-3">
                        <div className="mobile-quick-links">
                            {userQuickLinks.slice(0, 3).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="mobile-quick-link"
                                    onClick={() => { playChimeClick(); setIsMobileMenuOpen(false); }}
                                >
                                    <i className={`fa-solid ${link.icon}`} style={{ color: link.color, fontSize: '0.9rem' }} />
                                    <span>{link.name.replace('My ', '')}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Drawer Navigation List */}
                <div className="p-3 flex-grow-1">
                    <div className="fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.06em', fontSize: '0.62rem' }}>
                        Navigation
                    </div>
                    <div className="d-flex flex-column gap-1 mb-3">
                        {allNavLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"}
                                className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                                onClick={() => {
                                    playChimeClick();
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <div className="mobile-nav-icon">
                                    <i className={`fa-solid ${link.icon} text-success`} aria-hidden="true" />
                                </div>
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Theme Selector (mobile) */}
                    <div className="fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.06em', fontSize: '0.62rem' }}>
                        Theme
                    </div>
                    <div className="d-flex gap-1 mb-3">
                        {THEME_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    playChimeClick();
                                    setStoredTheme(opt.id);
                                    setCurrentTheme(opt.id);
                                }}
                                className={`btn btn-xs rounded-pill flex-grow-1 py-1.5 fw-bold transition-all d-flex align-items-center justify-content-center gap-1 ${
                                    currentTheme === opt.id ? 'btn-success text-white shadow-2xs' : 'btn-light text-dark border'
                                }`}
                                style={{ fontSize: '0.72rem' }}
                            >
                                <i className={`fa-solid ${opt.icon}`} style={{ fontSize: '0.65rem' }} aria-hidden="true" />
                                <span>{opt.name.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Feedback / Discord */}
                    <div className="d-flex flex-column gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                openSuggestionModal();
                            }}
                            className="btn btn-sm w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 border"
                            style={{ backgroundColor: '#fffbeb', borderColor: '#fbbf2440', fontSize: '0.8rem', color: '#92400e' }}
                        >
                            <i className="fa-solid fa-lightbulb text-warning" aria-hidden="true" />
                            <span>Suggest Feature</span>
                        </button>

                        <a
                            href="https://discord.gg/chopaeng"
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-light border w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none text-dark"
                            style={{ fontSize: '0.8rem' }}
                        >
                            <i className="fa-brands fa-discord text-primary" aria-hidden="true" />
                            <span>Join Discord</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/* K.K. Slider Jukebox Audio */}
            <KKSliderJukebox />
        </>
    );
};

export default Navbar;