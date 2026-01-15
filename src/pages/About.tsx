const About = () => {
    return (
        <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">

            <div className="app-container w-100" style={{maxWidth: '950px'}}>

                {/* 1. HEADER */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center bg-white p-3 rounded-circle shadow-sm mb-3 border border-3 border-light">
                        <i className="bi bi-person-vcard fs-1 text-nook"></i>
                    </div>
                    <h1 className="display-5 fw-black ac-font text-dark mb-1">Island Passport</h1>
                    <p className="text-muted fw-bold text-uppercase spacing-wide mb-0 opacity-75">Resident Registration</p>
                </div>

                {/* 2. THE PASSPORT CARD (Hero) */}
                <div className="passport-card bg-white rounded-4 shadow-sm border border-light p-4 p-md-5 mb-5 position-relative overflow-hidden mx-auto" style={{maxWidth: '800px'}}>
                    {/* Background Pattern */}
                    <div className="passport-bg"></div>

                    <div className="row align-items-center position-relative z-1">
                        {/* Left: Photo */}
                        <div className="col-md-5 text-center mb-4 mb-md-0">
                            <div className="photo-frame bg-white p-2 shadow-sm transform-rotate-n3">
                                <img
                                    src="logo.webp"
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
                                    <h5 className="text-nook fw-bold mb-0">Island Representative</h5>
                                </div>

                                {/* Comment (Bio) */}
                                <div className="passport-comment bg-light rounded-4 p-3 border border-2 border-light mt-2 position-relative">
                                    <span className="field-label text-muted small fw-bold text-uppercase position-absolute top-0 start-0 translate-middle-y ms-3 bg-light px-2">
                                        Comment
                                    </span>
                                    <p className="mb-0 text-dark fw-bold small lh-base">
                                        "Coffee lover. Twitch Partner. Building the Bayanihan spirit one Dodo Code at a time. Welcome to the Beshy community!"
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
                        { date: "130k+", label: "Beshy Family", icon: "people-fill" }
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

                {/* 4. PHILOSOPHY (Ordinance Card) */}
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
                                        <p className="small text-muted mb-0 fw-bold">Community members helping one another achieve a common goal.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ordinance-item text-center p-3 rounded-4 hover-lift">
                                        <div className="icon-bubble bg-info text-white mx-auto mb-3 shadow-sm">
                                            <i className="bi bi-globe-americas"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark">Inclusivity</h5>
                                        <p className="small text-muted mb-0 fw-bold">No matter who you are, you have a home on our islands.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ordinance-item text-center p-3 rounded-4 hover-lift">
                                        <div className="icon-bubble bg-success text-white mx-auto mb-3 shadow-sm">
                                            <i className="bi bi-clock-fill"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark">24/7 Access</h5>
                                        <p className="small text-muted mb-0 fw-bold">Paradise doesn't have a closing time. We are always open.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. ECOSYSTEM LIST */}
                <div className="bg-success bg-opacity-10 rounded-4 p-4 border border-success border-opacity-25 d-flex flex-column flex-md-row align-items-center gap-4">
                    <div className="bg-white p-3 rounded-circle shadow-sm text-success">
                        <i className="bi bi-controller fs-2"></i>
                    </div>
                    <div className="text-center text-md-start">
                        <h4 className="fw-black ac-font text-dark mb-1">More Than Just Items</h4>
                        <p className="small text-dark opacity-75 fw-bold mb-0">
                            From Valorant streams to custom Discord bots and turnip hacks,
                            Chopaeng is a full gaming ecosystem.
                        </p>
                    </div>
                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

                :root {
                    --nook-bg: #f2f4e6;
                    --nook-green: #88e0a0;
                    --nook-dark-green: #28a745;
                }

                .nook-os {
                    background-color: var(--nook-bg);
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                    font-family: 'Nunito', sans-serif;
                }

                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }
                .text-nook { color: var(--nook-dark-green); }
                .spacing-wide { letter-spacing: 1.5px; }
                .tiny-text { font-size: 0.65rem; }

                /* PASSPORT STYLING */
                .passport-card {
                    background-color: #fff;
                    background-image: linear-gradient(45deg, #ffffff 25%, #f9f9f9 25%, #f9f9f9 50%, #ffffff 50%, #ffffff 75%, #f9f9f9 75%, #f9f9f9 100%);
                    background-size: 20px 20px;
                }
                
                .photo-frame {
                    transform: rotate(-3deg);
                    border: 1px solid #eee;
                }

                .passport-field {
                    border-bottom: 2px dashed #eee;
                    padding-bottom: 5px;
                }

                /* STAMPS */
                .stamp-circle {
                    width: 100px; height: 100px;
                    border: 3px double var(--nook-dark-green);
                    border-radius: 50%;
                    transform: rotate(-10deg);
                    opacity: 0.8;
                    transition: transform 0.2s;
                }
                .stamp-circle:hover { transform: rotate(0deg) scale(1.1); opacity: 1; }

                /* ICONS */
                .icon-bubble {
                    width: 50px; height: 50px;
                    border-radius: 18px; /* Squircle */
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                }

                .hover-lift { transition: transform 0.2s; }
                .hover-lift:hover { transform: translateY(-5px); }
            `}</style>
        </div>
    );
};

export default About;