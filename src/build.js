#!/usr/bin/env node
/*
 * Renders the site to static HTML.
 *
 * GitHub Pages serves files, not an application, so every page is compiled
 * once here and committed as finished HTML. Run `npm run build` after editing
 * anything in src/ and commit what changes.
 *
 * Clean URLs come from directory indexes: a page with path "/tools" is written
 * to tools/index.html, which Pages serves at /tools. Assets are referenced
 * absolutely so they resolve the same from every depth.
 */
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://solvecalc.github.io';
const YEAR = new Date().getFullYear();
const BUILD_DATE = new Date().toISOString().slice(0, 10);
// Bumped whenever the CSS or JS changes, so returning visitors are not served
// a stale copy from cache.
const ASSET_V = '7';

// GitHub Pages serves /tools as a 301 to /tools/, so every URL this file emits
// (canonical, schema, sitemap) uses the trailing-slash form that is actually
// served. Anything else makes Google crawl a redirect to reach the real page.
const U = (p) => SITE + (p === '/' ? '/' : p + '/');

const tools = require('./content/tools');
const guides = require('./content/guides');
const posts = require('./content/blog');

/* ── Vault order ───────────────────────────────────────────────────────────
 * solvecalc.net arranges its vault from an admin panel backed by a server.
 * GitHub Pages has no server, so the running order is set here instead: the
 * two flagship titles first, then widely recognised games, then whatever
 * order the catalogue already had. Edit this list and rebuild to rearrange.
 */
const FEATURED = [
  'GTA Vice City', 'GTA III',
  'Subway Surfers', 'Slope', 'Drift Hunters', 'Monkey Mart', 'Eggy Car', 'Retro Bowl',
  'Geometry Dash', 'Happy Wheels', 'Among Us', 'Classic Minecraft', 'Paper.io 2',
  'Moto X3M', 'Basket Random', 'Tunnel Rush', 'Subway Surfers New York', 'Smash Karts',
  'Temple Run 2', '1v1.LOL', 'Stickman Hook', 'Getaway Shootout', 'Crossy Road',
  'Snow Rider 3D', 'Cookie Clicker', 'Duck Life 4', 'Fireboy and Watergirl',
  'Doodle Jump', 'Run 3', 'Cluster Rush', 'Rooftop Snipers', 'Drive Mad', 'Vex 3',
  'Soccer Random', 'Basketball Stars', 'Death Run 3D', 'Bloxorz', 'OvO', 'Tag',
  'Papas Freezeria',
];

const games = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const byName = new Map(games.map((g) => [g.name.toLowerCase(), g]));
const featured = [];
const missing = [];
for (const name of FEATURED) {
  const g = byName.get(name.toLowerCase());
  if (g) featured.push(g); else missing.push(name);
}
if (missing.length) console.warn('  featured titles not in catalogue:', missing.join(', '));
const featuredCodes = new Set(featured.map((g) => g.code));
const ordered = [...featured, ...games.filter((g) => !featuredCodes.has(g.code))];
fs.writeFileSync(path.join(ROOT, 'games.json'), JSON.stringify(ordered));

const faq = [
  { q: 'What is SolveCalc?',
    a: 'A free scientific calculator that runs entirely in your browser, with a small set of focused math tools and written guides alongside it. No account, no download, no cost. This build is hosted on GitHub Pages and its source is public.' },
  { q: 'What does calcsolver mean?',
    a: 'Calcsolver, calc solver and calcsolve are all names people use for the same thing: an online calculator that works a problem out for you. Whichever spelling you searched for, this is that tool.' },
  { q: 'Is it really free?',
    a: 'Yes. There is no paid tier and no sign-in. Everything on the site is open to anyone who loads the page.' },
  { q: 'Does it work on a school Chromebook?',
    a: 'It is a plain web page, so it loads on any modern browser including managed Chromebooks that block installs. Once loaded it keeps working even if the connection drops.' },
  { q: 'Do my calculations get sent anywhere?',
    a: 'No. Every calculation is performed by JavaScript on your own device. Nothing you type is transmitted, logged or stored on a server.' },
  { q: 'How is this different from solvecalc.net?',
    a: 'Same calculator, much smaller site. This build keeps the calculator, nine tools and a handful of guides, with its own writing. The full project, with far more reference material, is at solvecalc.net.' },
];

const org = { '@type': 'Organization', name: 'SolveCalc', url: U('/') };
const webSite = {
  '@context': 'https://schema.org', '@type': 'WebSite', name: 'SolveCalc',
  alternateName: ['CalcSolver', 'Calc Solver', 'CalcSolve', 'Solve Calc'], url: U('/'),
};
const webApp = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'SolveCalc CalcSolver',
  url: U('/'), applicationCategory: 'UtilitiesApplication', operatingSystem: 'All',
  description: 'Free online calcsolver and scientific calculator that runs in the browser.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: org,
};
const faqSchema = (items) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: U(it.path) })),
});
const softwareApp = (t) => ({
  '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name,
  url: U(`/tools/${t.slug}`), applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'All', description: t.desc,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: org,
});
const article = (item, kind) => ({
  '@context': 'https://schema.org', '@type': kind === 'blog' ? 'BlogPosting' : 'Article',
  headline: item.name, description: item.desc,
  mainEntityOfPage: U(`/${kind === 'blog' ? 'blog' : 'guides'}/${item.slug}`),
  datePublished: item.date || BUILD_DATE, dateModified: BUILD_DATE,
  author: org, publisher: org,
  ...(item.img ? { image: [`${SITE}/assets/img/posts/${item.slug}.webp`] } : {}),
});

const PAGES = [
  { file: 'index.html', path: '/', tpl: 'index', vault: true, bodyClass: 'page-home',
    title: 'SolveCalc - Free CalcSolver and Scientific Calculator',
    desc: 'SolveCalc is a free calcsolver: a full scientific calculator that runs in your browser, plus focused math tools and short guides. No download, no account.',
    schema: [webSite, org, webApp, faqSchema(faq)] },
  { file: 'tools/index.html', path: '/tools', tpl: 'tools', bodyClass: 'page-tools',
    title: 'Math Tools - Free Calculators That Show the Working',
    desc: 'Nine focused calculators for fractions, percentages, primes, ratios, exponents and number bases. Each shows its working, runs in your browser, and is free.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }])] },
  { file: 'guides/index.html', path: '/guides', tpl: 'guides', bodyClass: 'page-guides',
    title: 'Math Guides - Order of Operations, Logs and Rounding',
    desc: 'Short reference guides on the topics where a confident wrong answer is most likely: order of operations, fraction conversions, logarithms and rounding.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }])] },
  { file: 'blog/index.html', path: '/blog', tpl: 'blog', bodyClass: 'page-blog',
    title: 'SolveCalc Blog - Working Accurately Under Pressure',
    desc: 'Practical posts on calculator habits: the mistakes that quietly cost marks, estimating before you trust a screen, and reading a question properly first.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])] },
  { file: 'about/index.html', path: '/about', tpl: 'about', bodyClass: 'page-static',
    title: 'About SolveCalc - The Free CalcSolver Project',
    desc: 'What the SolveCalc GitHub Pages build is, how it is put together, who it is for, and how it differs from the larger project at solvecalc.net.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])] },
  { file: 'contact/index.html', path: '/contact', tpl: 'contact', bodyClass: 'page-static',
    title: 'Contact SolveCalc - Report a Bug or a Wrong Answer',
    desc: 'How to reach the SolveCalc project: email for bugs and wrong calculator results, GitHub issues for anything code related, and what details actually help.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])] },
  { file: 'privacy-policy/index.html', path: '/privacy-policy', tpl: 'privacy-policy', bodyClass: 'page-static',
    title: 'Privacy Policy - SolveCalc CalcSolver',
    desc: 'What SolveCalc stores, which is almost nothing: no accounts and no calculation logs. What is kept in your own browser and which outside services load.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy-policy' }])] },
  { file: 'terms/index.html', path: '/terms', tpl: 'terms', bodyClass: 'page-static',
    title: 'Terms of Service - SolveCalc',
    desc: 'The rules for using SolveCalc: fair use of the free calcsolver and tools, checking results that matter, who owns the code, and the limits of liability.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }])] },
  { file: 'disclaimer/index.html', path: '/disclaimer', tpl: 'disclaimer', bodyClass: 'page-static',
    title: 'Disclaimer - SolveCalc CalcSolver',
    desc: 'What SolveCalc results can and cannot be relied on for, why rounding differences occur, and why nothing here counts as professional advice.',
    schema: [crumbs([{ name: 'Home', path: '/' }, { name: 'Disclaimer', path: '/disclaimer' }])] },
  // GitHub Pages serves this for any unknown path, so it stays out of the sitemap.
  { file: '404.html', path: '/404', tpl: '404', bodyClass: 'page-static', robots: 'noindex, follow',
    title: 'Page Not Found - SolveCalc',
    desc: 'That page does not exist on SolveCalc. Head back to the free calcsolver, the math tools that show their working, or the written guides.', schema: [] },
];

for (const t of tools) {
  PAGES.push({
    file: `tools/${t.slug}/index.html`, path: `/tools/${t.slug}`, tpl: 'tool', bodyClass: 'page-tool',
    title: t.title, desc: t.desc, item: t, siblings: tools.filter((x) => x.slug !== t.slug).slice(0, 6),
    schema: [softwareApp(t), faqSchema(t.faq),
      crumbs([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: t.name, path: `/tools/${t.slug}` }])],
  });
}
for (const g of guides) {
  PAGES.push({
    file: `guides/${g.slug}/index.html`, path: `/guides/${g.slug}`, tpl: 'guide', bodyClass: 'page-article',
    title: g.title, desc: g.desc, item: g, siblings: guides.filter((x) => x.slug !== g.slug),
    schema: [article(g, 'guide'), faqSchema(g.faq),
      crumbs([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }, { name: g.name, path: `/guides/${g.slug}` }])],
  });
}
for (const b of posts) {
  PAGES.push({
    file: `blog/${b.slug}/index.html`, path: `/blog/${b.slug}`, tpl: 'post', bodyClass: 'page-article',
    title: b.title, desc: b.desc, item: b, siblings: posts.filter((x) => x.slug !== b.slug),
    schema: [article(b, 'blog'),
      crumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: b.name, path: `/blog/${b.slug}` }])],
  });
}

const LOGO = '/assets/img/solvecalc-calcsolver-logo.png';
const layout = fs.readFileSync(path.join(__dirname, 'layout.ejs'), 'utf8');
const vaultHtml = fs.readFileSync(path.join(__dirname, 'partials', 'vault.html'), 'utf8');
// The splash's Play button handler is inline on solvecalc.net's homepage, so it
// travels with the vault markup here rather than living in main.js.
const vaultPlayHtml = fs.readFileSync(path.join(__dirname, 'partials', 'vault-play.html'), 'utf8');
const shared = { SITE, YEAR, ASSET_V, tools, guides, posts, faq,
  topTools: tools.slice(0, 6), toolCount: tools.length };

const problems = [];
let built = 0;
for (const page of PAGES) {
  const tplPath = path.join(__dirname, 'pages', page.tpl + '.ejs');
  let body = ejs.render(fs.readFileSync(tplPath, 'utf8'), { ...shared, ...page }, { filename: tplPath });
  if (page.vault) body += '\n' + vaultHtml + '\n' + vaultPlayHtml;

  const html = ejs.render(layout, {
    ...shared, ...page, body, vault: !!page.vault, canonical: U(page.path),
    item: page.item || null,
    ogImage: page.item && page.item.img ? `/assets/img/posts/${page.item.slug}.webp` : LOGO,
    ogImageAlt: page.item && page.item.img ? page.item.imgAlt : 'SolveCalc calcsolver logo',
    robots: page.robots || 'index, follow', schema: page.schema || [],
  }, { filename: path.join(__dirname, 'layout.ejs') });

  const out = path.join(ROOT, page.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  built++;

  if (page.title.length > 60) problems.push(`${page.path}: title ${page.title.length} chars`);
  if (page.desc.length < 110 || page.desc.length > 160) problems.push(`${page.path}: description ${page.desc.length} chars`);
  if (/[–—]/.test(page.title + page.desc)) problems.push(`${page.path}: dash character in meta`);
}
if (problems.length) { problems.forEach((p) => console.error('  ' + p)); throw new Error(`${problems.length} page(s) outside limits`); }

fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
const indexed = PAGES.filter((p) => !(p.robots || '').includes('noindex'));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  indexed.map((p) => `  <url><loc>${U(p.path)}</loc><lastmod>${BUILD_DATE}</lastmod></url>\n`).join('') +
  '</urlset>\n');
// IndexNow needs its key readable at the site root; written here so a clean
// checkout plus a build always has it.
const INDEXNOW_KEY = '9d68979f049dfc0fc3b5963df0f66b52';
fs.writeFileSync(path.join(ROOT, INDEXNOW_KEY + '.txt'), INDEXNOW_KEY);
// Disables Jekyll so every file is served exactly as committed.
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

console.log(`built ${built} pages (${tools.length} tools, ${guides.length} guides, ${posts.length} posts)`);
console.log(`vault: ${ordered.length} games, ${featured.length} featured first (${featured.slice(0, 3).map((g) => g.name).join(', ')}...)`);
console.log(`sitemap: ${indexed.length} urls`);
