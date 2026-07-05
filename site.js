/* =========================================================================
   New Bharat Trading Company — shared site logic
   Builds the nav + footer, and renders product/category lists & detail.
   Depends on catalog.js (SITE, CATEGORIES, PRODUCTS) loaded first.
   ========================================================================= */
(function () {
  "use strict";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var qs = function (k) { return new URLSearchParams(location.search).get(k); };
  var catName = function (slug) {
    var c = CATEGORIES.find(function (x) { return x.slug === slug; });
    return c ? c.name : slug;
  };

  /* ---- enquiry / call links --------------------------------------------- */
  function enquireHref(product) {
    var subj = product
      ? "Enquiry: " + product.name
      : "Enquiry from website";
    var body = product
      ? "Hello " + SITE.name + ",%0D%0A%0D%0APlease send availability and a quote for:%0D%0A" +
        "Product: " + encodeURIComponent(product.name) + "%0D%0A" +
        "Standard: " + encodeURIComponent(product.standard) + "%0D%0A" +
        "Size / grade: %0D%0AQuantity: %0D%0A%0D%0AThank you."
      : "";
    return "mailto:" + SITE.email + "?subject=" + encodeURIComponent(subj) +
           (body ? "&body=" + body : "");
  }
  function telHref() { return "tel:" + SITE.phone.replace(/[^+\d]/g, ""); }
  function waHref(product) {
    var t = product ? "Enquiry about " + product.name : "Enquiry from website";
    return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(t);
  }

  /* ---- chrome: nav + footer --------------------------------------------- */
  function buildNav(active) {
    var links = [
      { href: "products.html", label: "Products", key: "products" },
      { href: "products.html#categories", label: "Range", key: "range" },
      { href: "about.html", label: "About", key: "about" },
      { href: "contact.html", label: "Contact", key: "contact" },
    ];
    var items = links.map(function (l) {
      var on = l.key === active ? " is-active" : "";
      return '<a class="nav__link' + on + '" href="' + l.href + '">' + l.label + "</a>";
    }).join("");

    return '' +
      '<nav class="nav">' +
        '<a class="nav__brand" href="index.html">' +
          '<span class="nav__dot"></span>' +
          '<span class="nav__name">' + esc(SITE.short.toUpperCase()) + '</span>' +
        '</a>' +
        '<button class="nav__burger" aria-label="Menu"><span></span><span></span><span></span></button>' +
        '<div class="nav__links">' + items +
          '<a class="nav__cta" href="' + enquireHref(null) + '">GET A QUOTE</a>' +
        '</div>' +
      '</nav>';
  }

  function buildFooter() {
    return '' +
      '<footer class="foot"><div class="wrap">' +
        '<div class="foot__brand"><span class="nav__dot"></span><span>' +
          esc(SITE.short.toUpperCase()) + '</span></div>' +
        '<p class="foot__meta">© ' + SITE.estd + '–2026 · ' + esc(SITE.tagline) +
          ' · Nagdevi, Mumbai · DIN · ISO · IS · ASTM</p>' +
      '</div></footer>';
  }

  function mountChrome(active) {
    var nm = document.querySelector("[data-nav-mount]");
    if (nm) nm.innerHTML = buildNav(active);
    var fm = document.querySelector("[data-footer-mount]");
    if (fm) fm.innerHTML = buildFooter();
    // burger toggle
    var burger = document.querySelector(".nav__burger");
    var menu = document.querySelector(".nav__links");
    if (burger && menu) burger.addEventListener("click", function () { menu.classList.toggle("is-open"); });
  }

  /* ---- card markup ------------------------------------------------------ */
  function productCard(p) {
    return '' +
      '<a class="card" href="product.html?id=' + encodeURIComponent(p.slug) + '">' +
        '<div class="card__img"><img src="' + p.img + '" alt="' + esc(p.name) + '"></div>' +
        '<div class="card__body">' +
          '<p class="card__cat">' + esc(catName(p.category)) + '</p>' +
          '<h3 class="card__name">' + esc(p.name) + '</h3>' +
          '<p class="card__std">' + esc(p.standard) + '</p>' +
          '<span class="card__cta">View details →</span>' +
        '</div>' +
      '</a>';
  }

  function categoryCard(c) {
    var count = PRODUCTS.filter(function (p) { return p.category === c.slug; }).length;
    return '' +
      '<a class="ccard" href="category.html?cat=' + encodeURIComponent(c.slug) + '">' +
        '<div class="ccard__no">' + esc(c.no) + '</div>' +
        '<h3 class="ccard__name">' + esc(c.name) + '</h3>' +
        '<p class="ccard__blurb">' + esc(c.blurb) + '</p>' +
        '<span class="ccard__cta">' + count + ' product' + (count === 1 ? "" : "s") + ' →</span>' +
      '</a>';
  }

  /* ---- PRODUCTS PAGE: search + category filter -------------------------- */
  function initProductsPage() {
    var gridEl = document.querySelector("[data-product-grid]");
    if (!gridEl) return;
    var searchEl = document.querySelector("[data-search]");
    var chipsEl = document.querySelector("[data-chips]");

    // build chips
    var current = qs("cat") || "all";
    var chipData = [{ slug: "all", name: "All" }].concat(CATEGORIES);
    chipsEl.innerHTML = chipData.map(function (c) {
      var on = c.slug === current ? " is-active" : "";
      return '<button class="chip' + on + '" data-cat="' + c.slug + '">' + esc(c.name) + "</button>";
    }).join("");

    var term = "";
    function render() {
      var list = PRODUCTS.filter(function (p) {
        var inCat = current === "all" || p.category === current;
        var t = term.trim().toLowerCase();
        var inTerm = !t ||
          p.name.toLowerCase().indexOf(t) > -1 ||
          p.standard.toLowerCase().indexOf(t) > -1 ||
          catName(p.category).toLowerCase().indexOf(t) > -1;
        return inCat && inTerm;
      });
      gridEl.innerHTML = list.length
        ? list.map(productCard).join("")
        : '';
      var emptyEl = document.querySelector("[data-empty]");
      if (emptyEl) emptyEl.style.display = list.length ? "none" : "block";
    }

    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      current = b.getAttribute("data-cat");
      chipsEl.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      render();
    });
    if (searchEl) searchEl.addEventListener("input", function () { term = searchEl.value; render(); });
    render();
  }

  /* ---- CATEGORY PAGE ---------------------------------------------------- */
  function initCategoryPage() {
    var host = document.querySelector("[data-category-page]");
    if (!host) return;
    var slug = qs("cat");
    var cat = CATEGORIES.find(function (c) { return c.slug === slug; });
    var titleEl = document.querySelector("[data-cat-title]");
    var eyebrowEl = document.querySelector("[data-cat-eyebrow]");
    var blurbEl = document.querySelector("[data-cat-blurb]");
    var gridEl = document.querySelector("[data-cat-grid]");

    if (!cat) {
      if (titleEl) titleEl.textContent = "Category not found";
      if (gridEl) gridEl.innerHTML = '<p class="empty">That category doesn\'t exist. <a href="products.html">See all products →</a></p>';
      return;
    }
    document.title = cat.name + " — " + SITE.name;
    if (eyebrowEl) eyebrowEl.textContent = "Range · " + cat.no;
    if (titleEl) titleEl.textContent = cat.name;
    if (blurbEl) blurbEl.textContent = cat.blurb;
    var list = PRODUCTS.filter(function (p) { return p.category === cat.slug; });
    gridEl.innerHTML = list.map(productCard).join("");
  }

  /* ---- PRODUCT DETAIL PAGE ---------------------------------------------- */
  function initProductPage() {
    var host = document.querySelector("[data-product-page]");
    if (!host) return;
    var slug = qs("id");
    var p = PRODUCTS.find(function (x) { return x.slug === slug; });
    if (!p) {
      host.innerHTML = '<div class="wrap" style="padding:80px 28px;text-align:center;">' +
        '<h1 style="font-weight:600;">Product not found</h1>' +
        '<p class="note"><a href="products.html">← Back to all products</a></p></div>';
      return;
    }
    document.title = p.name + " — " + SITE.name;

    var specs = p.specs.map(function (s) {
      return '<div><dt>' + esc(s.k) + '</dt><dd>' + esc(s.v) + '</dd></div>';
    }).join("");

    var hasPrices = p.prices.some(function (r) { return r.price && r.price !== "—"; });
    var rows = p.prices.map(function (r) {
      return '<tr><td>' + esc(r.size) + '</td><td>' +
        (r.price && r.price !== "—" ? "₹ " + esc(r.price) : "On enquiry") + '</td></tr>';
    }).join("");

    var priceBlock = '' +
      '<h2 class="sec-title">Indicative price list</h2>' +
      '<table class="ptable"><thead><tr><th>Size</th><th>₹ / 100 pcs</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      '<p class="note">' +
        (hasPrices
          ? 'Indicative list prices in INR per 100 pieces, exclusive of GST (Unbrako DFL-20, w.e.f. 1 April 2026). Subject to change — final pricing and availability confirmed on enquiry.'
          : 'Pricing for this product is confirmed on enquiry — send us your size, grade and quantity for a prompt quote.') +
      '</p>';

    // related
    var related = PRODUCTS.filter(function (x) { return x.category === p.category && x.slug !== p.slug; }).slice(0, 4);
    var relatedBlock = related.length ? '' +
      '<div class="section section--light" style="margin-top:64px;border-top:1px solid var(--line);"><div class="wrap">' +
        '<h2 class="sec-title">More in ' + esc(catName(p.category)) + '</h2>' +
        '<div class="grid grid--prod">' + related.map(productCard).join("") + '</div>' +
      '</div></div>' : "";

    host.innerHTML = '' +
      '<div class="pd"><div class="wrap">' +
        '<p class="crumb"><a href="products.html">Products</a> &nbsp;/&nbsp; ' +
          '<a href="category.html?cat=' + p.category + '">' + esc(catName(p.category)) + '</a> &nbsp;/&nbsp; ' +
          esc(p.name) + '</p>' +
        '<div class="pd__top">' +
          '<div class="pd__media"><img src="' + p.img + '" alt="' + esc(p.name) + '"></div>' +
          '<div>' +
            '<p class="pd__cat">' + esc(catName(p.category)) + '</p>' +
            '<h1 class="pd__name">' + esc(p.name) + '</h1>' +
            '<p class="pd__blurb">' + esc(p.blurb) + '</p>' +
            '<div class="tags">' +
              '<span class="tag">' + esc(p.standard) + '</span>' +
              '<span class="tag">' + esc(p.grade) + '</span>' +
              '<span class="tag">' + esc(p.sizeRange) + '</span>' +
            '</div>' +
            '<div class="btns">' +
              '<a class="btn btn--primary" href="' + enquireHref(p) + '">Enquire about this product</a>' +
              '<a class="btn btn--ghost" href="' + telHref() + '">Call us</a>' +
            '</div>' +
            '<dl class="specs">' + specs +
              '<div><dt>Material</dt><dd>' + esc(p.material) + '</dd></div>' +
              '<div><dt>Length range</dt><dd>' + esc(p.lengthRange) + '</dd></div>' +
              '<div><dt>Finish</dt><dd>' + esc(p.finish) + '</dd></div>' +
            '</dl>' +
            priceBlock +
          '</div>' +
        '</div>' +
      '</div></div>' + relatedBlock;
  }

  /* ---- generic mounts (used on home/about/contact) ---------------------- */
  function mountLists() {
    var cg = document.querySelector("[data-category-list]");
    if (cg) cg.innerHTML = CATEGORIES.map(categoryCard).join("");
    var fg = document.querySelector("[data-featured-list]");
    if (fg) fg.innerHTML = PRODUCTS.filter(function (p) { return p.featured; }).map(productCard).join("");
    // contact links
    document.querySelectorAll("[data-enquire]").forEach(function (el) { el.href = enquireHref(null); });
    document.querySelectorAll("[data-tel]").forEach(function (el) { el.href = telHref(); });
    document.querySelectorAll("[data-email]").forEach(function (el) {
      el.href = "mailto:" + SITE.email; el.textContent = SITE.email;
    });
    document.querySelectorAll("[data-wa]").forEach(function (el) { el.href = waHref(null); });
    document.querySelectorAll("[data-site-address]").forEach(function (el) { el.textContent = SITE.address; });
    document.querySelectorAll("[data-site-hours]").forEach(function (el) { el.textContent = SITE.hours; });
    document.querySelectorAll("[data-site-phone]").forEach(function (el) { el.textContent = SITE.phone; });
  }

  /* ---- boot ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var active = document.body.getAttribute("data-active") || "";
    mountChrome(active);
    mountLists();
    initProductsPage();
    initCategoryPage();
    initProductPage();
  });
})();
