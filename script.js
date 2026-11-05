/* Landing · Páginas web · Lobos y alrededores
   JavaScript vanilla. La página funciona igual sin JS:
   el formulario hace un POST nativo a Netlify y redirige a /gracias/. */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año del footer ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header con borde al hacer scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll suave al formulario + foco accesible ---------- */
  document.querySelectorAll('a[href="#presupuesto"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var target = document.getElementById("presupuesto");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, "", "#presupuesto");
    });
  });

  /* ---------- Aparición suave de bloques ---------- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealTargets = document.querySelectorAll(".plan, .block, .section__title, .hero__visual");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ---------- Formulario ---------- */
  var form = document.querySelector('form[name="presupuesto"]');
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = form.querySelector(".form-status");
  var summaryEl = form.querySelector(".form-error-summary");

  function digitsOnly(value) { return (value || "").replace(/\D/g, ""); }

  var validators = {
    nombre: function (input) { return input.value.trim().length >= 2; },
    whatsapp: function (input) {
      var d = digitsOnly(input.value);
      return d.length >= 8 && d.length <= 15;
    },
    email: function (input) {
      var v = input.value.trim();
      return v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }
  };

  function setFieldError(input, hasError) {
    var err = document.getElementById("err-" + input.name);
    input.setAttribute("aria-invalid", hasError ? "true" : "false");
    if (err) err.hidden = !hasError;
  }

  function validateField(input) {
    var fn = validators[input.name];
    if (!fn) return true;
    var ok = fn(input);
    setFieldError(input, !ok);
    return ok;
  }

  function validateRubro() {
    var group = form.querySelector('[data-required-group="rubro"]');
    var ok = !!form.querySelector('input[name="rubro"]:checked');
    var err = document.getElementById("err-rubro");
    if (group) group.classList.toggle("has-error", !ok);
    if (err) err.hidden = ok;
    return ok;
  }

  // Validación en línea: al salir del campo, y en vivo una vez que ya mostró error.
  Object.keys(validators).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener("blur", function () {
      if (input.value.trim() !== "" || input.required) validateField(input);
    });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") validateField(input);
    });
  });
  form.querySelectorAll('input[name="rubro"]').forEach(function (r) {
    r.addEventListener("change", validateRubro);
  });

  function validateAll() {
    var invalid = [];
    if (!validateRubro()) invalid.push(form.querySelector('input[name="rubro"]'));
    ["nombre", "whatsapp", "email"].forEach(function (name) {
      var input = form.elements[name];
      if (input && !validateField(input)) invalid.push(input);
    });
    return invalid;
  }

  function setLoading(isLoading) {
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
    var label = submitBtn.querySelector(".btn__label");
    if (label) label.textContent = isLoading ? "Enviando…" : "Enviar pedido de presupuesto";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.classList.remove("is-error");

    var invalid = validateAll();
    if (invalid.length) {
      summaryEl.textContent = invalid.length === 1
        ? "Falta completar 1 dato. Revisalo y volvé a enviar."
        : "Faltan completar " + invalid.length + " datos. Revisalos y volvé a enviar.";
      summaryEl.hidden = false;
      invalid[0].focus();
      if (invalid[0].type !== "radio") {
        invalid[0].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      } else {
        invalid[0].closest("fieldset").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
      return;
    }
    summaryEl.hidden = true;

    setLoading(true);

    // Netlify Forms acepta POST urlencoded a la raíz con el campo form-name.
    var body = new URLSearchParams(new FormData(form)).toString();

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        window.location.href = form.getAttribute("action") || "/gracias/";
      })
      .catch(function () {
        setLoading(false);
        statusEl.classList.add("is-error");
        statusEl.textContent = "No se pudo enviar. Revisá tu conexión e intentá de nuevo.";
      });
  });
})();
