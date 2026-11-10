# LIU & TREE — Capital Management

A bilingual company website for Liu & Tree Capital, designed for GitHub Pages.

## Design

Deep pine green, silver and cool paper. Self-hosted Manrope type with native Chinese fonts. An original animated mathematical surface expresses order within complexity; it does not represent financial data. Editorial sections introduce the firm, its philosophy and its vision. The complete supplied company introduction is displayed in English and Chinese together. A founders section presents the firm-supplied collective academic backgrounds from Fudan University, Stanford University and Princeton University, and describes the substantial proprietary capital provided by Liu and Tree. No individual degrees or university-to-founder assignments are inferred. The site includes English/Chinese navigation switching, a mobile navigation menu, expandable principles, scroll reveals and an animation pause control. Reduced-motion preferences are respected.

## Preview

No build step or runtime dependencies are required. From this directory:

```sh
python -m http.server 4173
```

Open http://localhost:4173.

## GitHub Pages

In repository **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save. All asset paths are relative and work on a GitHub Pages project URL. `.nojekyll` serves the files without Jekyll processing. Pushes to `main` update the website.

## Editing

- `index.html`: page structure and both languages (`data-en` / `data-zh`).
- `styles.css`: layout, responsive design and animation styles.
- `script.js`: language preferences, interactions and the original canvas artwork.
- `assets/`: self-hosted font, license and favicon.

The Chinese closing line is “立于原则，行于智慧，致于长远。” No contact information, performance figures, regulatory status or client claims have been invented.

Manrope is distributed under the SIL Open Font License; see `assets/OFL.txt`.
