import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from '../assets/logo.webp';
import { useAuth } from "../context/useAuth";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const { user, login, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Auto-close mobile menu on route change
    useEffect(() => setIsMobileMenuOpen(false), [pathname]);

    const navLinks = [
        { name: "Home", path: "/", icon: "fa-house" },
        { name: "Treasure Islands", path: "/islands", icon: "fa-map" },
        { name: "Find", path: "/find", icon: "fa-magnifying-glass" },
        // { name: "Membership", path: "/membership", icon: "fa-crown" },
        { name: "Guide", path: "/guides", icon: "fa-book-open" },
        { name: "About", path: "/about", icon: "fa-circle-info" },
    ];

    return (
        <>
            <div className="d-flex justify-content-center w-100 sticky-top" style={{ zIndex: 1050, transition: "padding 0.4s cubic-bezier(0.16, 1, 0.3, 1)", padding: isScrolled ? "0" : "1rem 1rem 0 1rem", pointerEvents: "none" }}>
                <nav
                    className={`navbar transition-all ${isScrolled ? "py-2 w-100" : "py-2 w-100"}`}
                    style={{
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.6)",
                        backdropFilter: isScrolled ? "blur(20px)" : "blur(12px)",
                        WebkitBackdropFilter: isScrolled ? "blur(20px)" : "blur(12px)",
                        boxShadow: isScrolled ? "0 10px 40px rgba(0, 0, 0, 0.08)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
                        border: isScrolled ? "none" : "1px solid rgba(255, 255, 255, 0.8)",
                        borderBottom: isScrolled ? "1px solid rgba(200, 200, 200, 0.3)" : "1px solid rgba(255, 255, 255, 0.8)",
                        borderRadius: isScrolled ? "0" : "24px",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        pointerEvents: "auto",
                        maxWidth: isScrolled ? "100%" : "1200px"
                    }}
                >
                    <div className="container d-flex justify-content-between align-items-center">

                        {/* Brand / Logo */}
                        <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none brand-group hover-scale">
                            <div className="logo-box shadow-sm" style={{ width: isScrolled ? '40px' : '48px', height: isScrolled ? '40px' : '48px', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                <img src={logo} alt="Logo" className="logo-img" />
                            </div>
                            <div className="brand-text-group d-flex flex-column justify-content-center">
                                <span className="brand-name ac-font text-dark mb-0" style={{ fontSize: isScrolled ? '1.1rem' : '1.3rem', transition: 'all 0.3s ease', letterSpacing: '1px' }}>CHOPAENG</span>
                                <span className="brand-subtext x-small fw-black text-success d-none d-sm-block" style={{ letterSpacing: '1.5px', opacity: 0.8 }}>TREASURE ISLAND</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="d-none d-lg-flex align-items-center nav-pill-container p-1 rounded-pill bg-white bg-opacity-75 border border-white shadow-sm" style={{ backdropFilter: 'blur(10px)' }}>
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    end={link.path === "/"}
                                    className={({ isActive }) =>
                                        `nav-pill-link rounded-pill px-4 py-2 text-decoration-none fw-bold small text-uppercase transition-all ${isActive ? "active text-white" : "text-secondary"
                                        }`
                                    }
                                    style={({ isActive }) => ({
                                        letterSpacing: '0.5px',
                                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    })}
                                >
                                    <span className="d-flex align-items-center gap-2">
                                        <i className={`fa-solid ${link.icon} icon-sm`}></i>
                                        {link.name}
                                    </span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className="d-flex align-items-center gap-3">
                            {user ? (
                                <button
                                    type="button"
                                    onClick={() => void logout()}
                                    className="btn btn-light rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all hover-scale"
                                    title="Logout"
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    Logout
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={login}
                                    className="btn btn-nook-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all hover-scale"
                                    title="Login"
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    Login
                                </button>
                            )}

                            <a href="https://discord.gg/chopaeng" target="_blank" rel="noreferrer" className="btn btn-nook-sm rounded-circle d-none d-md-flex shadow-sm hover-scale" style={{ width: '42px', height: '42px' }}>
                                <i className="fa-brands fa-discord fs-5"></i>
                            </a>

                            <button
                                className={`mobile-toggle btn border-0 d-lg-none p-2 ${isMobileMenuOpen ? 'open' : ''}`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}
                            >
                                <div className="hamburger">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`mobile-flyout d-lg-none ${isMobileMenuOpen ? "active" : ""}`}>
                <div className="container py-4">
                    <div className="row g-3">
                        {navLinks.map((link) => (
                            <div className="col-6" key={link.name}>
                                <Link
                                    to={link.path}
                                    className={`mobile-card text-decoration-none p-3 rounded-4 d-flex flex-column align-items-center gap-2 ${pathname === link.path ? 'active' : ''}`}
                                >
                                    <div className="mobile-icon-circle">
                                        <i className={`fa-solid ${link.icon}`}></i>
                                    </div>
                                    <span className="fw-black x-small text-uppercase">{link.name}</span>
                                </Link>
                            </div>
                        ))}
                        <div className="col-12 mt-2">
                            {user ? (
                                <button
                                    type="button"
                                    onClick={() => void logout()}
                                    className="mobile-card text-decoration-none p-3 rounded-4 d-flex align-items-center justify-content-center gap-2 w-100 border-0"
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    <span className="fw-black x-small text-uppercase">Logout</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={login}
                                    className="mobile-card text-decoration-none p-3 rounded-4 d-flex align-items-center justify-content-center gap-2 w-100 border-0"
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    <span className="fw-black x-small text-uppercase">Login</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;