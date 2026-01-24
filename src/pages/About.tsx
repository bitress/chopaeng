import logo from '../assets/logo.webp'
const About = () => {
    return (
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
                                    <h5 className="text-nook fw-bold mb-0">Islander</h5>
                                </div>

                                {/* Comment (Bio) */}
                                <div className="passport-comment bg-light rounded-4 p-3 border border-2 border-light mt-2 position-relative">
                                    <span className="field-label text-muted small fw-bold text-uppercase position-absolute top-0 start-0 translate-middle-y ms-3 bg-light px-2">
                                        Bio
                                    </span>
                                    <p className="mb-0 text-dark fw-bold small lh-base">
                                        People call me Cho or Chops. I'm a Filipino streamer currently located here in the Philippines. I love playing games specially Animal Crossing: New Horizons. I only stream this game as of now. This is also my way to connect to different people. Please join me in my adventure in gaming and let's explore the world of ACNH!</p>
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
            </div>
        </div>
    );
};

export default About;