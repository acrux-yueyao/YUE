/* ── Editorial portfolio: router · reveals · kinetic type ── */
(function () {
  var VIEWS = ["home", "god-shift", "govai", "negotiated", "mycelium", "contact"];
  var body = document.body;
  var pages = document.querySelectorAll(".page");
  body.classList.add("js");

  /* reveal on scroll */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  function revealActive() {
    var vh = window.innerHeight;
    document.querySelectorAll(".page.active .reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.96) el.classList.add("in");
    });
  }

  function scrollToId(id) {
    var t = document.getElementById(id);
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function show(view, push, anchor) {
    if (VIEWS.indexOf(view) === -1) view = "home";
    body.setAttribute("data-view", view);
    pages.forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-page") === view); });

    if (!anchor) { window.scrollTo(0, 0); }
    revealActive();
    if (anchor) { requestAnimationFrame(function () { scrollToId(anchor); }); }

    if (push && location.hash !== "#" + view) history.pushState({ view: view }, "", "#" + view);
    document.title = (view === "home" ? "Yue Yao" : titleOf(view) + " — Yue Yao") + " · HCI Researcher";
  }

  function titleOf(v) {
    return { "god-shift": "GOD SHIFT", "govai": "GOV.AI",
      "negotiated": "Negotiated Understanding", "mycelium": "The Whisper Network",
      "contact": "Contact" }[v] || "Yue Yao";
  }

  /* nav handling: [data-view] swaps view; #anchor scrolls within home */
  document.querySelectorAll("a[data-view], a.nav-about").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var view = el.getAttribute("data-view");
      var href = el.getAttribute("href") || "";
      var anchor = href.charAt(0) === "#" ? href.slice(1) : "";

      if (!view) {                       // About link → home + scroll
        show("home", true, anchor && anchor !== "home" ? anchor : null);
        return;
      }
      var inPage = anchor && anchor !== "home" && anchor !== view &&
                   document.getElementById(anchor) ? anchor : null;
      show(view, true, inPage);
    });
  });

  window.addEventListener("popstate", function () {
    show((location.hash || "#home").slice(1), false);
  });

  show((location.hash || "#home").slice(1), false);

  /* kinetic hero weight, linked to scroll */
  var kinEls = document.querySelectorAll(".kin");
  if (kinEls.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 640);
        var w = 340 + (y / 640) * 240;      // 340 → 580
        document.documentElement.style.setProperty("--kin-wght", w.toFixed(0));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* language toggle */
  var KEY = "yy-lang";
  var root = document.documentElement;
  var btn = document.getElementById("langToggle");
  function applyLang(lang) {
    root.setAttribute("lang", lang);
    btn.textContent = lang === "zh" ? "EN" : "中文";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  var saved; try { saved = localStorage.getItem(KEY); } catch (e) {}
  applyLang(saved === "zh" ? "zh" : "en");
  btn.addEventListener("click", function () {
    applyLang(root.getAttribute("lang") === "zh" ? "en" : "zh");
  });
})();
