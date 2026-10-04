# Diego Rabelo da Costa — personal academic website

Static, bilingual (EN/PT) single-page site. No build step is needed to host it: everything in this folder is plain HTML, CSS and JavaScript.

```
index.html            English version (default)
pt/index.html         Portuguese version (the EN | PT switch in the top bar links the two)
assets/css/style.css  styles (light and dark themes follow the visitor's system setting)
assets/js/main.js     filters, BibTeX modal, tabs, mobile menu
assets/img/           photo, hero background, per-theme artwork, paper figures (img/pubs), logos (img/logos), video thumbnails (img/videos)
documents/            Diego_Rabelo_da_Costa_CV.pdf (short CV linked from the top bar and the Contact section)
.nojekyll             tells GitHub Pages to serve the files as they are
robots.txt, sitemap.xml
```

## Publishing on GitHub Pages

1. Create a public repository named `<your-github-user>.github.io` (this gives the address `https://<your-github-user>.github.io/`). Any other repository name also works, but the site is then served from `https://<user>.github.io/<repo>/`.
2. Upload **the contents of this folder** (not the folder itself) to the root of the repository — `index.html` must be at the top level. Keep the hidden `.nojekyll` file.
3. In the repository, open *Settings → Pages* and choose *Deploy from a branch*, branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live. Every later change is published by committing new files to `main`.
5. Optional custom domain (e.g. `diegorabelo.com.br`): add it in *Settings → Pages → Custom domain* (GitHub creates a `CNAME` file) and point the domain's DNS to GitHub Pages following the instructions shown there.

The canonical address is set to `https://drabelocosta.github.io/` (repository `drabelocosta.github.io`). If you ever move the site to another address, search-and-replace it in `index.html`, `pt/index.html` (the `canonical`/`hreflang` tags) and `sitemap.xml`, or rebuild with `SITE_URL=https://your.domain/ python3 tools/build_site.py`.

## Updating content

The HTML is generated from data files by the scripts in the companion `site-source.zip` (Python 3, Jinja2):

- `data/publications.json` — one entry per paper (title, authors, journal, DOI, year, areas, type, BibTeX, citations, arXiv id, figure). It is built from Crossref records (`data/crossref/*.json`) by `tools/build_pubs.py`; the per-paper theme labels live in `AREA_BY_DOI` inside that script.
- `data/lattes.json` — education, projects, supervisions, boards and events parsed from the Lattes XML by `tools/parse_lattes.py`.
- `data/videos.json` — YouTube playlists and talks.
- `data/metrics.json` — Google Scholar numbers shown in the hero (`citations`, `h_index`, `i10_index`, `date`).
- `tools/content.py` — all editorial text in English and Portuguese (profile, positions, research themes, projects, courses, UI labels).

Run `python3 tools/build_site.py` from the source folder to regenerate `site/`. To add a figure for a paper, drop `assets/img/pubs/<doi-slug>.webp` (slug = DOI lower-cased with non-alphanumerics replaced by `_`, e.g. `10_1103_physrevb_89_075418.webp`); the generator picks it up automatically. Logos go in `assets/img/logos/<key>.svg|png` with keys `ufc`, `fisica`, `funcap`, `umn`, `hnu`, `uantwerp`, `cnpq`, `capes`.
