const Membership = () => {
    const tiers = [
        {
            name: "Chotato",
            price: "3",
            tagline: "The Budget Friendly Pick",
            isSoldOut: true,
            features: ["2 Private Islands", "Unlimited trips 24/7", "Bot access for Items", "Discord Role"],
            color: "secondary"
        },
        {
            name: "ChoColate",
            price: "4",
            tagline: "More Islands, More Loot",
            isSoldOut: true,
            features: ["9 Private Islands", "ChoBot Access", "Unlimited trips 24/7", "DM Support", "Discord Role"],
            color: "secondary"
        },
        {
            name: "ChoFries",
            price: "5",
            tagline: "The Fan Favorite",
            isRecommended: true,
            features: ["9 Private Islands", "PRIORITY ChoBot Access", "Priority Requests", "Unlimited trips 24/7", "Discord Role"],
            color: "success"
        },
        {
            name: "ChoSoup",
            price: "10",
            tagline: "The Ultimate VIP",
            features: ["Access to ALL Islands", "VIP ChoBot Priority", "Exclusive Giveaways", "Priority DM Help", "All Member Perks"],
            color: "dark"
        }
    ];

    return (
        <div className="bg-white min-vh-100">

            {/* 1. HERO SECTION */}
            <section className="py-5 bg-light border-bottom">
                <div className="container py-5 text-center">
                    <h1 className="display-4 fw-bold mb-3">Join the <span className="text-success">Beshies</span></h1>
                    <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '750px' }}>
                        Support the stream and get exclusive 24/7 access to our automated treasure island network.
                        Choose your preferred platform below to get started.
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                        <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill fw-bold">
                            🔥 20% Off Annual Subs
                        </span>
                    </div>
                </div>
            </section>

            {/* 2. PLATFORM SELECTION */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-4 justify-content-center">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                                <i className="bi bi-patreon fs-1 text-danger mb-3"></i>
                                <h4 className="fw-bold">Patreon</h4>
                                <p className="small text-muted">Access all 4 tiers of membership and custom bot roles.</p>
                                <a href="#" className="btn btn-outline-danger w-100 rounded-pill mt-auto fw-bold">View Patreon</a>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4 text-white bg-dark">
                                <i className="bi bi-twitch fs-1 text-primary mb-3"></i>
                                <h4 className="fw-bold">Twitch Sub</h4>
                                <p className="small opacity-75">Free with Prime! Counts as a mid-tier membership.</p>
                                <a href="#" className="btn btn-primary w-100 rounded-pill mt-auto fw-bold">Subscribe Now</a>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                                <i className="bi bi-youtube fs-1 text-danger mb-3"></i>
                                <h4 className="fw-bold">YouTube</h4>
                                <p className="small text-muted">Join the channel to get exclusive badges and island perks.</p>
                                <a href="#" className="btn btn-outline-dark w-100 rounded-pill mt-auto fw-bold">Join Channel</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. MEMBERSHIP TIERS (The Patreon Tiers) */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold">Patreon Tiers</h2>
                        <p className="text-muted">Direct support for our 24/7 automated islands.</p>
                    </div>
                    <div className="row g-4">
                        {tiers.map((tier, i) => (
                            <div key={i} className="col-lg-3 col-md-6">
                                <div className={`card h-100 border-0 shadow-sm rounded-4 p-4 ${tier.isRecommended ? 'border border-success border-2 shadow' : ''}`}>
                                    {tier.isRecommended && (
                                        <div className="position-absolute top-0 start-50 translate-middle">
                                            <span className="badge rounded-pill bg-success px-3">BEST VALUE</span>
                                        </div>
                                    )}
                                    <div className="text-center mb-4">
                                        <h4 className="fw-bold mb-1">{tier.name}</h4>
                                        <div className="h2 fw-bold mb-0">${tier.price}<span className="fs-6 text-muted fw-normal">/mo</span></div>
                                        <p className="small text-muted mt-2">{tier.tagline}</p>
                                    </div>
                                    <ul className="list-unstyled mb-4 flex-grow-1">
                                        {tier.features.map((feat, idx) => (
                                            <li key={idx} className="small mb-2 d-flex align-items-center">
                                                <i className="bi bi-check2 text-success me-2"></i>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className={`btn w-100 rounded-pill fw-bold ${tier.isSoldOut ? 'btn-light text-muted disabled' : `btn-${tier.color}`}`}>
                                        {tier.isSoldOut ? 'Sold Out' : 'Get Started'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. CONNECTION GUIDE */}
            <section className="py-5 border-top">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card border-0 bg-success bg-opacity-10 rounded-4 p-4 p-lg-5">
                                <div className="row align-items-center">
                                    <div className="col-md-2 text-center mb-3 mb-md-0">
                                        <i className="bi bi-discord display-4 text-success"></i>
                                    </div>
                                    <div className="col-md-10">
                                        <h3 className="fw-bold mb-2">Sync with Discord</h3>
                                        <p className="text-muted mb-3">Access is automated. You MUST link your accounts to see the island channels.</p>
                                        <div className="d-flex flex-wrap gap-3">
                                            <div className="small fw-bold">1. Link Patreon/Twitch to Discord</div>
                                            <div className="small fw-bold">2. Join Chopaeng Server</div>
                                            <div className="small fw-bold">3. Access #chobot-orders</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FAQ / FOOTER INFO */}
            <section className="py-5 bg-dark text-white text-center">
                <div className="container">
                    <h5 className="fw-bold text-success mb-3 text-uppercase">Important Notice</h5>
                    <p className="opacity-75 mx-auto mb-0" style={{ maxWidth: '600px' }}>
                        Due to the nature of digital access, we do not provide refunds. Please ensure your Discord
                        is correctly linked. Need help? Open a ticket in our server.
                    </p>
                </div>
            </section>

        </div>
    );
};

export default Membership;