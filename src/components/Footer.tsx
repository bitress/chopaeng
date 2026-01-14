
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white pt-5 pb-4 border-top">
            <div className="container">
                <div className="row gy-4">

                    {/* Brand & Description */}
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-3 footer-brand-wrapper">
                            <div
                                className="bg-success rounded-3 d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                <img
                                    src="logo.webp"
                                    alt="CHOPAENG Logo"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <span className="h5 fw-bold mb-0 text-dark font-heading letter-spacing-1">
        CHOPAENG
    </span>

                            <style>{`
        /* Subtle lift effect for the footer logo on hover */
        .footer-brand-wrapper:hover div {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(25, 135, 84, 0.2) !important;
        }
    `}</style>
                        </div>
                        <p className="text-muted small lh-lg" style={{ maxWidth: '300px' }}>
                            Your ultimate destination for treasure island adventures and premium gaming services.
                            Join our community to explore, trade, and discover the secrets of the islands.
                        </p>
                        <div className="d-flex gap-3 mt-4">
                            <a href="#" className="social-icon-link text-muted"><i className="bi bi-discord fs-5"></i></a>
                            <a href="#" className="social-icon-link text-muted"><i className="bi bi-twitter-x fs-5"></i></a>
                            <a href="#" className="social-icon-link text-muted"><i className="bi bi-instagram fs-5"></i></a>
                            <a href="#" className="social-icon-link text-muted"><i className="bi bi-youtube fs-5"></i></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-2 col-6 col-md-3">
                        <h6 className="fw-bold text-dark text-uppercase small mb-4 letter-spacing-1">Islands</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li><a href="#islands" className="footer-link">New Horizons</a></li>
                            <li><a href="#islands" className="footer-link">Treasure Maps</a></li>
                            <li><a href="#islands" className="footer-link">Daily Tours</a></li>
                            <li><a href="#islands" className="footer-link">Item Catalog</a></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="col-lg-2 col-6 col-md-3">
                        <h6 className="fw-bold text-dark text-uppercase small mb-4 letter-spacing-1">Support</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li><a href="#guide" className="footer-link">Guide Book</a></li>
                            <li><a href="#faq" className="footer-link">FAQ</a></li>
                            <li><a href="#contact" className="footer-link">Help Center</a></li>
                            <li><a href="#terms" className="footer-link">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Newsletter / Join */}
                    <div className="col-lg-4 col-md-12">
                        <div className="p-4 rounded-4 bg-light border">
                            <h6 className="fw-bold text-dark mb-2">Join the Island Newsletter</h6>
                            <p className="small text-muted mb-3">Get notified about the latest island drops and events.</p>
                            <div className="input-group">
                                <input
                                    type="email"
                                    className="form-control border-0 shadow-none px-3"
                                    placeholder="Email address"
                                    style={{ borderRadius: '10px 0 0 10px' }}
                                />
                                <button
                                    className="btn btn-success px-3"
                                    style={{ borderRadius: '0 10px 10px 0' }}
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <hr className="my-5 opacity-10" />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <p className="small text-muted mb-0">
                        &copy; {currentYear} <strong>CHOPAENG</strong>. All rights reserved.
                    </p>
                    <div className="d-flex gap-4">
                        <a href="#" className="text-decoration-none small text-muted hover-success">Privacy Policy</a>
                        <a href="#" className="text-decoration-none small text-muted hover-success">Cookies</a>
                    </div>
                </div>
            </div>

            <style>{`
        .footer-link {
          text-decoration: none;
          color: #6c757d;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .footer-link:hover {
          color: #198754;
          padding-left: 5px;
        }
        .hover-success:hover {
          color: #198754 !important;
        }
        .social-icon-link {
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .social-icon-link:hover {
          color: #198754 !important;
          transform: translateY(-3px);
        }
        .letter-spacing-1 {
          letter-spacing: 1px;
        }
      `}</style>
        </footer>
    );
};

export default Footer;