import { useState, useEffect } from 'react';
import {Link} from "react-router-dom";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Treasure Islands', path: '/islands' },
        { name: 'Membership', path: '/membership' },
        { name: 'Guide', path: '/guides' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];


    return (
        <>
            <nav
                className={`navbar sticky-top transition-all duration-300 ${
                    isScrolled ? 'py-2 shadow-lg' : 'py-3'
                }`}
                style={{
                    backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                <div className="container d-flex justify-content-between align-items-center">

                    {/* Brand / Logo */}
                    <a href="/" className="d-flex align-items-center gap-2 text-decoration-none group brand-wrapper">
                        <div
                            className="bg-success rounded-3 d-flex align-items-center justify-content-center shadow-sm logo-container"
                            style={{
                                width: '42px',
                                height: '42px',
                                overflow: 'hidden', // Ensures image doesn't bleed out of rounded corners
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            <img
                                src="logo.webp"
                                alt="CHOPAENG Logo"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover', // Or 'contain' if you want to see the whole logo border
                                    display: 'block'
                                }}
                            />
                        </div>

                        <span className="h5 fw-bold mb-0 text-dark font-heading letter-spacing-1 brand-text">
        CHOPAENG
    </span>

                        <style>{`
        /* When hovering over the link, tilt the logo and change text color */
        .brand-wrapper:hover .logo-container {
            transform: rotate(-8deg) scale(1.1);
            box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3) !important;
        }

        .brand-wrapper:hover .brand-text {
            color: #198754 !important; /* Success color */
        }

        .brand-text {
            transition: color 0.3s ease;
        }
    `}</style>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="d-none d-lg-flex align-items-center gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-decoration-none text-dark hover-success fw-bold small text-uppercase"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side: Discord + Mobile Toggle */}
                    <div className="d-flex align-items-center gap-3">
                        <a
                            href="https://discord.com"
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary rounded-pill fw-bold d-flex align-items-center gap-2 px-4 d-none d-sm-flex border-0 shadow-sm discord-btn"
                            style={{ backgroundColor: '#5865F2' }}
                        >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                            </svg>
                            <span>Discord</span>
                        </a>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="btn d-lg-none p-2 border-0"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Navigation"
                        >
                            <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <div className={`mobile-menu bg-white d-lg-none ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="container py-4 d-flex flex-column gap-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="h5 text-dark text-decoration-none fw-bold"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr />
                        <a href="https://discord.com" className="btn btn-primary w-100 rounded-pill py-3 fw-bold" style={{ backgroundColor: '#5865F2' }}>
                            Join Discord
                        </a>
                    </div>
                </div>
            </nav>

            {/* CSS Styles - You can move these to a CSS file */}
            <style>{`
        .nav-custom-link {
          position: relative;
          color: #666 !important;
          transition: color 0.3s ease;
          letter-spacing: 1px;
        }
        .nav-custom-link:hover {
          color: #198754 !important;
        }
        .nav-custom-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: #198754;
          transition: width 0.3s ease;
        }
        .nav-custom-link:hover::after {
          width: 100%;
        }
        
        .logo-icon:hover {
          transform: rotate(15deg) scale(1.1);
        }

        .discord-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4) !important;
        }

        /* Mobile Menu Logic */
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          height: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          border-bottom: 1px solid #eee;
        }
        .mobile-menu.active {
          height: auto;
          opacity: 1;
        }

        /* Hamburger Animation */
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