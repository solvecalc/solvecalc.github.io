#!/usr/bin/env node
/*
 * IndexNow submission.
 *
 * The Express sites do this from a /indexnow-submit route, but GitHub Pages
 * serves files and runs nothing, so there is no request to hang it off. This
 * runs from a terminal instead: `npm run indexnow`, after a deploy.
 *
 * The URL list is read from the built sitemap.xml rather than kept separately,
 * because a hand-maintained second list is exactly what drifted out of sync on
 * the other sites. Build first, then submit.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const KEY = '9d68979f049dfc0fc3b5963df0f66b52';
const SITE = 'https://solvecalc.github.io';
const HOST = 'solvecalc.github.io';

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
if (!urls.length) { console.error('sitemap.xml has no URLs - run npm run build first'); process.exit(1); }

const keyFile = path.join(ROOT, KEY + '.txt');
if (!fs.existsSync(keyFile)) { console.error('missing ' + KEY + '.txt at the site root'); process.exit(1); }

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls });
const req = https.request({
  hostname: 'api.indexnow.org', path: '/IndexNow', method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) },
}, (res) => {
  let out = '';
  res.on('data', (d) => { out += d; });
  res.on('end', () => {
    // 200 accepted, 202 accepted but the key is still being verified.
    const ok = res.statusCode === 200 || res.statusCode === 202;
    console.log(`${ok ? 'submitted' : 'REFUSED'}: ${urls.length} urls, HTTP ${res.statusCode}${out ? ' ' + out.slice(0, 200) : ''}`);
    process.exit(ok ? 0 : 1);
  });
});
req.on('error', (e) => { console.error('request failed:', e.message); process.exit(1); });
req.write(body);
req.end();
