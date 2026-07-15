/* =========================================================================
   New Bharat Trading Company — hero pixel-ripple canvas
   A grid of small squares that bloom outward from the centre in a wave,
   then shimmer. Vanilla port of the canvas physics engine (no framework).
   Cheap canvas-2D — safe on phones. Respects prefers-reduced-motion.
   ========================================================================= */
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  var wrap = document.getElementById("nbt-pixels");
  if (!hero || !wrap) return;

  var canvas = document.createElement("canvas");
  wrap.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // slate-blue so it reads on the LIGHT hero, with the brand red as a spark
  var COLORS = ["#8ea0c6", "#8ea0c6", "#7387b4", "#5f74a6", "#e30613"];
  var GAP = window.innerWidth < 700 ? 12 : 10;   // keeps the rect count sane
  var SPEED = 30;

  var pixels = [];
  var raf = 0;
  var last = 0;
  var running = true;
  var FRAME = 1000 / 60;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function Pixel(x, y, color, speed, delay) {
    this.x = x; this.y = y; this.color = color;
    this.speed = rand(0.08, 0.4) * speed;
    this.size = 0;
    this.sizeStep = rand(0.12, 0.28);
    this.minSize = 0.5;
    this.maxSizeInt = 2;
    this.maxSize = rand(0.5, 2);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008;
    this.isShimmer = false;
    this.isReverse = false;
  }
  Pixel.prototype.draw = function () {
    var offset = this.maxSizeInt * 0.5 - this.size * 0.5;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + offset, this.y + offset, this.size, this.size);
  };
  Pixel.prototype.shimmer = function () {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    this.size += this.isReverse ? -this.speed : this.speed;
  };
  Pixel.prototype.appear = function () {
    if (this.counter <= this.delay) { this.counter += this.counterStep; return; }
    if (this.size >= this.maxSize) this.isShimmer = true;
    if (this.isShimmer) this.shimmer();
    else this.size += this.sizeStep;
    this.draw();
  };

  function build() {
    var r = wrap.getBoundingClientRect();
    var w = Math.floor(r.width), h = Math.floor(r.height);
    if (!w || !h) return false;
    canvas.width = w; canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    var speed = REDUCE ? 0 : Math.min(SPEED, 100) * 0.001;
    pixels = [];
    for (var x = 0; x < w; x += GAP) {
      for (var y = 0; y < h; y += GAP) {
        var color = COLORS[Math.floor(Math.random() * COLORS.length)];
        var dx = x - w / 2, dy = y - h / 2;
        // radial stagger => the wave expands outward from the centre
        var delay = REDUCE ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(new Pixel(x, y, color, speed, delay));
      }
    }
    return true;
  }

  function paintStatic() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < pixels.length; i++) {
      pixels[i].size = pixels[i].maxSize;
      pixels[i].draw();
    }
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!running) return;
    if (now - last < FRAME) return;
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < pixels.length; i++) pixels[i].appear();
  }

  function start() {
    if (!build()) return;
    cancelAnimationFrame(raf);
    if (REDUCE) { paintStatic(); return; }
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  start();

  // rebuild on resize (debounced)
  var t;
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () {
      clearTimeout(t);
      t = setTimeout(start, 200);
    }).observe(wrap);
  }

  // pause when the hero is off-screen — saves CPU/battery
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      running = en[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }
})();
