import React from 'react';

const Contact = () => {
    return (
        <div className="bg-white min-vh-100">

            {/* 1. HERO SECTION */}
            <section className="py-5 bg-light border-bottom">
                <div className="container py-5">
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-8">
                            <h1 className="display-4 fw-bold text-dark mb-3">Contact Support</h1>
                            <p className="lead text-muted mb-0">
                                Need help with an island? Have a question about your membership?
                                Reach out to the Chopaeng team through the channels below.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CONTACT CARDS */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-4">

                        {/* Discord Support */}
                        <div className="col-md-6">
                            <div className="card h-100 border-0 shadow-sm rounded-4">
                                <div className="card-body p-4 p-lg-5">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3">
                                            <i className="bi bi-discord fs-2"></i>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-0">Live Chat</h3>
                                            <span className="badge bg-success rounded-pill">Fastest Response</span>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-4">
                                        Join our Discord server and open a support ticket. Our staff team is active 24/7 to help with island codes, bot issues, and technical support.
                                    </p>
                                    <a href="https://discord.gg/chopaeng" target="_blank" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold">
                                        Join Discord Server
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Business Email */}
                        <div className="col-md-6">
                            <div className="card h-100 border-0 shadow-sm rounded-4">
                                <div className="card-body p-4 p-lg-5">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 me-3">
                                            <i className="bi bi-envelope-fill fs-2"></i>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-0">Business</h3>
                                            <span className="badge bg-secondary rounded-pill">24h Response</span>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-4">
                                        For sponsorships, brand collaborations, or official business inquiries, please reach out via email. We look forward to working with you.
                                    </p>
                                    <a href="mailto:hello@chopaeng.com" className="btn btn-success btn-lg w-100 rounded-pill fw-bold text-white">
                                        hello@chopaeng.com
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. CONTACT FORM */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4 p-lg-5">
                                    <h2 className="fw-bold mb-4 text-center">Send a Message</h2>
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-uppercase">Full Name</label>
                                            <input type="text" className="form-control form-control-lg bg-light border-0 px-3" placeholder="Enter your name" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-uppercase">Email Address</label>
                                            <input type="email" className="form-control form-control-lg bg-light border-0 px-3" placeholder="name@example.com" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-uppercase">Subject</label>
                                            <select className="form-select form-select-lg bg-light border-0 px-3">
                                                <option defaultValue>Island Access Issue</option>
                                                <option>Membership & Billing</option>
                                                <option>Technical Support</option>
                                                <option>Business Inquiry</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold small text-uppercase">Message</label>
                                            <textarea className="form-control bg-light border-0 px-3" rows="5" placeholder="How can we help you?"></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-success btn-lg w-100 rounded-pill fw-bold text-white shadow-sm">
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SOCIAL LINKS */}
            <section className="py-5">
                <div className="container text-center">
                    <p className="text-muted fw-bold text-uppercase small mb-4">Follow us on Social Media</p>
                    <div className="d-flex justify-content-center gap-4">
                        <a href="#" className="text-dark fs-3"><i className="bi bi-twitch"></i></a>
                        <a href="#" className="text-dark fs-3"><i className="bi bi-youtube"></i></a>
                        <a href="#" className="text-dark fs-3"><i className="bi bi-instagram"></i></a>
                        <a href="#" className="text-dark fs-3"><i className="bi bi-tiktok"></i></a>
                    </div>
                </div>
            </section>

            {/* Bootstrap Icons Link */}
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
        </div>
    );
};

export default Contact;