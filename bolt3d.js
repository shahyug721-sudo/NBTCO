/* =========================================================================
   New Bharat Trading Company — 3D hero bolt
   Desktop only. three.js is fetched ONLY when the guards pass, so phones
   never download it. If anything fails, the hero simply renders without it.
   ========================================================================= */
(function () {
  "use strict";

  var host = document.getElementById("nbt-bolt3d");
  if (!host) return;

  // ---- guards ------------------------------------------------------------
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 901) return;                 // phones/tablets stay fast
  if (!hasWebGL()) return;

  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  // ---- load three.js on demand -------------------------------------------
  if (window.THREE) { init(); }
  else {
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.async = true;
    s.onload = init;
    s.onerror = function () { /* silent — hero is fine without the bolt */ };
    document.head.appendChild(s);
  }

  function init() {
    var THREE = window.THREE;
    if (!THREE) return;

    // The slot is display:none until now — reveal it FIRST, otherwise it
    // measures 0x0 and there'd be nothing to size the canvas to.
    host.classList.add("is-on");
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) { host.classList.remove("is-on"); return; }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { host.classList.remove("is-on"); return; }

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    try {
      if (THREE.ACESFilmicToneMapping) renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    } catch (e) {}
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 9.6);

    // studio environment so the steel actually reflects
    try {
      var pmrem = new THREE.PMREMGenerator(renderer);
      var env = new THREE.Scene();
      env.background = new THREE.Color(0xdfe6f5);
      var panel = function (x, y, z, sx, sy, col, mul) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color: col }));
        m.material.color.multiplyScalar(mul);
        m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
      };
      panel(0, 8, 5, 16, 10, 0xffffff, 1.0);
      panel(-8, 2, 4, 8, 14, 0xaebfff, 0.85);
      panel(8, -3, 4, 8, 14, 0xffd7a8, 0.5);
      scene.environment = pmrem.fromScene(env, 0.04).texture;
    } catch (e) {}

    // ---- the bolt ---------------------------------------------------------
    var steel = new THREE.MeshStandardMaterial({ color: 0xccd1d9, metalness: 1.0, roughness: 0.22 });
    var bolt = new THREE.Group();

    var head = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.8, 6), steel);
    head.position.y = 2.45; head.rotation.y = Math.PI / 6; bolt.add(head);

    var washer = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.18, 0.22, 40), steel);
    washer.position.y = 2.0; bolt.add(washer);

    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 4.2, 48), steel);
    shaft.position.y = -0.1; bolt.add(shaft);

    function Helix(r, turns, hh, y0) { THREE.Curve.call(this); this.r = r; this.turns = turns; this.hh = hh; this.y0 = y0; }
    Helix.prototype = Object.create(THREE.Curve.prototype);
    Helix.prototype.constructor = Helix;
    Helix.prototype.getPoint = function (t) {
      var a = t * this.turns * Math.PI * 2;
      return new THREE.Vector3(this.r * Math.cos(a), this.y0 - t * this.hh, this.r * Math.sin(a));
    };
    var thread = new THREE.Mesh(new THREE.TubeGeometry(new Helix(0.64, 24, 3.9, 1.85), 420, 0.1, 10, false), steel);
    bolt.add(thread);

    var tip = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.05, 0.55, 48), steel);
    tip.position.y = -2.47; bolt.add(tip);

    bolt.rotation.z = 0.45;
    scene.add(bolt);

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(5, 7, 6); scene.add(key);
    var rim = new THREE.DirectionalLight(0x8fb0ff, 1.3); rim.position.set(-6, -2, -5); scene.add(rim);

    // ---- cursor tilt ------------------------------------------------------
    var tx = 0, ty = 0;
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
    }, { passive: true });

    // ---- pause when the hero is off-screen (saves CPU/battery) ------------
    var running = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { running = en[0].isIntersecting; }, { threshold: 0 }).observe(host);
    }

    window.addEventListener("resize", function () {
      var W = host.clientWidth, H = host.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
    });

    function loop() {
      requestAnimationFrame(loop);
      if (!running) return;
      bolt.rotation.y += 0.006;
      bolt.rotation.x += ((-ty) - bolt.rotation.x) * 0.05;
      bolt.position.x += ((tx * 0.6) - bolt.position.x) * 0.05;
      renderer.render(scene, camera);
    }
    loop();
  }
})();
