/* ==========================================================================
   interactions.js — cursor, magnetic buttons, card tilt, project filters,
   experience accordion, design-process stepper and contact form.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var SITE = window.SITE || {};
    var reduced = SITE.reducedMotion;
    var fine = SITE.finePointer;

    /* ---------- Subtle custom cursor (mouse users only) ---------- */
    if (fine && !reduced) {
      var cursor = document.createElement("div");
      cursor.className = "cursor";
      cursor.setAttribute("aria-hidden", "true");
      document.body.appendChild(cursor);
      document.documentElement.classList.add("has-cursor");
      var cx = 0, cy = 0, tx = 0, ty = 0, running = false;
      function loop() {
        cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25;
        cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) requestAnimationFrame(loop); else running = false;
      }
      document.addEventListener("pointermove", function (e) {
        tx = e.clientX; ty = e.clientY;
        cursor.classList.add("is-visible");
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
      document.addEventListener("pointerleave", function () { cursor.classList.remove("is-visible"); });
      document.addEventListener("pointerover", function (e) {
        cursor.classList.toggle("is-hover", !!e.target.closest("a, button, [data-cursor]"));
      });
    }

    /* ---------- Magnetic buttons ---------- */
    if (fine && !reduced) {
      document.querySelectorAll("[data-magnetic]").forEach(function (el) {
        var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.3;
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          var x = e.clientX - (r.left + r.width / 2);
          var y = e.clientY - (r.top + r.height / 2);
          el.style.transform = "translate(" + (x * strength).toFixed(1) + "px," + (y * strength).toFixed(1) + "px)";
        });
        el.addEventListener("pointerleave", function () { el.style.transform = ""; });
      });
    }

    /* ---------- 3D tilt + glare on project cards ---------- */
    if (fine && !reduced) {
      document.querySelectorAll("[data-tilt]").forEach(function (card) {
        var inner = card.querySelector(".project-card__inner");
        var glare = card.querySelector(".project-card__glare");
        var max = parseFloat(card.getAttribute("data-tilt")) || 4;
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          if (inner) inner.style.transform = "perspective(1200px) rotateY(" + ((px - 0.5) * max).toFixed(2) + "deg) rotateX(" + ((0.5 - py) * max).toFixed(2) + "deg)";
          if (glare) { glare.style.setProperty("--gx", (px * 100).toFixed(1) + "%"); glare.style.setProperty("--gy", (py * 100).toFixed(1) + "%"); }
        });
        card.addEventListener("pointerleave", function () { if (inner) inner.style.transform = ""; });
      });
    }

    /* ---------- Project filters ---------- */
    var filterBar = document.querySelector("[data-filters]");
    if (filterBar) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-categories]"));
      var status = document.getElementById("filter-status");
      filterBar.querySelectorAll(".filter").forEach(function (btn) {
        var f = btn.getAttribute("data-filter");
        var n = f === "all" ? cards.length : cards.filter(function (c) { return c.getAttribute("data-categories").split(" ").indexOf(f) > -1; }).length;
        var span = document.createElement("span"); span.className = "count"; span.textContent = n; span.setAttribute("aria-hidden", "true");
        btn.appendChild(span);
      });
      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter");
        if (!btn) return;
        var f = btn.getAttribute("data-filter");
        filterBar.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var shown = 0;
        cards.forEach(function (card) {
          var match = f === "all" || card.getAttribute("data-categories").split(" ").indexOf(f) > -1;
          card.classList.toggle("is-hidden", !match);
          card.classList.remove("is-filtering");
          if (match) { void card.offsetWidth; card.classList.add("is-filtering"); shown++; }
        });
        if (status) status.textContent = "Showing " + shown + " project" + (shown === 1 ? "" : "s") + ".";
      });
    }

    /* ---------- Experience accordion ---------- */
    document.querySelectorAll(".role__head").forEach(function (head) {
      head.addEventListener("click", function () {
        var open = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!open));
      });
    });

    /* ---------- Design process stepper ---------- */
    var process = document.querySelector("[data-process]");
    if (process) {
      var steps = Array.prototype.slice.call(process.querySelectorAll(".step"));
      var detail = document.querySelector("[data-process-detail]");
      var autoplay = null;
      function select(i, fromUser) {
        steps.forEach(function (s, idx) {
          s.classList.toggle("is-active", idx === i);
          var b = s.querySelector(".step__btn");
          if (b) b.setAttribute("aria-pressed", String(idx === i));
        });
        var s = steps[i];
        if (detail && s) {
          detail.querySelector("[data-pd-num]").textContent = s.getAttribute("data-num");
          detail.querySelector("[data-pd-title]").textContent = s.getAttribute("data-title");
          detail.querySelector("[data-pd-text]").textContent = s.getAttribute("data-detail");
          var tags = detail.querySelector("[data-pd-tags]");
          tags.innerHTML = "";
          (s.getAttribute("data-tags") || "").split("|").forEach(function (t) {
            if (!t) return;
            var li = document.createElement("li"); li.className = "tag"; li.textContent = t; tags.appendChild(li);
          });
        }
        if (fromUser && autoplay) { clearInterval(autoplay); autoplay = null; }
      }
      steps.forEach(function (s, i) {
        var b = s.querySelector(".step__btn");
        if (b) b.addEventListener("click", function () { select(i, true); });
      });
      select(0);
      // Gentle autoplay while visible, stops on first interaction
      if (!reduced && "IntersectionObserver" in window) {
        var current = 0;
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && autoplay === null && current !== -1) {
              autoplay = setInterval(function () { current = (current + 1) % steps.length; select(current); }, 3800);
            } else if (!e.isIntersecting && autoplay) { clearInterval(autoplay); autoplay = null; }
          });
        }, { threshold: 0.4 }).observe(process);
        process.addEventListener("pointerdown", function () { current = -1; }, { once: true });
        process.addEventListener("keydown", function () { current = -1; if (autoplay) { clearInterval(autoplay); autoplay = null; } }, { once: true });
      }
    }

    /* ---------- Contact form ----------
<<<<<<< HEAD
       If the form has a data-endpoint (e.g. a Formspree URL) it POSTs there.
       Without one it falls back to opening the visitor's email app with the
       message pre-filled, so the form always works on static hosting. */
=======
       Delivers enquiries to your inbox from a static site — no server needed.

       data-provider="formsubmit" (default)
         Posts to FormSubmit (formsubmit.co), which emails a formatted message to
         data-to. The very first submission sends an activation email to that
         address: click "Activate Form" once and every later message is delivered.
       data-provider="emailjs"
         Sends through EmailJS using the branded HTML template in
         /email-template/portfolio-enquiry.html. Add data-emailjs-service,
         data-emailjs-template and data-emailjs-key to the <form>.
       If sending fails, the visitor's email app opens with the message ready. */
>>>>>>> 775ac49 (Updated portfolio website)
    var form = document.querySelector("[data-contact-form]");
    if (form) {
      var statusEl = form.querySelector(".form__status");
      var submitBtn = form.querySelector("[type='submit']");
      function setError(field, msg) {
        var wrap = field.closest(".field");
        var err = wrap && wrap.querySelector(".field__error");
        if (msg) { wrap.setAttribute("data-invalid", ""); field.setAttribute("aria-invalid", "true"); }
        else { wrap.removeAttribute("data-invalid"); field.removeAttribute("aria-invalid"); }
        if (err) err.textContent = msg || "";
      }
      function validate() {
        var ok = true, first = null;
        form.querySelectorAll("[required]").forEach(function (f) {
          var msg = "";
          if (!f.value.trim()) msg = "Please fill in this field.";
          else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) msg = "Please enter a valid email address.";
          setError(f, msg);
          if (msg) { ok = false; if (!first) first = f; }
        });
        if (first) first.focus();
        return ok;
      }
      form.querySelectorAll("input, textarea").forEach(function (f) {
<<<<<<< HEAD
        f.addEventListener("input", function () { if (f.closest(".field") && f.closest(".field").hasAttribute("data-invalid")) setError(f, ""); });
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        statusEl.className = "form__status"; statusEl.textContent = "";
        if (form.querySelector(".hp input") && form.querySelector(".hp input").value) return; // bot
        if (!validate()) return;
        var data = {
          name: form.name.value.trim(), email: form.email.value.trim(),
          company: form.company ? form.company.value.trim() : "", topic: form.topic ? form.topic.value : "",
          message: form.message.value.trim()
        };
        var endpoint = form.getAttribute("data-endpoint");
        if (!endpoint) {
          var to = form.getAttribute("data-mailto") || "sismail77@gmail.com";
          var subject = "Portfolio enquiry" + (data.topic ? " — " + data.topic : "") + " from " + data.name;
          var body = data.message + "\n\n— " + data.name + (data.company ? ", " + data.company : "") + "\n" + data.email;
          window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
          statusEl.classList.add("is-success");
          statusEl.textContent = "Your email app should open with the message ready to send. If it doesn't, email " + to + " directly.";
          return;
        }
=======
        f.addEventListener("input", function () { var w = f.closest(".field"); if (w && w.hasAttribute("data-invalid")) setError(f, ""); });
      });
      function mailtoFallback(d) {
        var to = form.getAttribute("data-mailto") || "sismail77@gmail.com";
        var body = d.message + "\n\n— " + d.name + (d.company ? ", " + d.company : "") + "\n" + d.email;
        window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(d.subject) + "&body=" + encodeURIComponent(body);
      }
      function send(d) {
        var provider = form.getAttribute("data-provider") || "formsubmit";
        if (provider === "emailjs") {
          return fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_id: form.getAttribute("data-emailjs-service"),
              template_id: form.getAttribute("data-emailjs-template"),
              user_id: form.getAttribute("data-emailjs-key"),
              template_params: { subject: d.subject, name: d.name, email: d.email, company: d.company || "—", topic: d.topic, message: d.message, sent_at: d.sentAt, page: d.page }
            })
          }).then(function (r) { if (!r.ok) throw new Error("EmailJS " + r.status); });
        }
        var to = form.getAttribute("data-to") || "sismail77@gmail.com";
        // Field names become the labels in the email, so they are written for people.
        return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(to), {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            "Name": d.name, "Email": d.email, "Company": d.company || "—", "Enquiry type": d.topic,
            "Message": d.message, "Sent from": d.page, "Sent at": d.sentAt,
            _subject: d.subject, _replyto: d.email, _template: "box", _captcha: "false"
          })
        }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || String(j.success) === "false") throw new Error(j.message || "FormSubmit " + r.status);
        }); });
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        statusEl.className = "form__status"; statusEl.textContent = "";
        var hp = form.querySelector(".hp input");
        if (hp && hp.value) return; // spam bot
        if (!validate()) return;
        var d = {
          name: form.name.value.trim(), email: form.email.value.trim(),
          company: form.company ? form.company.value.trim() : "", topic: form.topic ? form.topic.value : "",
          message: form.message.value.trim(), page: location.href.split("#")[0],
          sentAt: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
        };
        d.subject = "Portfolio enquiry: " + d.topic + " from " + d.name + (d.company ? " (" + d.company + ")" : "");
>>>>>>> 775ac49 (Updated portfolio website)
        submitBtn.disabled = true;
        var label = submitBtn.querySelector("span");
        var original = label ? label.textContent : "";
        if (label) label.textContent = "Sending…";
<<<<<<< HEAD
        fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed");
            form.reset();
            statusEl.classList.add("is-success");
            statusEl.textContent = "Thank you — your message has been sent. I'll reply within two working days.";
          })
          .catch(function () {
            statusEl.classList.add("is-error");
            statusEl.textContent = "Something went wrong sending your message. Please email sismail77@gmail.com directly.";
          })
          .then(function () { submitBtn.disabled = false; if (label) label.textContent = original; });
=======
        send(d).then(function () {
          form.reset();
          statusEl.classList.add("is-success");
          statusEl.textContent = "Thank you, " + d.name.split(" ")[0] + " — your message has been sent. I'll reply within two working days.";
        }).catch(function () {
          statusEl.classList.add("is-error");
          statusEl.textContent = "Your message couldn't be sent automatically, so your email app is opening with it ready to send. You can also email sismail77@gmail.com directly.";
          mailtoFallback(d);
        }).then(function () { submitBtn.disabled = false; if (label) label.textContent = original; });
>>>>>>> 775ac49 (Updated portfolio website)
      });
    }
  });
})();
