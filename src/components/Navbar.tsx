import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from '../assets/logo.webp';
const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu whenever route changes (optional nice touch)
    // If you want this, uncomment and import useLocation:
    // import { useLocation } from "react-router-dom";
    // const { pathname } = useLocation();
    // useEffect(() => setIsMobileMenuOpen(false), [pathname]);

    const navLinks = [
        { name: "Home", path: "/", icon: "fa-house" },
        { name: "Treasure Islands", path: "/islands", icon: "fa-map" },
        // { name: "Find", path: "/find", icon: "fa-magnifying-glass" },
        { name: "Membership", path: "/membership", icon: "fa-crown" },
        { name: "Guide", path: "/guides", icon: "fa-book-open" },
        { name: "About", path: "/about", icon: "fa-circle-info" },
        { name: "Contact", path: "/contact", icon: "fa-envelope" },
    ];


    const closeMobile = () => setIsMobileMenuOpen(false);

    return (
        <>
            <nav
                className={`navbar sticky-top ${isScrolled ? "py-2 shadow-lg" : "py-3"}`}
                style={{
                    backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease-in-out",
                }}
            >
                <div className="container d-flex justify-content-between align-items-center">
                    {/* Brand / Logo */}
                    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none brand-wrapper">
                        <div
                            className="bg-success rounded-3 d-flex align-items-center justify-content-center shadow-sm logo-container"
                            style={{
                                width: "42px",
                                height: "42px",
                                overflow: "hidden",
                                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            }}
                        >
                            <img
                                src={logo}
                                alt="CHOPAENG Logo"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        </div>

                        <span className="h5 fw-bold mb-0 text-dark font-heading letter-spacing-1 brand-text">
              CHOPAENG
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="d-none d-lg-flex align-items-center gap-4">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"} // IMPORTANT: only Home is active on exact "/"
                                className={({ isActive }) =>
                                    `nav-custom-link text-decoration-none fw-bold small text-uppercase ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="d-flex align-items-center gap-3">


                        {/* Mobile Menu Toggle */}
                        <button
                            className="btn d-lg-none p-2 border-0"
                            onClick={() => setIsMobileMenuOpen((v) => !v)}
                            aria-label="Toggle Navigation"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <div className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <div className={`mobile-menu bg-white d-lg-none ${isMobileMenuOpen ? "active" : ""}`}>
                    <div className="container py-4 d-flex flex-column gap-3">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.path === "/"}
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                    `mobile-link h5 text-decoration-none fw-bold ${isActive ? "text-success" : "text-dark"}`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            <style>{`
        /* Brand hover */
        .brand-wrapper:hover .logo-container {
          transform: rotate(-8deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3) !important;
        }
        .brand-wrapper:hover .brand-text {
          color: #198754 !important;
        }
        .brand-text { transition: color 0.3s ease; }

        /* Desktop Nav Links */
        .nav-custom-link {
          position: relative;
          color: #666 !important;
          transition: color 0.25s ease;
          letter-spacing: 1px;
        }
        .nav-custom-link:hover {
          color: #198754 !important;
        }

     

        /* ACTIVE state */
        .nav-custom-link.active {
          color: #198754 !important;
        }
        .nav-custom-link.active::after {
          width: 100%;
        }

        /* Discord hover */
        .discord-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .discord-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4) !important;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.35s ease, opacity 0.25s ease;
          border-bottom: 1px solid #eee;
        }
        .mobile-menu.active {
          max-height: 520px; /* smooth expand */
          opacity: 1;
        }

        /* Hamburger */
        .hamburger span {
          display: block;
          width: 25px;
          height: 3px;
          background: #333;
          margin: 5px 0;
          transition: 0.3s;
        }
        .hamburger.open span:nth-child(1) { transform: rotate(-45deg) translate(-5px, 6px); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: rotate(45deg) translate(-5px, -6px); }
      `}</style>
        </>
    );
};

export default Navbar;
