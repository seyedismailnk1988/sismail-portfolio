/* ==========================================================================
   animations.js — scroll-driven motion using IntersectionObserver + rAF.
   No GSAP needed: everything here is light enough for native APIs.
   Respects prefers-reduced-motion (reveals still resolve, nothing moves).
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var SITE = window.SITE || {};
    var reduced = SITE.reducedMotion;

    /* ---------- Reveal on scroll ---------- */
    var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-img], [data-inview]");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-inview"); });
    }

    // Stagger children: <div data-stagger> children get incremental delays
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = parseFloat(group.getAttribute("data-stagger")) || 0.07;
      Array.prototype.forEach.call(group.querySelectorAll("[data-reveal]"), function (el, i) {
        el.style.setProperty("--delay", (i * step).toFixed(2) + "s");
      });
    });

    /* ---------- Count-up numbers ---------- */
    var counters = document.querySelectorAll("[data-count]");
    function runCount(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduced) { el.textContent = prefix + target + suffix; return; }
      var start = null, dur = 1600;
      function frame(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }

    /* ---------- Scroll-linked progress (timeline, process line, case-study bar) ---------- */
    var timeline = document.querySelector(".timeline");
    var tlProgress = document.querySelector(".timeline__progress");
    var processLine = document.querySelector(".process__line");
    var csBar = document.querySelector(".cs-progress");
    var parallax = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));

    function onScroll() {
      var vh = window.innerHeight;
      if (timeline && tlProgress) {
        var r = timeline.getBoundingClientRect();
        var p = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1);
        tlProgress.style.setProperty("--progress", (p * 100).toFixed(1) + "%");
      }
      if (processLine) {
        var pr = processLine.getBoundingClientRect();
        var pp = Math.min(Math.max((vh * 0.85 - pr.top) / (vh * 0.5), 0), 1);
        processLine.style.setProperty("--p", pp.toFixed(3));
      }
      if (csBar) {
        var h = document.documentElement.scrollHeight - vh;
        csBar.style.setProperty("--p", h > 0 ? (window.scrollY / h).toFixed(4) : 0);
      }
      if (!reduced) {
        parallax.forEach(function (el) {
          var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
          var rect = el.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > vh + 200) return;
          var offset = Math.max(-60, Math.min(60, (rect.top + rect.height / 2 - vh / 2) * speed));
          el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
        });
      }
    }
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    /* ---------- Timeline: mark roles as they enter view ---------- */
    if ("IntersectionObserver" in window) {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("is-inview"); });
      }, { rootMargin: "0px 0px -40% 0px" });
      document.querySelectorAll(".role").forEach(function (el) { rio.observe(el); });
    }

    /* ---------- Case-study table of contents ---------- */
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".cs-toc a"));
    if (tocLinks.length && "IntersectionObserver" in window) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          tocLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
        });
      }, { rootMargin: "-30% 0px -65% 0px" });
      tocLinks.forEach(function (a) {
        var t = document.getElementById(a.getAttribute("href").slice(1));
        if (t) tio.observe(t);
      });
    }

    /* ---------- Hero 3D stage follows the pointer ---------- */
    var scene = document.querySelector(".stage__scene");
    var hero = document.querySelector(".hero");
    if (scene && hero && !reduced && SITE.finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        scene.style.setProperty("--ry", (-16 + x * 18).toFixed(2) + "deg");
        scene.style.setProperty("--rx", (8 - y * 12).toFixed(2) + "deg");
      });
      hero.addEventListener("pointerleave", function () {
        scene.style.setProperty("--ry", "-16deg");
        scene.style.setProperty("--rx", "8deg");
      });
    }
  });
})();
