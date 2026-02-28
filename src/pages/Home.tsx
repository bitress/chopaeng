import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import banner from '../assets/banner.png'
import logo from '../assets/logo.webp'
import StreamEmbed from "../components/StreamEmbed.tsx";
interface BlogPost {
    id: string;
    title: string;
    date: string; // Formatted "Jan 24"
    category: string;
    image: string;
    excerpt: string;
}

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// --- HELPER: DATE FORMATTER ---
const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
};

const Home = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("https://blogs.chopaeng.com/api/patreon/posts");
                if (!response.ok) throw new Error("Failed to fetch");

                const json = await response.json();

                const transformed: BlogPost[] = [...json.data]
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.attributes.published_at).getTime() -
                            new Date(a.attributes.published_at).getTime()
                    )
                    .slice(0, 3)
                    .map((item: any) => {
                        const attr = item.attributes;

                        let imageUrl = attr.image?.large_url;
                        if (!imageUrl && attr.embed_data?.provider === "YouTube") {
                            imageUrl = banner;
                        }
                        if (!imageUrl) {
                            imageUrl = banner;
                        }

                        const category = attr.is_public ? "Announcement" : "Members Only";

                        const rawText = stripHtml(attr.content);
                        const excerpt =
                            rawText.length > 100 ? rawText.substring(0, 100) + "..." : rawText;

                        return {
                            id: item.id,
                            title: attr.title,
                            date: formatDate(attr.published_at), // format AFTER sorting ✅
                            category,
                            image: imageUrl,
                            excerpt
                        };
                    });

                setPosts(transformed);
            } catch (error) {
                console.error("Error loading posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <>
            <title>Chopaeng | ACNH Treasure Island – Free Maps, Items & DIYs</title>
            <meta name="description" content="Chopaeng is the #1 ACNH treasure island site. Browse free & premium Animal Crossing: New Horizons treasure island maps, items, DIYs, Bells, villagers, and more." />
            <meta name="keywords" content="ACNH treasure islands, Animal Crossing New Horizons treasure island, treasure island ACNH, ACNH free items, ACNH dodo codes, Animal Crossing treasure island dodo code, ACNH bells, ACNH villagers, ACNH DIYs, free Animal Crossing items" />

            <link rel="canonical" href="https://www.chopaeng.com/" />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Chopaeng" />
            <meta property="og:title" content="Chopaeng | ACNH Treasure Island – Free Maps, Items & DIYs" />
            <meta property="og:description" content="Browse free & premium ACNH treasure island maps, items, DIYs, Bells, and villagers on Chopaeng — the #1 Animal Crossing: New Horizons treasure island site." />
            <meta property="og:url" content="https://www.chopaeng.com/" />
            <meta property="og:image" content="https://www.chopaeng.com/banner.png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Chopaeng | ACNH Treasure Island – Free Maps, Items & DIYs" />
            <meta name="twitter:description" content="Browse free & premium ACNH treasure island maps, items, DIYs, Bells, and villagers on Chopaeng — the #1 Animal Crossing: New Horizons treasure island site." />
            <meta name="twitter:image" content="https://www.chopaeng.com/banner.png" />

            <div
                className="nook-os position-relative d-flex align-items-center font-nunito w-100"
                style={{ minHeight: '100dvh' }} // Use dynamic viewport height for mobile browsers
            >
                <style>
                    {`
            /* Only force a slightly shorter hero on true desktop to keep it tight */
            @media (min-width: 992px) { 
                .nook-os { min-height: 80vh !important; } 
            }
            .transform-active:active { transform: scale(0.95); }
            /* Prevent text overflow on narrow "desktop mode" viewports */
            .text-balance { text-wrap: balance; }
            /* Rotate FAQ chevron when open */
            .faq-item[open] summary .fa-chevron-down { transform: rotate(180deg); }
            .faq-item summary .fa-chevron-down { transition: transform 0.2s ease; }
        `}
                </style>

                {/* Background Leaf - Kept explicit size to prevent layout shifts */}
                <div className="position-absolute top-0 end-0 opacity-10 p-4 d-none d-lg-block pointer-events-none" style={{ zIndex: 0 }}>
                    <i className="fa-solid fa-leaf text-success" style={{ fontSize: '20rem', transform: 'rotate(45deg)' }}></i>
                </div>

                <section className="container px-4 px-lg-4 position-relative z-1">
                    <div className="row align-items-center justify-content-center py-5">

                        {/* Text Section */}
                        {/* Added col-md-10 to prevent it from being too wide on tablet portrait */}
                        <div className="col-12 col-md-10 col-lg-6 order-2 order-lg-1 ps-lg-4 text-center text-lg-start mt-5 mt-lg-0">

                            <div className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1 rounded-pill bg-white border border-success border-opacity-25 shadow-sm">
                                <span className="live-dot bg-danger rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                                <span className="text-success fw-bold x-small text-uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>Stream Online</span>
                            </div>

                            <h1 className="fw-black ac-font lh-1 mb-3 text-dark display-5 display-lg-4 text-balance">
                                Your Ticket to <br className="d-none d-lg-block" /> <span className="text-nook">Island Paradise.</span>
                            </h1>

                            <p className="lead text-muted mb-4 fw-bold opacity-75 fs-6 mx-auto mx-lg-0" style={{ maxWidth: '500px' }}>
                                Skip the grind. Join the community to access 24/7 Treasure Islands, Max Bells, and order any villager via ChoBot.
                            </p>

                            <div className="d-flex flex-column flex-sm-row gap-3 mb-4 justify-content-center justify-content-lg-start">
                                <Link to="/islands" className="btn btn-nook-primary rounded-pill px-4 py-3 py-lg-2 fw-black shadow-sm d-flex align-items-center justify-content-center gap-2 transform-active">
                                    <i className="fa-solid fa-plane-departure"></i> Start Looting
                                </Link>
                                <Link to="/maps" className="btn btn-white rounded-pill px-4 py-3 py-lg-2 fw-bold border shadow-sm text-muted transform-active">
                                    <i className="fa-solid fa-map me-2"></i> View Maps
                                </Link>
                            </div>

                            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 gap-md-4 text-muted small fw-bold">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="fa-brands fa-discord fs-5 text-primary opacity-75"></i> <span>29k Potatoes</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <i className="fa-solid fa-box-open fs-5 text-success opacity-75"></i> <span>Auto-Restock</span>
                                </div>
                            </div>
                        </div>

                        {/* Image/Stream Section */}
                        {/* Center on tablet (md), split on desktop (lg) */}
                        <div className="col-12 col-md-8 col-lg-6 order-1 order-lg-2 text-center position-relative mb-3 mb-lg-0">
                            <div className="snapshot-frame mx-auto position-relative w-100" style={{ maxWidth: '480px' }}>

                                <div className="tape-strip position-absolute start-50 translate-middle-x bg-white opacity-50 shadow-sm"
                                     style={{ height: '30px', width: '100px', top: '-15px', zIndex: 2, transform: 'rotate(-2deg)' }}></div>

                                {/* Ensure StreamEmbed is responsive within this container */}
                                <div className="ratio ratio-16x9 bg-dark rounded shadow overflow-hidden border border-4 border-white">
                                    <StreamEmbed />
                                </div>

                                {/* Adjusted badges to not float outside the container on small screens */}
                                <div className="floating-badge bg-white p-2 rounded-circle shadow-sm position-absolute bottom-0 start-0 translate-middle-x mb-n3 ms-4 d-none d-sm-block">
                                    <i className="fa-solid fa-sack-dollar text-warning fs-3"></i>
                                </div>
                                <div className="floating-badge-2 bg-white p-2 rounded-circle shadow-sm position-absolute top-0 end-0 translate-middle-x mt-n3 me-n2 d-none d-sm-block">
                                    <i className="fa-solid fa-gift text-danger fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* STATS STRIP */}
            <section className="container py-4 position-relative z-2">
                <div className="row g-3 text-center">
                    {[
                        { icon: "fa-users", color: "text-primary", value: "29k+", label: "Potatoes" },
                        { icon: "fa-map-location-dot", color: "text-success", value: "100+", label: "Island Maps" },
                        { icon: "fa-clock", color: "text-warning", value: "24/7", label: "Live Access" },
                        { icon: "fa-star", color: "text-danger", value: "Est. 2020", label: "Community" },
                    ].map((stat) => (
                        <div className="col-6 col-md-3" key={stat.label}>
                            <div className="bg-white rounded-4 shadow-sm border p-3 h-100 d-flex flex-column align-items-center justify-content-center gap-1">
                                <i className={`fa-solid ${stat.icon} fs-3 ${stat.color} opacity-75`}></i>
                                <h4 className="fw-black ac-font mb-0 text-dark">{stat.value}</h4>
                                <span className="text-muted small fw-bold">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="container py-5 position-relative z-2">
                <div className="text-center mb-5">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <i className="fa-solid fa-map text-success fs-4"></i>
                        <span className="text-muted fw-bold text-uppercase x-small tracking-widest">Quick Start</span>
                    </div>
                    <h2 className="display-6 fw-black text-dark ac-font mb-2">How It Works</h2>
                    <p className="text-muted fw-bold mx-auto" style={{ maxWidth: '480px' }}>Getting free items and villagers is just three steps away.</p>
                </div>
                <div className="row g-4 justify-content-center">
                    {[
                        {
                            step: "01",
                            icon: "fa-ticket",
                            color: "bg-light-green text-nook",
                            title: "Join the Community",
                            desc: "Subscribe on Patreon or join our Discord to become a member and unlock premium island access.",
                        },
                        {
                            step: "02",
                            icon: "fa-hashtag",
                            color: "bg-light-yellow text-warning",
                            title: "Grab a Dodo Code",
                            desc: "Head to the Island Monitor, pick an online island, and copy the live Dodo code instantly.",
                        },
                        {
                            step: "03",
                            icon: "fa-plane-departure",
                            color: "bg-light-blue text-info",
                            title: "Fly & Loot",
                            desc: "Enter the code at Dodo Airlines and land on a treasure island packed with items, bells, and DIYs.",
                        },
                    ].map((item) => (
                        <div className="col-md-4" key={item.step}>
                            <div className="bg-white rounded-5 shadow-sm border p-4 h-100 text-center position-relative overflow-hidden">
                                <span className="position-absolute top-0 end-0 m-3 fw-black ac-font opacity-10" style={{ fontSize: '4rem', lineHeight: 1 }}>{item.step}</span>
                                <div className={`app-icon mb-3 mx-auto d-flex align-items-center justify-content-center rounded-circle ${item.color}`}>
                                    <i className={`fa-solid ${item.icon} fs-2`}></i>
                                </div>
                                <h5 className="fw-black text-dark ac-font mb-2">{item.title}</h5>
                                <p className="text-muted small fw-bold mb-0">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container py-5 mt-4 position-relative z-2">

                {/* Section Header */}
                <div className="d-flex align-items-end justify-content-between mb-5">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <i className="fa-solid fa-bullhorn text-warning fs-4 rotate-n10"></i>
                            <span className="text-muted fw-bold text-uppercase x-small tracking-widest">Village News</span>
                        </div>
                        <h2 className="display-6 fw-black text-dark ac-font mb-0">Bulletin Board</h2>
                    </div>
                    <Link to="/blog" className="btn btn-white rounded-pill border fw-bold px-4 py-2 shadow-sm text-nook transform-active text-decoration-none">
                        Read All <i className="fa-solid fa-arrow-right ms-2"></i>
                    </Link>
                </div>

                {/* Cards Grid */}
                <div className="row g-4">
                    {loading ? (
                        /* Loading Skeletons */
                        [1, 2, 3].map(i => (
                            <div className="col-lg-4 col-md-6" key={i}>
                                <div className="post-card h-100 bg-white rounded-5 shadow-sm border border-light overflow-hidden">
                                    <div className="bg-light" style={{height: 220}}></div>
                                    <div className="p-4">
                                        <div className="placeholder-glow">
                                            <span className="placeholder col-4 rounded-pill mb-3"></span>
                                            <span className="placeholder col-10 mb-2"></span>
                                            <span className="placeholder col-8"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Real Data */
                        posts.map((post, index) => (
                            <div className="col-lg-4 col-md-6" key={post.id}>
                                <Link to={`/blog/${post.id}`} className="text-decoration-none">
                                    <div
                                        className="post-card h-100 bg-white rounded-5 shadow-sm border border-light position-relative overflow-hidden"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Image Area with Washi Tape */}
                                        <div className="post-img-container">
                                            <div className="washi-tape-small"></div>
                                            <img src={post.image} alt={post.title} className="w-100 h-100 object-fit-cover transition-scale" />

                                            {/* Date Sticker */}
                                            <div className="date-sticker">
                                                <span className="d-block fw-bold small text-uppercase">{post.date.split(" ")[0]}</span>
                                                <span className="d-block fw-black fs-4 lh-1">{post.date.split(" ")[1]}</span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4 pt-4">
                                            <div className="mb-2">
                                                <span className={`badge rounded-pill fw-bold border border-opacity-10 px-3 py-1 ${
                                                    post.category === 'Announcement' ? 'bg-success-subtle text-success border-success' :
                                                        post.category === 'Members Only' ? 'bg-warning-subtle text-warning-emphasis border-warning' :
                                                            'bg-light text-muted border-secondary'
                                                }`}>
                                                    {post.category}
                                                </span>
                                            </div>

                                            <h3 className="h4 fw-black text-dark mb-2 ac-font">{post.title}</h3>
                                            <p className="text-muted small fw-bold mb-4 opacity-75 line-clamp-2">
                                                {post.excerpt}
                                            </p>

                                            <div className="d-flex align-items-center text-nook fw-black small group-hover-arrow">
                                                Read Article <i className="fa-solid fa-chevron-right ms-2 transition-transform"></i>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="container py-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-green text-nook d-flex align-items-center justify-content-center rounded-circle"><i className="fa-solid fa-robot fs-2"></i></div>
                            <h3 className="h4 fw-black text-dark mb-2">ChoBot Orders</h3>
                            <p className="text-muted small fw-bold mb-0">Don't wait for drops. Type a command, receive a Dodo code, and fly to an island generated just for you.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-yellow text-warning d-flex align-items-center justify-content-center rounded-circle"><i className="fa-solid fa-coins fs-2"></i></div>
                            <h3 className="h4 fw-black text-dark mb-2">Max Bells</h3>
                            <p className="text-muted small fw-bold mb-0">Pay off that raccoon today. Hit max bells (999,999,999) in a single trip with the Turnip glitch.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="app-card h-100 text-center p-4 rounded-4 bg-white position-relative overflow-hidden">
                            <div className="app-icon mb-3 mx-auto bg-light-blue text-info d-flex align-items-center justify-content-center rounded-circle"><i className="fa-solid fa-ticket fs-2"></i></div>
                            <h3 className="h4 fw-black text-dark mb-2">Villager Injection</h3>
                            <p className="text-muted small fw-bold mb-0">Need Raymond? Sasha? Any villager in boxes ready to move to your island instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="container py-5">
                <div className="mx-auto" style={{ maxWidth: '720px' }}>
                    <div className="text-center mb-5">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                            <i className="fa-solid fa-circle-question text-success fs-4"></i>
                            <span className="text-muted fw-bold text-uppercase x-small tracking-widest">Got Questions?</span>
                        </div>
                        <h2 className="display-6 fw-black text-dark ac-font mb-0">FAQ</h2>
                    </div>
                    <div className="d-flex flex-column gap-3">
                        {[
                            {
                                q: "Is Chopaeng free to use?",
                                a: "Yes! Free island access is available to everyone. Premium islands with exclusive items and villager injection require a Patreon subscription.",
                            },
                            {
                                q: "What is a Treasure Island?",
                                a: "A Treasure Island is an Animal Crossing: New Horizons island loaded with rare items, Bells, DIY recipes, and materials — all free for visitors to take.",
                            },
                            {
                                q: "What is ChoBot and how do I use it?",
                                a: "ChoBot is our Discord bot. Type a command with the item or villager you want, and it automatically generates a private island just for you with a unique Dodo code.",
                            },
                            {
                                q: "How do I get max Bells (999,999,999)?",
                                a: "Premium members can visit a dedicated Bells island that uses the turnip glitch to give you max Bells in a single trip.",
                            },
                            {
                                q: "Can I request a specific villager?",
                                a: "Absolutely! Members can request any villager through ChoBot on Discord. The villager will be placed in boxes, ready to move to your island.",
                            },
                        ].map((faq) => (
                            <details key={faq.q} className="bg-white rounded-4 shadow-sm border p-4 faq-item" style={{ cursor: 'pointer' }}>
                                <summary className="fw-black text-dark ac-font fs-6 d-flex justify-content-between align-items-center" style={{ listStyle: 'none' }}>
                                    <span>{faq.q}</span>
                                    <i className="fa-solid fa-chevron-down text-muted small ms-3 flex-shrink-0"></i>
                                </summary>
                                <p className="text-muted small fw-bold mb-0 mt-3">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* PASSPORT SECTION */}
            <section className="container py-5 mb-5">
                <div className=" mx-auto bg-nook-green rounded-5 p-4 p-lg-5 shadow-lg" style={{ maxWidth: '900px' }}>
                    <div className="row align-items-center">
                        <div className="col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
                            <h2 className="display-5 fw-black text-white ac-font mb-3">Get Your <br /> Passport</h2>
                            <p className="text-white opacity-75 fw-bold mb-4">Join the sub squad on Twitch or Discord to unlock the premium Dodo codes.</p>
                            <a href="https://www.patreon.com/cw/chopaeng/membership" target="_blank" className="btn btn-light rounded-pill px-4 py-2 fw-black text-nook shadow-sm"><i className="fa-brands fa-patreon me-2"></i> Subscribe Now</a>
                        </div>
                        <div className="col-lg-7">
                            <div className="bg-cream passport-card rounded-4 p-4 shadow-sm rotate-n2 position-relative">
                                <div className="position-absolute top-0 end-0 m-3 opacity-25"><i className="fa-solid fa-stamp fa-4x text-nook"></i></div>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div
                                        className="bg-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: '80px', height: '80px', overflow: 'hidden' }}
                                    >
                                        <img
                                            src={logo}
                                            alt="Chopaeng Logo"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                padding: '8px' // Optional: adds a little breathing room around the logo
                                            }}
                                        />
                                    </div>
                                    <div><h4 className="fw-black text-dark m-0">PASSPORT</h4><span className="text-muted small text-uppercase fw-bold">Cho Membership</span></div>
                                </div>
                                <div className="border-top border-2 border-dashed my-3 opacity-25"></div>
                                <div className="row fw-bold text-dark small">
                                    <div className="col-6 mb-2 text-muted text-uppercase x-small">Benefits</div>
                                    <div className="col-6 mb-2 text-end text-nook">Active</div>
                                    <div className="col-12 mb-2"><i className="fa-solid fa-check text-success me-2"></i> 24/7 Access</div>
                                    <div className="col-12 mb-2"><i className="fa-solid fa-check text-success me-2"></i> Request Items, DIYs, or Villagers</div>
                                    <div className="col-12 mb-2"><i className="fa-solid fa-check text-success me-2"></i> Access to Exclusive Islands</div>
                                    <div className="col-12"><i className="fa-solid fa-check text-success me-2"></i> Exclusive Discord Role</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;