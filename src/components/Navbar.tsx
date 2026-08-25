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

    const themeDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);

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

    const navLinks = useMemo(() => [
        { name: "Home", path: "/", icon: "fa-house" },
        { name: "Islands", path: "/islands", icon: "fa-island-tropical" },
        { name: "Find", path: "/find", icon: "fa-magnifying-glass" },
        { name: "Catalogue", path: "/catalog", icon: "fa-boxes-stacked" },
        { name: "Builder", path: "/command-builder", icon: "fa-cubes-stacked" },
        { name: "Pockets", path: "/pockets", icon: "fa-boxes-packing" },
        { name: "Guides", path: "/guides", icon: "fa-book-open" },
    ], []);

    return (
        <>
            <style>{`
                .chopaeng-navbar {
                    transition: background-color 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease, box-shadow 0.25s ease;
                }

                .chopaeng-navbar.scrolled {
                    background-color: var(--nav-scrolled-bg, rgba(255, 255, 255, 0.9));
                    border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.07));
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
                }

                .chopaeng-nav-pill-container {
                    background: var(--nav-pill-bg, rgba(255, 255, 255, 0.8));
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.07));
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                    padding: 4px;
                    border-radius: 50px;
                }

                .chopaeng-nav-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 0.84rem;
                    font-weight: 700;
                    color: var(--text-muted, #64748b);
                    text-decoration: none;
                    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                }

                .chopaeng-nav-item:hover {
                    color: var(--text-dark, #1e293b);
                    background-color: rgba(0, 0, 0, 0.04);
                }

                .chopaeng-nav-item.active {
                    color: #ffffff !important;
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
                }

                .chopaeng-nav-item.active i {
                    color: #ffffff !important;
                }

                .chopaeng-action-btn {
                    width: 38px;
                    height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--card-bg, #ffffff);
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
                    color: var(--text-dark, #334155);
                    transition: all 0.18s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
                }

                .chopaeng-action-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                    color: var(--nook-green, #16a34a);
                }

                /* Mobile Flyout Navigation */
                .chopaeng-mobile-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    backdrop-filter: blur(4px);
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
                    width: 85%;
                    max-width: 380px;
                    background: var(--card-bg, #ffffff);
                    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
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

                .mobile-grid-link {
                    background: var(--bg-cream, #f8faf6);
                    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
                    border-radius: 16px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    text-decoration: none;
                    color: var(--text-dark, #1e293b);
                    transition: all 0.2s ease;
                }

                .mobile-grid-link:hover {
                    background: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .mobile-grid-link.active {
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    color: #ffffff !important;
                    border-color: transparent;
                }

                .mobile-grid-link.active i,
                .mobile-grid-link.active span {
                    color: #ffffff !important;
                }

                /* Hamburger Button */
                .chopaeng-hamburger {
                    width: 38px;
                    height: 38px;
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
                    width: 18px;
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
            `}</style>

            <nav
                className={`navbar sticky-top py-2.5 chopaeng-navbar ${isScrolled || isMobileMenuOpen ? "scrolled" : ""}`}
                style={{ zIndex: 1050 }}
                role="navigation"
                aria-label="Main Navigation"
            >
                <div className="container-xl d-flex align-items-center justify-content-between gap-3">
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
                            style={{ width: 38, height: 38, border: '2px solid rgba(22, 163, 74, 0.2)' }}
                        >
                            <img src={logo} alt="Chopaeng Leaf Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="d-flex flex-column">
                            <span className="ac-font text-dark fw-black fs-5 lh-1" style={{ letterSpacing: '0.02em' }}>
                                CHOPAENG
                            </span>
                            <span className="tiny-text fw-bold text-success text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                Treasure Islands
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links Pill */}
                    <div className="d-none d-lg-flex align-items-center chopaeng-nav-pill-container" role="menubar">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"}
                                className={({ isActive }) => `chopaeng-nav-item ${isActive ? "active" : ""}`}
                                onClick={() => playChimeClick()}
                                role="menuitem"
                            >
                                <i className={`fa-solid ${link.icon} x-small`} aria-hidden="true" />
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Action Controls */}
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {/* User Account / Profile Button */}
                        {user ? (
                            <div className="position-relative" ref={userDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowUserDropdown((prev) => !prev)}
                                    className="btn btn-sm rounded-pill fw-bold bg-white border shadow-2xs d-inline-flex align-items-center gap-2 p-1 pe-3 transition-all"
                                    style={{ height: '38px' }}
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
                                            style={{ width: 28, height: 28, fontSize: '0.75rem' }}
                                        >
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="small text-dark fw-bold text-truncate d-none d-md-inline" style={{ maxWidth: '100px' }}>
                                        {user.username}
                                    </span>
                                    <i className="fa-solid fa-chevron-down tiny-text text-muted" aria-hidden="true" />
                                </button>

                                {/* User Profile Dropdown */}
                                {showUserDropdown && (
                                    <div
                                        className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg border animate-up"
                                        style={{
                                            width: '230px',
                                            backgroundColor: 'var(--card-bg, #ffffff)',
                                            borderColor: 'var(--card-border, rgba(0,0,0,0.08))',
                                            zIndex: 1060,
                                        }}
                                    >
                                        <div className="p-2 border-bottom mb-1">
                                            <div className="fw-black text-dark text-truncate small">{user.username}</div>
                                            <div className="tiny-text text-muted text-truncate">
                                                {user.is_admin ? "Administrator" : user.is_mod ? "Moderator" : "Member"}
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 p-2 rounded-3 text-dark mb-1 hover-bg-light"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            <i className="fa-solid fa-user text-success" aria-hidden="true" />
                                            <span>My Profile</span>
                                        </Link>

                                        <Link
                                            to="/pockets"
                                            className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 p-2 rounded-3 text-dark mb-1 hover-bg-light"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            <i className="fa-solid fa-boxes-packing text-primary" aria-hidden="true" />
                                            <span>Pocket Inventory</span>
                                        </Link>

                                        <Link
                                            to="/order"
                                            className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 p-2 rounded-3 text-dark mb-1 hover-bg-light"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            <i className="fa-solid fa-paper-plane text-info" aria-hidden="true" />
                                            <span>Order Bot</span>
                                        </Link>

                                        <div className="border-top pt-1 mt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 p-2 rounded-3 text-danger hover-bg-light"
                                            >
                                                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
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
                                className="btn btn-nook text-white rounded-pill fw-bold btn-sm shadow-2xs d-none d-md-inline-flex align-items-center gap-2 px-3.5"
                                style={{ height: '38px' }}
                                title="Login with Discord"
                            >
                                <i className="fa-brands fa-discord fs-6" aria-hidden="true" />
                                <span>Login</span>
                            </button>
                        )}

                        {/* K.K. Slider Jukebox Launcher */}
                        <button
                            type="button"
                            onClick={() => {
                                playChimeClick();
                                window.dispatchEvent(new CustomEvent('chopaeng_toggle_jukebox'));
                            }}
                            className="chopaeng-action-btn"
                            title="K.K. Slider Jukebox Player"
                            aria-label="Open K.K. Slider Jukebox"
                        >
                            <i className="fa-solid fa-guitar text-success fs-6" aria-hidden="true" />
                        </button>

                        {/* Theme Switcher Button */}
                        <div className="position-relative" ref={themeDropdownRef}>
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
                                } fs-6`} aria-hidden="true" />
                            </button>

                            {showThemeDropdown && (
                                <div
                                    className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg border animate-up"
                                    style={{
                                        width: '240px',
                                        backgroundColor: 'var(--card-bg, #ffffff)',
                                        borderColor: 'var(--card-border, rgba(0,0,0,0.08))',
                                        zIndex: 1060,
                                    }}
                                >
                                    <div className="tiny-text fw-bold text-muted px-2 py-1 text-uppercase tracking-wider">
                                        Island Theme
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
                                            className={`btn w-100 text-start d-flex align-items-center gap-2 p-2 rounded-3 border-0 transition-all mb-1 ${
                                                currentTheme === opt.id ? 'bg-light fw-bold text-dark' : 'text-muted'
                                            }`}
                                        >
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                                style={{ width: '28px', height: '28px', backgroundColor: `${opt.badgeColor}20`, color: opt.badgeColor }}
                                                aria-hidden="true"
                                            >
                                                <i className={`fa-solid ${opt.icon} x-small`} />
                                            </div>
                                            <div className="flex-grow-1 text-truncate">
                                                <div className="small text-truncate" style={{ fontSize: '0.85rem' }}>{opt.name}</div>
                                                <div className="tiny-text text-muted text-truncate" style={{ fontSize: '0.68rem' }}>{opt.description}</div>
                                            </div>
                                            {currentTheme === opt.id && (
                                                <i className="fa-solid fa-check text-success x-small" aria-hidden="true" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Discord Server Link */}
                        <a
                            href="https://discord.gg/chopaeng"
                            target="_blank"
                            rel="noreferrer"
                            className="chopaeng-action-btn d-none d-sm-inline-flex"
                            title="Join our Discord Community"
                            aria-label="Discord Community"
                        >
                            <i className="fa-brands fa-discord text-primary fs-6" aria-hidden="true" />
                        </a>

                        {/* Mobile Menu Toggle Hamburger */}
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

            {/* Mobile Drawer Backdrop Overlay */}
            <div
                className={`chopaeng-mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Drawer Panel */}
            <aside
                className={`chopaeng-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
                aria-label="Mobile Navigation Drawer"
            >
                {/* Drawer Header */}
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div className="d-flex align-items-center gap-2">
                        <img src={logo} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                        <span className="ac-font fw-black fs-6 text-dark">CHOPAENG</span>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close menu"
                    />
                </div>

                {/* Drawer User Card */}
                <div className="p-3 border-bottom">
                    {user ? (
                        <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2 min-w-0">
                                {userAvatarUrl ? (
                                    <img src={userAvatarUrl} alt={user.username} className="rounded-circle" style={{ width: 36, height: 36 }} />
                                ) : (
                                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36 }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <strong className="d-block text-dark small text-truncate">{user.username}</strong>
                                    <span className="tiny-text text-muted">Signed In</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn btn-xs btn-outline-danger rounded-pill fw-bold px-2.5 py-1"
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

                {/* Drawer Navigation Links Grid */}
                <div className="p-3 flex-grow-1">
                    <div className="tiny-text fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
                        Explore Islands
                    </div>
                    <div className="row g-2 mb-3">
                        {navLinks.map((link) => (
                            <div className="col-6" key={link.name}>
                                <NavLink
                                    to={link.path}
                                    end={link.path === "/"}
                                    className={({ isActive }) => `mobile-grid-link ${isActive ? "active" : ""}`}
                                    onClick={() => {
                                        playChimeClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <i className={`fa-solid ${link.icon} fs-5 text-success`} aria-hidden="true" />
                                    <span className="tiny-text fw-bold">{link.name}</span>
                                </NavLink>
                            </div>
                        ))}
                    </div>

                    {/* Theme Selector */}
                    <div className="tiny-text fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
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
                                <i className={`fa-solid ${opt.icon} x-small`} aria-hidden="true" />
                                <span>{opt.name.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Feedback / Suggestion Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            openSuggestionModal();
                        }}
                        className="btn btn-warning bg-opacity-10 text-dark border border-warning border-opacity-50 w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-2xs mb-2"
                        style={{ backgroundColor: '#fffbeb', fontSize: '0.82rem' }}
                    >
                        <i className="fa-solid fa-lightbulb text-warning" aria-hidden="true" />
                        <span>Suggest Feature / Feedback</span>
                    </button>

                    <a
                        href="https://discord.gg/chopaeng"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-light border w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none text-dark"
                        style={{ fontSize: '0.82rem' }}
                    >
                        <i className="fa-brands fa-discord text-primary" aria-hidden="true" />
                        <span>Join Discord Community</span>
                    </a>
                </div>
            </aside>

            {/* Background K.K. Slider Jukebox Audio */}
            <KKSliderJukebox />
        </>
    );
};

export default Navbar;