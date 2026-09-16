# solvecalc.github.io

The GitHub Pages build of [SolveCalc](https://solvecalc.net): a free scientific
calculator (a "calcsolver") that runs entirely in the browser, plus nine focused
math tools and a handful of written guides.

Live at **https://solvecalc.github.io**

## How it works

GitHub Pages serves files, not an application, so every page is compiled to
static HTML ahead of time and committed. There is no server, no database and no
build step running on a request.

- The calculator and every tool are client-side JavaScript. Nothing typed into
  them is transmitted anywhere.
- Pages are rendered from EJS templates in `src/` by `src/build.js`.
- Clean URLs come from directory indexes: `/tools` is `tools/index.html`.
- `.nojekyll` stops GitHub from running Jekyll over the output.

## Layout

```
src/layout.ejs        page shell: head, header, footer
src/pages/*.ejs       one template per page type
src/content/*.js      the writing: tools, guides, blog posts
src/partials/         calculator markup, vault markup, tool widgets
src/build.js          renders everything, writes sitemap.xml and robots.txt
assets/               css, js, fonts, images
games.json            catalogue read by the vault
```

## Building

```
npm install
npm run build
```

The build fails rather than publishing a page whose title runs past 60
characters or whose meta description falls outside 110-160, so a bad page
cannot ship silently.

## Licence

MIT for the site's own code. Third-party content reached through the page
belongs to its respective owners.
