# PWA — Progressive Web App (Instalabilidad)

**Fecha:** 2026-06-28  
**Scope:** Hacer appGastos instalable en móvil desde GitHub Pages  
**Objetivo único:** Instalabilidad (ícono en pantalla de inicio). Sin soporte offline.

---

## Contexto

appGastos es una app estática en GitHub Pages (`https://raydel-suarez.github.io/appGastos/`). Sin build step, sin npm. El usuario siempre tiene internet, por lo que el único valor de la PWA es poder instalarla como app nativa desde el navegador.

---

## Archivos

```
appGastos/
├── manifest.json          ← Web App Manifest
├── sw.js                  ← Service worker mínimo
├── icons/
│   ├── icon-192.png       ← Generado con canvas (192 × 192)
│   └── icon-512.png       ← Generado con canvas (512 × 512)
└── index.html             ← +5 meta tags en <head> + registro SW
```

---

## manifest.json

```json
{
  "name": "appGastos",
  "short_name": "appGastos",
  "start_url": "/appGastos/",
  "display": "standalone",
  "theme_color": "#F59E0B",
  "background_color": "#0C1220",
  "icons": [
    { "src": "/appGastos/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/appGastos/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- `start_url` usa la subcarpeta `/appGastos/` porque el sitio no está en la raíz del dominio.
- `display: standalone` elimina la chrome del navegador para parecer app nativa.
- `background_color` coincide con el sidebar oscuro de la app para el splash screen.

---

## sw.js

Service worker mínimo. Solo existe para satisfacer el requisito de instalabilidad de Chrome Android. No intercepta requests ni cachea nada.

```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
```

---

## Ícono

- **Diseño:** Fondo `#0C1220`, texto **"AG"** en `#F59E0B`, fuente bold, esquinas redondeadas.
- **Generación:** Script canvas que produce los PNG en tiempo de build (ejecutado una sola vez con Node/Playwright). Los PNG se commitean al repo; no hay paso de generación en runtime.
- **Tamaños:** 192 × 192 (requerido por Chrome) y 512 × 512 (requerido para installability audit de Lighthouse y para splash screen en Android).

---

## Cambios en index.html

Dentro de `<head>`:

```html
<link rel="manifest" href="/appGastos/manifest.json">
<meta name="theme-color" content="#F59E0B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/appGastos/icons/icon-192.png">
```

Justo antes de `</body>`:

```html
<script>
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/appGastos/sw.js');
</script>
```

Las meta tags `apple-*` cubren iOS Safari, que no usa el manifest para el ícono de pantalla de inicio — usa `apple-touch-icon` directamente.

---

## Lo que NO cambia

- Lógica de la app (`app.js`, `storage.js`, `ui.js`, `charts.js`, `constants.js`)
- CSS
- Estructura de datos en localStorage
- Suite E2E

---

## Criterio de éxito

En Android Chrome: al visitar la URL de producción, el navegador muestra el banner "Agregar a pantalla de inicio" (o el menú ⋮ lo ofrece). Al instalarse, abre en modo standalone con el ícono AG en la pantalla principal.

En iOS Safari: "Compartir → Agregar a pantalla de inicio" muestra el ícono AG y abre sin barra del navegador.
