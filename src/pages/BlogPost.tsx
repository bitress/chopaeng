import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import banner from '../assets/banner.png'
const API_BASE_URL = "https://blogs.chopaeng.com";

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [post, setPost] = useState<any>(null);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Post
                const postRes = await fetch(`${API_BASE_URL}/api/patreon/posts/${id}`);
                if (!postRes.ok) throw new Error("Post not found");
                const postJson = await postRes.json();
                const attr = postJson.data.attributes;

                // Format Post
                setPost({
                    id: postJson.data.id,
                    title: attr.title,
                    date: new Date(attr.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    author: "Nook Inc.",
                    // Determine if locked based on API 'is_public' flag
                    isLocked: !attr.is_public,
                    category: attr.is_public ? "Announcement" : "Members Only",
                    image: attr.image?.large_url || "https://images.unsplash.com/photo-1544551763-46a8723ba3f9?q=80&w=800&auto=format&fit=crop",
                    content: attr.content,
                    url: attr.url
                });

                // 2. Fetch Sidebar (Optimized: Only needed if we succeed)
                const listRes = await fetch(`${API_BASE_URL}/api/patreon/posts`);
                if (listRes.ok) {
                    const listJson = await listRes.json();
                    setRecentPosts(listJson.data
                        .filter((p: any) => p.id !== id)
                        .slice(0, 3)
                        .map((p: any) => ({
                            id: p.id,
                            title: p.attributes.title,
                            date: new Date(p.attributes.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                            image: p.attributes.image?.large_url
                        }))
                    );
                }

            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <div className="min-vh-100 d-flex justify-content-center align-items-center nook-bg"><i className="fa-solid fa-spinner fa-spin fa-3x text-nook"></i></div>;

    if (error || !post) return (
        <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center nook-bg font-nunito">
            <h2 className="fw-black text-muted opacity-50">Post Not Found</h2>
            <button onClick={() => navigate("/blog")} className="btn btn-nook-primary rounded-pill fw-bold shadow-sm px-4 mt-3">Return to Board</button>
        </div>
    );

    return (
        <div className="nook-bg min-vh-100 font-nunito pb-5">

            {/* HERO HEADER */}
            <div className="position-relative" style={{ height: '50vh', minHeight: '400px' }}>
                <img src={banner} alt={post.title} className="w-100 h-100 object-fit-cover" style={{ filter: 'brightness(0.6)' }} />

                {/* Nav */}
                <div className="position-absolute top-0 start-0 p-4 w-100 d-flex justify-content-between">
                    <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: 45, height: 45 }}><i className="fa-solid fa-arrow-left"></i></button>
                    <Link to="/" className="btn btn-light rounded-pill px-4 fw-bold shadow-sm opacity-90 text-decoration-none text-dark">Home</Link>
                </div>

                {/* Title Overlay */}
                <div className="position-absolute bottom-0 start-0 w-100 bg-gradient-fade p-4 p-lg-5">
                    <div className="container" style={{ maxWidth: '900px' }}>
                        <span className={`badge border border-white fw-bold px-3 py-2 rounded-pill shadow-sm mb-3 ${post.isLocked ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
                            {post.isLocked ? <><i className="fa-solid fa-lock me-2"></i>Members Only</> : post.category}
                        </span>
                        <h1 className="display-3 fw-black text-white ac-font mb-3 text-shadow">{post.title}</h1>
                        <div className="d-flex align-items-center gap-4 text-white fw-bold opacity-90 small">
                            <span><i className="fa-regular fa-calendar me-2"></i> {post.date}</span>
                            <span><i className="fa-solid fa-pen-nib me-2"></i> {post.author}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="container mt-n5 position-relative z-2" style={{ maxWidth: '1100px' }}>
                <div className="row g-4 justify-content-center">

                    {/* Main Article */}
                    <div className="col-lg-8">
                        <div className="bg-white rounded-5 shadow-lg p-5 border border-light article-paper position-relative overflow-hidden">

                            {/* --- LOCKED OVERLAY UI --- */}
                            {post.isLocked && (
                                <div className="locked-overlay d-flex flex-column align-items-center justify-content-center text-center p-4">
                                    <div className="bg-white p-5 rounded-4 shadow-lg border border-warning" style={{maxWidth: '450px'}}>
                                        <div className="mb-3 text-warning">
                                            <i className="fa-solid fa-lock fa-3x"></i>
                                        </div>
                                        <h2 className="fw-black text-dark mb-3 ac-font">Member Exclusive</h2>
                                        <p className="text-muted mb-4 fw-bold">
                                            This post is for Patreon members only. <br/>
                                            Subscribe to the squad to unlock this island drop!
                                        </p>
                                        <a
                                            href={`https://www.patreon.com${post.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-warning rounded-pill px-5 py-3 fw-black shadow-sm w-100 transform-active"
                                        >
                                            Unlock on Patreon
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Render Content (Blurred if Locked) */}
                            <div className={`article-body ${post.isLocked ? 'blur-content' : ''}`} dangerouslySetInnerHTML={{ __html: post.content }} />

                            {!post.isLocked && (
                                <>
                                    <hr className="my-5 border-secondary opacity-10" />
                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                                        <span className="fw-bold text-muted small">Support us on Patreon:</span>
                                        <a
                                            href={`https://www.patreon.com${post.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-nook-primary rounded-pill px-5 fw-bold shadow-sm"
                                        >
                                            <i className="fa-brands fa-patreon me-2"></i> View Original
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="bg-cream rounded-4 p-4 shadow-sm border border-light mb-4">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-nook-green rounded-circle d-flex align-items-center justify-content-center text-white overflow-hidden shadow-sm" style={{ width: 50, height: 50, flexShrink: 0 }}>
                                    <img
                                        src="https://cdn.discordapp.com/icons/729590421478703135/a_df114e705c4d246df0e5a71a786c46af.png?size=256"
                                        alt="Chopaeng Logo"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                </div>
                                <div>
                                    <h5 className="fw-black m-0 text-dark lh-1">Chopaeng Camp</h5>
                                    <span className="text-nook x-small fw-black">Official Updates</span>
                                </div>
                            </div>

                            <p className="small text-muted fw-bold mb-3 lh-sm">
                                Stay tuned to this channel for server maintenance schedules and new island drops.
                            </p>

                            <a
                                href="https://discord.gg/chopaeng"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-dark w-100 rounded-pill fw-black small py-2 d-flex align-items-center justify-content-center gap-2 transform-active"
                            >
                                <i className="fa-brands fa-discord fs-5"></i>
                                Join Discord
                            </a>
                        </div>

                        {/* Recent Posts List */}
                        <div className="bg-white rounded-4 p-4 shadow-sm border border-light sticky-top" style={{ top: '20px', zIndex: 1 }}>
                            <h6 className="fw-black text-uppercase text-muted x-small tracking-wide mb-3">Recent Posts</h6>
                            <div className="d-flex flex-column gap-3">
                                {recentPosts.map((p) => (
                                    <div key={p.id} onClick={() => navigate(`/blog/${p.id}`)} className="d-flex gap-3 align-items-center group-hover cursor-pointer">
                                        <div className="rounded-3 bg-light flex-shrink-0 overflow-hidden" style={{ width: 60, height: 60 }}>
                                            <img src={p.image || banner} className="w-100 h-100 object-fit-cover" alt="" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 small line-clamp-2 transition-colors">{p.title}</h6>
                                            <small className="text-muted x-small fw-bold">{p.date}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-shadow { text-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                .bg-gradient-fade { background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%); }
                .mt-n5 { margin-top: -4rem !important; }
                
            `}</style>
        </div>
    );
};

export default BlogPost;