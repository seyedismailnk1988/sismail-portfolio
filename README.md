# Seyed Ismail — Portfolio

A premium, minimal portfolio built with **plain HTML, CSS and JavaScript**. No framework, no build step, no runtime dependencies, and no third-party requests. Fonts are self-hosted, and every path is relative, so you can upload the folder to any web server and it works.

```
seyed-ismail-portfolio/
├── index.html                 Homepage: hero, work, about, experience, process, expertise, services, contact
├── projects/                  One case study per project
│   ├── travel-sailo.html      Flagship: screen-by-screen story (checkout, BNPL, wallet, confirmation…)
│   ├── jll.html               Flagship: business-impact case study
│   ├── citibank.html  foodiehub.html  fireboost.html
│   └── trekxplore.html  donut-delights.html  edm-campaigns.html
├── 404.html
├── css/
│   ├── style.css              Design tokens (:root), base styles, all components
│   ├── animations.css         Keyframes, reveal states, reduced-motion rules
│   └── responsive.css         Breakpoints: 1100 / 960 / 860 / 560px
├── js/
│   ├── main.js                Loader, navigation, mobile menu, active section, page transitions
│   ├── animations.js          Scroll reveals, counters, timeline/process progress, hero 3D tilt
│   └── interactions.js        Cursor, magnetic buttons, card tilt, filters, accordion, stepper, contact form
├── assets/
│   ├── cv/                    Downloadable CV (PDF)
│   ├── fonts/                 Inter + Space Grotesk (variable woff2)
│   ├── icons/                 Favicons and app icons
│   ├── images/                og-image.png (social sharing), portrait placeholder
│   └── projects/<slug>/       Project images (currently placeholders)
├── CONTENT-CHECKLIST.md       What still needs your input: assets, facts to verify
├── robots.txt  sitemap.xml  site.webmanifest
```

## Preview locally

Opening `index.html` directly works, but a local server behaves more like real hosting:

```bash
cd seyed-ismail-portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

## Before you publish: three things to do

1. **Work through `CONTENT-CHECKLIST.md`.** It lists every placeholder image (with exact path and size) and every fact that needs verifying.
2. **Review mode.** Every page has `<html … data-review="on">`, which shows yellow **REVIEW** notes beside content that still needs your input. Once you've dealt with them, change it to `data-review="off"` on each page, or delete the notes. Find them all with:
   ```bash
   grep -rn "review-flag" --include=*.html .
   ```
3. **Domain.** Metadata assumes `https://seyedismail.com`. If you use a different domain, replace it everywhere:
   ```bash
   grep -rl "https://seyedismail.com" . | xargs sed -i '' 's#https://seyedismail.com#https://YOUR-DOMAIN#g'   # macOS
   grep -rl "https://seyedismail.com" . | xargs sed -i 's#https://seyedismail.com#https://YOUR-DOMAIN#g'      # Linux
   ```

## Customising

### Replacing images
Placeholders are SVGs named after the image they stand in for, for example `assets/projects/travel-sailo/checkout.svg`. To replace one:

1. Export your image at the size listed in the checklist (2× is fine). Use **WebP or JPG**, under about 300 KB.
2. Save it in the same folder, for example `checkout.webp`.
3. In the HTML, change the `src` (and the `width`/`height` if the aspect ratio differs). Update the `alt` text to describe the screen, for example *"Travel Sailo payment page showing fare summary and Tabby option"*.

Images already use `loading="lazy"`, apart from each case study's hero image, which loads eagerly.

### Your portrait
Replace `assets/images/portrait.svg` with a 4:5 photo (1200×1500) and update the `src` in `index.html` (About section).

### Colours, type and spacing
Everything is controlled by the variables at the top of `css/style.css`:

```css
:root {
  --bg: #080808;  --bg-2: #111111;  --card: #171717;
  --accent: #FF3B30;  --accent-2: #FF4700;
  --text: #FFFFFF;  --text-2: #A1A1AA;
  --fs-hero: clamp(2.6rem, 5.2vw, 4.75rem);
  …
}
```

### Text content
All copy is plain, semantic HTML. Each section of `index.html` begins with a comment banner such as `<!-- ===== WORK ===== -->`, so you can find it quickly.

- **Add a project card:** copy an `<article class="project-card">` block in the Work section. Set `data-categories` to any of `product mobile web branding` (space-separated) so the filters include it. Filter counts update automatically.
- **Add a case study:** duplicate `projects/fireboost.html` (the simplest one), rename it, and edit it. The left-hand contents list is built from the `<section class="cs-section">` blocks. Add a matching `<li>` link in the `<aside class="cs-toc">` for each new section.
- **Evidence badges:** use these to show where each claim comes from:
  `<span class="src src--verified">Documented in CV</span>`, `src--measured` (measured, figure to add), `src--expected` (expected, not yet measured), `src--verify` (needs checking).

### CV
Replace `assets/cv/Seyed_Ismail_Senior_Product_Designer_CV.pdf` with your latest version, keeping the same file name, and every Download button will pick it up. *(The current PDF still says "10+ yrs" and "Aug 2025 – Present". See the checklist.)*

## Contact form

The form works on any static host without setup. With no endpoint set, it validates the fields and then opens the visitor's email app with the message already written, addressed to `sismail77@gmail.com`.

To receive messages directly instead (recommended), connect a form service:

**Formspree** (free tier)
1. Create a form at formspree.io and copy its endpoint, for example `https://formspree.io/f/abcdwxyz`.
2. In `index.html`, set it on the form: `<form class="form" data-contact-form data-endpoint="https://formspree.io/f/abcdwxyz" …>`
3. Submit a test message and confirm the address Formspree asks you to verify.

**Netlify Forms** (if you host on Netlify): add `name="contact" data-netlify="true"` to the `<form>` and set `data-endpoint="/"`. Netlify expects URL-encoded data, so either use Formspree, or change the `fetch` body in `js/interactions.js` to `new URLSearchParams({ "form-name": "contact", ...data })` with the header `Content-Type: application/x-www-form-urlencoded`.

A hidden honeypot field filters out simple spam bots.

## Deploying

**Netlify / Vercel / Cloudflare Pages** (easiest): drag the folder onto Netlify Drop (app.netlify.com/drop), or connect a Git repository. There's no build command, and the publish directory is the project root.

**GitHub Pages:** push the folder to a repository, then go to *Settings → Pages → Deploy from branch → main / root*.

**Any web host (cPanel, FTP):** upload the folder contents to `public_html/` (or your web root). On Apache, add this to `.htaccess` to use the custom 404 page and enable caching:
```apache
ErrorDocument 404 /404.html
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

**Custom domain:** point the domain at your host following their instructions, enable HTTPS, then update the domain in metadata (step 3 above) and in `robots.txt` / `sitemap.xml`.

After going live, submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console, and test social sharing with LinkedIn's Post Inspector.

## Motion, accessibility and performance

- **Reduced motion:** with *prefers-reduced-motion* turned on, all animation is switched off and content appears immediately.
- **No-JS:** the content is fully readable without JavaScript. Reveal animations only hide content while JS is running.
- **Keyboard:** skip link, visible focus rings, Escape closes the mobile menu, and the accordion and filters are real `<button>`s with `aria-expanded`/`aria-pressed`.
- The custom cursor, magnetic buttons and 3D tilt are enabled only on mouse/trackpad devices.
- **Loading:** the loader shows only on the first visit in a session and never longer than about 1.6 seconds.
- **Weight:** CSS + JS under 100 KB uncompressed, fonts about 70 KB, with no external requests.
- GSAP and Three.js were deliberately **not** used. IntersectionObserver, CSS 3D transforms and requestAnimationFrame cover every effect at a fraction of the weight. If you later want a WebGL hero, add it only to the hero and lazy-load it.

## SEO

Each page has a unique title and meta description aimed at searches such as *Senior Product Designer Dubai*, *Lead Product Designer*, *UX Strategist* and *Travel / Fintech Product Designer*. Pages also include canonical URLs, Open Graph/Twitter cards (`assets/images/og-image.png`, 1200×630), `Person` structured data on the homepage, a sitemap and robots.txt.
