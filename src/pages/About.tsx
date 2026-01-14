
const About = () => {
    return (
        <div className="about-wrapper bg-white">
            {/* 1. HERO: The Face Behind the Island */}
            <section className="py-5 bg-light overflow-hidden">
                <div className="container py-lg-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <div className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-3 fw-bold letter-spacing-2">
                                EST. NOVEMBER 2020
                            </div>
                            <h1 className="display-4 fw-bold mb-4 font-heading text-dark">
                                Meet <span className="text-success">Kuya Cho</span>
                            </h1>
                            <p className="lead text-muted mb-4 fs-4">
                                Filipino streamer, coffee lover, and the heart behind the world’s most active 24/7 Treasure Islands.
                            </p>
                            <p className="text-muted fs-5 lh-base">
                                Chopaeng (Karl Presto) started his journey on November 24, 2020, with a simple goal: to make
                                Animal Crossing: New Horizons more accessible for everyone. What began as a small stream
                                quickly grew into a global "Beshy" community, reaching Twitch Partnership in just four months.
                            </p>
                        </div>
                        <div className="col-lg-6 text-center position-relative">
                            <div className="profile-frame mx-auto">
                                <img
                                    src="logo.webp"
                                    alt="Kuya Cho Chopaeng"
                                    className="img-fluid rounded-circle shadow-lg border border-5 border-white"
                                    style={{ width: '350px', height: '350px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. VALUES: The Bayanihan Spirit */}
            <section className="py-5">
                <div className="container py-4 text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h2 className="fw-bold font-heading mb-3">Our Philosophy</h2>
                            <p className="text-muted fs-5 mb-5">
                                We believe in the Filipino spirit of <strong>Bayanihan</strong>—community members helping
                                one another to achieve a common goal. This culture defines every island we host.
                            </p>
                        </div>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: '🏳️‍🌈', title: 'Inclusivity', desc: 'No matter who you are or who you love, you are welcome in our islands.' },
                            { icon: '🏝️', title: '24/7 Access', desc: 'Paradise shouldn’t have an opening time. Our islands stay open day and night.' },
                            { icon: '🤝', title: 'Free Support', desc: 'We provide free islands daily to ensure every player can build their dream.' }
                        ].map((item, i) => (
                            <div key={i} className="col-md-4">
                                <div className="p-4 rounded-4 border bg-white h-100 shadow-hover">
                                    <div className="display-5 mb-3">{item.icon}</div>
                                    <h5 className="fw-bold mb-2">{item.title}</h5>
                                    <p className="small text-muted mb-0">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. MILESTONES: The Journey */}
            <section className="py-5 bg-dark text-white rounded-5 mx-2 mx-md-5 my-5">
                <div className="container py-4 text-center">
                    <h2 className="fw-bold mb-5 font-heading">Our Milestones</h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <h3 className="text-success fw-bold display-6">Nov 2020</h3>
                            <p className="opacity-75">The First Island Code Shared</p>
                        </div>
                        <div className="col-md-4 mb-4">
                            <h3 className="text-success fw-bold display-6">Mar 2021</h3>
                            <p className="opacity-75">Official Twitch Partner</p>
                        </div>
                        <div className="col-md-4 mb-4">
                            <h3 className="text-success fw-bold display-6">130k+</h3>
                            <p className="opacity-75">Global "Beshy" Explorers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. WHAT WE DO: Beyond Treasure Islands */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6 order-2 order-lg-1">
                            <h2 className="fw-bold font-heading mb-4">More than just items</h2>
                            <p className="text-muted">
                                While we are known for our <strong>Marahuyo</strong> and <strong>Bahaghari</strong> premium islands,
                                Chopaeng is a multi-gaming ecosystem. From the "Max Bell" turnip hacks to DIY request bots,
                                we use technology to simplify the grind.
                            </p>
                            <ul className="list-unstyled d-flex flex-column gap-3 mt-4">
                                <li className="d-flex align-items-center gap-3">
                                    <i className="bi bi-check-circle-fill text-success fs-4"></i>
                                    <span><strong>Island Requests:</strong> Order any item, villager, or DIY.</span>
                                </li>
                                <li className="d-flex align-items-center gap-3">
                                    <i className="bi bi-check-circle-fill text-success fs-4"></i>
                                    <span><strong>Variety Gaming:</strong> Catch Kuya Cho playing Valorant, Stardew Valley, or Roblox.</span>
                                </li>
                                <li className="d-flex align-items-center gap-3">
                                    <i className="bi bi-check-circle-fill text-success fs-4"></i>
                                    <span><strong>Safe Community:</strong> A mod-protected Discord for trading and chatting.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-6 order-1 order-lg-2">
                            <div className="bg-success-subtle p-4 rounded-5 border">
                                <img
                                    src="https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?auto=format&fit=crop&q=80&w=800"
                                    alt="Gaming Community"
                                    className="img-fluid rounded-4 shadow"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .font-heading { font-family: 'Inter', sans-serif; }
        .letter-spacing-2 { letter-spacing: 2px; }
        .bg-success-subtle { background-color: rgba(25, 135, 84, 0.1); }
        
        .profile-frame {
            position: relative;
            width: fit-content;
        }

        .floating-badge {
            position: absolute;
            bottom: 20px;
            right: -10px;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        .shadow-hover {
            transition: all 0.3s ease;
        }
        .shadow-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
            border-color: #198754 !important;
        }
      `}</style>
        </div>
    );
};

export default About;