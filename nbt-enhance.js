/* ==========================================================================
   NBT enhancement layer  —  New Bharat Trading Company
   Self-contained progressive enhancement. Runs independently of the builder
   runtime; never mutates existing product/contact markup.
   Adds: brand preloader, count-up stats, magnetic buttons, scroll-progress
   "thread", and a Fastener Finder that hands off to WhatsApp.
   ========================================================================== */
(function () {
  "use strict";

  var WA = "919867833131";                 // WhatsApp / phone — unchanged
  var TEL = "+919867833131";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = !window.matchMedia || window.matchMedia("(pointer: fine)").matches;

  var MARK =
    '<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs><linearGradient id="nbtSteelJs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16299c"/><stop offset="1" stop-color="#0a1352"/></linearGradient></defs>' +
    '<polygon points="60,32 46,7.8 18,7.8 4,32 18,56.2 46,56.2" fill="url(#nbtSteelJs)"/>' +
    '<polygon points="46,7.8 18,7.8 4,32 55,32 43.5,12.1 20.5,12.1" fill="#fff" opacity="0.06"/>' +
    '<polygon points="55,32 43.5,12.1 20.5,12.1 9,32 20.5,51.9 43.5,51.9" fill="none" stroke="#e30613" stroke-width="2.1" stroke-linejoin="round"/>' +
    '<polygon points="43,32 37.5,22.5 26.5,22.5 21,32 26.5,41.5 37.5,41.5" fill="#e30613"/></svg>';

  var WA_ICON =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.4-3.15-.66-2.66-1.06-4.3-3.79-4.43-3.97-.13-.18-1.05-1.4-1.05-2.67 0-1.27.67-1.9.9-2.16.24-.26.52-.32.7-.32.17 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.8 2 .87 2.14.07.14.12.31.02.5-.09.18-.14.29-.28.45-.14.16-.29.35-.42.47-.14.13-.28.28-.12.55.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.13.45.2.51.31.07.11.07.63-.17 1.31z"/></svg>';

  var started = false;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function boot() {
    if (started) return;
    started = true;
    try { preloader(); } catch (e) {}
    try { scrollThread(); } catch (e) {}
    try { buildFinder(); } catch (e) {}
    // Give the React runtime a moment to hydrate before touching its nodes.
    setTimeout(function () {
      try { countUp(); } catch (e) {}
      try { magnetic(); } catch (e) {}
    }, 400);
  }

  /* ---- helpers ---------------------------------------------------------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  // The page scrolls inside a 100vh overflow container, not the window.
  function findScroller() {
    var best = null, max = 0, divs = document.querySelectorAll("div");
    for (var i = 0; i < divs.length; i++) {
      var d = divs[i], cs = getComputedStyle(d);
      if ((cs.overflowY === "auto" || cs.overflowY === "scroll") &&
          d.scrollHeight > d.clientHeight + 60 && d.clientHeight > max) {
        max = d.clientHeight; best = d;
      }
    }
    return best;
  }

  /* ---- 1. brand preloader ---------------------------------------------- */
  function preloader() {
    if (REDUCE) return;
    if (sessionStorage.getItem("nbtSeen")) return;   // once per session
    var pre = el("div", { id: "nbt-preloader" });
    pre.appendChild(el("div", { class: "nbt-pre-mark" }, MARK));
    pre.appendChild(el("div", { class: "nbt-pre-word" }, "NEW BHARAT TRADING CO."));
    var track = el("div", { class: "nbt-pre-track" });
    track.appendChild(el("div", { class: "nbt-pre-bar" }));
    pre.appendChild(track);
    document.body.appendChild(pre);
    sessionStorage.setItem("nbtSeen", "1");
    var done = false;
    function hide() {
      if (done) return; done = true;
      pre.classList.add("nbt-hide");
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 650);
    }
    window.addEventListener("load", function () { setTimeout(hide, 500); });
    setTimeout(hide, 1900);   // hard cap — never trap the user
  }

  /* ---- 2. scroll-progress thread --------------------------------------- */
  function scrollThread() {
    var bar = el("div", { id: "nbt-thread" });
    var fill = el("div", { id: "nbt-thread-fill" });
    var head = el("div", { id: "nbt-thread-head" }, MARK);
    bar.appendChild(fill); bar.appendChild(head);
    document.body.appendChild(bar);
    var sc = findScroller() || document.scrollingElement || document.documentElement;
    var target = (sc === document.documentElement) ? window : sc;
    function update() {
      var top = sc.scrollTop || window.pageYOffset || 0;
      var h = (sc.scrollHeight || document.body.scrollHeight) - (sc.clientHeight || window.innerHeight);
      var pct = h > 0 ? Math.min(1, Math.max(0, top / h)) : 0;
      fill.style.height = (pct * 100) + "%";
      head.style.top = (pct * 100) + "%";
      head.style.opacity = pct > 0.005 ? "1" : "0";
    }
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- 3. count-up stats ------------------------------------------------ */
  function countUp() {
    var about = document.getElementById("about");
    if (!about) return;
    // Match on COMPUTED style — React normalises inline styles on hydration,
    // so raw style-attribute substrings (#c40512, letter-spacing:-1px) won't match.
    var nodes = Array.prototype.slice.call(about.querySelectorAll("div")).filter(function (n) {
      if (n.children.length) return false;              // leaf text node only
      var cs = getComputedStyle(n);
      return parseFloat(cs.fontSize) >= 28 &&
             cs.color === "rgb(196, 5, 18)" &&           // brand red #c40512
             /\d/.test(n.textContent);
    });
    if (!nodes.length) return;
    nodes.forEach(function (n) {
      var raw = n.textContent.trim();
      var m = raw.match(/^([\d.]+)(.*)$/);
      if (!m) return;
      var target = parseFloat(m[1]);
      var suffix = m[2] || "";
      var decimals = (m[1].indexOf(".") > -1) ? 1 : 0;
      var isYear = decimals === 0 && target >= 1900 && !suffix;
      var start = isYear ? target - 30 : 0;
      if (REDUCE) { n.textContent = raw; return; }
      var comma = !isYear;   // years render plain (1996, not 1,996)
      n.textContent = fmt(start, decimals, comma) + suffix;
      n._nbtRun = function () {
        var t0 = null, dur = 1500;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = start + (target - start) * eased;
          n.textContent = fmt(val, decimals, comma) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else n.textContent = raw;
        }
        requestAnimationFrame(step);
      };
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.target._nbtRun) { e.target._nbtRun(); e.target._nbtRun = null; io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { if (n._nbtRun) io.observe(n); });
  }
  function fmt(v, d, comma) {
    if (d) return v.toFixed(1);
    return comma ? Math.round(v).toLocaleString("en-IN") : String(Math.round(v));
  }

  /* ---- 4. magnetic buttons --------------------------------------------- */
  function magnetic() {
    if (REDUCE || !FINE) return;
    var targets = document.querySelectorAll("[data-nbt-magnetic]");
    targets.forEach(function (b) {
      b.style.transition = "transform .25s cubic-bezier(.2,.7,.2,1)";
      b.style.willChange = "transform";
      b.addEventListener("mousemove", function (ev) {
        var r = b.getBoundingClientRect();
        var mx = ev.clientX - (r.left + r.width / 2);
        var my = ev.clientY - (r.top + r.height / 2);
        b.style.transform = "translate(" + (mx * 0.3) + "px," + (my * 0.4) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = "translate(0,0)"; });
    });
  }

  /* ---- 5. Fastener Finder → WhatsApp ------------------------------------ */
  var TYPES = ["Bolts & Screws", "Socket Screws", "Nuts", "Washers", "Machine Screws",
    "Self-Tapping / Self-Drilling", "Threaded Rods", "Anchor Fasteners",
    "Special Material (SS / HDG / Alloy)", "Bearings", "Not sure — need help"];
  var SIZES = ["M2", "M3", "M4", "M5", "M6", "M8", "M10", "M12", "M14", "M16", "M20", "M24",
    "M30", "M36", "Above M36", "Inch / BSW / UNC / BSF", "Not sure"];
  var STDS = ["DIN", "ISO", "IS", "ASTM / ANSI", "Not sure"];
  var GRADES = ["Mild / Carbon steel", "High-tensile 8.8", "High-tensile 10.9",
    "High-tensile 12.9", "Stainless SS 304", "Stainless SS 316",
    "Hot-dip galvanized", "Brass", "Not sure"];

  function opts(list) {
    return '<option value="" selected disabled>Select…</option>' +
      list.map(function (v) { return '<option>' + v + '</option>'; }).join("");
  }
  function field(label, id, list) {
    return '<div class="nbt-field"><label for="' + id + '">' + label + '</label>' +
      '<select id="' + id + '">' + opts(list) + '</select></div>';
  }

  function buildFinder() {
    // Launcher
    var launch = el("button", { id: "nbt-launch", type: "button", "aria-label": "Get a fastener quote on WhatsApp" });
    launch.innerHTML = '<span class="nbt-launch-pulse"></span>' + WA_ICON + '<span>Get a Quote</span>';
    document.body.appendChild(launch);

    // Inner pages inject their own WhatsApp FAB stack (bottom-right) via site.js.
    // Sit above it so the two don't overlap.
    function adjustLaunch() {
      if (document.querySelector(".fab-stack")) launch.style.bottom = "150px";
    }
    adjustLaunch();
    setTimeout(adjustLaunch, 800);

    // Modal
    var modal = el("div", { id: "nbt-modal", role: "dialog", "aria-modal": "true", "aria-label": "Fastener Finder" });
    modal.innerHTML =
      '<div class="nbt-card" role="document">' +
        '<div class="nbt-card-head">' +
          '<span class="nbt-mark">' + MARK + '</span>' +
          '<div><h3>Fastener Finder</h3><p>Tell us what you need — we\'ll confirm stock &amp; price on WhatsApp.</p></div>' +
          '<button class="nbt-card-close" type="button" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="nbt-card-body">' +
          field("Product", "nbt-type", TYPES) +
          field("Size", "nbt-size", SIZES) +
          field("Standard", "nbt-std", STDS) +
          field("Material / Grade", "nbt-grade", GRADES) +
          '<div class="nbt-field"><label for="nbt-qty">Quantity</label><input id="nbt-qty" type="text" placeholder="e.g. 500 pcs / 10 kg" autocomplete="off"></div>' +
          '<div class="nbt-field"><label for="nbt-name">Your name</label><input id="nbt-name" type="text" placeholder="Optional" autocomplete="name"></div>' +
          '<div class="nbt-field nbt-full"><label for="nbt-note">Notes</label><input id="nbt-note" type="text" placeholder="Application, finish, drive, delivery city…" autocomplete="off"></div>' +
        '</div>' +
        '<div class="nbt-card-foot">' +
          '<button class="nbt-send" type="button">' + WA_ICON + ' Send on WhatsApp</button>' +
          '<div class="nbt-alt">or call <a href="tel:' + TEL + '">+91 98678 33131</a> · Mon–Sat</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var card = modal.querySelector(".nbt-card");
    function open() { modal.classList.add("nbt-open"); var f = modal.querySelector("#nbt-type"); if (f) setTimeout(function () { f.focus(); }, 60); }
    function close() { modal.classList.remove("nbt-open"); launch.focus(); }

    launch.addEventListener("click", open);
    modal.querySelector(".nbt-card-close").addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("nbt-open")) close(); });

    modal.querySelector(".nbt-send").addEventListener("click", function () {
      var v = function (id) { var n = modal.querySelector(id); return n && n.value ? n.value : ""; };
      var lines = ["Hello New Bharat Trading Co., I'd like a quotation:", ""];
      var map = [["Product", "#nbt-type"], ["Size", "#nbt-size"], ["Standard", "#nbt-std"],
                 ["Material/Grade", "#nbt-grade"], ["Quantity", "#nbt-qty"], ["Notes", "#nbt-note"]];
      map.forEach(function (p) { var val = v(p[1]); if (val) lines.push("• " + p[0] + ": " + val); });
      var name = v("#nbt-name"); if (name) lines.push("", "— " + name);
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
      close();
    });
  }
})();
