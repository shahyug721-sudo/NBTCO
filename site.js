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

  /* ---- small inline icons ----------------------------------------------- */
  var IC = {
    phone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.21 2.2z"/></svg>',
    mail: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2.24V18h16V6.24l-8 5.99-8-5.99z"/></svg>',
    clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    star: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.86-5-4.87 7.1-1.01z"/></svg>',
    wa: '<svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.32-1.96 1.36-.5.05-.98.23-3.3-.69-2.79-1.1-4.57-3.94-4.71-4.12-.14-.18-1.13-1.5-1.13-2.86 0-1.36.71-2.03.97-2.31.24-.26.53-.32.71-.32.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.57.79 1.96.86 2.1.07.14.12.3.02.48-.09.18-.14.29-.28.45-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.18-.21.68-.79.86-1.07.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.21.5.32.07.11.07.66-.17 1.34z"/></svg>',
    up: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>',
    arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>',
  };

  function backBtn(href, variant) {
    return '<a class="backbtn backbtn--' + variant + '" href="' + href + '" data-back>' +
      IC.arrow + 'Back</a>';
  }

  /* ---- chrome: utility bar + nav + footer ------------------------------- */
  function buildUtilBar() {
    return '' +
      '<div class="ubar"><div class="wrap">' +
        '<div class="ubar__left">' +
          '<a href="' + telHref() + '">' + IC.phone + esc(SITE.phone) + '</a>' +
          '<a class="ubar__email" href="mailto:' + SITE.email + '">' + IC.mail + esc(SITE.email) + '</a>' +
          '<span class="ubar__hours">' + IC.clock + esc(SITE.hours) + '</span>' +
        '</div>' +
        '<span class="ubar__badge">' + IC.star + 'Authorised Unbrako Stockist</span>' +
      '</div></div>';
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
    var cats = CATEGORIES.slice(0, 6).map(function (c) {
      return '<li><a href="category.html?cat=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + '</a></li>';
    }).join("");
    return '' +
      '<footer class="foot"><div class="wrap">' +
        '<div class="foot__cols">' +
          '<div>' +
            '<div class="foot__brand2"><span class="nav__dot"></span><span>' +
              esc(SITE.short.toUpperCase()) + '</span></div>' +
            '<p>' + esc(SITE.tagline) + '</p>' +
            '<p>' + esc(SITE.address) + '</p>' +
          '</div>' +
          '<div><h4>Explore</h4><ul>' +
            '<li><a href="products.html">All Products</a></li>' +
            '<li><a href="products.html#categories">Product Range</a></li>' +
            '<li><a href="about.html">About Us</a></li>' +
            '<li><a href="contact.html">Contact</a></li>' +
          '</ul></div>' +
          '<div><h4>Our Range</h4><ul>' + cats + '</ul></div>' +
          '<div class="foot__contact"><h4>Get in touch</h4><ul>' +
            '<li><a href="' + telHref() + '">' + esc(SITE.phone) + '</a></li>' +
            '<li><a href="mailto:' + SITE.email + '">' + esc(SITE.email) + '</a></li>' +
            '<li><a href="' + waHref(null) + '" target="_blank" rel="noopener">WhatsApp us</a></li>' +
            '<li>' + esc(SITE.hours) + '</li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="foot__bottom">' +
          '<p class="foot__meta">© ' + SITE.estd + '–2026 · ' + esc(SITE.name) + ' · Nagdevi, Mumbai</p>' +
          '<div class="foot__badges">' +
            '<span class="foot__badge">DIN</span><span class="foot__badge">ISO</span>' +
            '<span class="foot__badge">IS</span><span class="foot__badge">ASTM</span>' +
          '</div>' +
        '</div>' +
      '</div></footer>';
  }

  function buildFabs() {
    return '' +
      '<div class="fab-stack">' +
        '<button class="fab fab--top" data-top aria-label="Back to top">' + IC.up + '</button>' +
        '<a class="fab fab--wa" href="' + waHref(null) + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + IC.wa + '</a>' +
      '</div>';
  }

  function mountChrome(active) {
    var nm = document.querySelector("[data-nav-mount]");
    if (nm) nm.innerHTML = buildUtilBar() + buildNav(active);
    var fm = document.querySelector("[data-footer-mount]");
    if (fm) fm.innerHTML = buildFooter();
    // burger toggle
    var burger = document.querySelector(".nav__burger");
    var menu = document.querySelector(".nav__links");
    if (burger && menu) burger.addEventListener("click", function () { menu.classList.toggle("is-open"); });

    // back button on the page-header band (product page injects its own)
    var ph = document.querySelector(".phead .wrap");
    if (ph) {
      var fallback = active === "range" ? "products.html" : "index.html";
      ph.insertAdjacentHTML("afterbegin", backBtn(fallback, "dark"));
    }

    // floating action buttons
    document.body.insertAdjacentHTML("beforeend", buildFabs());
    var topBtn = document.querySelector("[data-top]");
    if (topBtn) {
      topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
      var onScroll = function () { topBtn.classList.toggle("is-shown", window.pageYOffset > 420); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // delegated back-navigation
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-back]");
      if (b && history.length > 1) { e.preventDefault(); history.back(); }
    });
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
        backBtn("products.html", "light") +
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
        backBtn("category.html?cat=" + p.category, "light") +
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
