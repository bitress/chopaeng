import { useState, useEffect } from "react";

const Guide = () => {
    const [activeTab, setActiveTab] = useState("steps");

    useEffect(() => {
        const site = window.location.origin;
        const url = `${site}/guide`;
        const img = `${site}/banner.png`;

        const title =
            activeTab === "steps"
                ? "How to Join ACNH Treasure Islands – Step-by-Step Guide | Chopaeng"
                : activeTab === "rules"
                    ? "ACNH Treasure Island Rules – Golden Rules for Visitors | Chopaeng"
                    : "ACNH Treasure Island FAQ – Help & Common Issues | Chopaeng";

        const desc =
            activeTab === "steps"
                ? "Step-by-step guide on how to join Chopaeng ACNH treasure islands. Learn Dodo code entry, airport tips, and best practices for smooth Animal Crossing: New Horizons island visits."
                : activeTab === "rules"
                    ? "Review the golden rules for visiting Chopaeng ACNH treasure islands. Proper airport exits, clean item handling, and stable connections keep treasure islands running smoothly."
                    : "Find answers to common ACNH treasure island issues on Chopaeng — interference errors, communication errors, how to order items, and how to use the Chopaeng Discord bot.";

        document.title = title;

        const setMeta = (attr: string, key: string, value: string) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute("content", value);
        };

        const setLink = (rel: string, href: string) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement("link");
                el.setAttribute("rel", rel);
                document.head.appendChild(el);
            }
            el.setAttribute("href", href);
        };

        setMeta("name", "description", desc);
        setLink("canonical", url);

        setMeta("property", "og:type", "website");
        setMeta("property", "og:site_name", "Chopaeng");
        setMeta("property", "og:url", url);
        setMeta("property", "og:title", title);
        setMeta("property", "og:description", desc);
        setMeta("property", "og:image", img);

        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", title);
        setMeta("name", "twitter:description", desc);
        setMeta("name", "twitter:image", img);
    }, [activeTab]);


    const steps = [
        {
            num: "01",
            title: "Empty Pockets",
            desc: "Leave everything at home. You need 40 empty slots. Tools are provided on the island.",
            icon: "bag-x"
        },
        {
            num: "02",
            title: "Dodo Airlines",
            desc: "Speak to Orville → 'I want to fly' → 'Visit someone' → 'Online play' → 'Search via Dodo Code'.",
            icon: "airplane-fill"
        },
        {
            num: "03",
            title: "Enter Code",
            desc: "Type the live code from the dashboard. If you get 'Interference', keep trying immediately.",
            icon: "keyboard"
        },
        {
            num: "04",
            title: "Arrival",
            desc: "Wait for the arrival cutscene to finish completely. Do not move until the banner disappears.",
            icon: "geo-alt-fill"
        }
    ];

    const rules = [
        {
            title: "Airport Only",
            desc: "NEVER leave quietly (- button). It crashes the island. Don't be that person.",
            type: "danger",
            icon: "x-octagon-fill"
        },
        {
            title: "No Littering",
            desc: "Use trash cans for unwanted items. Litter prevents item refreshes.",
            type: "warning",
            icon: "trash-fill"
        },
        {
            title: "Stable Wi-Fi",
            desc: "NAT Type A or B required.",
            type: "primary",
            icon: "wifi"
        },
        {
            title: "Strict Confidentiality",
            desc: "Do NOT share the Dodo Code. One character per membership.",
            type: "danger",
            icon: "shield-lock-fill"
        },
        {
            title: "Nickname Format",
            desc: "Set to: 'Character Name | Island Name' so we can identify you.",
            type: "info",
            icon: "person-badge-fill"
        },
        {
            title: "Read The Pins",
            desc: "Check pinned messages before asking. Your answer is likely there.",
            type: "secondary",
            icon: "pin-angle-fill"
        },
        {
            title: "ChoBot Protocol",
            desc: "Only request items when ON the island. Pick up everything you drop.",
            type: "warning",
            icon: "robot"
        }
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
                            <p className="mb-0 small text-muted fw-bold text-uppercase tracking-wide">ChoPaeng</p>
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
                        { id: 'rules', label: 'Sub Rules', icon: 'shield-exclamation' },
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
                                <a target="_blank" href="https://discord.gg/chopaeng" className="btn btn-outline-dark rounded-pill fw-bold px-4 btn-sm">
                                    Open Discord Support
                                </a>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Guide;