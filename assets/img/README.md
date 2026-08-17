# Images

Drop the customer's photos here. Nothing in this folder is required for the site
to work — every image slot currently falls back to a CSS-drawn placeholder.

## Recommended files

| File | Used for | Suggested size |
|---|---|---|
| `hero.jpg` | Full-width background behind the headline | 2400 × 1400, < 400 KB |
| `field.jpg` | "About" — harvest / field shot | 1200 × 1500 |
| `sorting.jpg` | "About" — small overlapping photo | 800 × 800 |
| `packing.jpg` | "Packaging" — palletised cartons | 1200 × 1600 |
| `og-image.jpg` | Link preview on WhatsApp / LinkedIn | 1200 × 630 |

## How to swap a placeholder for a real photo

**Hero background** — one line in [`../../css/style.css`](../../css/style.css), in the `.hero-bg` rule:

```css
.hero-bg {
  background-image: linear-gradient(rgba(27,42,25,.45), rgba(27,42,25,.45)), url("../assets/img/hero.jpg");
  background-size: cover;
  background-position: center;
}
```

**Section photos** — in [`../../index.html`](../../index.html), replace the whole
placeholder block with an `<img>`:

```html
<!-- before -->
<div class="photo-frame photo-field">
  <span class="photo-note" data-i18n="about.photoNote">…</span>
</div>

<!-- after -->
<img class="photo-frame" src="assets/img/field.jpg" alt="Oregano harvest in the Aegean highlands" loading="lazy">
```

Keep the `photo-frame` class — it carries the rounded corners and shadow.

## Before uploading

- Export as JPEG at ~80% quality, or WebP for smaller files.
- Keep each photo under ~400 KB; GitHub Pages has no image optimisation.
- Write a real `alt` description — it matters for search ranking and screen readers.
