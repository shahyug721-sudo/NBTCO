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
    var body = product
      ? "Hello " + SITE.name + ",\r\n\r\nPlease send availability and a quote for:\r\n" +
        "Product: " + product.name + "\r\n" +
        "Standard: " + product.standard + "\r\n" +
        "Size / grade: \r\nQuantity: \r\n\r\nThank you."
      : "";
    // Gmail compose POPUP (overlay), address pre-filled in To, subject left blank.
    return "https://mail.google.com/mail/u/0/?tf=cm&to=" + encodeURIComponent(SITE.email) +
           (body ? "&body=" + encodeURIComponent(body) : "");
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

  /* ---- chrome: utility bar + nav + footer ------------------------------- */
  function buildUtilBar() {
    return '' +
      '<div data-navtop style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;padding:8px 32px;background:linear-gradient(90deg,#0a1aa8,#0f24c8 55%,#0a1aa8);">' +
        '<span style="justify-self:start;font:600 10.5px/1 Jost;letter-spacing:2px;color:#aeb9ee;">NAGDEVI · MUMBAI</span>' +
        '<span style="justify-self:center;font:600 11px/1 Jost;letter-spacing:2.4px;color:#e3e8fb;white-space:nowrap;"><span style="color:#ff5a63;">EST. ' + esc(SITE.estd) + '</span> · STAINLESS &amp; HIGH-TENSILE FASTENERS</span>' +
        '<a href="mailto:' + esc(SITE.email) + '" style="justify-self:end;font:600 11px/1 Jost;letter-spacing:1.4px;color:#e3e8fb;text-decoration:none;">' + esc(SITE.email.toUpperCase()) + '</a>' +
      '</div>';
  }

  /* ---- chrome: nav + footer --------------------------------------------- */
  function buildNav(active) {
    var links = [
      { href: "index.html", label: "Home", key: "home" },
      { href: "products.html", label: "Products", key: "products" },
      { href: "about.html", label: "About Us", key: "about" },
      { href: "contact.html", label: "Contact Us", key: "contact" },
    ];
    var act = ({ range: "products" })[active] || active;
    var items = links.map(function (l) {
      var col = l.key === act ? "#e30613" : "#0e1a66";
      return '<a data-navlink href="' + l.href + '" style="font:600 12px/1 Jost;letter-spacing:1.8px;text-transform:uppercase;color:' + col + ';text-decoration:none;transition:color .2s;">' + l.label + '</a>';
    }).join("");
    var circle = 'width:38px;height:38px;border-radius:50%;background:#e30613;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;transition:background .2s,transform .2s;';
    var svgWa = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"/></svg>';
    var svgCall = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>';
    var svgMail = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2.24V18h16V6.24l-8 5.99-8-5.99z"/></svg>';
    return '' +
      '<nav style="position:sticky;top:0;z-index:100;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(0,0,0,.08);">' +
        '<div data-navmain style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;padding:15px 32px;max-width:1400px;margin:0 auto;">' +
          '<a href="index.html" style="justify-self:start;display:flex;align-items:center;gap:10px;text-decoration:none;">' +
            '<img src="assets/logo-mark.svg" alt="New Bharat Trading Co." style="width:32px;height:32px;display:block;">' +
            '<span style="font:600 13px/1 Jost;letter-spacing:2.5px;color:#0e1a66;">' + esc(SITE.short.toUpperCase()) + '</span>' +
          '</a>' +
          '<div style="justify-self:center;display:flex;align-items:center;gap:32px;">' + items + '</div>' +
          '<div style="justify-self:end;display:flex;align-items:center;gap:10px;">' +
            '<a href="' + waHref(null) + '" target="_blank" rel="noopener" aria-label="WhatsApp" style="' + circle + '">' + svgWa + '</a>' +
            '<a href="' + telHref() + '" aria-label="Call" style="' + circle + '">' + svgCall + '</a>' +
            '<a href="' + enquireHref(null) + '" target="_blank" rel="noopener" aria-label="Email" style="' + circle + '">' + svgMail + '</a>' +
          '</div>' +
        '</div>' +
      '</nav>';
  }

  function buildFooter() {
    var cats = CATEGORIES.slice(0, 6).map(function (c) {
      return '<li><a href="category.html?cat=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + '</a></li>';
    }).join("");
    return '' +
      '<footer class="foot"><div class="foot__wm" aria-hidden="true">' + esc(SITE.short.toUpperCase()) + '</div><div class="wrap">' +
        '<div class="foot__cols">' +
          '<div>' +
            '<div class="foot__brand2"><span style="display:inline-flex;width:26px;height:26px;"><img src="assets/logo-mark-light.svg" alt="New Bharat Trading Co." style="width:26px;height:26px;display:block;"></span><span>' +
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

    // (back button is now rendered site-wide by nbt-enhance.js, below the nav)

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
        '<h1 style="font-weight:600;">Product not found</h1>' +
        '<p class="note"><a href="products.html">← Back to all products</a></p></div>';
      return;
    }
    document.title = p.name + " — " + SITE.name;

    var specs = p.specs.map(function (s) {
      return '<div><dt>' + esc(s.k) + '</dt><dd>' + esc(s.v) + '</dd></div>';
    }).join("") +
      '<div><dt>Material</dt><dd>' + esc(p.material) + '</dd></div>' +
      '<div><dt>Length range</dt><dd>' + esc(p.lengthRange) + '</dd></div>' +
      '<div><dt>Finish</dt><dd>' + esc(p.finish) + '</dd></div>';

    // standards list (from the standard string + grade + any "conforms to" spec)
    var stdItems = p.standard.split("·").map(function (s) { return s.trim(); }).filter(Boolean);
    stdItems.push(p.grade);
    var conf = p.specs.find(function (s) { return /conform/i.test(s.k); });
    if (conf) stdItems.push(conf.v + " — mechanical properties");
    var seen = {};
    var stdRows = stdItems.filter(function (s) {
      if (seen[s]) return false; seen[s] = 1; return true;
    }).map(function (s) {
      return '<div class="cfg__stdrow"><span class="cfg__stddot"></span>' + esc(s) + '</div>';
    }).join("");

    var sizeBtns = p.prices.map(function (r) {
      return '<button class="cfg__size" type="button" data-size="' + esc(r.size) + '">' + esc(r.size) + '</button>';
    }).join("");

    var svgWa = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.4-3.15-.66-2.66-1.06-4.3-3.79-4.43-3.97-.13-.18-1.05-1.4-1.05-2.67 0-1.27.67-1.9.9-2.16.24-.26.52-.32.7-.32.17 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.8 2 .87 2.14.07.14.12.31.02.5-.09.18-.14.29-.28.45-.14.16-.29.35-.42.47-.14.13-.28.28-.12.55.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.13.45.2.51.31.07.11.07.63-.17 1.31z"/></svg>';
    var svgMail = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2.24V18h16V6.24l-8 5.99-8-5.99z"/></svg>';
    var svgCall = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>';

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
        '<div class="cfg">' +
          '<div class="cfg__main">' +
            '<div class="cfg__top">' +
              '<div class="cfg__media"><img src="' + p.img + '" alt="' + esc(p.name) + '"></div>' +
              '<div>' +
                '<p class="cfg__cat">' + esc(catName(p.category)) + '</p>' +
                '<h1 class="cfg__title">' + esc(p.name) + '</h1>' +
                '<p class="cfg__blurb">' + esc(p.blurb) + '</p>' +
                '<div class="cfg__facts">' +
                  '<div><dt>Grade</dt><dd>' + esc(p.grade.replace(/property class/i, "").trim()) + '</dd></div>' +
                  '<div><dt>Range</dt><dd>' + esc(p.sizeRange) + '</dd></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="cfg__tabs">' +
              '<button class="cfg__tab on" type="button" data-tab="build">Build enquiry</button>' +
              '<button class="cfg__tab" type="button" data-tab="specs">Specifications</button>' +
              '<button class="cfg__tab" type="button" data-tab="std">Standards</button>' +
            '</div>' +
            '<div class="cfg__panel on" data-panel="build">' +
              '<p class="cfg__hint">Tap the sizes you need — they drop into your enquiry on the right.</p>' +
              '<div class="cfg__sizes">' + sizeBtns + '</div>' +
              '<p class="cfg__note">Other sizes, grades, materials and finishes made to order.</p>' +
            '</div>' +
            '<div class="cfg__panel" data-panel="specs">' +
              '<dl class="specs">' + specs + '</dl>' +
            '</div>' +
            '<div class="cfg__panel" data-panel="std">' + stdRows + '</div>' +
          '</div>' +
          '<aside class="cfg__rail">' +
            '<h3 class="cfg__railh">Your enquiry</h3>' +
            '<p class="cfg__railsub">Build a list and send it — we reply with an official quotation, stock &amp; delivery.</p>' +
            '<div class="cfg__list" data-list><div class="cfg__empty">No sizes yet.<br>Tap sizes to add them here.</div></div>' +
            '<p class="cfg__count" data-count><b>0</b> lines selected</p>' +
            '<div class="cfg__rbtns">' +
              '<a class="cfg__rbtn cfg__rbtn--wa" data-wa target="_blank" rel="noopener">' + svgWa + 'Send on WhatsApp</a>' +
              '<a class="cfg__rbtn cfg__rbtn--mail" data-mail target="_blank" rel="noopener">' + svgMail + 'Email quotation</a>' +
              '<a class="cfg__rbtn cfg__rbtn--call" href="' + telHref() + '">' + svgCall + 'Call ' + esc(SITE.phone) + '</a>' +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div></div>' + relatedBlock;

    wireConfigurator(host, p);
  }

  /* ---- product configurator: tabs + enquiry builder + fixed message ----- */
  function quoteMessage(p, sizes) {
    var sizeLine = sizes.length ? sizes.join(", ") : "(please specify)";
    return "Hello " + SITE.name + "," + "\r\n\r\n" +
      "I would like to request an official quotation for the following:" + "\r\n\r\n" +
      "Product: " + p.name + "\r\n" +
      "Grade: " + p.grade + "\r\n" +
      "Standard: " + p.standard + "\r\n" +
      "Size(s): " + sizeLine + "\r\n" +
      "Quantity: " + "\r\n\r\n" +
      "Kindly share your best pricing, available stock and estimated delivery time." + "\r\n\r\n" +
      "Thank you.";
  }

  function wireConfigurator(host, p) {
    // tabs
    host.querySelectorAll(".cfg__tab").forEach(function (t) {
      t.addEventListener("click", function () {
        host.querySelectorAll(".cfg__tab").forEach(function (x) { x.classList.remove("on"); });
        host.querySelectorAll(".cfg__panel").forEach(function (x) { x.classList.remove("on"); });
        t.classList.add("on");
        host.querySelector('.cfg__panel[data-panel="' + t.getAttribute("data-tab") + '"]').classList.add("on");
      });
    });

    var listEl = host.querySelector("[data-list]");
    var countEl = host.querySelector("[data-count]");
    var waEl = host.querySelector("[data-wa]");
    var mailEl = host.querySelector("[data-mail]");
    var chosen = []; // preserves order

    function render() {
      listEl.innerHTML = "";
      if (!chosen.length) {
        listEl.innerHTML = '<div class="cfg__empty">No sizes yet.<br>Tap sizes to add them here.</div>';
      } else {
        chosen.forEach(function (s) {
          var row = document.createElement("div");
          row.className = "cfg__item";
          row.innerHTML = '<span class="cfg__itemname">' + esc(s) + '</span><span class="cfg__x" title="Remove">✕</span>';
          row.querySelector(".cfg__x").addEventListener("click", function () {
            chosen = chosen.filter(function (x) { return x !== s; });
            render();
          });
          listEl.appendChild(row);
        });
      }
      countEl.innerHTML = "<b>" + chosen.length + "</b> line" + (chosen.length === 1 ? "" : "s") + " selected";
      host.querySelectorAll(".cfg__size").forEach(function (b) {
        b.classList.toggle("on", chosen.indexOf(b.getAttribute("data-size")) !== -1);
      });
      var msg = quoteMessage(p, chosen);
      waEl.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(msg);
      mailEl.href = "https://mail.google.com/mail/u/0/?tf=cm&to=" + encodeURIComponent(SITE.email) +
        "&body=" + encodeURIComponent(msg);
    }

    host.querySelectorAll(".cfg__size").forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-size");
        if (chosen.indexOf(s) === -1) chosen.push(s);
        else chosen = chosen.filter(function (x) { return x !== s; });
        render();
      });
    });
    render();
  }

  /* ---- generic mounts (used on home/about/contact) ---------------------- */
  function mountLists() {
    var cg = document.querySelector("[data-category-list]");
    if (cg) cg.innerHTML = CATEGORIES.map(categoryCard).join("");
    var fg = document.querySelector("[data-featured-list]");
    if (fg) fg.innerHTML = PRODUCTS.filter(function (p) { return p.featured; }).map(productCard).join("");
    // contact links
    document.querySelectorAll("[data-enquire]").forEach(function (el) { el.href = enquireHref(null); el.target = "_blank"; el.rel = "noopener"; });
    document.querySelectorAll("[data-tel]").forEach(function (el) { el.href = telHref(); });
    document.querySelectorAll("[data-email]").forEach(function (el) {
      el.href = enquireHref(null); el.target = "_blank"; el.rel = "noopener"; el.textContent = SITE.email;
    });
    document.querySelectorAll("[data-wa]").forEach(function (el) { el.href = waHref(null); });
    document.querySelectorAll("[data-site-address]").forEach(function (el) { el.textContent = SITE.address; });
    document.querySelectorAll("[data-site-hours]").forEach(function (el) { el.textContent = SITE.hours; });
    document.querySelectorAll("[data-site-phone]").forEach(function (el) { el.textContent = SITE.phone; });
  }

  /* ============================================================
     Motion  ·  scroll reveal (02) + split headline (03) +
     magnetic CTAs (04) + sticky scroll story (06).
     Self-contained — no external dependencies. The homepage
     (index.html) does not load site.js, so it stays untouched.
     ============================================================ */
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var els = document.querySelectorAll(".card, .ccard, .stat, .pill, .specs, .ptable");
    els.forEach(function (el) { if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", ""); });
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var sibs = [].slice.call(el.parentNode.querySelectorAll(":scope > [data-reveal]"));
      var i = sibs.indexOf(el);
      el.style.transitionDelay = (Math.max(0, i) * 0.08) + "s";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  }

  function splitEl(el) {
    var out = "";
    [].forEach.call(el.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok.trim() === "") { out += tok; return; }
          out += '<span class="w"><i>' + tok + '</i></span>';
        });
      } else if (node.nodeName === "BR") {
        out += "<br>";
      } else {
        var tag = node.tagName.toLowerCase();
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok.trim() === "") { out += tok; return; }
          out += '<span class="w"><i><' + tag + '>' + tok + '</' + tag + '></i></span>';
        });
      }
    });
    el.innerHTML = out;
    el.querySelectorAll(".w > i").forEach(function (i, idx) { i.style.transitionDelay = (idx * 0.05) + "s"; });
  }

  function initSplit() {
    var heads = document.querySelectorAll(".phead h1");
    heads.forEach(splitEl);
    // headers sit above the fold — play on load
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heads.forEach(function (el) { el.classList.add("in"); }); });
    });
  }

  function initMagnetic() {
    if (REDUCE || !window.matchMedia("(pointer:fine)").matches) return;
    document.querySelectorAll(".btn--primary, .nav__cta").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (x * 0.3).toFixed(1) + "px," + (y * 0.45).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  function initScrollStory() {
    var prog = document.getElementById("prog");
    if (!prog) return;
    var bolt = document.getElementById("progBolt");
    var bar = document.getElementById("progBar");
    var titleEl = document.getElementById("progTitle");
    var bodyEl = document.getElementById("progBody");
    var dots = prog.querySelectorAll(".prog__dots b");
    var steps;
    try { steps = JSON.parse(prog.getAttribute("data-steps")); } catch (e) { steps = null; }
    if (!steps || !steps.length) return;
    var cur = -1, ticking = false;
    function upd() {
      var r = prog.getBoundingClientRect();
      var total = prog.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / (total || 1)));
      if (bar) bar.style.width = (p * 100) + "%";
      if (bolt && !REDUCE) bolt.style.transform = "rotate(" + (p * 220).toFixed(1) + "deg)";
      var idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      if (idx !== cur) {
        cur = idx;
        if (titleEl) titleEl.textContent = steps[idx].t;
        if (bodyEl) bodyEl.textContent = steps[idx].b;
        dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
      }
    }
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { upd(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---- parallax + inertia (StringTune-style, attribute driven) ----------
     Native scroll, refined by a smoothing (lerp) formula. Elements drift
     at different speeds as they cross the viewport, giving layered depth.

       data-parallax="0.14"          vertical speed factor
       data-parallax-x="0.1"         optional horizontal drift
       data-parallax-mode="scroll"   lag the whole scroll (use for hero
                                     bands that scroll away); default is
                                     "center" — 0 offset when centred, so
                                     nothing looks displaced on load.
     A global intensity scales every speed. Images are auto-hooked so the
     part drifts within its frame. Respects prefers-reduced-motion.
     --------------------------------------------------------------------- */
  var PARALLAX_INTENSITY = 1.0; // 1.0 == "moderate" (intensity 5 of 10)

  function initParallax() {
    if (REDUCE) return;
    var items = [];
    function add(el, sy, sx, mode) {
      el.style.willChange = "transform";
      el.style.backfaceVisibility = "hidden";
      items.push({ el: el, sy: sy, sx: sx || 0, mode: mode || "center", cy: 0, cx: 0 });
    }
    // explicit hooks
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var sy = parseFloat(el.getAttribute("data-parallax"));
      if (isNaN(sy)) sy = 0.12;
      var sx = parseFloat(el.getAttribute("data-parallax-x"));
      add(el, sy, isNaN(sx) ? 0 : sx, el.getAttribute("data-parallax-mode"));
    });
    // auto: transparent product art drifts within its dark frame
    document.querySelectorAll(".card__img img, .pd__media img").forEach(function (img) {
      add(img, 0.075, 0, "center");
    });
    if (!items.length) return;

    var run = true;
    function frame() {
      if (!run) return;
      var vh = window.innerHeight, vw = window.innerWidth;
      var sc = window.pageYOffset;
      for (var i = 0; i < items.length; i++) {
        var it = items[i], r = it.el.getBoundingClientRect();
        var far = r.bottom < -240 || r.top > vh + 240;
        var ty, tx = 0;
        if (it.mode === "scroll") {
          ty = sc * it.sy * PARALLAX_INTENSITY;
          tx = sc * it.sx * PARALLAX_INTENSITY;
        } else {
          var d = (r.top + r.height / 2) - vh / 2;
          ty = -d * it.sy * PARALLAX_INTENSITY;
          tx = -d * it.sx * PARALLAX_INTENSITY;
        }
        if (far) { it.cy = ty; it.cx = tx; } // snap while off-screen — no lag catch-up
        else { it.cy += (ty - it.cy) * 0.1; it.cx += (tx - it.cx) * 0.1; }
        it.el.style.transform = "translate3d(" + it.cx.toFixed(2) + "px," + it.cy.toFixed(2) + "px,0)";
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    window.addEventListener("pagehide", function () { run = false; });
  }

  function initMotion() {
    document.body.classList.add("motion-ready");
    if (!REDUCE) { initReveal(); initSplit(); initParallax(); }
    initMagnetic();
    initScrollStory();
  }

  /* ---- boot ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var active = document.body.getAttribute("data-active") || "";
    mountChrome(active);
    mountLists();
    initProductsPage();
    initCategoryPage();
    initProductPage();
    initMotion();
  });
})();
