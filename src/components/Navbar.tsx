import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from '../assets/logo.webp';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();

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
        { name: "Membership", path: "/membership", icon: "fa-crown" },
        { name: "Guide", path: "/guides", icon: "fa-book-open" },
        { name: "About", path: "/about", icon: "fa-circle-info" },
    ];

    return (
        <>
            <nav
                className={`navbar sticky-top transition-all ${isScrolled ? "navbar-scrolled py-2" : "py-3"}`}
                style={{
                    backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "transparent",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    zIndex: 1050
                }}
            >
                <div className="container d-flex justify-content-between align-items-center">

                    {/* Brand / Logo */}
                    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none brand-group">
                        <div className="logo-box shadow-sm">
                            <img src={logo} alt="Logo" className="logo-img" />
                        </div>
                        <div className="brand-text-group">
                            <span className="brand-name ac-font text-dark h5 mb-0">CHOPAENG</span>
                            <span className="brand-subtext x-small fw-black text-success d-none d-sm-block">Treasure Island</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="d-none d-lg-flex align-items-center nav-pill-container p-1 rounded-pill bg-white bg-opacity-50 border border-white shadow-sm">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"}
                                className={({ isActive }) =>
                                    `nav-pill-link rounded-pill px-3 py-2 text-decoration-none fw-black small text-uppercase transition-all ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <span className="d-flex align-items-center gap-2">
                                    <i className={`fa-solid ${link.icon} icon-sm`}></i>
                                    {link.name}
                                </span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="d-flex align-items-center gap-2">
                        <a href="https://discord.gg/chopaeng" target="_blank" className="btn btn-nook-sm d-none d-md-flex">
                            <i className="fa-brands fa-discord"></i>
                        </a>

                        <button
                            className={`mobile-toggle btn border-0 d-lg-none ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
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
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;