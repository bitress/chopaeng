
const Membership = () => {

    const links = {
        patreon: "https://www.patreon.com/chopaeng",
        twitch: "https://www.twitch.tv/chopaeng",
        youtube: "https://www.youtube.com/c/chopaengtv"
    };

    const tiers = [
        {
            name: "Chotato",
            price: "2",
            tagline: "Entry Level",
            isSoldOut: true,
            features: ["2 Private Islands", "Unlimited Trips", "Bot Access", "Discord Role"],
            color: "secondary",
            icon: "gem"
        },
        {
            name: "ChoColate",
            price: "4",
            tagline: "Standard Plan",
            isSoldOut: true,
            features: ["9 Private Islands", "ChoBot Access", "Unlimited Trips", "DM Support", "Discord Role"],
            color: "secondary",
            icon: "mug-hot"
        },
        {
            name: "ChoFries",
            price: "5",
            tagline: "Most Popular",
            isRecommended: true,
            features: ["9 Private Islands", "PRIORITY ChoBot", "Priority Requests", "Unlimited Trips", "Discord Role"],
            color: "success",
            icon: "fire"
        },
        {
            name: "ChoSoup",
            price: "10",
            tagline: "All Access",
            features: ["ALL Islands Access", "VIP Priority Queue", "Exclusive Giveaways", "Priority DM Help", "All Perks"],
            color: "dark",
            icon: "star"
        }
    ];

    return (
        <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">

            <div className="app-container w-100" style={{maxWidth: '1000px'}}>

                {/* 1. ABD HEADER */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center bg-white p-3 rounded-4 shadow-sm mb-3 border border-3 border-light transform-rotate-n3">
                        {/* FA: Landmark/Bank Icon */}
                        <i className="fa-solid fa-landmark fs-1 text-success"></i>
                    </div>
                    <h1 className="display-5 fw-black ac-font text-dark mb-1">Membership Plans</h1>
                    <p className="text-muted fw-bold text-uppercase spacing-wide mb-0 opacity-75">Nook Inc. Financial Services</p>
                </div>

                {/* 2. PLATFORM SELECTOR */}
                <div className="row g-3 justify-content-center mb-5">
                    <div className="col-md-4">
                        <a href={links.patreon} target="_blank" rel="noreferrer" className="text-decoration-none">
                            <div className="platform-btn bg-white rounded-4 p-4 text-center h-100 shadow-sm border border-2 border-transparent hover-border-danger cursor-pointer transition-all">
                                {/* FA: Patreon Brand */}
                                <i className="fa-brands fa-patreon fs-1 text-danger mb-2"></i>
                                <h4 className="fw-black ac-font text-dark mb-1">Patreon</h4>
                                <p className="small text-muted fw-bold mb-0">Full Tier Access</p>
                            </div>
                        </a>
                    </div>
                    <div className="col-md-4">
                        <a href={links.twitch} target="_blank" rel="noreferrer" className="text-decoration-none">
                            <div className="platform-btn bg-dark rounded-4 p-4 text-center h-100 shadow-sm border border-2 border-transparent hover-border-primary cursor-pointer transition-all">
                                {/* FA: Twitch Brand */}
                                <i className="fa-brands fa-twitch fs-1 text-primary mb-2"></i>
                                <h4 className="fw-black ac-font text-white mb-1">Twitch</h4>
                                <p className="small text-white-50 fw-bold mb-0">Free w/ Prime Gaming</p>
                            </div>
                        </a>
                    </div>
                    <div className="col-md-4">
                        <a href={links.youtube} target="_blank" rel="noreferrer" className="text-decoration-none">
                            <div className="platform-btn bg-white rounded-4 p-4 text-center h-100 shadow-sm border border-2 border-transparent hover-border-danger cursor-pointer transition-all">
                                {/* FA: YouTube Brand */}
                                <i className="fa-brands fa-youtube fs-1 text-danger mb-2"></i>
                                <h4 className="fw-black ac-font text-dark mb-1">YouTube</h4>
                                <p className="small text-muted fw-bold mb-0">Become a Member</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* 3. TIERS GRID */}
                <div className="row g-4 mb-5">
                    {tiers.map((tier, i) => (
                        <div key={i} className="col-lg-3 col-md-6">
                            <div className={`
                                tier-card h-100 d-flex flex-column p-4 rounded-4 shadow-sm bg-white position-relative
                                ${tier.isRecommended ? 'border-2 border-success ring-success' : 'border border-light'}
                                ${tier.isSoldOut ? 'opacity-75' : ''}
                            `}>
                                {tier.isRecommended && (
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <span className="badge bg-success text-white rounded-pill px-3 py-1 fw-bold border border-2 border-white shadow-sm">
                                            BEST VALUE
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-4 pt-2">
                                    <div className={`icon-circle mx-auto mb-3 bg-${tier.color} bg-opacity-10 text-${tier.color}`}>
                                        {/* FA: Dynamic Icons */}
                                        <i className={`fa-solid fa-${tier.icon} fs-4`}></i>
                                    </div>
                                    <h5 className="fw-black ac-font text-dark mb-0">{tier.name}</h5>
                                    <p className="small text-muted fw-bold mb-2">{tier.tagline}</p>
                                    <div className="d-flex align-items-baseline justify-content-center text-dark">
                                        <span className="fs-5 fw-bold">$</span>
                                        <span className="display-6 fw-black ac-font mx-1">{tier.price}</span>
                                        <span className="small text-muted fw-bold">/mo</span>
                                    </div>
                                </div>

                                <div className="receipt-line mb-4"></div>

                                <ul className="list-unstyled flex-grow-1 d-flex flex-column gap-2 mb-4">
                                    {tier.features.map((feat, idx) => (
                                        <li key={idx} className="d-flex align-items-start small fw-bold text-muted">
                                            {/* FA: Circle Check */}
                                            <i className="fa-solid fa-circle-check text-success me-2 flex-shrink-0 mt-1"></i>
                                            <span className="lh-sm">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={links.patreon}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`btn rounded-pill fw-black py-2 w-100 shadow-sm border-2 text-uppercase text-decoration-none ${tier.isSoldOut ? 'btn-light text-muted border-0 disabled-link' : `btn-${tier.color} text-white border-white`}`}
                                    style={{pointerEvents: tier.isSoldOut ? 'none' : 'auto'}}
                                >
                                    {tier.isSoldOut ? 'SOLD OUT' : 'Select on Patreon'}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 4. SYNC INSTRUCTION */}
                <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-grid opacity-10 pointer-events-none"></div>

                    <div className="row align-items-center position-relative z-1">
                        <div className="col-md-5 text-center mb-4 mb-md-0">
                            <div className="d-inline-block p-4 rounded-circle bg-success bg-opacity-10 border border-success border-opacity-25 mb-3">
                                {/* FA: Rotate/Sync Icon */}
                                <i className="fa-solid fa-rotate fs-1 text-success spin-hover"></i>
                            </div>
                            <h4 className="fw-black ac-font text-dark">Activation</h4>
                        </div>
                        <div className="col-md-7">
                            <h5 className="fw-bold text-dark mb-3">How to claim perks:</h5>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-3 border">
                                    <span className="badge bg-dark rounded-circle p-2 w-auto h-auto">1</span>
                                    <span className="small fw-bold text-dark">Subscribe via Patreon / Twitch</span>
                                </div>
                                <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-3 border">
                                    <span className="badge bg-dark rounded-circle p-2 w-auto h-auto">2</span>
                                    <span className="small fw-bold text-dark">Go to User Settings &gt; Connections</span>
                                </div>
                                <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-3 border">
                                    <span className="badge bg-dark rounded-circle p-2 w-auto h-auto">3</span>
                                    <span className="small fw-bold text-dark">Link Discord account. Done!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <p className="tiny-text text-muted fw-bold text-uppercase opacity-50">
                        * NO REFUNDS ON DIGITAL GOODS. ISLANDS MANAGED BY NOOK INC.
                    </p>
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

                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }
                .spacing-wide { letter-spacing: 1.5px; }
                .tiny-text { font-size: 0.7rem; letter-spacing: 0.5px; }

                /* UTILS */
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease; }
                .hover-border-danger:hover { border-color: #dc3545 !important; transform: translateY(-3px); }
                .hover-border-primary:hover { border-color: #0d6efd !important; transform: translateY(-3px); }
                .transform-rotate-n3 { transform: rotate(-3deg); }

                /* TIER CARDS */
                .tier-card {
                    transition: transform 0.2s;
                }
                .tier-card:hover { transform: translateY(-5px); }
                
                .icon-circle {
                    width: 50px; height: 50px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                }

                .receipt-line {
                    height: 2px;
                    background-image: linear-gradient(to right, #ccc 50%, rgba(255,255,255,0) 0%);
                    background-position: bottom;
                    background-size: 10px 1px;
                    background-repeat: repeat-x;
                }

                .ring-success { box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1); }

                /* DIAGRAM BG */
                .bg-grid {
                    background-image: linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                
                .spin-hover:hover { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Membership;