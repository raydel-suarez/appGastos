# Splash Screen — PWA

**Fecha:** 2026-07-01
**Scope:** Pantalla de bienvenida con el logo "AG" al abrir appGastos como app instalada
**Objetivo único:** Que al abrir la app instalada (Android o iOS) se vea brevemente el logo sobre fondo oscuro antes del dashboard, en vez de un salto directo. En navegador normal (pestaña web) no debe verse.

---

## Contexto

appGastos ya es instalable ([[2026-06-28-pwa-design]]) con `manifest.json`, `background_color: #0C1220` e íconos `icon-192.png` / `icon-512.png` (logo "AG" en `#F59E0B` sobre `#0C1220`). Android genera un splash nativo básico a partir del manifest, pero iOS Safari no soporta ese mecanismo. Para tener el mismo comportamiento controlado en ambas plataformas, se implementa un overlay propio en HTML/CSS/JS en vez de depender del splash nativo de cada sistema.

---

## Alcance de la detección

El splash solo debe aparecer cuando la app corre en modo standalone (instalada), nunca en una pestaña de navegador normal:

```js
const esStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;
```

- `matchMedia('(display-mode: standalone)')` cubre Android/Chrome y Safari moderno.
- `navigator.standalone === true` es el flag clásico de iOS Safari, usado como respaldo.

Esta detección corre en un `<script>` inline **no-module** dentro de `<head>`/inicio de `<body>`, para ejecutarse antes del primer pintado y evitar cualquier destello del splash en usuarios de navegador normal.

---

## Archivos afectados

```
appGastos/
├── index.html    ← + <div id="splash"> + script inline de control
└── css/styles.css ← + sección "Splash screen"
```

No se toca `manifest.json`, `sw.js`, ni ningún módulo JS de la app (`app.js`, `storage.js`, `ui.js`, `charts.js`, `constants.js`). El logo reutiliza el asset existente `icons/icon-512.png`, no se genera ninguno nuevo.

---

## HTML

Como primer hijo de `<body>`:

```html
<div id="splash">
  <img src="icons/icon-512.png" alt="appGastos">
</div>
```

Inmediatamente después, script inline de control (ver sección "Comportamiento").

---

## CSS (`css/styles.css`)

Nueva sección al final del archivo:

```css
/* ── Splash screen ── */
#splash {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  align-items: center;
  justify-content: center;
  background: var(--sidebar-bg);
  opacity: 1;
  transition: opacity 400ms ease;
}

html.is-standalone #splash {
  display: flex;
}

#splash img {
  width: 180px;
  max-width: 45vw;
  height: auto;
}

#splash.splash--hide {
  opacity: 0;
}
```

- Reutiliza `var(--sidebar-bg)` (`#0C1220`), ya definida en `:root` — sin nuevo color hardcodeado.
- `display: none` por defecto: si el JS no llega a marcar `is-standalone` en `<html>` (o el usuario no está en modo standalone), el splash nunca se muestra ni ocupa espacio.
- El tamaño del logo (180px, con tope de 45vw para pantallas angostas) parte del padding interno que ya trae el PNG de 512×512.

---

## Comportamiento (script inline)

```html
<script>
  (function () {
    const esStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (!esStandalone) return;

    document.documentElement.classList.add('is-standalone');

    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        const splash = document.getElementById('splash');
        splash.classList.add('splash--hide');
        splash.addEventListener('transitionend', function () {
          splash.remove();
        }, { once: true });
      }, 1000);
    });
  })();
</script>
```

Secuencia:
1. Si no es standalone → el script no hace nada; `#splash` permanece `display: none` (definido en CSS) y nunca se ve.
2. Si es standalone → se agrega la clase `is-standalone` a `<html>` de inmediato (antes del primer pintado), lo que activa `display: flex` en `#splash` vía CSS.
3. Tras `DOMContentLoaded`, se espera 1000ms con el splash visible.
4. Se agrega `.splash--hide` → transición de opacidad de 400ms.
5. Al terminar la transición (`transitionend`), se elimina el nodo del DOM por completo — no queda bloqueando clics ni interacciones posteriores.

Este comportamiento es independiente de cuánto tarde `app.js` en inicializar el dashboard: el tiempo de exhibición es fijo (~1.4s totales) porque la carga de la app ya es prácticamente instantánea.

---

## Lo que NO cambia

- `manifest.json` (su `background_color` ya coincide y sigue siendo usado por el splash nativo de Android antes de que cargue el HTML)
- `sw.js`
- Lógica de la app (`app.js`, `storage.js`, `ui.js`, `charts.js`, `constants.js`)
- Estructura de datos en localStorage
- Suite E2E existente (los escenarios de `flujo-critico.feature` no dependen de standalone mode, así que no deberían verse afectados; el splash nunca se activa en las pruebas Playwright porque corren en modo navegador normal, no standalone)

---

## Criterio de éxito

- **Android (instalada):** al abrir desde el ícono de pantalla de inicio, se ve el logo "AG" sobre fondo `#0C1220` durante ~1.4s antes de que aparezca el dashboard, con un fade out suave.
- **iOS (instalada vía "Agregar a pantalla de inicio"):** mismo comportamiento y tiempos que en Android.
- **Navegador normal (Chrome/Safari en pestaña):** no se ve ningún splash; el dashboard aparece de inmediato como hoy.
- El splash no interfiere con el formulario ni ninguna interacción una vez desaparece (nodo eliminado del DOM).
