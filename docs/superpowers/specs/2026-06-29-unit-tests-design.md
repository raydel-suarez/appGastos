# Diseño: Pruebas Unitarias con Vitest

**Fecha:** 2026-06-29  
**Alcance:** Suite de pruebas unitarias para todos los módulos vitales de appGastos  
**Decisión clave:** Carpeta `unit/` dedicada, espejando el patrón de `e2e/`

---

## Motivación

appGastos ya tiene pruebas E2E (Playwright) y pruebas de humo en producción (TestSprite). Lo que falta es verificar la **lógica pura** de manera rápida y aislada: cálculos de fechas, persistencia en localStorage, generación de mensajes comparativos y construcción de datos para gráficos. Las pruebas unitarias cubren este nivel y corren en milisegundos, sin navegador.

---

## Arquitectura

### Estructura de archivos

```
unit/
├── package.json          ← Vitest + jsdom como devDependencies
├── vitest.config.js      ← entorno jsdom, globals habilitados
└── tests/
    ├── constants.test.js
    ├── storage.test.js
    ├── dateUtils.test.js
    ├── ui.test.js
    └── charts.test.js
```

### Configuración de Vitest

- **Entorno:** `jsdom` — provee `localStorage`, `document` y `window` en Node.js
- **Globals:** `true` — `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` sin importar
- **Scripts disponibles:**
  - `npm test` — ejecución única (CI/pre-push)
  - `npm run test:watch` — modo desarrollo con recarga automática
  - `npm run test:coverage` — reporte de cobertura

### Relación con los otros módulos de testing

| Suite | Propósito | Velocidad | Cuándo correr |
|---|---|---|---|
| `unit/` (Vitest) | Lógica pura aislada | ~segundos | Antes de commit |
| `e2e/` (Playwright) | Flujos completos en browser | ~minutos | Antes de push |
| TestSprite | Smoke en producción | ~minutos | Después de deploy |

---

## Refactorización: extracción de `js/dateUtils.js`

Las funciones de cálculo de fechas viven actualmente en `app.js` sin exportarse. Se extraen a un módulo dedicado para permitir su prueba unitaria.

**Funciones a extraer de `app.js` → `js/dateUtils.js`:**

```js
export function toDateStr(date)          // Date → "YYYY-MM-DD"
export function getDateRange(periodo)    // 'semanal'|'mensual'|'anual' → {start, end}
export function getPrevDateRange(periodo) // mismo pero para el período anterior
export function generarId()              // genera ID único basado en timestamp + random
```

`app.js` las importa desde `./dateUtils.js`. El comportamiento de la aplicación no cambia.

---

## Plan de cobertura

### `constants.test.js` — Integridad de datos base

```
✦ Hay exactamente 7 categorías definidas
✦ Cada categoría tiene un color asignado (arrays del mismo largo)
✦ Los meses son exactamente 12
```

Objetivo: garantizar que nadie rompa accidentalmente la fuente de verdad de categorías y colores.

---

### `dateUtils.test.js` — Lógica de rangos de fechas

```
✦ La semana actual siempre empieza en lunes y termina en domingo
✦ El período previo semanal cubre exactamente la semana anterior
✦ El período mensual abarca del primer al último día del mes actual
✦ El período anual va del 1 de enero al 31 de diciembre del año en curso
✦ Los IDs generados son únicos entre sí
```

Estrategia: usar `vi.setSystemTime()` para fijar la fecha y hacer los tests deterministas, independientemente de cuándo corran.

---

### `storage.test.js` — Persistencia en localStorage

```
✦ Devuelve una lista vacía cuando no hay gastos guardados
✦ Agrega un gasto y lo recupera correctamente
✦ Eliminar un gasto lo remueve sin afectar los demás
✦ Actualizar un gasto cambia solo los campos indicados
✦ Filtra gastos por rango de fechas correctamente
✦ Devuelve lista vacía si localStorage está corrupto
```

Estrategia: jsdom provee `localStorage` real en memoria. Se limpia en `beforeEach` con `localStorage.clear()` para garantizar aislamiento entre tests.

---

### `ui.test.js` — Renderizado de tabla y leyendas

```
✦ Muestra el mensaje de "sin gastos" cuando la lista está vacía
✦ Ordena los gastos de más reciente a más antiguo en la tabla
✦ Muestra el total gastado con porcentaje de variación respecto al período anterior
✦ Omite el delta porcentual cuando no hay datos del período anterior
✦ Identifica la categoría con mayor gasto del período
✦ Alerta sobre una categoría con variación significativa (>5%) respecto al período anterior
```

Estrategia: crear los elementos DOM necesarios (`cuerpoTabla`, `mensajeVacio`, `leyendas`) en `beforeEach` via `document.createElement` e inyectarlos en `document.body`. Limpiar en `afterEach`.

---

### `charts.test.js` — Construcción de datos para gráficos

```
✦ El gráfico de barras semanal genera exactamente 7 etiquetas (Lun–Dom)
✦ El gráfico de barras mensual genera una barra por semana del mes
✦ El gráfico de barras anual genera 12 etiquetas (una por mes)
✦ La dona muestra "Sin gastos" cuando no hay datos
✦ La dona solo incluye categorías con monto mayor a cero
```

Estrategia: `Chart` no existe en jsdom (llega por CDN). Se mockea como clase global con `vi.stubGlobal('Chart', MockChart)` donde `MockChart` guarda en una propiedad pública los argumentos del constructor (labels, data, type). Los tests verifican esos argumentos para confirmar que los datos se construyeron correctamente, sin depender de Canvas real.

---

## Decisiones de diseño

| Decisión | Justificación |
|---|---|
| Carpeta `unit/` separada | Espeja el patrón de `e2e/`, raíz queda limpia |
| jsdom como entorno | `storage.js` y `ui.js` necesitan `localStorage` y DOM |
| `vi.setSystemTime()` en dateUtils | Tests de fechas son deterministas sin importar cuándo corren |
| Mock de `Chart` global | La librería llega por CDN; mockear permite probar la lógica sin Canvas |
| Extraer `dateUtils.js` | Hace testeable la lógica más crítica del dashboard |

---

## Criterios de éxito

- `npm test` desde `unit/` pasa en verde sin servidor ni navegador
- Cada test tiene una descripción legible en español que expresa el comportamiento esperado
- Los tests de fechas son deterministas (no dependen del día real en que corren)
- Añadir un nuevo módulo JS sigue el mismo patrón sin cambiar la configuración
