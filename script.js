/* NEONCODE · Quantum Terminal — Phase 2 behavior */
(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");

  /* ---------- Night / Day Mode ---------- */
  function readTheme() {
    try { return localStorage.getItem("neoncode-theme"); } catch (e) { return null; }
  }
  function saveTheme(value) {
    try { localStorage.setItem("neoncode-theme", value); } catch (e) { /* storage unavailable */ }
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☾" : "☀";
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to day mode" : "Switch to night mode");
    }
  }

  var saved = readTheme();
  if (saved !== "dark" && saved !== "light") {
    saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  applyTheme(saved);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) setMenu(false);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function setActive() {
    var y = window.scrollY + 120;
    var current = null;
    targets.forEach(function (sec) { if (sec.offsetTop <= y) current = sec; });
    links.forEach(function (a) {
      var on = current && a.getAttribute("href") === "#" + current.id;
      a.classList.toggle("active", !!on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Contact form (opens mail app) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var fields = {
      name: { el: document.getElementById("name"), err: document.getElementById("nameError") },
      email: { el: document.getElementById("email"), err: document.getElementById("emailError") },
      message: { el: document.getElementById("message"), err: document.getElementById("messageError") }
    };
    var note = document.getElementById("formNote");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function check(key) {
      var f = fields[key];
      var v = f.el.value.trim();
      var msg = "";
      if (!v) msg = "This field is required.";
      else if (key === "email" && !emailRe.test(v)) msg = "Please enter a valid email address.";
      else if (key === "message" && v.length < 10) msg = "Please write at least 10 characters.";
      f.err.textContent = msg;
      f.el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener("blur", function () { check(key); });
      fields[key].el.addEventListener("input", function () {
        if (fields[key].el.getAttribute("aria-invalid") === "true") check(key);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;
      Object.keys(fields).forEach(function (key) {
        if (!check(key)) { ok = false; if (!firstBad) firstBad = fields[key].el; }
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      var name = fields.name.el.value.trim();
      var email = fields.email.el.value.trim();
      var message = fields.message.el.value.trim();
      var subject = "Portfolio message from " + name;
      var body = message + "\n\n--\n" + name + "\n" + email;
      window.location.href = "mailto:syedazubda3@gmail.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (note) note.textContent = "Opening your email app. If nothing opens, write to syedazubda3@gmail.com directly.";
    });
  }
})();
