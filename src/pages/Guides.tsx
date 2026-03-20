import { useState, useEffect } from "react";

const Guide = () => {
    const [activeTab, setActiveTab] = useState("steps");

    useEffect(() => {
        const site = window.location.origin;
        const url = `${site}/guide`;
        const img = `${site}/banner.png`;

        const title =
            activeTab === "steps"
                ? "How to Join ACNH Treasure Islands – Step-by-Step Guide | Chopaeng"
                : activeTab === "rules"
                    ? "ACNH Treasure Island Rules – Golden Rules for Visitors | Chopaeng"
                    : "ACNH Treasure Island FAQ – Help & Common Issues | Chopaeng";

        const desc =
            activeTab === "steps"
                ? "Step-by-step guide on how to join Chopaeng ACNH treasure islands. Learn Dodo code entry, airport tips, and best practices for smooth Animal Crossing: New Horizons island visits."
                : activeTab === "rules"
                    ? "Review the golden rules for visiting Chopaeng ACNH treasure islands. Proper airport exits, clean item handling, and stable connections keep treasure islands running smoothly."
                    : "Find answers to common ACNH treasure island issues on Chopaeng — interference errors, communication errors, how to order items, and how to use the Chopaeng Discord bot.";

        document.title = title;

        const setMeta = (attr: string, key: string, value: string) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute("content", value);
        };

        const setLink = (rel: string, href: string) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement("link");
                el.setAttribute("rel", rel);
                document.head.appendChild(el);
            }
            el.setAttribute("href", href);
        };

        setMeta("name", "description", desc);
        setLink("canonical", url);

        setMeta("property", "og:type", "website");
        setMeta("property", "og:site_name", "Chopaeng");
        setMeta("property", "og:url", url);
        setMeta("property", "og:title", title);
        setMeta("property", "og:description", desc);
        setMeta("property", "og:image", img);

        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", title);
        setMeta("name", "twitter:description", desc);
        setMeta("name", "twitter:image", img);
    }, [activeTab]);


    const steps = [
        {
            num: "01",
            title: "Empty Pockets",
            desc: "Leave everything at home. You need all 40 empty slots to collect as much as possible. Tools, nets, rods, and shovels are provided on the island — there is no need to bring your own.",
            icon: "bag-x"
        },
        {
            num: "02",
            title: "Find a Live Island",
            desc: "Visit the Chopaeng Treasure Islands page to see which islands are currently online, how many visitors are present, and what items are available.",
            icon: "display"
        },
        {
            num: "03",
            title: "Dodo Airlines",
            desc: "Speak to Orville → 'I want to fly' → 'Visit someone' → 'Online play' → 'Search via Dodo Code'. Enter the live code exactly as shown on the dashboard.",
            icon: "airplane-fill"
        },
        {
            num: "04",
            title: "Enter Code",
            desc: "Type the live code from the dashboard. If you get 'Interference', keep trying immediately — it means someone else is in the air. If you get a 'Communication Error', wait 60 seconds for the island to reboot.",
            icon: "keyboard"
        },
        {
            num: "05",
            title: "Arrival",
            desc: "Wait for the full arrival cutscene to finish. Do not move until the welcome banner disappears completely or you may miss spawned items.",
            icon: "geo-alt-fill"
        },
        {
            num: "06",
            title: "Collect Everything",
            desc: "Walk the entire island and pick up every item on the ground. Dig fossils with the shovel, fish in the water, and shake trees if available. Use the trash can for any duplicates you do not want.",
            icon: "bag-plus-fill"
        }
    ];

    const rules = [
        {
            num: "C1",
            title: "Strict Code Confidentiality",
            desc: "Do NOT share the Dodo Code with anyone — including your other account, friends, family, or online acquaintances. The code is exclusively for you. You are allowed only 1 character/island per membership.",
            type: "danger",
            icon: "fa-solid fa-shield-halved"
        },
        {
            num: "C2",
            title: "Set Your Nickname",
            desc: "Change your server nickname to the format: ACNH Character Name | Your ACNH Island Name. This helps the team identify you. You can update your nickname in the 👑 set-nick channel.",
            type: "info",
            icon: "fa-solid fa-id-badge"
        },
        {
            num: "C3",
            title: "Always Leave via the Airport — No AFK",
            desc: "NEVER press the minus (–) button to leave. Always walk to the airport and fly home through Orville. Leaving with the minus button may cause the island to crash for all other visitors and you may lose items.",
            type: "danger",
            icon: "fa-solid fa-circle-xmark"
        },
        {
            num: "C4",
            title: "Check Your Internet Connection",
            desc: "NAT Type A or B is required for smooth online play. If you have NAT Type C or D you may experience connection problems — please do not join the islands until you have resolved your NAT type.",
            type: "primary",
            icon: "fa-solid fa-wifi"
        },
        {
            num: "C5",
            title: "Read the Pinned Messages First",
            desc: "Check the pinned section in each Discord channel before asking questions. The pins contain rules, tutorials, and announcements. Most common questions are already answered there.",
            type: "secondary",
            icon: "fa-solid fa-thumbtack"
        },
        {
            num: "C6",
            title: "No Littering",
            desc: "Do not drop unwanted items on the ground. Trash bins are placed all over each island — please use them. Litter prevents islands from refreshing their item spawns for everyone.",
            type: "warning",
            icon: "fa-solid fa-trash"
        },
        {
            num: "C7",
            title: "ChoBot Tutorials",
            desc: "Tutorials for ChoBot (the drop bot) are available in the 🍄 chobot-how channel on Discord. Check there before asking how to request items or use any bot commands.",
            type: "success",
            icon: "fa-solid fa-robot"
        },
        {
            num: "C8",
            title: "ChoBot: On-Island Requests Only",
            desc: "Do NOT request any item through ChoBot unless you are already standing on the island and ready to pick it up. Always collect every item you request — do not leave requested items on the ground.",
            type: "warning",
            icon: "fa-solid fa-box-open"
        },
    ];

    return (
        <div className="nook-os min-vh-100 p-3 p-lg-5 font-nunito d-flex flex-column align-items-center">

            <div className="app-container w-100" style={{maxWidth: '850px'}}>

                {/* 1. APP HEADER */}
                <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="app-icon bg-success text-white shadow-sm">
                        <i className="fa-solid fa-book-open fs-4"></i>
                        </div>
                        <div>
                            <h2 className="mb-0 ac-font fw-black text-dark lh-1">Island Guide</h2>
                            <p className="mb-0 small text-muted fw-bold text-uppercase tracking-wide">ChoPaeng</p>
                        </div>
                    </div>
                    {/* Fake Battery/Time - Optional aesthetic touch */}
                    <div className="d-none d-md-block text-end opacity-50">
                        <i className="fa-solid fa-battery-full fs-4"></i>
                    </div>
                </div>

                {/* 2. NAVIGATION TABS (Pill Style) */}
                <div className="bg-white p-2 rounded-pill shadow-sm border mb-4 d-flex justify-content-between">
                    {[
                        { id: 'steps', label: 'How to Join', icon: 'fa-solid fa-plane' },
                        { id: 'rules', label: 'Sub Rules', icon: 'fa-solid fa-shield-halved' },
                        { id: 'faq', label: 'Help & FAQ', icon: 'fa-solid fa-comment-dots' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn btn-tab rounded-pill flex-grow-1 fw-bold text-uppercase py-2 transition-all ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <i className={`${tab.icon} me-2 d-none d-sm-inline`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 3. CONTENT AREA (White Paper) */}
                <div className="content-card bg-white rounded-4 shadow-sm border p-4 p-md-5 position-relative overflow-hidden">

                    {/* TAB 1: STEPS */}
                    {activeTab === 'steps' && (
                        <div className="animate-fade-in">
                            <h4 className="ac-font fw-black mb-4 text-center text-dark">Ready for Takeoff?</h4>
                            <div className="d-flex flex-column gap-4">
                                {steps.map((step, i) => (
                                    <div key={i} className="d-flex align-items-start gap-4 p-3 rounded-4 hover-bg-light transition-all border border-transparent hover-border">
                                        <div className="step-circle flex-shrink-0 ac-font">{step.num}</div>
                                        <div>
                                            <h5 className="fw-black text-dark mb-1">{step.title}</h5>
                                            <p className="text-muted fw-bold mb-0 small lh-base">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Max Bells Teaser */}
                            <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 d-flex align-items-center gap-3">
                                <i className="fa-solid fa-piggy-bank text-success fs-2"></i>
                                <div>
                                    <h6 className="fw-black text-success mb-0">Want Max Bells?</h6>
                                    <p className="small text-success mb-0 fw-bold opacity-75">Take turnips from Turnip Island → Sell at Nook's Cranny.</p>
                                </div>
                            </div>

                            {/* Tips & Tricks */}
                            <div className="mt-5">
                                <h5 className="ac-font fw-black text-center text-dark mb-4">Tips &amp; Tricks</h5>
                                <div className="row g-3">
                                    {[
                                        { icon: "fa-solid fa-box-archive", color: "text-primary", title: "Empty Storage First", tip: "Free up your home storage before visiting so you can unload full pockets quickly and fly back for another run." },
                                        { icon: "fa-solid fa-rotate", color: "text-warning", title: "Visit Multiple Times", tip: "You can fly back to the same island multiple times in a row. Land, fill up, fly home to unload, and return with the same code." },
                                        { icon: "fa-solid fa-fish", color: "text-info", title: "Don't Forget the Water", tip: "Rare fish and bugs also spawn on treasure islands. Bring or use the provided net and fishing rod — some are worth millions of Bells." },
                                        { icon: "fa-solid fa-map-location-dot", color: "text-success", title: "Check the Map First", tip: "Visit the Island Maps page before flying to see a full overhead view of the island layout and plan your collection route." },
                                        { icon: "fa-solid fa-clock", color: "text-danger", title: "Visit During Off-Peak Hours", tip: "Visitor slots fill up fast during peak hours. Try visiting in the early morning (Philippine time) for the least competition and fastest access." },
                                        { icon: "fa-solid fa-star", color: "text-warning", title: "Collect Star Fragments", tip: "Star Fragments and Large Star Fragments are rare crafting materials used in wand recipes. Always pick these up when you see them — they are hard to farm naturally." },
                                    ].map((tip, i) => (
                                        <div key={i} className="col-sm-6">
                                            <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-4 border border-transparent h-100">
                                                <i className={`${tip.icon} ${tip.color} fs-4 flex-shrink-0 mt-1`}></i>
                                                <div>
                                                    <h6 className="fw-black text-dark mb-1 small">{tip.title}</h6>
                                                    <p className="text-muted fw-bold mb-0 x-small lh-base">{tip.tip}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: RULES */}
                    {activeTab === 'rules' && (
                        <div className="animate-fade-in">
                            <h4 className="ac-font fw-black mb-4 text-center text-dark">Sub Rules</h4>
                            <div className="row g-3 mb-5">
                                {rules.map((rule, i) => (
                                    <div key={i} className="col-12">
                                        <div className={`p-4 rounded-4 bg-${rule.type}-subtle border border-${rule.type} border-opacity-25 d-flex align-items-center gap-3`}>
                                            <div className={`icon-box text-${rule.type} bg-white shadow-sm flex-shrink-0`}>
                                                <i className={`${rule.icon} fs-4`}></i>
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className={`badge bg-${rule.type} bg-opacity-25 text-${rule.type} rounded-pill fw-black x-small`}>{rule.num}</span>
                                                    <h5 className={`fw-black text-${rule.type} mb-0`}>{rule.title}</h5>
                                                </div>
                                                <p className="small text-dark opacity-75 fw-bold mb-0">{rule.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Warning Banner */}
                            <div className="p-4 rounded-4 bg-danger-subtle border border-danger border-opacity-50 text-center mb-5">
                                <i className="fa-solid fa-triangle-exclamation text-danger fs-3 mb-2"></i>
                                <p className="fw-black text-danger mb-1 small">Anyone caught breaking any of these rules will receive up to two warnings before being kicked or permanently banned from the server.</p>
                                <p className="small text-muted fw-bold mb-0">Open a ticket in <span className="text-success fw-black">🌼 camp-support</span> if you have any questions about the rules.</p>
                            </div>

                            {/* ChoBot Order Rules */}
                            <h4 className="ac-font fw-black mb-1 text-center text-dark">
                                <i className="fa-solid fa-robot text-success me-2"></i>Order Bot Rules
                            </h4>
                            <p className="text-muted fw-bold small text-center mb-4">Additional rules that apply when using ChoBot to place item orders.</p>
                            <div className="row g-3">
                                {[
                                    {
                                        num: "OB1",
                                        title: "Set Your Nickname First",
                                        desc: "You MUST change your server nickname to Your ACNH Character Name | Your ACNH Island Name before placing any order. Update it in the 👑 set-nick channel.",
                                        type: "info",
                                        icon: "fa-solid fa-id-badge"
                                    },
                                    {
                                        num: "OB2",
                                        title: "No Code Sharing",
                                        desc: "DO NOT share your order code with anyone else. Only the person who placed the order may visit that island. Sharing a code may result in a permanent bot ban.",
                                        type: "danger",
                                        icon: "fa-solid fa-shield-halved"
                                    },
                                    {
                                        num: "OB3",
                                        title: "No Littering",
                                        desc: "DO NOT litter on the island. Pick up only what you ordered and leave the island clean for the next person.",
                                        type: "warning",
                                        icon: "fa-solid fa-trash"
                                    },
                                    {
                                        num: "OB4",
                                        title: "Order Only What You Need",
                                        desc: "Do not spam or place excessive orders. Order only the items you genuinely need to keep the queue fair for all members.",
                                        type: "secondary",
                                        icon: "fa-solid fa-list-check"
                                    },
                                    {
                                        num: "OB5",
                                        title: "Good Internet Required",
                                        desc: "You MUST have a stable internet connection of at least 15–25 Mbps before placing an order to avoid disconnection errors mid-visit.",
                                        type: "primary",
                                        icon: "fa-solid fa-wifi"
                                    },
                                    {
                                        num: "OB6",
                                        title: "Read the Bot Guide First",
                                        desc: "Read everything in the 🌲 chorder-bot-how channel before placing any orders. This prevents wrong commands and avoids unnecessary questions in the order channel.",
                                        type: "success",
                                        icon: "fa-solid fa-book-open"
                                    },
                                    {
                                        num: "OB7",
                                        title: "Order Channel is for Orders Only",
                                        desc: "DO NOT chat or look up items in the 🌲 chorder-bot channel — that channel is strictly for placing orders. Use the 🌲 chorder-bot-help channel for questions.",
                                        type: "danger",
                                        icon: "fa-solid fa-comment-slash"
                                    },
                                    {
                                        num: "OB8",
                                        title: "Item Lookup Channel is for Lookups Only",
                                        desc: "DO NOT place orders or chat in the 🌲 chorder-item-lookup channel. That channel is exclusively for looking up the code for an item or DIY recipe.",
                                        type: "warning",
                                        icon: "fa-solid fa-magnifying-glass"
                                    },
                                ].map((rule, i) => (
                                    <div key={i} className="col-12">
                                        <div className={`p-4 rounded-4 bg-${rule.type}-subtle border border-${rule.type} border-opacity-25 d-flex align-items-center gap-3`}>
                                            <div className={`icon-box text-${rule.type} bg-white shadow-sm flex-shrink-0`}>
                                                <i className={`${rule.icon} fs-4`}></i>
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className={`badge bg-${rule.type} bg-opacity-25 text-${rule.type} rounded-pill fw-black x-small`}>{rule.num}</span>
                                                    <h5 className={`fw-black text-${rule.type} mb-0`}>{rule.title}</h5>
                                                </div>
                                                <p className="small text-dark opacity-75 fw-bold mb-0">{rule.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: FAQ / DIALOGUE */}
                    {activeTab === 'faq' && (
                        <div className="animate-fade-in">
                            <h4 className="ac-font fw-black mb-4 text-center text-dark">Troubleshooting & Help</h4>

                            <div className="d-flex flex-column gap-3">
                                {[
                                    { q: "Wuh-oh! Interference?", a: "Someone is flying in or out of the island, or a visitor has a menu open. Keep pressing 'A' to retry — you'll be let in as soon as the interference clears, usually within a few seconds." },
                                    { q: "Communication Error?", a: "The island crashed, most likely because a visitor pressed the minus button to quit instead of leaving through the airport. Wait about 60 seconds for the host to reboot the island, then check Discord or the dashboard for a new Dodo code." },
                                    { q: "How do I order a specific item?", a: "Join the Chopaeng Discord server and type !order [item name] in the correct bot channel. ChoBot will generate a private island stocked with your item and send you a unique Dodo code, usually within seconds. This feature requires a paid membership." },
                                    { q: "How do I request a specific villager?", a: "Use the !villager [name] command in the Chopaeng Discord bot channel. ChoBot will create an island with the villager already placed in boxes. Fly over, talk to them, and invite them to move to your island. Only one character per membership can use this per session." },
                                    { q: "How do I get max Bells?", a: "Premium members can visit the dedicated Bells island. Pick up the turnips on the ground, return home, and sell them at Nook's Cranny for 999,999,999 Bells in a single trip. Make sure your pockets are empty before going so you can carry as many turnips as possible." },
                                    { q: "Why is my inventory full after just a few minutes?", a: "Treasure islands are packed with items, so your 40 slots fill quickly. Empty your pockets completely before each visit. When full, fly home through the airport, drop off items in your storage, then return with a fresh code to collect more." },
                                    { q: "The Dodo code isn't working — what do I do?", a: "Dodo codes expire after 24 hours or when the island reboots. Check the Chopaeng website or Discord for the current live code. If you see 'This island is full', wait a minute and retry — a visitor slot will open once someone flies home." },
                                    { q: "Can I take items from the island's beach or trees?", a: "Yes! You can pick up anything on the ground, dig up fossils with the provided shovel, cut trees, shake fruit trees, and fish in the water. Use only the tools provided on the island and return any borrowed tools to the designated spot when you're done." },
                                    { q: "My game says 'Could not connect'. What's wrong?", a: "This usually means your NAT type is too strict (NAT Type C or D). Switch to a wired connection if possible, or change your router settings to achieve NAT Type A or B. Restarting your modem and router often resolves temporary connectivity problems." },
                                    { q: "I accidentally littered on the island. What do I do?", a: "Use the trash can provided on the island to dispose of unwanted items. Never drop items directly on the ground and leave them — litter prevents new items from spawning and slows down the refresh for all visitors. If you left accidental litter, let a mod know in Discord." },
                                    { q: "Can I visit with friends at the same time?", a: "Up to 7 other players can be on a Chopaeng island at the same time (8 total including the host). You are welcome to coordinate visits with friends using the same code, but each person must have their pockets empty and must leave properly through the airport." },
                                    { q: "How often are islands restocked?", a: "Public islands are restocked on a rolling schedule managed by the Chopaeng team. Member ChoBot islands are generated fresh on demand each time you submit a request, so they are always fully stocked when you arrive." },
                                ].map((item, i) => (
                                    <div key={i} className="dialogue-container">
                                        <div className="dialogue-bubble bg-light border p-3 rounded-4 position-relative">
                                            <span className="badge bg-dark text-white rounded-pill mb-2 px-3">Question</span>
                                            <h6 className="fw-bold text-dark mb-2">{item.q}</h6>
                                            <p className="small text-success fw-bold mb-0 bg-white p-2 rounded-3 border">
                                                <i className="fa-solid fa-quote-left me-2"></i>
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-4">
                                <a target="_blank" href="https://discord.gg/chopaeng" className="btn btn-outline-dark rounded-pill fw-bold px-4 btn-sm">
                                    Open Discord Support
                                </a>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Guide;