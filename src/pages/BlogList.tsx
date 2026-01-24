import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- CONFIGURATION ---
const API_URL = "https://blogs.chopaeng.com/api/patreon/posts";

// --- FALLBACK IMAGES ---
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1544551763-46a8723ba3f9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595009901132-723a3b7c20eb?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598556886362-7e04097f5831?q=80&w=800&auto=format&fit=crop"
];

// --- HELPERS ---
const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

// --- CATEGORIES (Derived from API Data) ---
const CATEGORIES = ["All", "Announcement", "Members Only"];

const BlogList = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch");
                const json = await response.json();

                // Transform API Data
                const transformed = json.data.map((item: any, index: number) => {
                    const attr = item.attributes;

                    // Image Logic (Same as Home.tsx)
                    let imageUrl = attr.image?.large_url;
                    if (!imageUrl && attr.embed_data?.provider === "YouTube") {
                        imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                    }
                    if (!imageUrl) imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

                    // Excerpt Logic
                    const rawText = stripHtml(attr.content);
                    const excerpt = rawText.length > 120 ? rawText.substring(0, 120) + "..." : rawText;

                    return {
                        id: item.id,
                        title: attr.title,
                        date: formatDate(attr.published_at),
                        category: attr.is_public ? "Announcement" : "Members Only",
                        image: imageUrl,
                        excerpt: excerpt
                    };
                });

                setPosts(transformed);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Filter Logic
    const filteredPosts = filter === "All"
        ? posts
        : posts.filter(p => p.category === filter);

    return (
        <div className="nook-bg min-vh-100 pb-5 font-nunito">

            {/* HEADER */}
            <div className="bg-nook-green pt-5 pb-5 position-relative shadow-sm mb-5">
                <div className="container position-relative z-1 text-center py-4">
                    <span className="badge bg-white text-nook-green rounded-pill mb-3 px-3 py-2 fw-black text-uppercase tracking-wide shadow-sm">
                        <i className="fa-solid fa-bullhorn me-2"></i> Village News
                    </span>
                    <h1 className="display-4 fw-black text-white ac-font mb-4">The Notice Board</h1>

                    {/* Category Filters */}
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`btn rounded-pill px-4 fw-bold transition-all border-2 ${
                                    filter === cat
                                        ? 'btn-white text-nook-green shadow-sm'
                                        : 'btn-outline-light text-white opacity-75 hover-opacity-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background Pattern Overlay */}
                <div className="position-absolute bottom-0 start-0 w-100 overflow-hidden" style={{height: '40px'}}>
                    <div className="w-100 h-100 bg-white" style={{borderTopLeftRadius: '50% 100%', borderTopRightRadius: '50% 100%'}}></div>
                </div>
            </div>

            {/* POSTS GRID */}
            <div className="container" style={{maxWidth: '1100px'}}>
                <div className="row g-4">

                    {/* LOADING STATE */}
                    {loading && [1, 2, 3, 4, 5, 6].map(i => (
                        <div className="col-lg-4 col-md-6" key={i}>
                            <div className="post-card h-100 bg-white rounded-4 shadow-sm border border-light overflow-hidden">
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
                    ))}

                    {/* REAL DATA */}
                    {!loading && filteredPosts.map((post) => (
                        <div className="col-lg-4 col-md-6" key={post.id}>
                            <Link to={`/blog/${post.id}`} className="text-decoration-none">
                                <div className="post-card h-100 bg-white rounded-4 shadow-sm border border-light position-relative overflow-hidden">

                                    {/* Image with Tape */}
                                    <div className="post-img-container position-relative bg-light" style={{height: '220px'}}>
                                        <div className="washi-tape"></div>
                                        <img src={post.image} alt={post.title} className="w-100 h-100 object-fit-cover transition-scale" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className={`badge border px-2 ${post.category === 'Members Only' ? 'bg-warning-subtle text-warning-emphasis border-warning' : 'bg-success-subtle text-success border-success'}`}>
                                                {post.category}
                                            </span>
                                            <small className="fw-bold text-muted x-small text-uppercase">{post.date}</small>
                                        </div>

                                        <h3 className="h5 fw-black text-dark mb-2 ac-font lh-sm line-clamp-2">{post.title}</h3>
                                        <p className="text-muted small fw-bold mb-4 opacity-75 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="d-flex align-items-center text-nook fw-black small group-hover-arrow">
                                            Read More <i className="fa-solid fa-chevron-right ms-2 transition-transform"></i>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {!loading && filteredPosts.length === 0 && (
                    <div className="text-center py-5 opacity-50">
                        <i className="fa-solid fa-folder-open fa-3x mb-3"></i>
                        <h3>No posts found in this category.</h3>
                    </div>
                )}
            </div>

            <style>{`
                /* Nook Colors */
                :root {
                    --nook-green: #28a745;
                    --nook-bg: #f2f4e6;
                }
                .nook-bg { background-color: var(--nook-bg); background-image: radial-gradient(#dce2c8 15%, transparent 16%); background-size: 30px 30px; }
                .bg-nook-green { background-color: var(--nook-green); }
                .text-nook-green { color: var(--nook-green); }
                
                /* Fonts */
                .font-nunito { font-family: 'Nunito', sans-serif; }
                .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
                .fw-black { font-weight: 900; }

                /* Card Animations */
                .post-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .post-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
                
                .transition-scale { transition: transform 0.5s ease; }
                .post-card:hover .transition-scale { transform: scale(1.05); }

                /* Washi Tape */
                .washi-tape {
                    position: absolute; top: -10px; left: 50%; transform: translateX(-50%) rotate(-2deg);
                    width: 90px; height: 30px;
                    background: rgba(255,255,255,0.35); backdrop-filter: blur(4px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 5;
                    border-left: 2px dotted rgba(0,0,0,0.1); border-right: 2px dotted rgba(0,0,0,0.1);
                }

                .group-hover-arrow:hover .transition-transform { transform: translateX(5px); }
                .transition-transform { transition: transform 0.2s ease; }
                .btn-white { background: white; color: var(--nook-green); border: none; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default BlogList;