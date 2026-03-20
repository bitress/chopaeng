const Chobot = () => {
    const discordCommands = [
        { cmd: "!find <item>", alias: "!f", desc: "Search for an item across all islands." },
        { cmd: "!villager <name>", alias: null, desc: "Find which island a villager is on." },
        { cmd: "!random", alias: null, desc: "Get a random item suggestion." },
        { cmd: "!islandstatus", alias: null, desc: "Check if an island is ONLINE, OFFLINE, or FULL." },
        { cmd: "!dodo <island>", alias: null, desc: "Request a Dodo code privately via DM." },
        { cmd: "!visitors", alias: null, desc: "List all current visitors on an island." },
        { cmd: "!ask <question>", alias: null, desc: "Ask the Chopaeng AI a question about the community." },
        { cmd: "!ping", alias: null, desc: "Check the bot's current response time." },
        { cmd: "!status", alias: null, desc: "View bot health, uptime, and service information." },
        { cmd: "!help", alias: null, desc: "Display the full help menu." },
        { cmd: "!refresh", alias: null, desc: "Force an immediate cache refresh from Google Sheets.", admin: true },
        { cmd: "!update", alias: null, desc: "Pull the latest code and restart the bot.", admin: true },
    ];

    const twitchCommands = [
        { cmd: "!find <item>", alias: "!locate, !where, !lookup, !lp, !search", desc: "Search for an item across all islands." },
        { cmd: "!villager <name>", alias: null, desc: "Find a villager's location." },
        { cmd: "!random", alias: null, desc: "Get a random item suggestion." },
        { cmd: "!ask <question>", alias: null, desc: "Ask the Chopaeng AI." },
        { cmd: "!status", alias: null, desc: "View bot status." },
        { cmd: "!help", alias: null, desc: "Display available commands." },
    ];

    const slashCommands = [
        { cmd: "/flight_status", desc: "Display current Flight Logger statistics." },
        { cmd: "/recover_flights", desc: "Recover any missing flight records." },
        { cmd: "/unwarn <user>", desc: "Remove an active warning from a user." },
        { cmd: "/warnings <user>", desc: "View the full warning history for a user." },
        { cmd: "/flight_history <user>", desc: "View a user's complete island visit history." },
    ];

    const features = [
        {
            icon: "fa-plane",
            color: "bg-danger",
            title: "Flight Logger",
            desc: "Watches island visitors in real-time. Alerts staff for unknown visitors with interactive moderation buttons: Admit, Warn, Kick, Ban, Dismiss, and Investigate. Warnings expire automatically after 3 days.",
        },
        {
            icon: "fa-magnifying-glass",
            color: "bg-success",
            title: "Smart Fuzzy Search",
            desc: "Multi-strategy search pipeline: exact match → prefix → contains → token overlap → fuzzy → plural fallback. Full Unicode support including CJK characters. Returns close suggestions when an exact match isn't found.",
        },
        {
            icon: "fa-robot",
            color: "bg-primary",
            title: "Chopaeng AI",
            desc: "Built-in keyword-based knowledge base about the community, guidelines, islands, and VIP info — no paid API required. Optional upgrade with free Google Gemini AI for richer answers. Per-user conversation history with 5-turn memory.",
        },
        {
            icon: "fa-map-location-dot",
            color: "bg-warning",
            title: "Island Status & Dodo Codes",
            desc: "Reads real-time island data to report ONLINE, OFFLINE, or FULL status. Supports 18 subscriber islands and 27 free islands. Sends Dodo codes securely via DM on request.",
        },
        {
            icon: "fa-server",
            color: "bg-info",
            title: "REST API",
            desc: "Exposes JSON endpoints for item search, villager lookup, island status, and Patreon post data. Supports both HTML and JSON responses for flexible integration.",
        },
        {
            icon: "fa-table-columns",
            color: "bg-secondary",
            title: "Web Dashboard",
            desc: "Mod-only secure login via secret key or Discord OAuth. Includes island management, analytics, activity logs, visitor tracking, and role-based access for admins and senior mods.",
        },
    ];

    const apiEndpoints = [
        { method: "GET", path: "/health", desc: "Health check — returns JSON status." },
        { method: "GET", path: "/api/find?item=<name>", desc: "Search for an item (JSON response)." },
        { method: "GET", path: "/api/villager?name=<name>", desc: "Find a villager (JSON response)." },
        { method: "GET", path: "/api/villagers/list", desc: "List villagers grouped by island." },
        { method: "GET", path: "/api/islands", desc: "Island status, visitors, and Dodo codes." },
        { method: "GET", path: "/api/patreon/posts", desc: "List cached Patreon posts." },
        { method: "POST", path: "/api/refresh", desc: "Trigger a manual cache refresh." },
    ];

    return (
        <>
            <title>ChoBot – Chopaeng's Custom Discord & Twitch Bot</title>
            <meta
                name="description"
                content="Learn about ChoBot, Chopaeng's custom Discord and Twitch bot. Explore commands for finding items, checking island status, requesting Dodo codes, and more."
            />
            <link rel="canonical" href="https://www.chopaeng.com/chobot" />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Chopaeng" />
            <meta property="og:title" content="ChoBot – Chopaeng's Custom Discord & Twitch Bot" />
            <meta property="og:description" content="ChoBot is Chopaeng's unified community bot for Discord and Twitch — find items, check island status, request Dodo codes, and chat with Chopaeng AI." />
            <meta property="og:url" content="https://www.chopaeng.com/chobot" />
            <meta property="og:image" content="https://www.chopaeng.com/banner.png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="ChoBot – Chopaeng's Custom Discord & Twitch Bot" />
            <meta name="twitter:description" content="ChoBot is Chopaeng's unified community bot for Discord and Twitch — find items, check island status, request Dodo codes, and chat with Chopaeng AI." />
            <meta name="twitter:image" content="https://www.chopaeng.com/banner.png" />

            <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">
                <div className="app-container w-100" style={{ maxWidth: '950px' }}>

                    {/* Hero */}
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5 text-center position-relative overflow-hidden">
                        <div className="passport-bg"></div>
                        <div className="position-relative z-1">
                            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: 72, height: 72 }}>
                                <i className="fa-solid fa-robot fs-2 text-primary"></i>
                            </div>
                            <h1 className="fw-black ac-font text-dark mb-2">ChoBot</h1>
                            <p className="text-muted fw-bold mb-3">
                                Chopaeng's custom unified bot — available on Discord, Twitch, and the web.
                            </p>
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary border-opacity-25 fw-bold px-3 py-2">
                                    <i className="fa-brands fa-discord me-1"></i> Discord
                                </span>
                                <span className="badge rounded-pill bg-purple-subtle text-purple border fw-bold px-3 py-2" style={{ background: '#f3e8ff', color: '#7c3aed', borderColor: '#c4b5fd' }}>
                                    <i className="fa-brands fa-twitch me-1"></i> Twitch
                                </span>
                                <span className="badge rounded-pill bg-success-subtle text-success border border-success border-opacity-25 fw-bold px-3 py-2">
                                    <i className="fa-solid fa-globe me-1"></i> REST API
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mb-5">
                        <div className="text-center mb-4">
                            <h2 className="fw-black ac-font text-dark">Features</h2>
                            <p className="text-muted fw-bold small">Everything ChoBot can do for the community</p>
                        </div>
                        <div className="row g-4">
                            {features.map((f, i) => (
                                <div className="col-md-6 col-lg-4" key={i}>
                                    <div className="bg-white rounded-4 shadow-sm border p-4 h-100">
                                        <div className={`d-inline-flex align-items-center justify-content-center rounded-circle text-white mb-3 ${f.color}`} style={{ width: 44, height: 44 }}>
                                            <i className={`fa-solid ${f.icon} small`}></i>
                                        </div>
                                        <h6 className="fw-black text-dark mb-2">{f.title}</h6>
                                        <p className="text-muted small fw-bold mb-0 lh-base">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discord Commands */}
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="fa-brands fa-discord fs-4 text-primary"></i>
                            <div>
                                <h3 className="fw-black ac-font text-dark mb-0">Discord Commands</h3>
                                <p className="text-muted small fw-bold mb-0">Use these commands in the Chopaeng Discord server</p>
                            </div>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {discordCommands.map((c, i) => (
                                <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-3 bg-light border">
                                    <code className="fw-black text-primary bg-white border rounded-3 px-2 py-1 small flex-shrink-0 text-nowrap">{c.cmd}</code>
                                    <div className="min-w-0">
                                        <p className="mb-0 small fw-bold text-muted">{c.desc}</p>
                                        {c.alias && (
                                            <p className="mb-0 x-small text-muted mt-1">
                                                <span className="fw-bold">Alias:</span> <code className="text-secondary">{c.alias}</code>
                                            </p>
                                        )}
                                        {c.admin && (
                                            <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 rounded-pill x-small fw-bold mt-1">Admin only</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Slash Commands */}
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="fa-solid fa-slash fs-4 text-primary"></i>
                            <div>
                                <h3 className="fw-black ac-font text-dark mb-0">Slash Commands</h3>
                                <p className="text-muted small fw-bold mb-0">Flight Logger moderation slash commands</p>
                            </div>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {slashCommands.map((c, i) => (
                                <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-3 bg-light border">
                                    <code className="fw-black text-success bg-white border rounded-3 px-2 py-1 small flex-shrink-0 text-nowrap">{c.cmd}</code>
                                    <p className="mb-0 small fw-bold text-muted">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Twitch Commands */}
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="fa-brands fa-twitch fs-4" style={{ color: '#9147ff' }}></i>
                            <div>
                                <h3 className="fw-black ac-font text-dark mb-0">Twitch Commands</h3>
                                <p className="text-muted small fw-bold mb-0">Use these in the Chopaeng Twitch chat</p>
                            </div>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {twitchCommands.map((c, i) => (
                                <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-3 bg-light border">
                                    <code className="fw-black px-2 py-1 small flex-shrink-0 text-nowrap bg-white border rounded-3" style={{ color: '#9147ff' }}>{c.cmd}</code>
                                    <div className="min-w-0">
                                        <p className="mb-0 small fw-bold text-muted">{c.desc}</p>
                                        {c.alias && (
                                            <p className="mb-0 x-small text-muted mt-1">
                                                <span className="fw-bold">Aliases:</span> <code className="text-secondary">{c.alias}</code>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* REST API */}
                    <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 mb-5">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="fa-solid fa-code fs-4 text-success"></i>
                            <div>
                                <h3 className="fw-black ac-font text-dark mb-0">REST API</h3>
                                <p className="text-muted small fw-bold mb-0">Available endpoints from the ChoBot web service</p>
                            </div>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {apiEndpoints.map((e, i) => (
                                <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-3 bg-light border">
                                    <span className="badge bg-success rounded-2 fw-black flex-shrink-0 small py-2 px-2">{e.method}</span>
                                    <div className="min-w-0">
                                        <code className="small text-dark fw-bold d-block mb-1">{e.path}</code>
                                        <p className="mb-0 small fw-bold text-muted">{e.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mb-3">
                        <a
                            href="https://github.com/bitress/chobot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-dark rounded-pill px-5 py-3 fw-black shadow-sm me-3"
                        >
                            <i className="fa-brands fa-github me-2"></i> View on GitHub
                        </a>
                        <a
                            href="https://discord.gg/chopaeng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary rounded-pill px-5 py-3 fw-black shadow-sm"
                        >
                            <i className="fa-brands fa-discord me-2"></i> Join Discord
                        </a>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Chobot;
