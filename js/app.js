/* ══ Yue Yao OS ══════════════════════════════════════════════
   scramble text · iPod cover-flow + click wheel · dock · clock
   ════════════════════════════════════════════════════════════ */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── menubar clock ── */
  var clock = document.getElementById("clock");
  function tick() {
    var d = new Date();
    clock.textContent = String(d.getHours()).padStart(2, "0") + ":" +
                        String(d.getMinutes()).padStart(2, "0");
  }
  tick(); setInterval(tick, 15000);

  /* ── scramble text ── */
  var GLYPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>-_/[]{}=+*^?#$%01".split("");
  function scramble(el) {
    var lang = root.getAttribute("lang") || "en";
    var target = el.dataset[lang] || el.dataset.en || "";
    if (reduce) { el.textContent = target; el.dataset.done = "1"; return; }
    var reveal = target.split("").map(function (c, i) {
      return { c: c, at: Math.floor(Math.random() * 14) + Math.floor(i * 0.55) };
    });
    var f = 0, max = Math.max(target.length * 0.6, 18) + 14;
    clearInterval(el._t);
    el._t = setInterval(function () {
      var out = "";
      for (var i = 0; i < reveal.length; i++) {
        var r = reveal[i];
        if (r.c === " ") out += " ";
        else if (f >= r.at) out += r.c;
        else out += GLYPH[Math.floor(Math.random() * GLYPH.length)];
      }
      el.textContent = out;
      if (f++ > max) { el.textContent = target; clearInterval(el._t); }
    }, 40);
    el.dataset.done = "1";
  }
  var scrambles = document.querySelectorAll(".scramble");
  if ("IntersectionObserver" in window && !reduce) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !e.target.dataset.done) { scramble(e.target); so.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    scrambles.forEach(function (el) { so.observe(el); });
  } else {
    scrambles.forEach(function (el) { el.textContent = el.dataset.en || ""; el.dataset.done = "1"; });
  }

  /* initial hash: hard jump (smooth-scroll on load gets cancelled) */
  function hashJump() {
    if (!location.hash) return;
    var ht = document.getElementById(location.hash.slice(1));
    if (ht) ht.scrollIntoView({ behavior: "instant" });
  }
  setTimeout(hashJump, 80);
  window.addEventListener("load", function () { setTimeout(hashJump, 120); });

  /* ── section navigation ── */
  document.querySelectorAll("[data-go]").forEach(function (el) {
    el.addEventListener("click", function () {
      var t = document.getElementById(el.getAttribute("data-go"));
      if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ── iPod cover-flow ── */
  var albums = Array.prototype.slice.call(document.querySelectorAll(".album"));
  var idx = 0;
  var idxEl = document.getElementById("scr-idx");
  var npCat = document.getElementById("np-cat"),
      npTitle = document.getElementById("np-title"),
      npCn = document.getElementById("np-cn"),
      npLinks = document.getElementById("np-links");

  function layout() {
    albums.forEach(function (a) {
      var o = a.dataset.i - idx, ax = Math.abs(o), t;
      if (o === 0) t = "translateX(0) translateZ(46px) scale(1)";
      else t = "translateX(" + (o * 66) + "px) rotateY(" + (o > 0 ? -38 : 38) + "deg) scale(" + (ax === 1 ? .82 : .62) + ")";
      a.style.transform = t;
      a.style.opacity = ax > 2 ? 0 : (o === 0 ? 1 : ax === 1 ? .7 : .32);
      a.style.zIndex = 10 - ax;
      a.classList.toggle("is-center", o === 0);
    });
    var cur = albums[idx], d = cur.dataset;
    idxEl.textContent = String(idx + 1).padStart(2, "0");
    var catWord = { "Playable Game": { en: "Playable Game", zh: "可玩游戏" },
      "Research through Design": { en: "Research through Design", zh: "研究性设计" },
      "Exhibition": { en: "Exhibition", zh: "展览" },
      "Interactive Installation": { en: "Interactive Installation", zh: "交互装置" } }[d.cat];
    var lang = root.getAttribute("lang") || "en";
    npCat.textContent = (catWord ? catWord[lang] : d.cat) + " · " + d.year;
    npTitle.textContent = d.title;
    npCn.textContent = d.cn;
    npLinks.innerHTML = "";
    if (d.demo) npLinks.appendChild(mkLink(d.demo, d.demolabel || "Open", false));
    if (d.case) npLinks.appendChild(mkLink(d.case, lang === "zh" ? "案例" : "Case", true));
  }
  function mkLink(href, label, alt) {
    var a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener";
    a.textContent = label; if (alt) a.className = "alt";
    return a;
  }
  function setIdx(n) { idx = Math.max(0, Math.min(albums.length - 1, n)); layout(); }
  function step(d) { setIdx(idx + d); }

  layout();

  /* wheel: rotary drag + zones + keyboard */
  var wheel = document.getElementById("wheel");
  var dragging = false, lastAng = 0, accum = 0;
  var STEP = 0.52; // radians per album
  function angleAt(e) {
    var r = wheel.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  }
  wheel.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".w-center") || e.target.closest("[data-go]") || e.target.closest("[data-wheel]")) return;
    dragging = true; lastAng = angleAt(e); accum = 0;
    wheel.setPointerCapture(e.pointerId);
  });
  wheel.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var a = angleAt(e), d = a - lastAng;
    if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
    accum += d; lastAng = a;
    while (accum >= STEP) { step(1); accum -= STEP; }
    while (accum <= -STEP) { step(-1); accum += STEP; }
  });
  wheel.addEventListener("pointerup", function () { dragging = false; });
  wheel.addEventListener("pointercancel", function () { dragging = false; });

  document.querySelectorAll("[data-wheel]").forEach(function (el) {
    el.addEventListener("click", function () { step(el.getAttribute("data-wheel") === "next" ? 1 : -1); });
  });
  document.getElementById("wcenter").addEventListener("click", function () {
    var d = albums[idx].dataset; if (d.demo) window.open(d.demo, "_blank", "noopener");
  });
  window.addEventListener("keydown", function (e) {
    if (document.getElementById("ipod").getBoundingClientRect().top > window.innerHeight ||
        document.getElementById("ipod").getBoundingClientRect().bottom < 0) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Enter") { var d = albums[idx].dataset; if (d.demo) window.open(d.demo, "_blank", "noopener"); }
  });

  /* app icons + dock apps jump to an album */
  document.querySelectorAll("[data-album]").forEach(function (el) {
    el.addEventListener("click", function () {
      setIdx(parseInt(el.getAttribute("data-album"), 10));
      document.getElementById("ipod").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });

  /* ── language toggle ── */
  var KEY = "yy-lang", btn = document.getElementById("langToggle");
  function applyLang(lang) {
    root.setAttribute("lang", lang);
    btn.textContent = lang === "zh" ? "EN" : "中文";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.querySelectorAll(".scramble[data-done]").forEach(scramble);
    layout();
  }
  var saved; try { saved = localStorage.getItem(KEY); } catch (e) {}
  applyLang(saved === "zh" ? "zh" : "en");
  btn.addEventListener("click", function () {
    applyLang(root.getAttribute("lang") === "zh" ? "en" : "zh");
  });
})();
