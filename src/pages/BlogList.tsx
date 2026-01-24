import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import banner from '../assets/banner.png';
// --- CONFIGURATION ---
const API_URL = "https://blogs.chopaeng.com/api/patreon/posts";

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

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

                const transformed = json.data.map((item: any) => {
                    const attr = item.attributes;

                    let imageUrl = attr.image?.large_url;
                    if (!imageUrl && attr.embed_data?.provider === "YouTube") {
                        imageUrl = banner;
                    }
                    if (!imageUrl) imageUrl = banner;

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
        </div>
    );
};

export default BlogList;