import logo from '../assets/logo.webp'
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <>
            <title>About Chopaeng – Meet the Islander Behind the Treasure Islands</title>
            <meta
                name="description"
                content="Meet Kuya Cho, the Islander behind Chopaeng, and learn how our community provides free and premium Animal Crossing Treasure Islands through a Bayanihan spirit."
            />
            <link rel="canonical" href="https://www.chopaeng.com/about" />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Chopaeng" />
            <meta property="og:title" content="About | Chopaeng – ACNH Treasure Island Maps, Items & Guides" />
            <meta property="og:description" content="Meet Kuya Cho, the Islander behind Chopaeng. We provide free & premium Animal Crossing: New Horizons treasure islands with a Bayanihan spirit." />
            <meta property="og:url" content="https://www.chopaeng.com/about" />
            <meta property="og:image" content="https://www.chopaeng.com/banner.png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="About | Chopaeng – ACNH Treasure Islands, Items & Guides" />
            <meta name="twitter:description" content="Meet Kuya Cho, the Islander behind Chopaeng. We provide free & premium Animal Crossing: New Horizons treasure islands with a Bayanihan spirit." />
            <meta name="twitter:image" content="https://www.chopaeng.com/banner.png" />

            <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">

            <div className="app-container w-100" style={{maxWidth: '950px'}}>


                {/* 2. THE PASSPORT CARD (Hero) */}
                <div className="passport-card bg-white rounded-4 shadow-sm border border-light p-4 p-md-5 mb-5 position-relative overflow-hidden mx-auto" style={{maxWidth: '800px'}}>
                    {/* Background Pattern */}
                    <div className="passport-bg"></div>

                    <div className="row align-items-center position-relative z-1">
                        {/* Left: Photo */}
                        <div className="col-md-5 text-center mb-4 mb-md-0">
                            <div className="photo-frame bg-white p-2 shadow-sm transform-rotate-n3">
                                <img
                                    src={logo}
                                    alt="Kuya Cho"
                                    className="img-fluid rounded-3 border border-light"
                                />
                            </div>
                            <div className="mt-3">
                                <span className="badge bg-success text-white rounded-pill px-3 py-1 ac-font shadow-sm">
                                    EST. 2020
                                </span>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="col-md-7">
                            <div className="d-flex flex-column gap-3">
                                {/* Name Field */}
                                <div className="passport-field">
                                    <span className="field-label text-muted small fw-bold text-uppercase">Name</span>
                                    <h2 className="text-dark fw-black ac-font mb-0">Kuya Cho</h2>
                                </div>

                                {/* Title Field */}
                                <div className="passport-field">
                                    <span className="field-label text-muted small fw-bold text-uppercase">Title</span>
                                    <h5 className="text-nook fw-bold mb-0">Islander & Streamer</h5>
                                </div>

                                {/* Comment (Bio) */}
                                <div className="passport-comment bg-light rounded-4 p-3 border border-2 border-light mt-2 position-relative">
                                    <span className="field-label text-muted small fw-bold text-uppercase position-absolute top-0 start-0 translate-middle-y ms-3 bg-light px-2">
                                        Bio
                                    </span>
                                    <p className="mb-0 text-dark fw-bold small lh-base">
                                        People call me Cho or Chops. I'm a Filipino streamer currently located here in the Philippines. I love playing games specially Animal Crossing: New Horizons. I only stream this game as of now. This is also my way to connect to different people. Please join me in my adventure in gaming and let's explore the world of ACNH!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MILESTONES (Stamps) */}
                <div className="row g-4 mb-5 justify-content-center">
                    {[
                        { date: "Nov 2020", label: "First Flight", icon: "airplane-engines" },
                        { date: "Mar 2021", label: "Twitch Partner", icon: "twitch" },
                        { date: "29k+", label: "Potatoes", icon: "people-fill" }
                    ].map((milestone, i) => (
                        <div key={i} className="col-4 col-md-3">
                            <div className="stamp-circle mx-auto d-flex flex-column align-items-center justify-content-center text-center p-3">
                                <i className={`bi bi-${milestone.icon} fs-2 text-nook opacity-50 mb-1`}></i>
                                <h6 className="fw-black text-nook mb-0 ac-font">{milestone.date}</h6>
                                <small className="tiny-text fw-bold text-nook opacity-75 text-uppercase">{milestone.label}</small>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 4. WHAT IS CHOPAENG */}
                <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm border mb-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-black ac-font text-dark">What Is Chopaeng?</h3>
                        <p className="text-muted fw-bold small">Your home for free &amp; premium ACNH treasure islands</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <p className="text-muted fw-bold lh-lg">
                                Chopaeng is a Philippine-based Animal Crossing: New Horizons community and streaming platform
                                founded in November 2020. What started as a personal passion project quickly grew into one of
                                the most active ACNH treasure island communities in Southeast Asia, with over 29,000 members
                                affectionately known as "Potatoes."
                            </p>
                            <p className="text-muted fw-bold lh-lg mb-0">
                                The site provides free access to public treasure islands packed with rare furniture, DIY
                                recipes, materials, seasonal items, and bells — plus premium member-only islands with
                                advanced features like villager injection, max bells, and priority ChoBot access.
                            </p>
                        </div>
                        <div className="col-lg-6">
                            <p className="text-muted fw-bold lh-lg">
                                Our real-time island dashboard lets players see which islands are currently online, how many
                                visitors are on each island, and what items are available — all without needing to join a
                                Discord server first. Free islands are open to all Animal Crossing players worldwide.
                            </p>
                            <p className="text-muted fw-bold lh-lg mb-0">
                                Paid membership tiers (available through Patreon, Twitch, and YouTube) unlock private islands,
                                priority queue access, and our ChoBot Discord integration, which lets members request specific
                                items and villagers on-demand.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 5. PHILOSOPHY (Ordinance Card) */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-12">
                        <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm border position-relative">
                            <div className="text-center mb-4">
                                <h3 className="fw-black ac-font text-dark">Island Ordinances</h3>
                                <p className="text-muted fw-bold small">Our Core Philosophy</p>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="ordinance-item text-center p-3 rounded-4 hover-lift">
                                        <div className="icon-bubble bg-warning text-white mx-auto mb-3 shadow-sm">
                                            <i className="bi bi-heart-fill"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark">Bayanihan</h5>
                                        <p className="small text-muted mb-0 fw-bold">Community members helping one another achieve a common goal. We share freely so everyone can enjoy the game.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ordinance-item text-center p-3 rounded-4 hover-lift">
                                        <div className="icon-bubble bg-info text-white mx-auto mb-3 shadow-sm">
                                            <i className="bi bi-globe-americas"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark">Inclusivity</h5>
                                        <p className="small text-muted mb-0 fw-bold">No matter who you are or where you're from, you have a home on our islands. Everyone is welcome here.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ordinance-item text-center p-3 rounded-4 hover-lift">
                                        <div className="icon-bubble bg-success text-white mx-auto mb-3 shadow-sm">
                                            <i className="bi bi-clock-fill"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark">24/7 Access</h5>
                                        <p className="small text-muted mb-0 fw-bold">Paradise doesn't have a closing time. Our islands are always open whenever you need items or bells.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. HOW CHOPAENG WORKS */}
                <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm border mb-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-black ac-font text-dark">How the Islands Work</h3>
                        <p className="text-muted fw-bold small">From Dodo code to treasure in under a minute</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { step: "1", icon: "bi-display", title: "Check the Dashboard", desc: "Visit the Treasure Islands page to see which islands are currently online, what they contain, and their visitor count in real time." },
                            { step: "2", icon: "bi-key-fill", title: "Get a Dodo Code", desc: "Free islands show their Dodo codes publicly. Member islands generate private codes through ChoBot or the members-only dashboard." },
                            { step: "3", icon: "bi-airplane-fill", title: "Fly & Collect", desc: "Enter the Dodo code at Dodo Airlines in ACNH and fly to the island. All items on the ground are yours to take — no limits." },
                            { step: "4", icon: "bi-door-open-fill", title: "Exit Properly", desc: "Always leave through the airport terminal. Pressing the minus button causes the island to crash for everyone still visiting." },
                        ].map((item, i) => (
                            <div key={i} className="col-sm-6 col-lg-3">
                                <div className="text-center p-3 rounded-4 bg-light h-100">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-3" style={{ width: 56, height: 56 }}>
                                        <i className={`bi ${item.icon} fs-3 text-success`}></i>
                                    </div>
                                    <span className="badge bg-success rounded-pill mb-2">{item.step}</span>
                                    <h6 className="fw-black text-dark">{item.title}</h6>
                                    <p className="small text-muted fw-bold mb-0">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. CTA */}
                <div className="text-center mb-3">
                    <Link to="/islands" className="btn btn-success rounded-pill px-5 py-3 fw-black shadow-sm me-3">
                        <i className="bi bi-airplane-fill me-2"></i> Browse Islands
                    </Link>
                    <Link to="/guides" className="btn btn-outline-success rounded-pill px-5 py-3 fw-black">
                        <i className="bi bi-book-half me-2"></i> Read the Guide
                    </Link>
                </div>

            </div>
        </div>
        </>
    );
};

export default About;