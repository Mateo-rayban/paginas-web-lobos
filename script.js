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
  /* ---------- El formulario aparece recién al elegir "Completar el formulario" ----------
     Sin JS se ve siempre (y Netlify lo detecta igual porque está en el HTML). */
  var formSection = document.querySelector("[data-form-section]");

  function showFormSection() {
    if (!formSection || !formSection.hidden) return;
    formSection.hidden = false;
    if (!prefersReducedMotion) {
      formSection.classList.add("is-revealing");
      formSection.addEventListener("animationend", function done() {
        formSection.classList.remove("is-revealing");
        formSection.removeEventListener("animationend", done);
      });
    }
  }

  if (formSection && location.hash !== "#presupuesto") formSection.hidden = true;
  window.addEventListener("hashchange", function () {
    if (location.hash === "#presupuesto") showFormSection();
  });

  var quoteDialog = document.getElementById("elegir-contacto");
  var canDialog = !!(quoteDialog && typeof quoteDialog.showModal === "function");

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (canDialog && link.hasAttribute("data-quote")) return; // lo maneja la ventanita
      if (link.hasAttribute("data-choose-form")) return;
      var id = link.getAttribute("href").slice(1);
      if (id === "presupuesto") showFormSection();
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

  /* ---------- "Pedir presupuesto": elegir formulario, WhatsApp o Instagram ----------
     Sin soporte de <dialog> (o sin JS) los botones llevan directo al formulario. */
  if (canDialog) {
    var lastTrigger = null;

    document.querySelectorAll("[data-quote]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        lastTrigger = btn;
        setMenu(false);
        quoteDialog.showModal();
        var first = quoteDialog.querySelector(".quote-option");
        if (first) first.focus();
      });
    });

    var closeDialog = function () { if (quoteDialog.open) quoteDialog.close(); };

    quoteDialog.querySelector("[data-dialog-close]").addEventListener("click", closeDialog);

    // Tocar afuera de la tarjeta cierra la ventanita.
    quoteDialog.addEventListener("click", function (e) {
      if (e.target === quoteDialog) closeDialog();
    });

    // Al elegir WhatsApp o Instagram se abre la app y se cierra la ventanita.
    quoteDialog.querySelectorAll('.quote-option[target="_blank"]').forEach(function (a) {
      a.addEventListener("click", function () { setTimeout(closeDialog, 150); });
    });

    quoteDialog.querySelector("[data-choose-form]").addEventListener("click", function (e) {
      e.preventDefault();
      lastTrigger = null;
      closeDialog();
      showFormSection();
      var target = document.getElementById("presupuesto");
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, "", "#presupuesto");
    });

    quoteDialog.addEventListener("close", function () {
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
  }

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
    ["inicio", "como-trabajo", "paso-a-paso", "contacto"].forEach(function (id) {
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
        // También arranca si se pasó de largo bajando rápido (quedó arriba de la pantalla).
        var finderIO = new IntersectionObserver(function (entries) {
          var e = entries[0];
          if (e.intersectionRatio >= 0.45 || e.boundingClientRect.top < 0) { finderIO.disconnect(); start(); }
        }, { threshold: [0, 0.45, 1] });
        finderIO.observe(finder);
      } else {
        start();
      }
    }
  }

  /* ---------- Efectos al bajar ----------
     Solo si el sistema no pide movimiento reducido (clase "motion" en <html>,
     que se pone en el <head> antes de pintar). */
  var motionOn = document.documentElement.classList.contains("motion");

  if (motionOn) {
    // 1) Elementos que entran una sola vez al aparecer en pantalla.
    var inTargets = document.querySelectorAll("[data-in]");
    if ("IntersectionObserver" in window) {
      var inIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            inIO.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
      inTargets.forEach(function (el) { inIO.observe(el); });
    } else {
      inTargets.forEach(function (el) { el.classList.add("is-in"); });
    }

    // 2) Franja de rubros: las palabras se encienden a medida que bajás.
    var audience = document.querySelector("[data-scrub]");
    var words = [];
    if (audience) {
      var label = audience.textContent.replace(/\s+/g, " ").trim();
      var parts = [];
      audience.childNodes.forEach(function (node) {
        var isEm = node.nodeType === 1 && node.tagName === "EM";
        node.textContent.split(/(\s+)/).forEach(function (chunk) {
          if (chunk) parts.push({ text: chunk, em: isEm });
        });
      });
      audience.setAttribute("aria-label", label);
      audience.textContent = "";
      parts.forEach(function (part) {
        if (/^\s+$/.test(part.text)) { audience.appendChild(document.createTextNode(" ")); return; }
        var span = document.createElement(part.em ? "em" : "span");
        span.className = "scrub-word";
        span.setAttribute("aria-hidden", "true");
        span.textContent = part.text;
        audience.appendChild(span);
        words.push(span);
      });
    }

    // La línea que une los pasos se va llenando a medida que bajás.
    var stepsList = document.querySelector("[data-steps]");

    // 3) El celular del inicio se mueve más lento que la página (parallax suave).
    var visual = document.querySelector(".hero__visual");

    var scrollTicking = false;
    var onMotionScroll = function () {
      var vh = window.innerHeight;
      if (visual) {
        var y = Math.min(window.scrollY, vh * 1.2);
        visual.style.transform = "translate3d(0," + (y * -0.12).toFixed(1) + "px,0)";
      }
      if (audience && words.length) {
        var r = audience.getBoundingClientRect();
        var progress = (vh * 0.9 - r.top) / (vh * 0.55 + r.height);
        progress = Math.max(0, Math.min(1, progress));
        var lit = Math.round(progress * words.length);
        for (var k = 0; k < words.length; k++) words[k].classList.toggle("is-lit", k < lit);
      }
      if (stepsList) {
        var sr = stepsList.getBoundingClientRect();
        var sp = (vh * 0.6 - sr.top) / sr.height;
        stepsList.style.setProperty("--progress", Math.max(0, Math.min(1, sp)).toFixed(3));
      }
      scrollTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!scrollTicking) { scrollTicking = true; window.requestAnimationFrame(onMotionScroll); }
    }, { passive: true });
    window.addEventListener("resize", onMotionScroll);
    onMotionScroll();
  }

  /* ---------- Formulario ---------- */
  var form = document.querySelector('form[name="presupuesto"]');
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = form.querySelector(".form-status");
  var summaryEl = form.querySelector(".form-error-summary");

  /* ---------- Formulario por pasos ----------
     Sin JS se ve todo habilitado. Con JS, los pasos 2 y 3 arrancan bloqueados
     y se van habilitando a medida que se contesta. */
  var stepBlocks = {
    1: form.querySelector('[data-step="1"]'),
    2: form.querySelector('[data-step="2"]'),
    3: form.querySelector('[data-step="3"]')
  };
  var stepSubmit = form.querySelector("[data-step-submit]");
  var progressBox = form.querySelector("[data-form-progress]");
  var progressLabel = progressBox ? progressBox.querySelector(".form-progress__label") : null;
  var currentStep = 1;

  function hideBlock(el) {
    if (!el) return;
    el.classList.add("is-pending");
    el.setAttribute("inert", "");
  }

  function revealBlock(el) {
    if (!el || !el.classList.contains("is-pending")) return;
    el.classList.remove("is-pending");
    el.removeAttribute("inert");
    if (!prefersReducedMotion) {
      el.classList.add("is-revealing");
      el.addEventListener("animationend", function done() {
        el.classList.remove("is-revealing");
        el.removeEventListener("animationend", done);
      });
    }
  }

  function bringIntoView(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.7) {
      window.scrollBy({ top: top - window.innerHeight * 0.3, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  function setStep(n) {
    if (n <= currentStep) return;
    currentStep = n;
    var hintEl = form.querySelector(".step-hint");
    if (hintEl) hintEl.remove();
    if (n >= 2) revealBlock(stepBlocks[2]);
    if (n >= 3) {
      revealBlock(stepBlocks[3]);
      revealBlock(stepSubmit);
      var next = form.querySelector(".step-next");
      if (next) next.hidden = true;
    }
    if (progressBox) {
      progressBox.setAttribute("data-current", String(n));
      if (progressLabel) progressLabel.textContent = "Paso " + n + " de 3";
    }
  }

  if (stepBlocks[1] && stepBlocks[2] && stepBlocks[3]) {
    if (progressBox) { progressBox.hidden = false; progressBox.setAttribute("data-current", "1"); }
    form.classList.add("is-stepped");
    var hint = document.createElement("p");
    hint.className = "step-hint";
    hint.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg><span>Elegí una opción y aparece la siguiente pregunta.</span>';
    stepBlocks[1].insertAdjacentElement("afterend", hint);
    hideBlock(stepBlocks[2]);
    hideBlock(stepBlocks[3]);
    hideBlock(stepSubmit);

    // Botón para pasar al último paso sin contestar las preguntas opcionales.
    var nextWrap = document.createElement("div");
    nextWrap.className = "step-next";
    nextWrap.innerHTML = '<button type="button" class="btn btn--ghost">Seguir al último paso</button>';
    stepBlocks[2].appendChild(nextWrap);
    nextWrap.querySelector("button").addEventListener("click", function () {
      setStep(3);
      stepBlocks[3].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      var nombre = form.elements.nombre;
      if (nombre) setTimeout(function () { nombre.focus({ preventScroll: true }); }, prefersReducedMotion ? 0 : 450);
    });

    form.addEventListener("change", function (e) {
      if (e.target.name === "rubro") setStep(2);
      if (e.target.name === "modalidad") {
        var wasBefore = currentStep < 3;
        setStep(3);
        if (wasBefore) bringIntoView(stepBlocks[3]);
      }
    });

    // Si el navegador recuerda respuestas (por ejemplo, al volver atrás), respetarlas.
    if (form.querySelector('input[name="rubro"]:checked')) setStep(2);
    if (form.querySelector('input[name="modalidad"]:checked')) setStep(3);
  }

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
