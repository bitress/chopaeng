import { useState, useEffect, type FormEvent } from 'react';

interface Villager {
    name: string;
    img: string;
}

interface ScoreEntry {
    username: string;
    score: number;
    date: string;
    isMe?: boolean;
}
export default function VillagerGuessingGame() {
    // --- USER IDENTITY ---
    const [username, setUsername] = useState<string>("");
    const [isRegistered, setIsRegistered] = useState(false);

    // --- GAME DATA ---
    const [allVillagers, setAllVillagers] = useState<any[]>([]);
    const [target, setTarget] = useState<any>(null);
    const [options, setOptions] = useState<any[]>([]);

    // --- GAME STATE ---
    const [revealed, setRevealed] = useState(false);
    const [streak, setStreak] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // --- APP STATE ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'GAME' | 'LEADERBOARD'>('GAME');
    const [lbTab, setLbTab] = useState<'LOCAL' | 'GLOBAL'>('GLOBAL');

    // --- LEADERBOARDS ---
    const [localScores, setLocalScores] = useState<ScoreEntry[]>([]);
    const [globalScores, setGlobalScores] = useState<ScoreEntry[]>([]);

    useEffect(() => {
        const savedName = localStorage.getItem('bitress_username');
        if (savedName) {
            setUsername(savedName);
            setIsRegistered(true);
        }

        const savedLocal = localStorage.getItem('bitress_local_scores');
        if (savedLocal) {
            try {
                setLocalScores(JSON.parse(savedLocal));
            } catch {
                localStorage.removeItem('bitress_local_scores');
            }
        }

        const fetchData = async () => {
            try {
                const [lbRes, villagerRes] = await Promise.all([
                    fetch('http://localhost:5000/api/leaderboard'),
                    fetch('http://localhost:5000/api/villagers')
                ]);

                if (lbRes.ok) {
                    const lbData = await lbRes.json();
                    setGlobalScores(lbData);
                }

                if (!villagerRes.ok) throw new Error('Failed to fetch villagers');

                const vData = await villagerRes.json();
                const cleanData: Villager[] = vData.map((v: any) => ({
                    name: v.name,
                    img: v.image_url || v.img
                }));

                setAllVillagers(cleanData);
            } catch (err) {
                setError("System offline. Ensure Python APIs are running.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (allVillagers.length > 0 && !target && isRegistered) {
            startRound();
        }
    }, [allVillagers, isRegistered]);

    const handleRegister = (e: FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        localStorage.setItem('bitress_username', username);
        setIsRegistered(true);
    };

    const saveScore = async (finalScore: number) => {
        if (finalScore === 0) return;

        const newEntry: ScoreEntry = {
            username,
            score: finalScore,
            date: new Date().toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
            isMe: true
        };

        const newLocal = [...localScores, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        setLocalScores(newLocal);
        localStorage.setItem('bitress_local_scores', JSON.stringify(newLocal));

        try {
            await fetch('http://localhost:5000/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, score: finalScore })
            });

            const res = await fetch('http://localhost:5000/api/leaderboard');
            if (res.ok) {
                const data: ScoreEntry[] = await res.json();
                setGlobalScores(data.map(s => ({ ...s, isMe: s.username === username })));
            }
        } catch {
            setGlobalScores(prev => [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10));
        }
    };

    const startRound = () => {
        if (allVillagers.length < 4) return;
        setRevealed(false);
        setIsCorrect(null);

        const shuffled = [...allVillagers].sort(() => 0.5 - Math.random());
        setTarget(shuffled[0]);
        setOptions(shuffled.slice(0, 4).sort(() => 0.5 - Math.random()));
    };

    const handleGuess = (name: string) => {
        if (revealed || !target) return;
        setRevealed(true);

        if (name === target.name) {
            setStreak(prev => prev + 1);
            setIsCorrect(true);
        } else {
            saveScore(streak);
            setStreak(0);
            setIsCorrect(false);
        }
    };

    if (loading) return (
        <div className="min-vh-50 d-flex align-items-center justify-content-center p-5">
            <div className="spinner-grow text-success" role="status"></div>
            <span className="ms-3 fw-bold text-muted">Connecting to NookNet...</span>
        </div>
    );

    if (error) return (
        <div className="min-vh-50 d-flex align-items-center justify-content-center p-5">
            <div className="alert alert-danger text-center shadow-sm">
                <i className="fa-solid fa-circle-exclamation mb-2"></i>
                <p className="mb-0 fw-bold">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="nook-game-root py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5">

                        {/* NOOKPHONE CASE */}
                        <div className="nook-phone-case shadow-lg">

                            {/* HEADER */}
                            <div className="phone-header">
                                <div className="d-flex justify-content-between align-items-center px-3 py-2">
                                    <span className="signal"><i className="fa-solid fa-wifi"></i> NookNet</span>
                                    <span className="clock">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            {/* APP SCREEN */}
                            <div className="app-screen position-relative">

                                {!isRegistered ? (
                                    // === REGISTRATION SCREEN ===
                                    <div className="registration-view fade-in text-center pt-4">
                                        <div className="passport-icon mb-3">
                                            <i className="fa-solid fa-passport fa-4x text-teal"></i>
                                        </div>
                                        <h2 className="fw-black text-teal mb-2">Passport Entry</h2>
                                        <p className="text-muted small mb-4">Please register your resident name to access the global NookNet network.</p>

                                        <form onSubmit={handleRegister}>
                                            <div className="mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg text-center fw-bold rounded-pill border-2"
                                                    placeholder="Enter Username..."
                                                    value={username}
                                                    maxLength={12}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn-nook-action w-100">
                                                Create Passport <i className="fa-solid fa-check ms-2"></i>
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    // === MAIN APP ===
                                    <>
                                        {/* NAV TABS */}
                                        <div className="nav-pill-container mb-3">
                                            <button
                                                className={`nav-pill-btn ${view === 'GAME' ? 'active' : ''}`}
                                                onClick={() => setView('GAME')}
                                            >
                                                <i className="fa-solid fa-gamepad me-1"></i> Play
                                            </button>
                                            <button
                                                className={`nav-pill-btn ${view === 'LEADERBOARD' ? 'active' : ''}`}
                                                onClick={() => setView('LEADERBOARD')}
                                            >
                                                <i className="fa-solid fa-trophy me-1"></i> Rank
                                            </button>
                                        </div>

                                        {view === 'GAME' ? (
                                            <div className="game-view fade-in">
                                                {/* SCORE RIBBON */}
                                                <div className="score-ribbon mb-4">
                                                    <div className="score-box">
                                                        <span className="label">PLAYER</span>
                                                        <span className="value text-truncate" style={{maxWidth: '80px'}}>{username}</span>
                                                    </div>
                                                    <div className="app-title">
                                                        WHO'S THAT?
                                                    </div>
                                                    <div className="score-box">
                                                        <span className="label">STREAK</span>
                                                        <span className="value active">{streak}</span>
                                                    </div>
                                                </div>

                                                {/* GAME VIEWPORT */}
                                                <div className={`viewport-frame mb-4 ${revealed ? (isCorrect ? 'glow-success' : 'glow-danger') : ''}`}>
                                                    <div className="viewport-inner">
                                                        <div className="bg-grid"></div>
                                                        {target ? (
                                                            <img
                                                                src={target.img}
                                                                alt="Target"
                                                                className="villager-sprite"
                                                                draggable="false"
                                                                style={{
                                                                    filter: revealed
                                                                        ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
                                                                        : 'brightness(0) contrast(0)',
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="text-white">Loading...</div>
                                                        )}
                                                        {revealed && (
                                                            <div className={`stamp-overlay ${isCorrect ? 'stamp-correct' : 'stamp-wrong'}`}>
                                                                {isCorrect ? 'CORRECT!' : 'WRONG!'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* CONTROLS */}
                                                <div className="controls-area">
                                                    {!revealed ? (
                                                        <div className="row g-2">
                                                            {options.map((opt, i) => (
                                                                <div key={i} className="col-6">
                                                                    <button onClick={() => handleGuess(opt.name)} className="btn-nook-choice">
                                                                        {opt.name}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="result-actions text-center">
                                                            <div className="reveal-text mb-3">
                                                                It was <span className="fw-black text-teal">{target.name}</span>!
                                                            </div>
                                                            <button onClick={startRound} className="btn-nook-action w-100">
                                                                Next Villager <i className="fa-solid fa-arrow-right ms-2"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            // === LEADERBOARD VIEW ===
                                            <div className="leaderboard-view fade-in">
                                                {/* Global/Local Toggle */}
                                                <div className="d-flex justify-content-center mb-3">
                                                    <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                                                        <button
                                                            className={`btn btn-sm px-3 fw-bold ${lbTab === 'GLOBAL' ? 'btn-teal text-white' : 'bg-white text-muted'}`}
                                                            onClick={() => setLbTab('GLOBAL')}
                                                        >
                                                            <i className="fa-solid fa-globe me-1"></i> Global
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm px-3 fw-bold ${lbTab === 'LOCAL' ? 'btn-teal text-white' : 'bg-white text-muted'}`}
                                                            onClick={() => setLbTab('LOCAL')}
                                                        >
                                                            <i className="fa-solid fa-mobile-screen me-1"></i> My Device
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="lb-list-container custom-scroll">
                                                    {(lbTab === 'GLOBAL' ? globalScores : localScores).length > 0 ? (
                                                        (lbTab === 'GLOBAL' ? globalScores : localScores).map((entry, idx) => (
                                                            <div key={idx} className={`lb-item ${entry.isMe ? 'is-me' : ''}`}>
                                                                <div className={`lb-rank rank-${idx + 1}`}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="lb-info">
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="lb-player">{entry.username}</span>
                                                                        {entry.isMe && <span className="badge bg-teal ms-2 xx-small">YOU</span>}
                                                                    </div>
                                                                    <span className="lb-date">{entry.date}</span>
                                                                </div>
                                                                <div className="lb-score">
                                                                    {entry.score}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-5 opacity-50">
                                                            <i className="fa-solid fa-ghost fa-2x mb-2"></i>
                                                            <p className="small">No records found.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="phone-chin">
                                <div className="home-bar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Quicksand:wght@500;700&display=swap');

                .nook-game-root {
                    background-color: #e9eddb;
                    background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
                    font-family: 'Quicksand', sans-serif;
                    min-height: 100vh;
                }

                .text-teal { color: #5dbac3; }
                .bg-teal { background-color: #5dbac3; }
                .btn-teal { background-color: #5dbac3; border: none; }
                .fw-black { font-weight: 800; }
                .xx-small { font-size: 0.6em; }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* PHONE CASE */
                .nook-phone-case {
                    background: #fbfbf9;
                    border-radius: 40px;
                    border: 8px solid #5a524a;
                    overflow: hidden;
                    position: relative;
                }
                .phone-header { background: #5a524a; color: #b8ac97; font-size: 0.75rem; font-weight: 700; }
                .app-screen { padding: 25px; background: #fffdf5; min-height: 600px; display: flex; flex-direction: column; }

                /* REGISTRATION */
                .passport-icon { animation: float 3s ease-in-out infinite; }
                @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }

                /* NAV TABS */
                .nav-pill-container { display: flex; background: #eeebe5; padding: 4px; border-radius: 12px; }
                .nav-pill-btn {
                    flex: 1; border: none; background: transparent; padding: 8px;
                    border-radius: 8px; font-weight: 700; color: #888; font-size: 0.9rem;
                    transition: 0.2s;
                }
                .nav-pill-btn.active { background: white; color: #5dbac3; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

                /* GAME UI */
                .score-ribbon {
                    display: flex; justify-content: space-between; align-items: center;
                    background: #e6f4f1; border-radius: 20px; padding: 10px 15px;
                    border: 2px solid #bce3de;
                }
                .app-title { font-family: 'Fredoka', cursive; color: #5dbac3; font-size: 1.1rem; }
                .score-box { text-align: center; line-height: 1; }
                .score-box .label { font-size: 0.6rem; font-weight: 700; color: #8fa7a4; display: block; }
                .score-box .value { font-family: 'Fredoka', sans-serif; font-size: 1.2rem; color: #5a524a; }
                .score-box .value.active { color: #f2c94c; }

                .viewport-frame {
                    background: #c3d9d6; padding: 10px; border-radius: 25px;
                    transition: box-shadow 0.3s;
                }
                .viewport-frame.glow-success { box-shadow: 0 0 0 5px #a5d6a7; background: #a5d6a7; }
                .viewport-frame.glow-danger { box-shadow: 0 0 0 5px #ef9a9a; background: #ef9a9a; }

                .viewport-inner {
                    background: #2d2a26; border-radius: 18px; position: relative;
                    aspect-ratio: 4/3; overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                }
                .bg-grid {
                    position: absolute; inset: 0; opacity: 0.15;
                    background-image: 
                        linear-gradient(#fff 1px, transparent 1px), 
                        linear-gradient(90deg, #fff 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .villager-sprite { max-height: 85%; max-width: 80%; z-index: 2; transition: filter 0.5s ease-out; }

                .stamp-overlay {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-10deg);
                    font-family: 'Fredoka', cursive; font-size: 2.5rem; text-transform: uppercase;
                    border: 4px dashed; padding: 5px 20px; border-radius: 10px; z-index: 10;
                    animation: stamp-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes stamp-in { 
                    0% { transform: translate(-50%, -50%) rotate(-10deg) scale(0); opacity: 0; }
                    100% { transform: translate(-50%, -50%) rotate(-10deg) scale(1); opacity: 1; }
                }
                .stamp-correct { color: #69f0ae; border-color: #69f0ae; background: rgba(0,0,0,0.7); }
                .stamp-wrong { color: #ff5252; border-color: #ff5252; background: rgba(0,0,0,0.7); }

                /* LEADERBOARD */
                .lb-list-container { flex: 1; overflow-y: auto; max-height: 400px; padding-right: 5px; }
                .lb-list-container::-webkit-scrollbar { width: 6px; }
                .lb-list-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .lb-list-container::-webkit-scrollbar-thumb { background: #5dbac3; border-radius: 10px; }
                
                .lb-item {
                    display: flex; align-items: center; background: white;
                    padding: 12px 15px; border-radius: 15px; margin-bottom: 10px;
                    box-shadow: 0 2px 0 #eeebe5; border: 1px solid #f0f0f0;
                    transition: transform 0.2s;
                }
                .lb-item:hover { transform: translateX(3px); }
                .lb-item.is-me { border: 2px solid #5dbac3; background: #f0fafb; }
                
                .lb-rank {
                    width: 35px; height: 35px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Fredoka', cursive; font-weight: 600; font-size: 1.1rem;
                    margin-right: 15px; background: #eee; color: #888;
                }
                .lb-rank.rank-1 { background: #f2c94c; color: white; box-shadow: 0 2px 0 #deb335; }
                .lb-rank.rank-2 { background: #c0c0c0; color: white; }
                .lb-rank.rank-3 { background: #cd7f32; color: white; }

                .lb-info { flex: 1; display: flex; flex-direction: column; line-height: 1.2; }
                .lb-player { font-weight: 700; color: #5a524a; }
                .lb-date { font-size: 0.7rem; color: #aaa; font-weight: 600; }
                .lb-score { font-family: 'Fredoka', cursive; font-size: 1.4rem; color: #5dbac3; }

                /* BUTTONS */
                .btn-nook-choice {
                    width: 100%; border: none; background: white;
                    padding: 15px 5px; border-radius: 15px;
                    font-weight: 700; color: #5a524a; font-size: 0.95rem;
                    box-shadow: 0 4px 0 #e0e0e0; border: 2px solid #eee;
                    transition: 0.1s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    cursor: pointer;
                }
                .btn-nook-choice:hover { background: #f9f9f9; }
                .btn-nook-choice:active { transform: translateY(4px); box-shadow: none; }
                
                .btn-nook-action {
                    background: #5dbac3; border: none; padding: 15px;
                    border-radius: 50px; font-weight: 800; color: white;
                    box-shadow: 0 5px 0 #4a959c; transition: 0.2s;
                    cursor: pointer;
                }
                .btn-nook-action:hover { transform: translateY(-2px); box-shadow: 0 7px 0 #4a959c; }
                .btn-nook-action:active { transform: translateY(2px); box-shadow: 0 2px 0 #4a959c; }

                .phone-chin { height: 25px; background: #fffdf5; display: flex; justify-content: center; align-items: flex-start; }
                .home-bar { width: 100px; height: 5px; background: #e0e0e0; border-radius: 5px; }
                
                .reveal-text { font-size: 1.1rem; color: #5a524a; font-weight: 600; }
            `}</style>
        </div>
    );
}