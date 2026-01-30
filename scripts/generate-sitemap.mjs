import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE = "https://www.chopaeng.com";
const BLOG_API = "https://blogs.chopaeng.com/api/patreon/posts";

const nowIso = () => new Date().toISOString();

const esc = (s) =>
    String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");

const urlEntry = (loc, lastmod, changefreq = "weekly", priority = "0.7") => `
  <url>
    <loc>${esc(loc)}</loc>
    <lastmod>${esc(lastmod)}</lastmod>
    <changefreq>${esc(changefreq)}</changefreq>
    <priority>${esc(priority)}</priority>
  </url>`;

async function getBlogUrls() {
    try {
        const res = await fetch(BLOG_API);
        if (!res.ok) return [];
        const json = await res.json();
        return (json?.data || []).map((p) => ({
            loc: `${SITE}/blog/${p.id}`,
            lastmod: p?.attributes?.published_at ? new Date(p.attributes.published_at).toISOString() : nowIso(),
            changefreq: "monthly",
            priority: "0.6",
        }));
    } catch {
        return [];
    }
}

function getIslandUrls() {
    const islandsPath = path.resolve(__dirname, "../src/data/islands.ts");
    if (!fs.existsSync(islandsPath)) return [];

    const src = fs.readFileSync(islandsPath, "utf8");

    // grabs: id: "alapaap" (supports ' or ")
    const ids = [...src.matchAll(/\bid\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);

    const unique = [...new Set(ids)].filter(Boolean);

    return unique.map((id) => ({
        loc: `${SITE}/island/${id}`,
        lastmod: nowIso(),
        changefreq: "daily",
        priority: "0.8",
    }));
}

async function main() {
    const staticPages = [
        { loc: `${SITE}/`, changefreq: "daily", priority: "1.0" },
        { loc: `${SITE}/treasure-islands`, changefreq: "daily", priority: "0.9" },
        { loc: `${SITE}/blog`, changefreq: "daily", priority: "0.8" },
        { loc: `${SITE}/guide`, changefreq: "monthly", priority: "0.7" },
        { loc: `${SITE}/membership`, changefreq: "monthly", priority: "0.7" },
        { loc: `${SITE}/contact`, changefreq: "yearly", priority: "0.6" },
        { loc: `${SITE}/about`, changefreq: "yearly", priority: "0.6" },
        { loc: `${SITE}/finder`, changefreq: "daily", priority: "0.8" },
        { loc: `${SITE}/maps`, changefreq: "daily", priority: "0.8" },
        { loc: `${SITE}/dodo-translator`, changefreq: "yearly", priority: "0.5" },
    ].map((p) => ({ ...p, lastmod: nowIso() }));

    const [blogUrls] = await Promise.all([getBlogUrls()]);
    const islandUrls = getIslandUrls();

    const all = [...staticPages, ...islandUrls, ...blogUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => urlEntry(u.loc, u.lastmod, u.changefreq, u.priority)).join("\n")}
</urlset>
`;

    const outPath = path.resolve(__dirname, "../public/sitemap.xml");
    fs.writeFileSync(outPath, xml.trim() + "\n", "utf8");

    console.log(`✅ sitemap generated: ${outPath}`);
    console.log(`   urls: ${all.length}`);
}

main().catch((e) => {
    console.error("❌ failed to generate sitemap:", e);
    process.exit(1);
});
