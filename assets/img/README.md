# Images

| File | Used for | Size |
|---|---|---|
| `hero.jpg` | Background behind the headline (set in `css/style.css`, `.hero-bg`) | 1376 × 768 |
| `girl-in-the-field.jpg` | "About" — the large photo, with the family caption | 896 × 1195 |
| `leaf.jpg` | "About" — small overlapping photo (hidden on phones) | 800 × 800 |
| `field.jpg` | Background of the PA-compliance section (set in `css/style.css`, `#quality`) | 848 × 1264 |
| `oregano.jpg`, `sage.jpg`, `oils.jpg` | Product cards | 1000 wide |
| `og-image.jpg` | Link preview on WhatsApp / LinkedIn | 1200 × 630 |
| `nilc-logo.pdf` | The customer's logo — source for `assets/logo*.svg` | — |

The files here are web-optimised copies. The untouched originals live in
`originals/`, which is kept out of git (see `.gitignore`).

## Replacing a photo

Save the new file under the same name and size, as JPEG at ~80% quality, and
keep it under ~250 KB — GitHub Pages does no image optimisation.
Alt text for the About photos is translated: `about.familyAlt` and
`about.leafAlt` in `lang/*.txt`.
