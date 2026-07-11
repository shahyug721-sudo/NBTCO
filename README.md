# New Bharat Trading Co. — website

Static site (recolored to the SIW blue / red / navy scheme). No build step.

## Files
- `index.html` — homepage (animated nuts & bolts hero)
- `about.html`, `products.html`, `product.html`, `category.html`, `contact.html`
- `site.css`, `site.js`, `catalog.js` — shared styles, chrome (nav/footer), product data
- `support.js` — runtime the homepage depends on
- `assets/` — product & industry images

## Push to GitHub
```bash
cd site-export
git init
git add .
git commit -m "New Bharat Trading Co. website"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy on Vercel
1. Go to vercel.com → **Add New… → Project**.
2. Import the GitHub repo you just pushed.
3. Framework preset: **Other**. Build command: *none*. Output directory: leave blank (root).
4. **Deploy**. Vercel serves `index.html` at the root automatically.

That's it — it's a plain static site, so no environment variables or build config are needed.
