import { useEffect, useState, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/logo.webp';
import { useAuth } from "../context/useAuth";
import { THEME_OPTIONS, getStoredTheme, setStoredTheme, type ThemeMode } from "../utils/theme";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme);
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();

    useEffect(() => {
        const handleThemeUpdate = () => setCurrentTheme(getStoredTheme());
        window.addEventListener('chopaeng_theme_updated', handleThemeUpdate);
        return () => window.removeEventListener('chopaeng_theme_updated', handleThemeUpdate);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => setIsMobileMenuOpen(false), [pathname]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/"); 
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const navLinks = useMemo(() => [
        { name: "Home", path: "/", icon: "fa-house" },
        { name: "Treasure Islands", path: "/islands", icon: "fa-map" },
        { name: "Find", path: "/find", icon: "fa-magnifying-glass" },
        { name: "Command Builder", path: "/command-builder", icon: "fa-cart-shopping" },
        { name: "Guide", path: "/guides", icon: "fa-book-open" },
        { name: "About", path: "/about", icon: "fa-circle-info" },
    ], []);

    return (
        <>
            <style>{`
                .desktop-nav-container {
                    background: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }

                .stable-nav-link {
                    position: relative;
                    width: 40px; 
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6c757d;
                    transition: all 0.2s ease-in-out;
                    border-radius: 50px;
                    overflow: hidden;
                }

                .stable-nav-link.active {
                    width: auto; 
                    padding: 0 16px;
                    background-color: white;
                    color: #212529;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .stable-nav-link .link-text {
                    display: none; 
                    margin-left: 8px;
                    white-space: nowrap;
                    font-weight: 700;
                    font-size: 0.875rem;
                }

                .stable-nav-link.active .link-text {
                    display: inline-block; 
                }

                .stable-nav-link:hover:not(.active) {
                    background-color: rgba(255,255,255,0.5);
                    color: #212529;
                }

                .mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.4);
                    z-index: 1040;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .mobile-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .mobile-flyout {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #f8f9fa;
                    border-bottom-left-radius: 24px;
                    border-bottom-right-radius: 24px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    transform: translateY(-10px);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1045;
                }

                .mobile-flyout.active {
                    transform: translateY(0);
                    opacity: 1;
                    visibility: visible;
                }
            `}</style>

            <nav
                className={`navbar sticky-top transition-all ${isScrolled || isMobileMenuOpen ? "py-3" : "py-3"}`}
                style={{
                    backgroundColor: (isScrolled || isMobileMenuOpen) ? "var(--nav-scrolled-bg, rgba(255, 255, 255, 0.92))" : "transparent",
                    borderBottom: (isScrolled || isMobileMenuOpen) ? "1px solid var(--card-border, rgba(0,0,0,0.05))" : "none",
                    backdropFilter: (isScrolled || isMobileMenuOpen) ? "blur(12px)" : "none",
                    zIndex: 1050
                }}
            >
                <div className="container d-flex flex-nowrap justify-content-between align-items-center gap-3">

                    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none brand-group flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="logo-box shadow-sm">
                            <img src={logo} alt="Logo" className="logo-img" />
                        </div>
                        <div className="brand-text-group">
                            <span className="brand-name ac-font text-dark h5 mb-0">CHOPAENG</span>
                            <span className="brand-subtext x-small fw-black text-success d-none d-sm-block">Treasure Island</span>
                        </div>
                    </Link>

                    <div className="d-none d-lg-flex align-items-center desktop-nav-container p-1 rounded-pill flex-shrink-1 gap-1">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"}
                                className={({ isActive }) => `stable-nav-link text-decoration-none ${isActive ? "active" : ""}`}
                                title={link.name}
                            >
                                <i className={`fa-solid ${link.icon} fs-6`}></i>
                                <span className="link-text">{link.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {user ? (
                            <>
                                <Link to="/profile" className="btn btn-success rounded-pill fw-bold d-none d-md-flex align-items-center gap-2 px-3 shadow-sm" title="Profile">
                                    <i className="fa-solid fa-user"></i>
                                    Profile
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="btn bg-white border fw-bold d-none d-md-flex align-items-center gap-2 shadow-sm rounded-pill px-3"
                                    title="Logout"
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    <span className="d-none d-xl-inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={login}
                                className="btn btn-success rounded-pill fw-bold d-none d-md-flex align-items-center gap-2 px-3 shadow-sm"
                                title="Login"
                            >
                                <i className="fa-solid fa-right-to-bracket"></i>
                                Login
                            </button>
                        )}

                        {/* Theme Switcher Button */}
                        <div className="position-relative">
                            <button
                                type="button"
                                onClick={() => setShowThemeDropdown((prev) => !prev)}
                                className="btn bg-white border rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-all"
                                style={{ width: '40px', height: '40px' }}
                                title={`Theme: ${currentTheme === 'celeste' ? 'Celeste Stargazing' : currentTheme === 'roost' ? 'The Roost Cozy' : 'Nook Day'}`}
                                aria-label="Toggle Theme"
                                aria-expanded={showThemeDropdown}
                            >
                                <i className={`fa-solid ${
                                    currentTheme === 'celeste' ? 'fa-star text-warning' :
                                    currentTheme === 'roost' ? 'fa-mug-hot text-amber' :
                                    'fa-leaf text-success'
                                } fs-6`}></i>
                            </button>

                            {showThemeDropdown && (
                                <div 
                                    className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg border animate-fade z-index-dropdown"
                                    style={{ 
                                        width: '240px', 
                                        backgroundColor: 'var(--card-bg, #ffffff)',
                                        borderColor: 'var(--card-border, #e9ecef)',
                                        zIndex: 1060 
                                    }}
                                >
                                    <div className="tiny-text fw-bold text-muted px-2 py-1 text-uppercase tracking-wider">
                                        Select Island Theme
                                    </div>
                                    {THEME_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                setStoredTheme(opt.id);
                                                setCurrentTheme(opt.id);
                                                setShowThemeDropdown(false);
                                            }}
                                            className={`btn w-100 text-start d-flex align-items-center gap-2 p-2 rounded-3 border-0 transition-all mb-1 ${
                                                currentTheme === opt.id ? 'bg-light fw-bold text-dark' : 'text-muted'
                                            }`}
                                        >
                                            <div 
                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                style={{ width: '28px', height: '28px', backgroundColor: `${opt.badgeColor}20`, color: opt.badgeColor }}
                                            >
                                                <i className={`fa-solid ${opt.icon} x-small`}></i>
                                            </div>
                                            <div className="flex-grow-1 text-truncate">
                                                <div className="small text-truncate" style={{ fontSize: '0.85rem' }}>{opt.name}</div>
                                                <div className="tiny-text text-muted text-truncate" style={{ fontSize: '0.68rem' }}>{opt.description}</div>
                                            </div>
                                            {currentTheme === opt.id && (
                                                <i className="fa-solid fa-check text-success x-small"></i>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <a href="https://discord.gg/chopaeng" target="_blank" rel="noreferrer" className="btn bg-white border rounded-circle shadow-sm d-none d-md-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} aria-label="Join Discord">
                            <i className="fa-brands fa-discord text-primary"></i>
                        </a>

                        <button
                            className={`mobile-toggle btn border-0 d-lg-none ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation"
                        >
                            <div className="hamburger">
                                <span></span><span></span><span></span>
                            </div>
                        </button>
                    </div>
                </div>

    
                <div id="mobile-menu" className={`mobile-flyout d-lg-none ${isMobileMenuOpen ? "active" : ""}`}>
                    <div className="container py-4">
                        <div className="row g-3">
                            {navLinks.map((link) => (
                                <div className="col-6" key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={`text-decoration-none p-3 rounded-4 d-flex flex-column align-items-center gap-2 shadow-sm transition-all ${pathname === link.path ? 'bg-success text-white' : 'bg-white text-dark border border-light'}`}
                                    >
                                        <div className={`fs-4 ${pathname === link.path ? 'text-white' : 'text-success'}`}>
                                            <i className={`fa-solid ${link.icon}`}></i>
                                        </div>
                                        <span className="fw-bold x-small text-uppercase text-center">{link.name}</span>
                                    </Link>
                                </div>
                            ))}
                            
                            {/* Mobile Theme Selector */}
                            <div className="col-12 mt-2">
                                <div className="p-2 rounded-4 bg-white border shadow-2xs">
                                    <div className="tiny-text fw-bold text-muted px-2 mb-1 text-uppercase tracking-wider">
                                        Island Theme
                                    </div>
                                    <div className="d-flex gap-1">
                                        {THEME_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    setStoredTheme(opt.id);
                                                    setCurrentTheme(opt.id);
                                                }}
                                                className={`btn btn-sm rounded-pill flex-grow-1 py-1 fw-bold transition-all d-flex align-items-center justify-content-center gap-1 ${
                                                    currentTheme === opt.id ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'
                                                }`}
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                <i className={`fa-solid ${opt.icon} x-small`}></i>
                                                <span>{opt.name.split(' ')[0]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 mt-3 pt-3 border-top">
                                {user ? (
                                    <div className="d-flex gap-2">
                                        <Link to="/profile" className="btn btn-outline-success flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2">
                                            <i className="fa-solid fa-user"></i> Profile
                                        </Link>
                                        <button type="button" onClick={handleLogout} className="btn btn-white border flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2 text-dark shadow-sm">
                                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={login} className="btn btn-success w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm">
                                        <i className="fa-solid fa-right-to-bracket"></i> Login
                                    </button>
                                )}
                            </div>
                            <div className="col-12 mt-2 text-center">
                                 <a href="https://discord.gg/chopaeng" target="_blank" rel="noreferrer" className="btn btn-link text-decoration-none text-muted small fw-bold">
                                    <i className="fa-brands fa-discord me-2 text-primary"></i>
                                    Join the Discord Server
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;