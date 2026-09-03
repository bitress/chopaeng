import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.webp";
import { openSuggestionModal } from "../utils/suggestionsApi";
import { APP_VERSION } from "../version";

const Footer = () => {
    const [email, setEmail] = useState("");
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: "fa-brands fa-discord", url: "https://discord.com/invite/chopaeng", label: "Discord" },
        { icon: "fa-brands fa-facebook", url: "https://www.facebook.com/ChoPaengTV", label: "Facebook" },
        { icon: "fa-brands fa-tiktok", url: "https://www.tiktok.com/@ChoPaengTV", label: "Tiktok" },
        { icon: "fa-brands fa-instagram", url: "https://www.instagram.com/itschopaeng", label: "Instagram" },
        { icon: "fa-brands fa-twitch", url: "https://www.twitch.tv/chopaeng", label: "Twitch" },
        { icon: "fa-brands fa-youtube", url: "https://www.youtube.com/chopaengtv", label: "YouTube" },
    ];

    const footerNav = {
        islands: [
            { name: "Treasure Islands", path: "/islands" },
            { name: "ACNH Catalogue", path: "/catalog" },
            { name: "Pocket Inventory", path: "/pockets" },
            { name: "Maps", path: "/maps" },
            { name: "Membership", path: "/membership" },
            { name: "Get Dodo Code", path: "/dodo" },
        ],
        support: [
            { name: "Guide Book", path: "/guides" },
            { name: "Help Center", path: "/contact" },
            { name: "Suggest Feature", path: "#", onClick: (e: React.MouseEvent) => { e.preventDefault(); openSuggestionModal(); } },
            { name: "About Us", path: "/about" },
            { name: "Terms of Service", path: "/terms" },
        ]
    };

    const handleSubscribe = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
    };

    return (
        <footer className="chopaeng-footer pt-5 pb-4 border-top">
            <style>{`
                .chopaeng-footer {
                    background-color: #ffffff;
                    border-color: rgba(0, 0, 0, 0.08) !important;
                    color: #475569;
                    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
                }
                .chopaeng-footer .footer-brand-title,
                .chopaeng-footer .footer-section-heading {
                    color: #1e293b;
                }
                .chopaeng-footer .footer-newsletter-card {
                    background-color: #f8fafc;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }
                .chopaeng-footer .footer-link {
                    color: #64748b;
                    text-decoration: none;
                    transition: color 0.2s ease, transform 0.2s ease;
                }
                .chopaeng-footer .footer-link:hover {
                    color: var(--ac-primary, #16a34a);
                    transform: translateX(2px);
                }

                /* ── Theme: Celeste ── */
                [data-theme="celeste"] .chopaeng-footer {
                    background-color: #12192c;
                    border-color: rgba(167, 139, 250, 0.15) !important;
                    color: #94a3b8;
                }
                [data-theme="celeste"] .chopaeng-footer .footer-brand-title,
                [data-theme="celeste"] .chopaeng-footer .footer-section-heading {
                    color: #f8fafc;
                }
                [data-theme="celeste"] .chopaeng-footer .footer-newsletter-card {
                    background-color: #1a233d;
                    border-color: rgba(167, 139, 250, 0.2);
                }
                [data-theme="celeste"] .chopaeng-footer .footer-link {
                    color: #94a3b8;
                }
                [data-theme="celeste"] .chopaeng-footer .footer-link:hover {
                    color: #c084fc;
                }

                /* ── Theme: Roost ── */
                [data-theme="roost"] .chopaeng-footer {
                    background-color: #201a15;
                    border-color: rgba(217, 119, 6, 0.15) !important;
                    color: #d4a373;
                }
                [data-theme="roost"] .chopaeng-footer .footer-brand-title,
                [data-theme="roost"] .chopaeng-footer .footer-section-heading {
                    color: #fef3c7;
                }
                [data-theme="roost"] .chopaeng-footer .footer-newsletter-card {
                    background-color: #2d241d;
                    border-color: rgba(217, 119, 6, 0.2);
                }
                [data-theme="roost"] .chopaeng-footer .footer-link {
                    color: #c49a6c;
                }
                [data-theme="roost"] .chopaeng-footer .footer-link:hover {
                    color: #f59e0b;
                }

                /* ── Theme: Sakura ── */
                [data-theme="sakura"] .chopaeng-footer {
                    background-color: #fff0f4;
                    border-color: rgba(244, 114, 182, 0.2) !important;
                    color: #9d174d;
                }
                [data-theme="sakura"] .chopaeng-footer .footer-brand-title,
                [data-theme="sakura"] .chopaeng-footer .footer-section-heading {
                    color: #831843;
                }
                [data-theme="sakura"] .chopaeng-footer .footer-newsletter-card {
                    background-color: #ffe4ec;
                    border-color: rgba(244, 114, 182, 0.3);
                }
                [data-theme="sakura"] .chopaeng-footer .footer-link {
                    color: #be185d;
                }
                [data-theme="sakura"] .chopaeng-footer .footer-link:hover {
                    color: #ec4899;
                }

                /* ── Theme: DAL ── */
                [data-theme="dal"] .chopaeng-footer {
                    background-color: #0b1a2e;
                    border-color: rgba(56, 189, 248, 0.15) !important;
                    color: #94a3b8;
                }
                [data-theme="dal"] .chopaeng-footer .footer-brand-title,
                [data-theme="dal"] .chopaeng-footer .footer-section-heading {
                    color: #f0f9ff;
                }
                [data-theme="dal"] .chopaeng-footer .footer-newsletter-card {
                    background-color: #122845;
                    border-color: rgba(56, 189, 248, 0.2);
                }
                [data-theme="dal"] .chopaeng-footer .footer-link {
                    color: #94a3b8;
                }
                [data-theme="dal"] .chopaeng-footer .footer-link:hover {
                    color: #38bdf8;
                }

                /* ── Theme: NookLink ── */
                [data-theme="nooklink"] .chopaeng-footer {
                    background-color: #060910;
                    border-color: rgba(16, 185, 129, 0.15) !important;
                    color: #8da498;
                }
                [data-theme="nooklink"] .chopaeng-footer .footer-brand-title,
                [data-theme="nooklink"] .chopaeng-footer .footer-section-heading {
                    color: #ecfdf5;
                }
                [data-theme="nooklink"] .chopaeng-footer .footer-newsletter-card {
                    background-color: #0d171e;
                    border-color: rgba(16, 185, 129, 0.25);
                }
                [data-theme="nooklink"] .chopaeng-footer .footer-link {
                    color: #8da498;
                }
                [data-theme="nooklink"] .chopaeng-footer .footer-link:hover {
                    color: #10b981;
                }
            `}</style>
            <div className="container">
                <div className="row gy-5">
                    {/* Brand Section */}
                    <div className="col-lg-4 col-md-12 text-center text-lg-start">
                        <Link to="/" className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mb-3 text-decoration-none">
                            <div className="footer-logo bg-success rounded-3 d-flex align-items-center justify-content-center shadow-sm overflow-hidden">
                                <img src={logo} alt="CHOPAENG" className="footer-logo-img" />
                            </div>
                            <span className="h5 fw-bold mb-0 footer-brand-title font-heading letter-spacing-1">
                                CHOPAENG
                            </span>
                        </Link>
                        <p className="text-muted small lh-lg mx-auto mx-lg-0" style={{ maxWidth: 320 }}>
                            Premium gaming services and treasure island adventures.
                            Join the community to explore and trade secrets.
                        </p>
                        <div className="d-flex justify-content-center justify-content-lg-start gap-3 mt-4">
                            {socialLinks.map((social) => (
                                <a key={social.label} href={social.url} target="_blank" rel="noreferrer" className="social-icon-link text-muted" aria-label={social.label}>
                                    <i className={`${social.icon} fs-5`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="col-lg-4 col-md-12">
                        <div className="row">
                            <div className="col-6">
                                <h6 className="fw-bold footer-section-heading text-uppercase small mb-4">Islands</h6>
                                <ul className="list-unstyled d-flex flex-column gap-2">
                                    {footerNav.islands.map(link => (
                                        <li key={link.name}><Link to={link.path} className="footer-link">{link.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-6">
                                <h6 className="fw-bold footer-section-heading text-uppercase small mb-4">Support</h6>
                                <ul className="list-unstyled d-flex flex-column gap-2">
                                    {footerNav.support.map(link => (
                                        <li key={link.name}>
                                            {link.onClick ? (
                                                <button
                                                    type="button"
                                                    onClick={link.onClick}
                                                    className="footer-link btn btn-link p-0 border-0 text-decoration-none text-start text-muted"
                                                    style={{ fontSize: 'inherit' }}
                                                >
                                                    {link.name}
                                                </button>
                                            ) : (
                                                <Link to={link.path} className="footer-link">{link.name}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="col-lg-4 col-md-12">
                        <div className="p-4 rounded-4 footer-newsletter-card shadow-sm">
                            <h6 className="fw-bold footer-section-heading mb-2">Island Newsletter</h6>
                            <p className="small text-muted mb-3">Get notified about the latest drops.</p>
                            <form onSubmit={handleSubscribe}>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="form-control border-0 shadow-none px-3"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ borderRadius: "8px 0 0 8px", fontSize: "0.9rem" }}
                                    />
                                    <button type="submit" className="btn btn-success px-3" style={{ borderRadius: "0 8px 8px 0" }}>
                                        Join
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <hr className="my-5 opacity-10" />

                {/* Bottom Bar */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div>
                        <p className="small text-muted mb-1">
                            &copy; {currentYear} <strong>CHOPAENG</strong>. All rights reserved.
                        </p>
                        <p className="small text-muted mb-0" style={{ maxWidth: "700px" }}>
                            ChoPaeng Treasure Islands is
                            not affiliated with, endorsed by, sponsored by, or approved by
                            Nintendo. Animal Crossing and all related trademarks, characters,
                            and assets are the property of Nintendo.
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <Link
                            to="/privacy"
                            className="text-decoration-none small text-muted hover-success"
                        >
                            Privacy
                        </Link>

                        <Link
                            to="/cookies"
                            className="text-decoration-none small text-muted hover-success"
                        >
                            Cookies
                        </Link>

                        <a
                            href="https://creativecommons.org/licenses/by-sa/4.0/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none small text-muted hover-success"
                        >
                            CC BY-SA 4.0
                        </a>

                        <span className="badge bg-light text-muted border rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
                            v{APP_VERSION}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;