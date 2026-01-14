const Guide = () => {
    const steps = [
        {
            num: "01",
            title: "Empty Your Pockets",
            desc: "Leave everything at home! You'll want all 40 slots open to bring back as much loot as possible. (Don't bring tools—islands usually provide them!)",
            icon: "🎒"
        },
        {
            num: "02",
            title: "Head to Dodo Airlines",
            desc: "Talk to Orville. Select 'I want to fly' → 'I want to visit someone' → 'Via online play' → 'Search via Dodo Code'.",
            icon: "✈️"
        },
        {
            num: "03",
            title: "Enter the Code",
            desc: "Find a live code from the stream or your Member's Discord channel. Type it in and get ready to fly!",
            icon: "🔢"
        }
    ];

    const rules = [
        { title: "Airport Exit Only", text: "NEVER leave using the '-' button. It crashes the island for everyone else. Always go back through the airport.", color: "danger" },
        { title: "No Dropping Items", text: "If you pick up something you don't want, use the trash cans provided on the island. Don't drop it on the ground!", color: "warning" },
        { title: "Strong Connection", text: "Ensure your Switch has a stable Wi-Fi signal. Weak connections cause communication errors for the whole group.", color: "info" }
    ];

    return (
        <div className="guide-wrapper bg-white">
            {/* Header */}
            <section className="py-5 bg-success text-white text-center rounded-bottom-5 shadow">
                <div className="container py-4">
                    <h1 className="display-4 fw-bold font-heading mb-3">Island Explorer's Guide</h1>
                    <p className="lead opacity-75 mx-auto" style={{ maxWidth: '600px' }}>
                        Everything you need to know to navigate our treasure islands like a pro.
                        Follow these steps to ensure a smooth trip for you and your fellow Beshies!
                    </p>
                </div>
            </section>

            {/* Step by Step */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-4">
                        {steps.map((step, i) => (
                            <div key={i} className="col-lg-4">
                                <div className="p-4 rounded-4 border bg-light h-100 position-relative overflow-hidden shadow-sm">
                                    <span className="display-1 position-absolute top-0 end-0 opacity-10 fw-bold m-2">{step.num}</span>
                                    <div className="fs-2 mb-3">{step.icon}</div>
                                    <h4 className="fw-bold mb-3">{step.title}</h4>
                                    <p className="text-muted mb-0">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Golden Rules */}
            <section className="py-5 bg-light border-top border-bottom">
                <div className="container">
                    <h2 className="text-center fw-bold font-heading mb-5">The <span className="text-success">Golden Rules</span></h2>
                    <div className="row g-4 justify-content-center">
                        {rules.map((rule, i) => (
                            <div key={i} className="col-md-4">
                                <div className={`p-4 rounded-4 border-start border-5 border-${rule.color} bg-white shadow-sm h-100`}>
                                    <h5 className={`fw-bold text-${rule.color} mb-2`}>{rule.title}</h5>
                                    <p className="small text-muted mb-0">{rule.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Advanced Features (Max Bells / Bots) */}
            <section className="py-5">
                <div className="container py-4">
                    <div className="row align-items-center gx-lg-5">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <div className="p-4 bg-success-subtle rounded-5 border text-center">
                                <img
                                    src="logo.webp"
                                    alt="Max Bells Guide"
                                    className="img-fluid rounded-4 mb-3 shadow-sm"
                                    style={{ maxHeight: '300px' }}
                                />
                                <h3 className="fw-bold font-heading">The Max Bells Trick 💰</h3>
                                <p className="text-muted small">Want 999,999,999 Bells instantly?</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h2 className="fw-bold mb-4 font-heading">Pro Tips & Tricks</h2>
                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex gap-3">
                                    <div className="flex-shrink-0 bg-white shadow-sm p-3 rounded-circle fs-4">💰</div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Max Bells Instruction</h6>
                                        <p className="small text-muted mb-0">Grab 1 stack of turnips from our Turnip Island. Sell them to Nook's Cranny. The price will look negative—this is normal! Proceed with the sale, then check your ABD back home.</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="flex-shrink-0 bg-white shadow-sm p-3 rounded-circle fs-4">🤖</div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Using the OrderBot</h6>
                                        <p className="small text-muted mb-0">In the Discord channel, use the command <code>!order [item name]</code>. Our bot will fetch it and message you with a private Dodo Code when it's ready.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ / Troubleshooting */}
            <section className="py-5 bg-dark text-white rounded-top-5 mt-5">
                <div className="container py-4">
                    <h2 className="text-center fw-bold font-heading mb-5">Common Issues (FAQ)</h2>
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="accordion accordion-flush bg-transparent" id="faqAccordion">
                                <div className="accordion-item bg-transparent text-white border-bottom border-secondary">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button bg-transparent text-white shadow-none fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#f1">
                                            Orville says "Wuh-oh! There's some interference!"
                                        </button>
                                    </h2>
                                    <div id="f1" className="accordion-collapse collapse show">
                                        <div className="accordion-body opacity-75">
                                            This just means someone is currently flying in, flying out, or has a menu open on the island. Keep pressing "A" to retry—it's like a busy phone line!
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item bg-transparent text-white border-bottom border-secondary">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed bg-transparent text-white shadow-none fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#f2">
                                            I got a "Communication Error"
                                        </button>
                                    </h2>
                                    <div id="f2" className="accordion-collapse collapse">
                                        <div className="accordion-body opacity-75">
                                            The island likely crashed due to a weak connection or someone leaving via the "-" button. Don't worry! Wait 2-3 minutes for the island to reboot and check the stream for the new code.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-5">
                                <p className="mb-3 opacity-50">Still need help?</p>
                                <a href="#discord" className="btn btn-outline-success rounded-pill px-4">Contact Support in Discord</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .font-heading { font-family: 'Inter', sans-serif; }
        .bg-success-subtle { background-color: rgba(25, 135, 84, 0.1); }
        .rounded-bottom-5 { border-bottom-left-radius: 3rem !important; border-bottom-right-radius: 3rem !important; }
        .rounded-top-5 { border-top-left-radius: 3rem !important; border-top-right-radius: 3rem !important; }
        .accordion-button::after { filter: invert(1); }
        .accordion-button:not(.collapsed) { background-color: rgba(25, 135, 84, 0.2); }
      `}</style>
        </div>
    );
};

export default Guide;