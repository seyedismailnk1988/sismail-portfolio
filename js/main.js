/* ==========================================================================
   main.js — core site behaviour: loader, navigation, page transitions
   Plain JavaScript, no dependencies. Loaded with `defer` on every page.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var SITE = (window.SITE = window.SITE || {});
  SITE.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  SITE.finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Loader ---------- */
  function finishLoading() {
    var loader = document.querySelector(".loader");
    root.classList.add("is-loaded");
    if (loader) loader.classList.add("is-done");
  }
  // Only show the loader on the first visit of the session, and never wait long.
  var seen = false;
  try { seen = sessionStorage.getItem("si-loaded") === "1"; sessionStorage.setItem("si-loaded", "1"); } catch (e) {}
  if (seen || SITE.reducedMotion) {
    finishLoading();
  } else {
    var done = false;
    var go = function () { if (!done) { done = true; setTimeout(finishLoading, 350); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    window.addEventListener("load", go);
    setTimeout(go, 1600); // hard cap
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Year ---------- */
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Mobile menu ---------- */
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.getElementById("mobile-menu");
    function setMenu(open) {
      if (!toggle || !menu) return;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }
    }
    if (toggle && menu) {
      toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
      });
      window.addEventListener("resize", function () { if (window.innerWidth > 960) setMenu(false); });
    }

    /* ---------- Hide nav on scroll down, show on scroll up ---------- */
    var nav = document.querySelector(".nav");
<<<<<<< HEAD
    var lastY = window.scrollY;
=======
    var heroEl = document.querySelector(".hero");
    var lastY = window.scrollY;
    function scrollState(y) {
      if (nav) nav.classList.toggle("is-scrolled", y > 40);
      if (heroEl) root.classList.toggle("past-hero", y > heroEl.offsetHeight * 0.7);
    }
    scrollState(lastY);
>>>>>>> 775ac49 (Updated portfolio website)
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
<<<<<<< HEAD
=======
        scrollState(y);
>>>>>>> 775ac49 (Updated portfolio website)
        if (nav && !(menu && menu.classList.contains("is-open"))) {
          nav.classList.toggle("is-hidden", y > lastY && y > 400);
        }
        lastY = y;
        ticking = false;
      });
    }, { passive: true });

    /* ---------- Active section indicator (homepage) ---------- */
<<<<<<< HEAD
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a[href*='#']"));
=======
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a[href*='#'], .rail a[href*='#']"));
>>>>>>> 775ac49 (Updated portfolio website)
    var sections = navLinks
      .map(function (a) { var id = a.getAttribute("href").split("#")[1]; return id && document.getElementById(id); })
      .filter(Boolean);
    if (sections.length && "IntersectionObserver" in window) {
      var setActive = function (id) {
        navLinks.forEach(function (a) {
          var active = a.getAttribute("href").split("#")[1] === id;
          a.classList.toggle("is-active", active);
          if (active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target.id); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { io.observe(s); });
    }

    /* ---------- Page transitions (internal .html links only) ---------- */
    if (!SITE.reducedMotion) {
      document.addEventListener("click", function (e) {
        var a = e.target.closest("a");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (a.target === "_blank" || a.hasAttribute("download")) return;
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:)/i.test(href)) return;
        var url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.hash) return; // same page anchor
        e.preventDefault();
        root.classList.add("is-leaving");
        setTimeout(function () { location.href = a.href; }, 380);
      });
      // Restore when navigating back (bfcache)
      window.addEventListener("pageshow", function (e) { if (e.persisted) root.classList.remove("is-leaving"); });
    }
  });
})();
