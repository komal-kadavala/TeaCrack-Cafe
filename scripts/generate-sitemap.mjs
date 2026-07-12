import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = resolve(__dirname, '../public/sitemap.xml');

const baseUrl = 'https://teacrackcafe.vercel.app';
const pages = [
  '/',
  '/about',
  '/menu',
  '/gallery',
  '/reviews',
  '/contact',
];

const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((path) => {
    const priority = path === '/' ? '1.0' : '0.8';
    const changefreq = path === '/' || path === '/menu' ? 'weekly' : 'monthly';
    return `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <lastmod>2026-07-12</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n')}
</urlset>\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, content, 'utf8');
console.log(`Generated sitemap at ${outputPath}`);
