export interface Islands {
    id: string;
    name: string;
    type: string;
    items: string[];
    theme: string;
    description: string;

    // optional metadata (for live display / tags)
    status?: string;
    seasonal?: string;
    visitors?: number;
    cat?: "public" | "member";
}


export const PUBLIC_ISLANDS: Islands[] = [
    {
        id: "alapaap",
        name: "ALAPAAP",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs", "Materials"],
        visitors: 7,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island. Unlock access with membership."
    },
    {
        id: "aruga",
        name: "ARUGA",
        status: "SUB ONLY",
        type: "Patreon Exclusive",
        seasonal: "Year-Round",
        items: ["Exclusive Sets", "Materials"],
        visitors: 1,
        cat: "member",
        theme: "gold",
        description: "Patreon-exclusive island featuring curated premium sets and materials."
    },
    {
        id: "bahaghari",
        name: "BAHAGHARI",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs"],
        visitors: 7,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island with general loot and DIYs."
    },
    {
        id: "bituin",
        name: "BITUIN",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs"],
        visitors: 7,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island with general loot and DIYs."
    },
    {
        id: "bonita",
        name: "BONITA",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs"],
        visitors: 3,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island with general loot and DIYs."
    },
    {
        id: "dalisay",
        name: "DALISAY",
        status: "SUB ONLY",
        type: "Patreon Exclusive",
        seasonal: "Year-Round",
        items: ["Exclusive Sets"],
        visitors: 2,
        cat: "member",
        theme: "gold",
        description: "Patreon-exclusive island focused on premium exclusive sets."
    },
    {
        id: "galak",
        name: "GALAK",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs"],
        visitors: 4,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island with general loot and DIYs."
    },
    {
        id: "hiraya",
        name: "HIRAYA",
        status: "SUB ONLY",
        type: "Patreon Exclusive",
        seasonal: "Year-Round",
        items: ["Exclusive Sets"],
        visitors: 5,
        cat: "member",
        theme: "gold",
        description: "Patreon-exclusive island featuring curated exclusive sets."
    },
    {
        id: "lakan",
        name: "LAKAN",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs"],
        visitors: 4,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island with general loot and DIYs."
    },
    {
        id: "likha",
        name: "LIKHA",
        status: "SUB ONLY",
        type: "Treasure Island",
        seasonal: "Year-Round",
        items: ["General", "DIYs"],
        visitors: 7,
        cat: "member",
        theme: "gold",
        description: "Subscriber-only treasure island with general loot and DIYs."
    },
    {
        id: "marahuyo",
        name: "MARAHUYO",
        status: "SUB ONLY",
        type: "Patreon Exclusive",
        seasonal: "Year-Round",
        items: ["Max Bells", "Turnips"],
        visitors: 4,
        cat: "member",
        theme: "gold",
        description: "Patreon-exclusive island for max bells and turnips."
    },
    {
        id: "tagumpay",
        name: "TAGUMPAY",
        status: "SUB ONLY",
        type: "Patreon Exclusive",
        seasonal: "Year-Round",
        items: ["Exclusive Sets"],
        visitors: 5,
        cat: "member",
        theme: "gold",
        description: "Patreon-exclusive island featuring curated exclusive sets."
    },

    // --- PUBLIC ISLANDS (your originals) ---
    {
        id: "kilig",
        name: "KILIG",
        type: "1.0 Treasure Island",
        items: ["1.0 Furniture", "DIYs", "Furniture Sets"],
        theme: "teal",
        cat: "public",
        description: "Classic 1.0 treasure island featuring essential furniture, DIY recipes, and complete furniture sets."
    },
    {
        id: "maharlika",
        name: "MAHARLIKA",
        type: "Furniture Island",
        items: ["Furniture Sets", "Housewares", "Kitchenware"],
        theme: "purple",
        cat: "public",
        description: "Premium furniture island focused on elegant housewares and kitchen essentials."
    },
    {
        id: "harana",
        name: "HARANA",
        type: "Critters & DIY",
        items: ["Models", "Golden Tools", "DIYs"],
        theme: "teal",
        cat: "public",
        description: "A curated island for critter models, golden tools, and must-have DIY recipes."
    },
    {
        id: "kakanggata",
        name: "KAKANGGATA",
        type: "1.0 Treasure Island",
        items: ["Shell DIYs", "Surfboards", "Summer Gear"],
        theme: "teal",
        cat: "public",
        description: "Summer-themed island featuring beach items, shell DIYs, and surfboard collections."
    },
    {
        id: "bathala",
        name: "BATHALA",
        type: "2.0 Treasure Island",
        items: ["2.0 Items", "Vehicles", "Vines/Moss"],
        theme: "teal",
        cat: "public",
        description: "Full Animal Crossing 2.0 content including vehicles, vines, moss, and new items."
    },
    {
        id: "kaulayaw",
        name: "KAULAYAW",
        type: "2.0 Treasure Island",
        items: ["2.0 Furniture", "Food", "Cooking DIYs"],
        theme: "teal",
        cat: "public",
        description: "2.0 island centered on cooking, food items, and modern furniture pieces."
    },
    {
        id: "tadhana",
        name: "TADHANA",
        type: "Furniture Island",
        items: ["Antique", "Imperial", "Cute Sets"],
        theme: "purple",
        cat: "public",
        description: "Furniture island featuring popular themed sets like Antique, Imperial, and Cute."
    },
    {
        id: "pagsuyo",
        name: "PAGSUYO",
        type: "Critters & DIY",
        items: ["Fish Models", "Bug Models", "Art"],
        theme: "teal",
        cat: "public",
        description: "Dedicated island for fish and bug models plus genuine and decorative art."
    },
    {
        id: "kalawakan",
        name: "KALAWAKAN",
        type: "1.0 Treasure Island",
        items: ["Rattan", "Diner", "Throwback"],
        theme: "teal",
        cat: "public",
        description: "Retro-inspired island with rattan, diner, and throwback furniture sets."
    },
    {
        id: "dalangin",
        name: "DALANGIN",
        type: "2.0 Treasure Island",
        items: ["2.0 Furniture", "Gyroids", "Shopping"],
        theme: "teal",
        cat: "public",
        description: "2.0 island featuring gyroids, new furniture, and shopping-related items."
    },
    {
        id: "pagsamo",
        name: "PAGSAMO",
        type: "Furniture Island",
        items: ["Elegant", "Nordic", "Ranch Sets"],
        theme: "purple",
        cat: "public",
        description: "Furniture island focused on elegant, nordic, and ranch-style aesthetics."
    },
    {
        id: "tala",
        name: "TALA",
        type: "Materials and DIY",
        items: ["Wood", "Iron", "Gold", "Star Frags"],
        theme: "teal",
        cat: "public",
        description: "Material island stocked with crafting resources and star fragments."
    },
    {
        id: "matahom",
        name: "MATAHOM",
        type: "Clothing Island",
        items: ["Kimonos", "Bags", "Shoes"],
        theme: "pink",
        cat: "public",
        description: "Fashion island offering traditional and modern clothing accessories."
    },
    {
        id: "kundiman",
        name: "KUNDIMAN",
        type: "1.0 Treasure Island",
        items: ["1.0 Sets", "Walls/Floors"],
        theme: "teal",
        cat: "public",
        description: "Classic island for complete 1.0 furniture sets and interior walls and floors."
    },
    {
        id: "silakbo",
        name: "SILAKBO",
        type: "Seasonal Items",
        items: ["Spooky Set", "Candy", "Pumpkins"],
        theme: "teal",
        cat: "public",
        description: "Halloween-themed island with spooky furniture and seasonal treats."
    },
    {
        id: "sinagtala",
        name: "SINAGTALA",
        type: "Materials and DIY",
        items: ["Star Frags", "Seasonal Mats"],
        theme: "teal",
        cat: "public",
        description: "Celestial materials island featuring star fragments and seasonal crafting mats."
    },
    {
        id: "paraluman",
        name: "PARALUMAN",
        type: "Clothing Island",
        items: ["Coats", "Boots", "Hats"],
        theme: "pink",
        cat: "public",
        description: "Cold-weather fashion island with coats, boots, and stylish headwear."
    },
    {
        id: "amihan",
        name: "AMIHAN",
        type: "Seasonal Items",
        items: ["Ornaments", "Toy Day", "Festive"],
        theme: "teal",
        cat: "public",
        description: "Winter and holiday island featuring festive decorations and Toy Day items."
    },
    {
        id: "babaylan",
        name: "BABAYLAN",
        type: "Seasonal Items",
        items: ["Petals", "Bonsai", "Branches"],
        theme: "teal",
        cat: "public",
        description: "Spring-themed island with cherry-blossom petals, bonsai, and branches."
    },
    {
        id: "pagsuyo",
        name: "PAGSUYO",
        type: "Seasonal Items",
        items: ["Mushrooms", "Maple", "Acorns"],
        theme: "teal",
        cat: "public",
        description: "Autumn island featuring mushroom sets, maple leaves, and fall materials."
    },
    {
        id: "sinta",
        name: "SINTA",
        type: "Order Bot",
        items: ["Order Bot"],
        theme: "teal",
        cat: "public",
        description: "Romantic seasonal island featuring wedding furniture and love-themed items."
    }
];
