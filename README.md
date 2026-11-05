# Landing · Páginas web · Lobos y alrededores

Landing page de captación de clientes para servicios de desarrollo web orientados a negocios locales (restaurantes, bares, panaderías, quintas de eventos, comercios y profesionales).

- HTML5, CSS3 y JavaScript vanilla. Sin frameworks ni build.
- Formulario procesado con **Netlify Forms** (nativo).
- Mobile-first, accesible (contraste AA, foco visible, etiquetas reales, `prefers-reduced-motion`).

## Estructura

```
/
├── index.html          Landing (hero, cómo trabajo, formulario)
├── styles.css          Estilos (variables CSS de la paleta)
├── script.js           Scroll suave, validación y envío del formulario
├── gracias/
│   └── index.html      Página de confirmación (noindex)
├── .gitignore
└── README.md
```

## Probar en local

```bash
python3 -m http.server 8080
```

Abrí http://localhost:8080. El envío real del formulario solo funciona en Netlify (en local el servidor no acepta POST).

## Desplegar en Netlify

**Opción A: arrastrar y soltar**
1. Entrá a https://app.netlify.com/drop.
2. Arrastrá la carpeta del proyecto.

**Opción B: desde un repositorio (recomendado)**
1. Subí el proyecto a GitHub.
2. En Netlify: *Add new site → Import an existing project* y elegí el repo.
3. Build command: vacío. Publish directory: `/` (la raíz).

**Después del primer deploy**
1. En *Site configuration → Forms*, activá la detección de formularios (*Enable form detection*) si no está activa y volvé a desplegar.
2. Debería aparecer el formulario **presupuesto**.
3. En *Forms → Form notifications* agregá una notificación por email para recibir cada pedido.
4. Hacé un envío de prueba desde el sitio publicado.

## Campos que recibís

| Campo | Tipo | Obligatorio |
|---|---|---|
| `rubro` | Tipo de negocio | Sí |
| `negocio` | Nombre del negocio | No |
| `localidad` | Localidad (por defecto Lobos) | No |
| `necesidades[]` | Funciones que quiere (varias) | No |
| `web_actual` | Si ya tiene página | No |
| `modalidad` | Pago único / Abono mensual / No sabe | No |
| `nombre` | Nombre de contacto | Sí |
| `whatsapp` | Teléfono / WhatsApp | Sí |
| `email` | Email | No |
| `mensaje` | Comentario libre | No |

Protección anti-spam: campo honeypot `bot-field`.

## Personalizar

- **Colores y tipografías:** variables al inicio de `styles.css`.
- **Textos:** directamente en `index.html`.
- **Agregar un campo:** sumalo en el `<form>` de `index.html`. Netlify lo detecta en el próximo deploy.

## Pendiente cuando tengas marca y dominio

- Agregar `<link rel="canonical">` y `og:url` con el dominio final.
- Agregar una imagen `og:image` (1200×630) para cuando se comparta el link.
- Agregar datos estructurados (`LocalBusiness` / `ProfessionalService`) con nombre y zona.
- Reemplazar el favicon neutro.
