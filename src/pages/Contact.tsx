const Contact = () => {
    return (
        <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center justify-content-center">

            <title>Contact & Support | Get Help With Chopaeng Treasure Islands</title>

            <meta
                name="description"
                content="Get help with Chopaeng ACNH treasure island access, Dodo codes, memberships, orders, and account questions. Contact us via Discord or email."
            />

            <link rel="canonical" href="https://www.chopaeng.com/contact" />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Chopaeng" />
            <meta property="og:title" content="Chopaeng – Contact & Support" />
            <meta
                property="og:description"
                content="Contact Chopaeng via Discord or email for ACNH Treasure Island support and business inquiries."
            />
            <meta property="og:image" content="https://www.chopaeng.com/banner.png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Contact & Support | Chopaeng ACNH Treasure Islands" />
            <meta name="twitter:description" content="Get help with Chopaeng ACNH treasure island access, Dodo codes, memberships, orders, or account-related questions. Contact us via Discord or email." />
            <meta name="twitter:image" content="https://www.chopaeng.com/banner.png" />
            <meta property="og:url" content="https://www.chopaeng.com/contact" />


            <div className="app-container w-100" style={{maxWidth: '900px'}}>

                {/* 1. APP HEADER */}
                <div className="text-center mb-5">

                    <h1 className="display-5 fw-black ac-font text-dark mb-2">Resident Services</h1>
                    <p className="text-muted fw-bold text-uppercase spacing-wide mb-0">How can we help you today?</p>
                </div>

                {/* 2. CONTACT CARDS */}
                <div className="row g-4 justify-content-center mb-5">

                    {/* Discord (Community Support) */}
                    <div className="col-md-6">
                        <div className="contact-card h-100 bg-white p-4 rounded-4 shadow-sm border border-light position-relative overflow-hidden d-flex flex-column text-center hover-lift transition-all">
                            <div className="card-bg-icon text-primary opacity-10">
                                <i className="bi bi-discord"></i>
                            </div>

                            <div className="z-1 position-relative">
                                <div className="icon-squircle bg-primary text-white mx-auto mb-3 shadow-sm">
                                    <i className="bi bi-chat-dots-fill fs-3"></i>
                                </div>
                                <h3 className="fw-black ac-font text-dark mb-2">Community Chat</h3>
                                <p className="text-muted fw-bold small mb-4 lh-sm px-3">
                                    Need a Dodo Code? Bot stuck? Join our Discord server for 24/7 support from our mod team.
                                </p>
                                <a href="https://discord.gg/chopaeng" target="_blank" rel="noreferrer" className="btn btn-primary rounded-pill fw-bold px-5 py-2 w-100 shadow-sm btn-nook">
                                    Open Discord
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Email (Business) */}
                    <div className="col-md-6">
                        <div className="contact-card h-100 bg-white p-4 rounded-4 shadow-sm border border-light position-relative overflow-hidden d-flex flex-column text-center hover-lift transition-all">
                            <div className="card-bg-icon text-success opacity-10">
                                <i className="bi bi-envelope-paper"></i>
                            </div>

                            <div className="z-1 position-relative">
                                <div className="icon-squircle bg-success text-white mx-auto mb-3 shadow-sm">
                                    <i className="bi bi-mailbox2 fs-3"></i>
                                </div>
                                <h3 className="fw-black ac-font text-dark mb-2">Business Mail</h3>
                                <p className="text-muted fw-bold small mb-4 lh-sm px-3">
                                    For brand collaborations, sponsorships, or urgent account inquiries. (Replies within 24h).
                                </p>
                                <a href="mailto:hello@chopaeng.com" className="btn btn-success rounded-pill fw-bold px-5 py-2 w-100 shadow-sm btn-nook">
                                    Send Letter
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HOURS WIDGET */}
                <div className="bg-white rounded-4 p-4 border border-light shadow-sm d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-circle">
                            <i className="bi bi-clock-history fs-4"></i>
                        </div>
                        <div>
                            <h5 className="fw-black ac-font text-dark mb-0">Operating Hours</h5>
                            <p className="small text-muted fw-bold mb-0">Islands are open 24/7 unless refreshing.</p>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold">
                            <span className="dot bg-success me-2"></span>
                            System Online
                        </span>
                    </div>
                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

                .nook-os {
                    background-color: #f2f4e6;
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                    font-family: 'Nunito', sans-serif;
                }

                .ac-font { font-family: 'Fredoka One', cursive; }
                .fw-black { font-weight: 900; }
                .spacing-wide { letter-spacing: 1.5px; }

                /* Squircle Icon */
                .icon-squircle {
                    width: 60px; height: 60px;
                    border-radius: 22px;
                    display: flex; align-items: center; justify-content: center;
                    transform: rotate(-3deg);
                    border: 2px solid rgba(255,255,255,0.4);
                }

                /* Background Icon Decoration */
                .card-bg-icon {
                    position: absolute;
                    top: -20px; right: -20px;
                    font-size: 8rem;
                    transform: rotate(15deg);
                    z-index: 0;
                }

                /* Card Interaction */
                .contact-card {
                    border: 2px solid transparent;
                }
                .hover-lift:hover {
                    transform: translateY(-5px);
                    border-color: #88e0a0;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
                }
                .transition-all { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

                /* Buttons */
                .btn-nook {
                    border: 2px solid rgba(255,255,255,0.2);
                    transition: transform 0.1s;
                }
                .btn-nook:active { transform: scale(0.98); }

                /* Dot */
                .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
            `}</style>
        </div>
    );
};

export default Contact;