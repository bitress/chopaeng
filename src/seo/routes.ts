export interface RouteSEO {
  title: string;
  description: string;
  image?: string;
}

export const ROUTE_SEO: Record<string, RouteSEO> = {
  "/": {
    title: "ACNH Treasure Islands, Items & Dodo Codes | Chopaeng",
    description: "Join the top ACNH Treasure Island community. Get free 24/7 access to Animal Crossing items, DIYs, Bells, materials, villagers, and live Dodo codes.",
  },

  "/about": {
    title: "About Chopaeng | 24/7 ACNH Treasure Islands",
    description: "Learn about Chopaeng and our automated ACNH Treasure Islands. Discover how we run 24/7 Animal Crossing item streams and Discord bots.",
  },

  "/guides": {
    title: "ACNH Guides, Tips & Island Tutorials | Chopaeng",
    description: "Read practical Animal Crossing: New Horizons guides. Learn to navigate treasure islands, use drop bots, and optimize your ACNH gameplay.",
  },

  "/maps": {
    title: "ACNH Treasure Island Maps & Item Locations | Chopaeng",
    description: "View complete maps of all Chopaeng ACNH Treasure Islands. Locate exact grid spots for DIYs, furniture, clothing, and materials before flying.",
  },

  "/islands": {
    title: "Live ACNH Treasure Islands & Dodo Codes | Chopaeng",
    description: "View the live status of our 24/7 ACNH Treasure Islands. Get active Dodo codes, check island themes, and monitor visitor traffic in real-time.",
  },

  "/membership": {
    title: "Premium ACNH Treasure Island Access | Chopaeng",
    description: "Become a premium Chopaeng member. Unlock uninterrupted 24/7 access, exclusive drop bots, custom item requests, and private ACNH islands.",
  },

  "/find": {
    title: "ACNH Item & Villager Database | Chopaeng",
    description: "Search our massive Animal Crossing database. Quickly locate specific ACNH furniture, clothing, DIY recipes, and villagers across our islands.",
  },

  "/command-builder": {
    title: "ACNH Item Drop Command Builder | Chopaeng",
    description: "Generate automated drop commands for Chopaeng ACNH Discord bots. Fast, accurate, and free tool for spawning Animal Crossing items.",
  },

  "/contact": {
    title: "Contact Support | Chopaeng ACNH Community",
    description: "Reach out to the Chopaeng team. Get support for ACNH Treasure Islands, Discord bot troubleshooting, membership issues, or partnerships.",
  },

  "/blog": {
    title: "ACNH News & Chopaeng Blog | Updates & Tips",
    description: "Read the latest Animal Crossing: New Horizons news. Stay updated on Chopaeng island resets, Discord bot features, and community announcements.",
  },
};

export const DEFAULT_SEO: RouteSEO = {
  title: "Chopaeng | 24/7 ACNH Treasure Islands & Tools",
  description: "Your automated hub for Animal Crossing: New Horizons. Access 24/7 free ACNH Treasure Islands, live Dodo codes, item databases, and drop bots.",
  image: "https://www.chopaeng.com/banner.png",
};