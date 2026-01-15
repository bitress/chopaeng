import { useState } from "react";

const Guide = () => {
    const [activeTab, setActiveTab] = useState('steps');

    const steps = [
        { num: "01", title: "Empty Pockets", desc: "Leave everything at home! You need 40 slots open. Tools are provided on the islands.", icon: "bag-x" },
        { num: "02", title: "Dodo Airlines", desc: "Speak to Orville → 'I want to fly' → 'Visit someone' → 'Online play' → 'Search via Dodo Code'.", icon: "airplane-fill" },
        { num: "03", title: "Enter Code", desc: "Type a live code from the dashboard. If it says 'Interference', keep trying!", icon: "keyboard" }
    ];

    const rules = [
        { title: "Airport Only", desc: "NEVER leave quietly (- button). It crashes the island.", type: "danger", icon: "x-octagon-fill" },
        { title: "No Littering", desc: "Use trash cans for unwanted items. Do not drop items on the floor.", type: "warning", icon: "trash-fill" },
        { title: "Stable Wi-Fi", desc: "Ensure a strong connection to prevent communication errors.", type: "primary", icon: "wifi" }
    ];

    return (
        <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">

            <div className="app-container w-100" style={{maxWidth: '850px'}}>

                {/* 1. APP HEADER */}
                <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="app-icon bg-success text-white shadow-sm">
                            <i className="bi bi-book-half fs-4"></i>
                        </div>
                        <div>
                            <h2 className="mb-0 ac-font fw-black text-dark lh-1">Island Guide</h2>
                            <p className="mb-0 small text-muted fw-bold text-uppercase tracking-wide">Nook Inc.</p>
                        </div>
                    </div>
                    {/* Fake Battery/Time - Optional aesthetic touch */}
                    <div className="d-none d-md-block text-end opacity-50">
                        <i className="bi bi-battery-full fs-4"></i>
                    </div>
                </div>

                {/* 2. NAVIGATION TABS (Pill Style) */}
                <div className="bg-white p-2 rounded-pill shadow-sm border mb-4 d-flex justify-content-between">
                    {[
                        { id: 'steps', label: 'How to Join', icon: 'airplane' },
                        { id: 'rules', label: 'Golden Rules', icon: 'shield-exclamation' },
                        { id: 'faq', label: 'Help & FAQ', icon: 'chat-dots' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn btn-tab rounded-pill flex-grow-1 fw-bold text-uppercase py-2 transition-all ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <i className={`bi bi-${tab.icon} me-2 d-none d-sm-inline`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 3. CONTENT AREA (White Paper) */}
                <div className="content-card bg-white rounded-4 shadow-sm border p-4 p-md-5 position-relative overflow-hidden">

                    {/* TAB 1: STEPS */}
                    {activeTab === 'steps' && (
                        <div className="animate-fade-in">
                            <h4 className="ac-font fw-black mb-4 text-center text-dark">Ready for Takeoff?</h4>
                            <div className="d-flex flex-column gap-4">
                                {steps.map((step, i) => (
                                    <div key={i} className="d-flex align-items-start gap-4 p-3 rounded-4 hover-bg-light transition-all border border-transparent hover-border">
                                        <div className="step-circle flex-shrink-0 ac-font">{step.num}</div>
                                        <div>
                                            <h5 className="fw-black text-dark mb-1">{step.title}</h5>
                                            <p className="text-muted fw-bold mb-0 small lh-base">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Max Bells Teaser */}
                            <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 d-flex align-items-center gap-3">
                                <i className="bi bi-piggy-bank-fill text-success fs-2"></i>
                                <div>
                                    <h6 className="fw-black text-success mb-0">Want Max Bells?</h6>
                                    <p className="small text-success mb-0 fw-bold opacity-75">Take turnips from Turnip Island → Sell at Nook's Cranny.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: RULES */}
                    {activeTab === 'rules' && (
                        <div className="animate-fade-in">
                            <h4 className="ac-font fw-black mb-4 text-center text-dark">Safety Guidelines</h4>
                            <div className="row g-3">
                                {rules.map((rule, i) => (
                                    <div key={i} className="col-12">
                                        <div className={`p-4 rounded-4 bg-${rule.type}-subtle border border-${rule.type} border-opacity-25 d-flex align-items-center gap-3`}>
                                            <div className={`icon-box text-${rule.type} bg-white shadow-sm`}>
                                                <i className={`bi bi-${rule.icon} fs-4`}></i>
                                            </div>
                                            <div>
                                                <h5 className={`fw-black text-${rule.type} mb-1`}>{rule.title}</h5>
                                                <p className="small text-dark opacity-75 fw-bold mb-0">{rule.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: FAQ / DIALOGUE */}
                    {activeTab === 'faq' && (
                        <div className="animate-fade-in">
                            <h4 className="ac-font fw-black mb-4 text-center text-dark">Troubleshooting</h4>

                            <div className="d-flex flex-column gap-3">
                                {[
                                    { q: "Wuh-oh! Interference?", a: "Someone is flying in or has a menu open. Keep pressing 'A' to retry!" },
                                    { q: "Communication Error?", a: "The island crashed. Don't worry! Wait 60 seconds for the code to refresh." },
                                    { q: "How do I order items?", a: "Join our Discord and use the !order command with our bot." }
                                ].map((item, i) => (
                                    <div key={i} className="dialogue-container">
                                        <div className="dialogue-bubble bg-light border p-3 rounded-4 position-relative">
                                            <span className="badge bg-dark text-white rounded-pill mb-2 px-3">Question</span>
                                            <h6 className="fw-bold text-dark mb-2">{item.q}</h6>
                                            <p className="small text-success fw-bold mb-0 bg-white p-2 rounded-3 border">
                                                <i className="bi bi-chat-quote-fill me-2"></i>
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-4">
                                <button className="btn btn-outline-dark rounded-pill fw-bold px-4 btn-sm">
                                    Open Discord Support
                                </button>
                            </div>
                        </div>
                    )}

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
                .tracking-wide { letter-spacing: 1px; }

                /* Header Icon */
                .app-icon {
                    width: 48px; height: 48px;
                    border-radius: 18px; /* Squircle */
                    display: flex; align-items: center; justify-content: center;
                    transform: rotate(-5deg);
                }

                /* Tab Buttons */
                .btn-tab {
                    color: #aaa;
                    border: 2px solid transparent;
                }
                .btn-tab:hover { color: #666; background: #f8f9fa; }
                .btn-tab.active {
                    background-color: #88e0a0;
                    color: white;
                    box-shadow: 0 4px 0 #5faf63;
                    transform: translateY(-2px);
                }

                /* Steps Styling */
                .step-circle {
                    width: 45px; height: 45px;
                    background: #333; color: white;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem;
                    box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
                }
                .hover-border:hover { border-color: #eee !important; }

                /* Rules Icons */
                .icon-box {
                    width: 50px; height: 50px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                }
                .bg-danger-subtle { background-color: #fff0f0; }
                .bg-warning-subtle { background-color: #fffdec; }
                .bg-primary-subtle { background-color: #f0f7ff; }

                /* Animation */
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Responsive tweaks */
                @media (max-width: 576px) {
                    .btn-tab { font-size: 0.75rem; padding: 0.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Guide;