import { DEFAULT_SEO, ROUTE_SEO } from "./src/seo/routes";

export const config = {
  matcher: "/((?!api|assets|_vercel|.*\\..*).*)",
};

const SITE_URL = "https://www.chopaeng.com";
const DEFAULT_OG_IMAGE = "https://www.chopaeng.com/banner.png";

const BOT_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|Bingbot|YandexBot|DuckDuckBot|Slurp|GPTBot|ClaudeBot|Bytespider|Google-Extended/i;

export default async function middleware(req: Request) {
  const ua = req.headers.get("user-agent") || "";

  if (!BOT_UA.test(ua)) {
    return;
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  let seo = ROUTE_SEO[pathname] ?? DEFAULT_SEO;

  //
  // Dynamic Island SEO
  //
  const islandMatch = pathname.match(/^\/island\/([^/]+)$/);

  if (islandMatch) {
    const slug = decodeURIComponent(islandMatch[1]);

    try {
      const res = await fetch("https://console.chopaeng.com/api/islands", {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const { data } = await res.json();
        const island = data.find(
          (i: any) =>
            i.id.toLowerCase() === slug.toLowerCase() ||
            i.canonical_name.toLowerCase() === slug.toLowerCase()
        );

        if (island) {
          const type = island.type || "Treasure Island";
          const article = /^[aeiou]/i.test(type) ? "an" : "a";
          const items = Array.isArray(island.items) ? island.items.join(", ") : "";

          let dynamicDesc = `${island.name} is ${article} ${type}. ${island.description || ""} with ${items}.`
            .replace(/\s+/g, " ")
            .trim();

          if (dynamicDesc.length > 160) {
            dynamicDesc = dynamicDesc.substring(0, 157).trim() + "...";
          }

          seo = {
            title: `${island.name} | Chopaeng Treasure Island`,
            description: dynamicDesc,
            image: island.map_url,
          };
        }
      }
    } catch (err) {
      console.error("Island SEO error:", err);
    }
  }

  //
  // Dynamic Blog SEO
  //
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);

  if (blogMatch) {
    const postId = decodeURIComponent(blogMatch[1]);

    try {
      const res = await fetch("https://console.chopaeng.com/api/patreon/posts", {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const { data } = await res.json();
        const post = data.find((p: any) => p.id === postId);

        if (post && post.attributes) {
          const title = post.attributes.title;
          let rawContent = post.attributes.content || "";

          // 1. Replace block tags (<p>, <br>, <li>) with a space so words don't mash together
          rawContent = rawContent.replace(/<\/?(p|br|div|li)[^>]*>/gi, " ");
          // 2. Strip all remaining HTML tags
          let cleanDesc = rawContent.replace(/<[^>]*>?/gm, "");
          // 3. Remove excess whitespace/newlines
          cleanDesc = cleanDesc.replace(/\s+/g, " ").trim();

          if (cleanDesc.length > 160) {
            cleanDesc = cleanDesc.substring(0, 157).trim() + "...";
          }

          seo = {
            title: `${title} | Chopaeng News`,
            description: cleanDesc,
            // Fall back to default if large_url is null
            image: post.attributes.image?.large_url ?? undefined,
          };
        }
      }
    } catch (err) {
      console.error("Blog SEO error:", err);
    }
  }

  const image = seo.image ?? DEFAULT_OG_IMAGE;
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  const indexRes = await fetch(new URL("/index.html", req.url));
  let html = await indexRes.text();

  const metaTags = `
<title>${escapeHtml(seo.title)}</title>

<meta name="description" content="${escapeHtml(seo.description)}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="Chopaeng" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${escapeHtml(seo.title)}" />
<meta property="og:description" content="${escapeHtml(seo.description)}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:alt" content="${escapeHtml(seo.title)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(seo.title)}" />
<meta name="twitter:description" content="${escapeHtml(seo.description)}" />
<meta name="twitter:image" content="${image}" />

<link rel="canonical" href="${canonical}" />
`;

  html = html
    .replace(/<title>.*?<\/title>/i, "")
    .replace(
      /<meta\s+(name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/gi,
      ""
    )
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace("</head>", `${metaTags}</head>`);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;"); // Added escaping for single quotes as a safety measure
}