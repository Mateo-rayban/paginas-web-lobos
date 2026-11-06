# Landing · Páginas web · Lobos y alrededores

Landing page de captación de clientes para servicios de desarrollo web orientados a negocios locales (restaurantes, bares, panaderías, quintas de eventos, comercios y profesionales).

- HTML5, CSS3 y JavaScript vanilla. Sin frameworks ni build.
- Formulario enviado con **Web3Forms** (llega por email).
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

Abrí http://localhost:8080. El envío real del formulario necesita la clave de Web3Forms (ver abajo).

## Formulario: Web3Forms

Los pedidos se envían a [Web3Forms](https://web3forms.com) y llegan por email (plan gratis).

1. Entrá a https://web3forms.com, poné tu email y tocá *Create Access Key*.
2. Copiá la clave que te llega por email.
3. En `index.html`, buscá `PEGAR-ACA-LA-ACCESS-KEY` y reemplazalo por tu clave.

La clave no es secreta: está pensada para ir en el código de la página.

## Publicar en Cloudflare Pages (gratis)

1. Creá una cuenta en https://dash.cloudflare.com/sign-up
2. *Workers & Pages → Create → Pages → Connect to Git* y conectá GitHub.
3. Elegí el repo `paginas-web-lobos`.
4. Configuración:
   - Production branch: la rama con la versión final.
   - Framework preset: *None*.
   - Build command: vacío.
   - Build output directory: `/`.
5. *Save and Deploy*. Queda en `https://<nombre>.pages.dev`.
6. Cada cambio que se suba a esa rama se publica solo.

Dominio propio: en el proyecto, *Custom domains → Set up a custom domain*.

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

Protección anti-spam: casilla oculta `botcheck` (si un bot la marca, el pedido se descarta).

## Personalizar

- **Colores y tipografías:** variables al inicio de `styles.css`.
- **Textos:** directamente en `index.html`.
- **Agregar un campo:** sumalo en el `<form>` de `index.html` y en `LABELS` de `script.js`.

## Pendiente cuando tengas marca y dominio

- Actualizar `<link rel="canonical">` y `og:url` si se cambia a un dominio propio (hoy apuntan a paginas-web-lobos.pages.dev).
- Agregar una imagen `og:image` (1200×630) para cuando se comparta el link.
- Agregar datos estructurados (`LocalBusiness` / `ProfessionalService`) con nombre y zona.
- Reemplazar el favicon neutro.
