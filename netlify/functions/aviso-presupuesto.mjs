// Se ejecuta automáticamente cada vez que Netlify Forms recibe un envío
// y lo reenvía por email usando Resend (https://resend.com).
//
// Variables de entorno necesarias (Netlify → Project configuration → Environment variables):
//   RESEND_API_KEY  → la API key de Resend (marcala como secreta, scope: Functions)
//   NOTIFY_EMAIL    → el email donde querés recibir los pedidos
// Opcional:
//   RESEND_FROM     → remitente verificado en Resend (por defecto onboarding@resend.dev)

const LABELS = {
  rubro: "Tipo de negocio",
  negocio: "Nombre del negocio",
  localidad: "Localidad",
  "necesidades[]": "Qué necesita",
  necesidades: "Qué necesita",
  web_actual: "¿Tiene página web?",
  modalidad: "Forma de pago",
  nombre: "Nombre",
  whatsapp: "WhatsApp",
  email: "Email",
  mensaje: "Mensaje",
};

const IGNORE = new Set(["form-name", "bot-field", "subject", "ip", "user_agent", "referrer"]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toText(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value == null ? "" : String(value).trim();
}

async function sendLeadEmail(data) {
  const apiKey = Netlify.env.get("RESEND_API_KEY");
  const to = Netlify.env.get("NOTIFY_EMAIL");
  const from = Netlify.env.get("RESEND_FROM") || "Presupuestos web <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error("Faltan RESEND_API_KEY o NOTIFY_EMAIL en las variables de entorno.");
    return;
  }

  // Ordenar los campos como en el formulario y dejar afuera los vacíos.
  const ordered = Object.keys(LABELS).filter((k) => k in data);
  const extra = Object.keys(data).filter((k) => !(k in LABELS) && !IGNORE.has(k));
  const rows = [...ordered, ...extra]
    .map((key) => [LABELS[key] || key, toText(data[key])])
    .filter(([, value]) => value !== "");

  const nombre = toText(data.nombre) || "Sin nombre";
  const rubro = toText(data.rubro);
  const subject = `Nuevo pedido de presupuesto: ${nombre}${rubro ? " (" + rubro + ")" : ""}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#1F3A34">
      <h2 style="margin:0 0 16px">Nuevo pedido de presupuesto</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 12px 8px 0;border-bottom:1px solid #eee;color:#5C5C5C;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p style="margin-top:16px;color:#5C5C5C;font-size:13px">Enviado desde el formulario de la landing. También queda guardado en Netlify → Forms.</p>
    </div>`;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const payload = { from, to: [to], subject, html, text };
  const replyTo = toText(data.email);
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Se lanza el error para que quede en los logs de la función.
    throw new Error(`Resend respondió ${res.status}: ${await res.text()}`);
  }
  console.log("Aviso enviado a", to);
}

export default {
  async formSubmitted(event) {
    const data = event?.data || event?.payload?.data || {};
    await sendLeadEmail(data);
  },
};
