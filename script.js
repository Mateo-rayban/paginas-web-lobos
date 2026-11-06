/* Landing · Páginas web · Lobos y alrededores
   JavaScript vanilla. La página funciona igual sin JS:
   el formulario hace un POST nativo a Netlify y redirige a /gracias/. */
(function () {
  "use strict";

  // URL del webhook de n8n que manda el aviso por email (nodo Webhook, método POST).
  // Si queda vacía, el formulario igual se guarda en Netlify Forms.
  var N8N_WEBHOOK_URL = "";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año del footer ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Barra superior: se esconde al bajar y aparece al subir ---------- */
  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.getElementById("menu-movil");

  function isMenuOpen() { return !!mobileMenu && !mobileMenu.hidden; }

  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    if (open && header) header.classList.remove("is-hidden");
  }

  if (header) {
    var lastY = window.scrollY;
    var ticking = false;
    var update = function () {
      var y = window.scrollY;
      var delta = y - lastY;
      header.classList.toggle("is-scrolled", y > 8);
      if (y < 80 || isMenuOpen()) {
        header.classList.remove("is-hidden");
      } else if (delta > 6) {
        header.classList.add("is-hidden");
      } else if (delta < -6) {
        header.classList.remove("is-hidden");
      }
      if (Math.abs(delta) > 6) lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    // Si se navega con teclado, la barra vuelve a mostrarse.
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
    update();
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () { setMenu(!isMenuOpen()); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMenuOpen()) { setMenu(false); menuToggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (isMenuOpen() && header && !header.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Scroll suave a cada sección + foco accesible ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });

  /* ---------- Marcar en el menú la sección que se está viendo ---------- */
  var navLinks = document.querySelectorAll("[data-nav-link]");
  if (navLinks.length && "IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["inicio", "como-trabajo", "presupuesto", "contacto"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionIO.observe(el);
    });
  }

  /* ---------- Inicio: se escribe la búsqueda y aparece tu negocio ----------
     Es la única animación automática de la página. Sin JS o con movimiento
     reducido se ve directamente el resultado final. */
  var finder = document.querySelector("[data-finder]");
  if (finder && !prefersReducedMotion) {
    var queryEl = finder.querySelector(".finder__query");
    var text = queryEl ? queryEl.getAttribute("data-query") || queryEl.textContent : "";
    var stepMs = 65;
    if (queryEl && text) {
      queryEl.textContent = "";
      finder.style.setProperty("--result-delay", (300 + text.length * stepMs + 250) + "ms");
      finder.classList.add("is-waiting");
      var start = function () {
        finder.classList.remove("is-waiting");
        finder.classList.add("is-animating");
        var i = 0;
        setTimeout(function typeNext() {
          i += 1;
          queryEl.textContent = text.slice(0, i);
          if (i < text.length) setTimeout(typeNext, stepMs);
        }, 300);
      };
      // Arranca recién cuando el celular se ve en pantalla (en móvil queda más abajo).
      if ("IntersectionObserver" in window) {
        var finderIO = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { finderIO.disconnect(); start(); }
        }, { threshold: 0.45 });
        finderIO.observe(finder);
      } else {
        start();
      }
    }
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
    var params = new URLSearchParams(new FormData(form));
    var body = params.toString();

    // Aviso a n8n. sendBeacon no espera respuesta, no necesita CORS y sobrevive
    // a la redirección a /gracias/. Si falla, el pedido igual queda en Netlify.
    if (N8N_WEBHOOK_URL && params.get("bot-field") === "") {
      try {
        var sent = navigator.sendBeacon && navigator.sendBeacon(N8N_WEBHOOK_URL, params);
        if (!sent) {
          fetch(N8N_WEBHOOK_URL, { method: "POST", body: params, mode: "no-cors", keepalive: true }).catch(function () {});
        }
      } catch (err) { /* no bloquear el envío principal */ }
    }

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
