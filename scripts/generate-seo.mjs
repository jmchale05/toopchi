import { writeFileSync } from "node:fs";
import { join } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL ?? "https://toopchi.com").replace(
  /\/$/,
  "",
);

const sitemapPaths = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/start", priority: "0.9", changefreq: "weekly" },
  { path: "/how-to-play", priority: "0.8", changefreq: "monthly" },
  { path: "/setup", priority: "0.8", changefreq: "weekly" },
  { path: "/tenable/setup", priority: "0.8", changefreq: "weekly" },
  { path: "/premium", priority: "0.5", changefreq: "monthly" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths
  .map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.path === "/" ? "/" : entry.path}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /game
Disallow: /results
Disallow: /tenable/game
Disallow: /tenable/results
Disallow: /create-account

Sitemap: ${siteUrl}/sitemap.xml
`;

const publicDir = join(process.cwd(), "public");
writeFileSync(join(publicDir, "sitemap.xml"), sitemap);
writeFileSync(join(publicDir, "robots.txt"), robots);

console.log(`SEO files generated for ${siteUrl}`);
