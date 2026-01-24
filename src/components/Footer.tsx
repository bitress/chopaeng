import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.webp";

const Footer = () => {
    const [email, setEmail] = useState("");
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: "bi-discord", url: "https://discord.com/invite/chopaeng", label: "Discord" },
        { icon: "bi-facebook", url: "https://www.facebook.com/ChoPaengTV", label: "Facebook" },
        { icon: "bi-tiktok", url: "https://www.tiktok.com/@ChoPaengTV", label: "Tiktok" },
        { icon: "bi-instagram", url: "https://www.instagram.com/itschopaeng", label: "Instagram" },
        { icon: "bi-twitch", url: "https://www.twitch.tv/chopaeng", label: "Twitch" },
        { icon: "bi-youtube", url: "https://www.youtube.com/chopaengtv", label: "YouTube" },
    ];

    const footerNav = {
        islands: [
            { name: "Treasure Islands", path: "/islands" },
            { name: "Maps", path: "/maps" },
            { name: "Membership", path: "/membership" },
            { name: "Get Dodo Code", path: "/dodo" },
        ],
        support: [
            { name: "Guide Book", path: "/guides" },
            { name: "Help Center", path: "/contact" },
            { name: "About Us", path: "/about" },
            { name: "Terms of Service", path: "/terms" },
        ]
    };

    const handleSubscribe = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
    };

    return (
        <footer className="bg-white pt-5 pb-4 border-top">
            <div className="container">
                <div className="row gy-5">
                    {/* Brand Section */}
                    <div className="col-lg-4 col-md-12 text-center text-lg-start">
                        <Link to="/" className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mb-3 text-decoration-none">
                            <div className="footer-logo bg-success rounded-3 d-flex align-items-center justify-content-center shadow-sm overflow-hidden">
                                <img src={logo} alt="CHOPAENG" className="footer-logo-img" />
                            </div>
                            <span className="h5 fw-bold mb-0 text-dark font-heading letter-spacing-1">
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
                                    <i className={`bi ${social.icon} fs-5`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="col-lg-4 col-md-12">
                        <div className="row">
                            <div className="col-6">
                                <h6 className="fw-bold text-dark text-uppercase small mb-4">Islands</h6>
                                <ul className="list-unstyled d-flex flex-column gap-2">
                                    {footerNav.islands.map(link => (
                                        <li key={link.name}><Link to={link.path} className="footer-link">{link.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-6">
                                <h6 className="fw-bold text-dark text-uppercase small mb-4">Support</h6>
                                <ul className="list-unstyled d-flex flex-column gap-2">
                                    {footerNav.support.map(link => (
                                        <li key={link.name}><Link to={link.path} className="footer-link">{link.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="col-lg-4 col-md-12">
                        <div className="p-4 rounded-4 bg-light border-0 shadow-sm">
                            <h6 className="fw-bold text-dark mb-2">Island Newsletter</h6>
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
                    <p className="small text-muted mb-0">
                        &copy; {currentYear} <strong>CHOPAENG</strong>.
                    </p>
                    <div className="d-flex gap-4">
                        <Link to="/privacy" className="text-decoration-none small text-muted hover-success">Privacy</Link>
                        <Link to="/cookies" className="text-decoration-none small text-muted hover-success">Cookies</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .footer-logo { width: 40px; height: 40px; transition: transform 0.2s ease; }
                .footer-logo-img { width: 100%; height: 100%; object-fit: cover; }
                .footer-link { text-decoration: none; color: #6c757d; font-size: 0.9rem; transition: 0.2s; }
                .footer-link:hover { color: #198754; transform: translateX(3px); }
                .social-icon-link:hover { color: #198754 !important; transform: translateY(-3px); transition: 0.2s; }
                .hover-success:hover { color: #198754 !important; }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </footer>
    );
};

export default Footer;