import { Link } from "react-router-dom";

const CookiesPolicy = () => {
    return (
        <>
            <title>Cookies Policy – Chopaeng</title>
            <meta
                name="description"
                content="Read the Chopaeng Cookies Policy to understand how we use cookies and similar technologies on our ACNH treasure island website."
            />
            <link rel="canonical" href="https://www.chopaeng.com/cookies" />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Chopaeng" />
            <meta property="og:title" content="Cookies Policy – Chopaeng" />
            <meta property="og:description" content="Read the Chopaeng Cookies Policy to understand how we use cookies and similar technologies." />
            <meta property="og:url" content="https://www.chopaeng.com/cookies" />
            <meta property="og:image" content="https://www.chopaeng.com/banner.png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Cookies Policy – Chopaeng" />
            <meta name="twitter:description" content="Read the Chopaeng Cookies Policy to understand how we use cookies and similar technologies." />
            <meta name="twitter:image" content="https://www.chopaeng.com/banner.png" />

            <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">
                <div className="app-container w-100" style={{ maxWidth: '860px' }}>

                    {/* Header */}
                    <div className="text-center mb-5">
                        <div className="d-inline-flex align-items-center justify-content-center bg-white p-3 rounded-4 shadow-sm mb-3 border border-light">
                            <i className="fa-brands fa-chrome fa-3x text-success"></i>
                        </div>
                        <h1 className="display-5 fw-black ac-font text-dark mb-1">Cookies Policy</h1>
                        <p className="text-muted fw-bold small">Last updated: March 1, 2025</p>
                    </div>

                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5">

                        {/* What Are Cookies */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">1. What Are Cookies?</h2>
                            <p className="text-muted fw-bold lh-lg">
                                Cookies are small text files that are placed on your device (computer, smartphone, or tablet)
                                when you visit a website. They are widely used to make websites work more efficiently, to
                                provide a better user experience, and to give website owners useful information about how
                                their site is being used.
                            </p>
                            <p className="text-muted fw-bold lh-lg">
                                Cookies can be "session cookies" (which are deleted when you close your browser) or
                                "persistent cookies" (which remain on your device for a set period or until you delete them).
                                Similar technologies, such as web beacons, pixels, and local storage, may also be used for
                                similar purposes.
                            </p>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* How We Use Cookies */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">2. How We Use Cookies</h2>
                            <p className="text-muted fw-bold lh-lg">
                                The Chopaeng website at{' '}
                                <a href="https://www.chopaeng.com" className="text-success fw-bold text-decoration-none">
                                    https://www.chopaeng.com
                                </a>{' '}
                                uses cookies and similar technologies for the following purposes:
                            </p>

                            {/* Essential */}
                            <div className="p-4 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 mb-4">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <span className="badge bg-success text-white rounded-pill px-3">Essential</span>
                                    <h3 className="fw-bold text-dark h6 mb-0">Strictly Necessary Cookies</h3>
                                </div>
                                <p className="text-muted fw-bold mb-0 lh-lg small">
                                    These cookies are essential for the website to function. They enable core features such
                                    as session storage for island data caching (Dodo codes, island status), page navigation,
                                    and access to secure areas of the website. Without these cookies, our services cannot
                                    function properly.
                                </p>
                            </div>

                            {/* Analytics */}
                            <div className="p-4 rounded-4 bg-info bg-opacity-10 border border-info border-opacity-25 mb-4">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <span className="badge bg-info text-white rounded-pill px-3">Analytics</span>
                                    <h3 className="fw-bold text-dark h6 mb-0">Performance &amp; Analytics Cookies</h3>
                                </div>
                                <p className="text-muted fw-bold mb-0 lh-lg small">
                                    We use Google Analytics to collect information about how visitors use our Site. This
                                    includes data such as the number of visitors, pages viewed, and the source of traffic.
                                    This information helps us improve the Site's performance and user experience. Google
                                    Analytics stores data in aggregate and does not identify individual users by name.
                                </p>
                                <p className="text-muted fw-bold mb-0 lh-lg small mt-2">
                                    Cookie name: _ga, _gid, _gat (Google Analytics)
                                </p>
                            </div>

                            {/* Advertising */}
                            <div className="p-4 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-25 mb-4">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <span className="badge bg-warning text-dark rounded-pill px-3">Advertising</span>
                                    <h3 className="fw-bold text-dark h6 mb-0">Advertising Cookies</h3>
                                </div>
                                <p className="text-muted fw-bold mb-0 lh-lg small">
                                    We use Google AdSense to display advertisements on our Site. Google AdSense uses cookies
                                    to serve ads that are relevant to you based on your browsing history and interests. These
                                    cookies may track your visits to our Site and other websites in order to provide you with
                                    relevant advertising.
                                </p>
                                <p className="text-muted fw-bold mb-0 lh-lg small mt-2">
                                    Cookie name: IDE, DSID (DoubleClick/Google Ads), NID (Google personalisation)
                                </p>
                            </div>

                            {/* Performance */}
                            <div className="p-4 rounded-4 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <span className="badge bg-secondary text-white rounded-pill px-3">Performance</span>
                                    <h3 className="fw-bold text-dark h6 mb-0">Performance &amp; Speed Cookies</h3>
                                </div>
                                <p className="text-muted fw-bold mb-0 lh-lg small">
                                    We use Vercel Analytics and Vercel Speed Insights to monitor Site performance, loading
                                    times, and core web vitals. These tools use cookies and device identifiers to collect
                                    anonymised performance data so we can ensure the best possible experience for visitors.
                                </p>
                            </div>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* Third-Party Cookies */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">3. Third-Party Cookies</h2>
                            <p className="text-muted fw-bold lh-lg">
                                In addition to our own cookies, we allow certain third-party services to set cookies on
                                your device when you visit our Site. The following third-party services may set cookies:
                            </p>
                            <div className="table-responsive">
                                <table className="table table-bordered rounded-3 overflow-hidden">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="fw-bold small text-dark">Service</th>
                                            <th className="fw-bold small text-dark">Purpose</th>
                                            <th className="fw-bold small text-dark">Learn More</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold small text-dark">Google Analytics</td>
                                            <td className="small text-muted fw-bold">Site usage analytics</td>
                                            <td className="small">
                                                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Google Privacy Policy</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold small text-dark">Google AdSense</td>
                                            <td className="small text-muted fw-bold">Personalised advertising</td>
                                            <td className="small">
                                                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Google Ads Policy</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold small text-dark">Vercel Analytics</td>
                                            <td className="small text-muted fw-bold">Performance monitoring</td>
                                            <td className="small">
                                                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Vercel Privacy Policy</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* Session Storage */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">4. Session Storage and Local Storage</h2>
                            <p className="text-muted fw-bold lh-lg">
                                In addition to cookies, our Site uses browser session storage to temporarily cache island
                                data (including island status, Dodo codes, and visitor counts) to reduce API requests and
                                improve loading performance. This data is stored only for the duration of your browser
                                session and is automatically deleted when you close your browser tab.
                            </p>
                            <p className="text-muted fw-bold lh-lg">
                                This data is stored locally on your device and is not transmitted to or stored on our servers.
                            </p>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* Managing Cookies */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">5. How to Manage and Control Cookies</h2>
                            <p className="text-muted fw-bold lh-lg">
                                You have the right to decide whether to accept or reject cookies. You can exercise your
                                cookie preferences in the following ways:
                            </p>

                            <h3 className="fw-bold text-dark h6 mb-2">Browser Settings</h3>
                            <p className="text-muted fw-bold lh-lg">
                                Most web browsers allow you to manage cookies through your browser settings. You can:
                            </p>
                            <ul className="text-muted fw-bold lh-lg">
                                <li>View cookies stored on your device</li>
                                <li>Delete all or specific cookies</li>
                                <li>Block cookies from specific websites</li>
                                <li>Block all third-party cookies</li>
                                <li>Block all cookies (note: this may affect website functionality)</li>
                            </ul>
                            <p className="text-muted fw-bold lh-lg">
                                Instructions for managing cookies in popular browsers:
                            </p>
                            <ul className="text-muted fw-bold lh-lg">
                                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Google Chrome</a></li>
                                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Mozilla Firefox</a></li>
                                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Apple Safari</a></li>
                                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noreferrer" className="text-success text-decoration-none">Microsoft Edge</a></li>
                            </ul>

                            <h3 className="fw-bold text-dark h6 mb-2 mt-4">Opt Out of Google Advertising</h3>
                            <p className="text-muted fw-bold lh-lg">
                                To opt out of Google's personalised advertising, visit{' '}
                                <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-success fw-bold text-decoration-none">
                                    Google Ads Settings
                                </a>
                                . You can also opt out of third-party advertising cookies via the{' '}
                                <a href="https://optout.networkadvertising.org/" target="_blank" rel="noreferrer" className="text-success fw-bold text-decoration-none">
                                    Network Advertising Initiative
                                </a>
                                {' '}or the{' '}
                                <a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer" className="text-success fw-bold text-decoration-none">
                                    Digital Advertising Alliance
                                </a>
                                .
                            </p>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* Changes */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">6. Changes to This Policy</h2>
                            <p className="text-muted fw-bold lh-lg">
                                We may update this Cookies Policy from time to time to reflect changes in technology,
                                legislation, or our data practices. Any updates will be posted on this page with a revised
                                "Last updated" date. Please check back periodically to stay informed.
                            </p>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* More Information */}
                        <section className="mb-5">
                            <h2 className="fw-black text-dark h4 mb-3">7. More Information</h2>
                            <p className="text-muted fw-bold lh-lg">
                                For more information about how we handle your personal data, please review our{' '}
                                <Link to="/privacy" className="text-success fw-bold text-decoration-none">
                                    Privacy Policy
                                </Link>
                                . If you have any questions about our use of cookies, please contact us.
                            </p>
                        </section>

                        <hr className="opacity-10 my-4" />

                        {/* Contact */}
                        <section>
                            <h2 className="fw-black text-dark h4 mb-3">8. Contact Us</h2>
                            <p className="text-muted fw-bold lh-lg">
                                If you have questions about our use of cookies, please contact us:
                            </p>
                            <div className="bg-light rounded-4 p-4 border">
                                <p className="fw-bold text-dark mb-1">Chopaeng</p>
                                <p className="text-muted fw-bold mb-1">
                                    Email:{' '}
                                    <a href="mailto:hello@chopaeng.com" className="text-success text-decoration-none">
                                        hello@chopaeng.com
                                    </a>
                                </p>
                                <p className="text-muted fw-bold mb-0">
                                    Website:{' '}
                                    <a href="https://www.chopaeng.com" className="text-success text-decoration-none">
                                        https://www.chopaeng.com
                                    </a>
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </>
    );
};

export default CookiesPolicy;
