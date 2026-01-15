import { useMemo, useState } from "react";

type Category = "public" | "member";
type FilterKey = "ALL" | Category;

type IslandStatus = "ONLINE" | "SUB ONLY" | "REFRESHING";
type Theme = "pink" | "teal" | "purple" | "gold";

interface Island {
    name: string;
    status: IslandStatus;
    type: string;
    seasonal: string;
    items: string[];
    visitors: number; // 0..7
    cat: Category;
    theme: Theme;
}

interface FilterTab {
    key: FilterKey;
    label: string;
}

interface StatusMeta {
    dotClass: string;
    btn: {
        className: string;
        text: string;
        icon: string | null;
        disabled: boolean;
    };
    cardClass: string;
    aria: string;
}

const FILTERS: FilterTab[] = [
    { key: "ALL", label: "All" },
    { key: "public", label: "Free" },
    { key: "member", label: "VIP" },
];

const STATUS: Record<IslandStatus, StatusMeta> = {
    ONLINE: {
        dotClass: "bg-success",
        btn: { className: "btn btn-nook-primary", text: "VIEW CODE", icon: null, disabled: false },
        cardClass: "",
        aria: "Online",
    },
    "SUB ONLY": {
        dotClass: "bg-warning",
        btn: { className: "btn btn-warning text-dark", text: "SUB ONLY", icon: "fa-lock", disabled: false },
        cardClass: "",
        aria: "Subscriber only",
    },
    REFRESHING: {
        dotClass: "bg-secondary",
        btn: { className: "btn btn-light border text-muted", text: "REFRESHING...", icon: null, disabled: true },
        cardClass: "opacity-75",
        aria: "Refreshing",
    },
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const ISLANDS: Island[] = [
    {
        name: "MATAHOM",
        status: "ONLINE",
        type: "Clothing",
        seasonal: "Cherry Blossom",
        items: ["Kimonos", "Petal Piles", "Bags"],
        visitors: 3,
        cat: "public",
        theme: "pink",
    },
    {
        name: "PARALUMAN",
        status: "ONLINE",
        type: "Clothing",
        seasonal: "Winter/Festive",
        items: ["Frozen DIYs", "Ornaments", "Boots"],
        visitors: 4,
        cat: "public",
        theme: "pink",
    },
    {
        name: "KAKANGGATA",
        status: "ONLINE",
        type: "General Items",
        seasonal: "Summer",
        items: ["Shell DIYs", "Surfboards", "Tools"],
        visitors: 4,
        cat: "public",
        theme: "teal",
    },
    {
        name: "BATHALA",
        status: "REFRESHING",
        type: "2.0 Furniture",
        seasonal: "Halloween",
        items: ["Spooky Sets", "Pumpkins", "Carvings"],
        visitors: 0,
        cat: "public",
        theme: "purple",
    },
    {
        name: "LAKAN",
        status: "SUB ONLY",
        type: "All Materials",
        seasonal: "Autumn",
        items: ["Gold", "NMT", "Maple Leaves"],
        visitors: 1,
        cat: "member",
        theme: "gold",
    },
    {
        name: "MARAHUYO",
        status: "SUB ONLY",
        type: "Max Bells",
        seasonal: "Year-Round",
        items: ["Turnips", "Bells", "Crowns"],
        visitors: 3,
        cat: "member",
        theme: "gold",
    },
];

const TreasureIslands = () => {
    const [filter, setFilter] = useState<FilterKey>("ALL");
    const [search, setSearch] = useState<string>("");

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();

        return ISLANDS
            .filter((island) => (filter === "ALL" ? true : island.cat === filter))
            .filter((island) => {
                if (!q) return true;
                const haystack = [island.name, island.type, island.seasonal, ...island.items]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(q);
            });
    }, [filter, search]);

    const onCardClick = (island: Island) => {
        console.log("Open island:", island.name);
    };

    return (
        <div className="nook-bg min-vh-100 py-5">
            <div className="container-fluid px-lg-5">
                {/* CONTROLS */}
                <div className="d-flex flex-column align-items-center gap-3 mb-4">
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {FILTERS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setFilter(t.key)}
                                className={`btn btn-ac fw-bold text-uppercase rounded-pill px-4 ${filter === t.key ? "active" : ""}`}
                                aria-pressed={filter === t.key}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="search-wrap w-100" style={{ maxWidth: 520 }}>
                        <div className="input-group">
              <span className="input-group-text bg-white border-2">
                <i className="fa-solid fa-magnifying-glass" />
              </span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-control border-2"
                                placeholder="Search islands, items, seasons…"
                                aria-label="Search islands"
                            />
                            {search.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary border-2"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ANNOUNCEMENT */}
                <div
                    className="speech-bubble bg-white p-4 mb-5 mx-auto border border-3 border-dark rounded-4 shadow-sm"
                    style={{ maxWidth: 800 }}
                >
                    <h5 className="text-success fw-bold mb-2 ac-font">
                        <i className="fa-solid fa-leaf me-2"></i> Island Status
                    </h5>
                    <p className="mb-0 fw-bold text-muted" style={{ fontFamily: "Nunito" }}>
                        Codes are available on <span className="text-primary">Twitch</span> or{" "}
                        <span className="text-primary">Discord</span>. Click an island to view the full inventory map.
                    </p>
                </div>

                {/* EMPTY STATE */}
                {filteredData.length === 0 && (
                    <div className="text-center text-muted fw-bold py-5">
                        <i className="fa-regular fa-face-sad-tear me-2" />
                        No islands match your search.
                    </div>
                )}

                {/* MAIN GRID */}
                <div className="row g-4 justify-content-center">
                    {filteredData.map((island) => {
                        const statusMeta = STATUS[island.status];
                        const visitors = clamp(island.visitors, 0, 7);
                        const pct = (visitors / 7) * 100;

                        return (
                            <div key={island.name} className="col-xl-3 col-lg-4 col-md-6">
                                <button
                                    type="button"
                                    className={`card h-100 ac-card shadow-sm border-0 overflow-hidden text-start w-100 ${statusMeta.cardClass}`}
                                    onClick={() => onCardClick(island)}
                                    aria-label={`Open island ${island.name} (${statusMeta.aria})`}
                                >
                                    {/* SEASONAL BANNER */}
                                    <div className={`seasonal-tag text-center py-1 fw-black x-small theme-${island.theme}`}>
                                        <i className="fa-solid fa-calendar-day me-1"></i> {island.seasonal}
                                    </div>

                                    <div className="card-body p-4">
                                        {/* Island Header */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h3 className="ac-font mb-0 text-dark h4">{island.name}</h3>
                                                <span className="text-muted fw-bold small">{island.type}</span>
                                            </div>

                                            <div className={`status-dot ${statusMeta.dotClass}`} title={statusMeta.aria} aria-label={statusMeta.aria} />
                                        </div>

                                        {/* Item Preview List */}
                                        <div className="inventory-preview bg-light rounded-3 p-3 mb-3 border border-dashed">
                                            <h6 className="x-small text-uppercase fw-black text-muted mb-2">Featured Items</h6>
                                            <div className="d-flex flex-wrap gap-1">
                                                {island.items.slice(0, 3).map((item) => (
                                                    <span key={item} className="badge rounded-pill bg-white text-dark border fw-bold small">
                            {item}
                          </span>
                                                ))}
                                                {island.items.length > 3 && (
                                                    <span className="text-success fw-bold small ms-1">+ more</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Button */}
                                        <div className="d-grid gap-2">
                                            <button
                                                type="button"
                                                className={`${statusMeta.btn.className} rounded-pill fw-black py-2`}
                                                disabled={statusMeta.btn.disabled}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCardClick(island);
                                                }}
                                            >
                                                {statusMeta.btn.icon && <i className={`fa-solid ${statusMeta.btn.icon} me-2`} />}
                                                {statusMeta.btn.text}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Visitor Footer */}
                                    <div className="card-footer bg-white border-0 pb-3 text-center">
                                        <div
                                            className="progress mx-auto"
                                            style={{ height: 8, width: "80%", borderRadius: 10 }}
                                            role="progressbar"
                                            aria-valuenow={visitors}
                                            aria-valuemin={0}
                                            aria-valuemax={7}
                                            aria-label={`${visitors} of 7 villagers on island`}
                                        >
                                            <div
                                                className={`progress-bar ${visitors >= 6 ? "bg-danger" : "bg-success"}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="x-small fw-bold text-muted mt-2 d-block">
                      {visitors} / 7 Villagers on Island
                    </span>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Keep your styles as-is */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap');

        .nook-bg {
          background-color: #f2f4e6;
          background-image: radial-gradient(#dce2c8 15%, transparent 16%);
          background-size: 30px 30px;
        }

        .ac-font { font-family: 'Fredoka One', cursive; letter-spacing: 0.5px; }
        .fw-black { font-weight: 900; }
        .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }

        .btn-ac {
          background-color: #fff;
          border: 2px solid #e0e0e0;
          color: #aaa;
          transition: all 0.2s;
        }
        .btn-ac.active {
          background-color: #7dd181;
          border-color: #5faf63;
          color: #fff;
          box-shadow: 0 4px 0 #4ca350;
          transform: translateY(-2px);
        }

        .btn-nook-primary {
          background-color: #88e0a0;
          color: white;
          border: 2px solid white;
          box-shadow: 0 4px 0 #6dbd83;
        }
        .btn-nook-primary:hover { background-color: #76d490; color: white; }

        .ac-card {
          border-radius: 24px;
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .ac-card:hover { transform: scale(1.02); }
        .ac-card:focus-visible {
          outline: 3px solid rgba(0,0,0,0.6);
          outline-offset: 4px;
        }

        .seasonal-tag {
          text-transform: uppercase;
          border-bottom: 2px solid rgba(0,0,0,0.05);
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
          flex: 0 0 auto;
        }

        .inventory-preview { min-height: 85px; }

        .theme-pink { background-color: #ffd6e5; color: #ff69b4; }
        .theme-teal { background-color: #cafff5; color: #008080; }
        .theme-purple { background-color: #e5d6ff; color: #6a5acd; }
        .theme-gold { background-color: #fff5c2; color: #b8860b; }

        .speech-bubble { position: relative; }
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 15px 15px 0;
          border-style: solid;
          border-color: white transparent transparent;
          filter: drop-shadow(0 2px 0 black);
        }

        .search-wrap .form-control:focus {
          box-shadow: none;
          border-color: #7dd181;
        }
      `}</style>
        </div>
    );
};

export default TreasureIslands;
