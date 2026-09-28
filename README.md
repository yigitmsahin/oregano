# Nilc Tarım — one-page website

A static, multi-language single-page site for Nilc Tarım, a trader of Turkish
oregano, sage and essential oils from the Denizli region.
No database, no build step, no framework. HTML + CSS + jQuery, deployable to
GitHub Pages by pushing the folder.

**Languages:** Turkish · English · German — each one a plain text file in [`lang/`](lang/).

---

## Files

```
index.html          The whole page. Text is replaced at runtime from lang/*.txt
css/style.css       All styling (design tokens at the very top)
js/i18n.js          Translation engine — reads lang/*.txt
js/main.js          Nav, scroll effects, counters, contact form
lang/en.txt         English  ← fallback language
lang/tr.txt         Turkish
lang/de.txt         German
assets/             Logo files, favicon, home-screen icon
assets/img/         Drop customer photos here (see the README inside)
.nojekyll           Tells GitHub Pages to serve files as-is
robots.txt          Update the domain before launch
sitemap.xml         Update the domain before launch
```

---

## Running it locally

**You cannot just double-click `index.html`.** Browsers block reading
`lang/*.txt` over `file://`, so the page would load but never translate.
Serve it over HTTP instead — from this folder:

```bash
python -m http.server 4173
```

Then open <http://127.0.0.1:4173/>. Any static server works (`npx serve`,
VS Code's Live Server extension, etc.).

---

## Editing the text

All visible copy lives in the three files under [`lang/`](lang/). They are
plain text, one line per item:

```
hero.ctaPrimary = Request a quote
```

Rules:

- Change **only** what is right of the `=`. The key on the left is what the
  page looks up — renaming it makes the text disappear.
- Lines starting with `#` are notes and are ignored.
- Write `\n` where you want a line break.
- A few values contain HTML tags (`<br>`, `<em>`) — keep the tags, translate
  the words between them.
- Values may contain `=` freely; only the first one splits the line.

If a key is missing from `tr.txt` or `de.txt`, the English text is shown
instead, so a half-finished translation never leaves a blank space on the page.

### Adding a fourth language

1. Copy `lang/en.txt` to `lang/fr.txt` and translate it.
2. In [`js/i18n.js`](js/i18n.js), add the code to `SUPPORTED`:
   ```js
   var SUPPORTED = ["tr", "en", "de", "fr"];
   ```
3. In [`index.html`](index.html), add a button next to the others:
   ```html
   <button type="button" class="lang-btn" data-lang="fr">FR</button>
   ```

For a right-to-left language (Arabic, Hebrew), also add its code to the `RTL`
array in `i18n.js` — the engine then sets `dir="rtl"` on the page.

### How a visitor's language is chosen

1. `?lang=de` in the URL, if present — this is what the footer links use, and
   it is the link to send to a specific customer.
2. Otherwise, whatever they picked last (stored in the browser).
3. Otherwise, their browser language, if it is one of the three.
4. Otherwise, English.

---

## Where the content lives

The copy, products, email and address are the customer's own. Everything
below is still open or placeholder:

| What | Where |
|---|---|
| All copy | `lang/*.txt` |
| Email, company name, address | `index.html` → contact section and schema.org block, and `lang/*.txt` |
| Statistics (45 years, 3,000 MT) | `index.html` → `data-count` attributes |
| Phone / WhatsApp / office hours | Not supplied yet — add a row to `.contact-list` in `index.html` plus a label key in each `lang/*.txt` |
| Photos | `assets/img/` — see [the guide there](assets/img/README.md) |
| Logo | `assets/logo.svg` (full), `logo-light.svg` (footer), `logo-wordmark.svg` (header), `favicon.svg`, `logo.png` — all built from `assets/img/nilc-logo.pdf` |
| Domain in `robots.txt`, `sitemap.xml`, and the `og:`/`canonical` tags | as listed |

### Changing the colours

The palette is five variables at the top of [`css/style.css`](css/style.css):

```css
--herb-700: #33562f;   /* primary green — buttons, links */
--cream:    #faf8f2;   /* page background */
--sand:     #f3ede1;   /* alternating section background */
--clay:     #c2703f;   /* error/accent */
--gold:     #cb9c4a;   /* highlights */
```

Change those and the whole site re-skins consistently.

---

## The contact form

The site is static, so there is **no server to receive a submission**. The form
validates the input and then opens the visitor's email client with everything
pre-filled (`mailto:`). The recipient address is read from the email link in
the contact section, so it is defined in exactly one place.

This works everywhere but has a real limitation: visitors using webmail without
a configured mail handler may see nothing happen. The prominent email link
next to the form covers that case.

**To collect submissions properly**, sign up for a form relay — Formspree,
Basin and Web3Forms all have free tiers and work on static hosting — and
replace the body of `sendByMail()` in [`js/main.js`](js/main.js) with:

```js
$.post("https://formspree.io/f/YOUR_ID", data)
 .done(function () { $status.text(I18n.t("form.statusSent")); })
 .fail(function () { $status.addClass("is-error").text(I18n.t("form.statusInvalid")); });
```

---

## Deploying to GitHub Pages

```bash
git init
git add .
git commit -m "Oregano export site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source: Deploy from a branch →
Branch: `main`, folder: `/ (root)`** → Save. The site is live at
`https://USERNAME.github.io/REPO/` in a minute or two.

Notes:

- `.nojekyll` is already included so GitHub serves every file untouched.
- For a custom domain (`www.company.com`), add it under Settings → Pages, then
  point a CNAME record at `USERNAME.github.io` with your DNS provider. GitHub
  issues the HTTPS certificate automatically.
- **GitHub Pages is case-sensitive.** `Lang/EN.txt` will 404 even though it
  works on Windows. Keep filenames lowercase.

---

## Browser support

Chrome, Edge, Firefox and Safari — current and one version back. The layout
uses CSS Grid and `clamp()`; scroll animations use `IntersectionObserver` and
degrade to simply showing everything on older browsers. Motion is disabled
automatically for visitors with "reduce motion" enabled in their OS.
