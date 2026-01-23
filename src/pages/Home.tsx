import {Link} from "react-router-dom";

const Home = () => {
    return (
        <>
        <div className="nook-os min-vh-100 d-flex align-items-center font-nunito overflow-hidden position-relative">

            {/* Background Decoration (Leaf Pattern) */}
            <div className="position-absolute top-0 end-0 opacity-10 p-5 d-none d-lg-block pointer-events-none">
                <i className="fa-solid fa-leaf text-success" style={{fontSize: '30rem', transform: 'rotate(45deg)'}}></i>
            </div>

            <section className="container-fluid px-lg-5 position-relative z-1">
                <div className="row align-items-center py-5">

                    {/* LEFT: TEXT CONTENT */}
                    <div className="col-lg-6 order-2 order-lg-1 ps-lg-5">

                        {/* Status Badge */}
                        <div className="d-inline-flex align-items-center gap-2 mb-4 px-3 py-2 rounded-pill bg-white border border-success border-opacity-25 shadow-sm">
                            <span className="live-dot"></span>
                            <span className="text-success fw-bold x-small text-uppercase tracking-wider">
                                Stream Online Now
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="display-3 fw-black ac-font lh-1 mb-4 text-dark">
                            Your Ticket to <br />
                            <span className="text-nook">Island Paradise.</span>
                        </h1>

                        {/* Subtext */}
                        <p className="lead text-muted mb-5 fw-bold opacity-75" style={{ maxWidth: '480px', fontSize: '1.1rem' }}>
                            Skip the grind. Join the Chopaeng community to access 24/7 Treasure Islands, Max Bells, and order any villager via ChoBot.
                        </p>

                        {/* CTA Buttons */}
                        <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                            <Link to="/islands" className="btn btn-nook-primary rounded-pill px-5 py-3 fw-black shadow-sm d-flex align-items-center justify-content-center gap-2 transform-active">
                                <i className="fa-solid fa-plane-departure"></i>
                                Start Looting
                            </Link>
                            <Link to="/maps" className="btn btn-white rounded-pill px-5 py-3 fw-bold border shadow-sm text-muted transform-active">
                                <i className="fa-solid fa-map me-2"></i>
                                View Maps
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="d-flex align-items-center gap-4 text-muted small fw-bold">
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-brands fa-discord fs-4 text-primary opacity-75"></i>
                                <span>29k Potatoes</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-solid fa-box-open fs-4 text-success opacity-75"></i>
                                <span>Auto-Restock</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: HERO IMAGE (Snapshot Style) */}
                    <div className="col-lg-6 order-1 order-lg-2 mb-5 mb-lg-0 text-center position-relative">

                        {/* Main Image */}
                        <div className="snapshot-frame mx-auto position-relative">
                            <div className="tape-strip"></div>
                            <img
                                src="https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=1000&auto=format&fit=crop"
                                alt="ACNH Setup"
                                className="img-fluid rounded-3 border border-light"
                            />
                            {/* Floating Floating Elements */}
                            <div className="floating-badge bg-white p-3 rounded-circle shadow-sm position-absolute bottom-0 start-0 translate-middle-x mb-4 ms-4">
                                <i className="fa-solid fa-sack-dollar text-warning fs-2"></i>
                            </div>
                            <div className="floating-badge-2 bg-white p-3 rounded-circle shadow-sm position-absolute top-0 end-0 translate-middle-x mt-4 me-n4">
                                <i className="fa-solid fa-gift text-danger fs-2"></i>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>


            {/* SECTION 2: NOOK SERVICES (Features) */}
            <section className="container py-5">
                <div className="row g-4">
                    {/* Feature 1 */}
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-green text-nook d-flex align-items-center justify-content-center rounded-circle">
                                <i className="fa-solid fa-robot fs-2"></i>
                            </div>
                            <h3 className="h4 fw-black text-dark mb-2">ChoBot Orders</h3>
                            <p className="text-muted small fw-bold mb-0">
                                Don't wait for drops. Type a command, receive a Dodo code, and fly to an island generated just for you.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-yellow text-warning d-flex align-items-center justify-content-center rounded-circle">
                                <i className="fa-solid fa-coins fs-2"></i>
                            </div>
                            <h3 className="h4 fw-black text-dark mb-2">Max Bells</h3>
                            <p className="text-muted small fw-bold mb-0">
                                Pay off that raccoon today. Hit max bells (999,999,999) in a single trip with the Turnip glitch.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-blue text-info d-flex align-items-center justify-content-center rounded-circle">
                                <i className="fa-solid fa-ticket fs-2"></i>
                            </div>
                            <h3 className="h4 fw-black text-dark mb-2">Villager Injection</h3>
                            <p className="text-muted small fw-bold mb-0">
                                Need Raymond? Sasha? Any villager in boxes ready to move to your island instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: PASSPORT (Pricing/Access) */}
            <section className="container py-5 mb-5">
                <div className="passport-card mx-auto bg-nook-green rounded-5 p-4 p-lg-5 shadow-lg" style={{maxWidth: '900px'}}>
                    <div className="row align-items-center">
                        <div className="col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
                            <h2 className="display-5 fw-black text-white ac-font mb-3">
                                Get Your <br/> Passport
                            </h2>
                            <p className="text-white opacity-75 fw-bold mb-4">
                                Join the sub squad on Twitch or Discord to unlock the premium Dodo codes.
                            </p>
                            <a href="https://www.patreon.com/cw/chopaeng/membership" target="_blank" className="btn btn-light rounded-pill px-4 py-2 fw-black text-nook shadow-sm">
                                <i className="fa-brands fa-patreon me-2"></i>
                                Subscribe Now
                            </a>
                        </div>

                        {/* Passport Visual */}
                        <div className="col-lg-7">
                            <div className="bg-cream rounded-4 p-4 shadow-sm rotate-n2 position-relative">
                                {/* Stamp decoration */}
                                <div className="position-absolute top-0 end-0 m-3 opacity-25">
                                    <i className="fa-solid fa-stamp fa-4x text-nook"></i>
                                </div>

                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-secondary bg-opacity-25 rounded rounded-3" style={{width: '80px', height: '80px'}}></div>
                                    <div>
                                        <h4 className="fw-black text-dark m-0">PASSPORT</h4>
                                        <span className="text-muted small text-uppercase fw-bold">Nook Inc. Membership</span>
                                    </div>
                                </div>
                                <div className="border-top border-2 border-dashed my-3 opacity-25"></div>
                                <div className="row fw-bold text-dark small">
                                    <div className="col-6 mb-2 text-muted text-uppercase x-small">Benefits</div>
                                    <div className="col-6 mb-2 text-end text-nook">Active</div>
                                    <div className="col-12 mb-2">
                                        <i className="fa-solid fa-check text-success me-2"></i> 24/7 Access
                                    </div>
                                    <div className="col-12 mb-2">
                                        <i className="fa-solid fa-check text-success me-2"></i> Priority Queue
                                    </div>
                                    <div className="col-12">
                                        <i className="fa-solid fa-check text-success me-2"></i> Exclusive Discord Role
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>





            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
                
                :root {
                    --nook-bg: #f2f4e6;
                    --nook-green: #28a745;
                    --nook-cream: #fffdf0;
                    --nook-blue: #5bc0de;
                    --nook-yellow: #f0ad4e;
                    
                }
                
                .app-card {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
                    border: 2px solid transparent;
                }
                .app-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(40, 167, 69, 0.15);
                    border-color: rgba(40, 167, 69, 0.2);
                }
                .app-icon {
                    width: 80px; height: 80px;
                }
                .bg-light-green { background-color: #e8f5e9; }
                .bg-light-yellow { background-color: #fff3cd; }
                .bg-light-blue { background-color: #e0f7fa; }
                
                /* PASSPORT SECTION */
                .bg-nook-green { background-color: #28a745; }
                .bg-cream { background-color: #fffdf0; }
                .rotate-n2 { transform: rotate(-2deg); }
                .rotate-n2:hover { transform: rotate(0deg); transition: 0.3s ease; }

                .nook-os {
                    background-color: var(--nook-bg);
                    background-image: radial-gradient(#dce2c8 15%, transparent 16%);
                    background-size: 30px 30px;
                }
                
                .font-nunito { font-family: 'Nunito', sans-serif; }
                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }
                .text-nook { color: var(--nook-green); }
                .pointer-events-none { pointer-events: none; }

                /* ANIMATIONS */
                .live-dot {
                    width: 10px; height: 10px; background: #28a745; border-radius: 50%;
                    display: inline-block; animation: pulse 2s infinite; margin-right: 8px;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
                    70% { box-shadow: 0 0 0 8px rgba(40, 167, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
                }

                /* BUTTONS */
                .btn-nook-primary {
                    background-color: #88e0a0;
                    color: white;
                    border: 2px solid #fff;
                    transition: all 0.2s;
                }
                .btn-nook-primary:hover {
                    background-color: #6fd18b;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(136, 224, 160, 0.4) !important;
                }
                .btn-white:hover { transform: translateY(-3px); background-color: #f8f9fa; }
                .transform-active:active { transform: scale(0.95) !important; }

                /* SNAPSHOT FRAME */
                .snapshot-frame {
                    background: #fff;
                    padding: 15px;
                    padding-bottom: 50px; /* Polaroid style bottom */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    transform: rotate(-3deg);
                    max-width: 550px;
                    transition: transform 0.3s ease;
                }
                .snapshot-frame:hover { transform: rotate(0deg) scale(1.02); }

                /* TAPE STRIP */
                .tape-strip {
                    position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
                    width: 120px; height: 35px;
                    background-color: rgba(255, 255, 255, 0.4);
                    border-left: 2px dashed rgba(0,0,0,0.1);
                    border-right: 2px dashed rgba(0,0,0,0.1);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    z-index: 10;
                    backdrop-filter: blur(2px);
                }

                /* FLOATING ICONS */
                .floating-badge { animation: float 3s ease-in-out infinite; }
                .floating-badge-2 { animation: float 4s ease-in-out infinite reverse; }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </>
    );
};

export default Home;