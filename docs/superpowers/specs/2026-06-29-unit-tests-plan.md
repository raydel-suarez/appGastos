# Plan de Implementación: Pruebas Unitarias con Vitest

**Spec base:** `2026-06-29-unit-tests-design.md`  
**Rama sugerida:** `feature/add-unit-tests`

---

## Paso 1 — Extraer `js/dateUtils.js`

**Archivos modificados:** `js/app.js` (editar), `js/dateUtils.js` (crear)

Mover desde `app.js` a `js/dateUtils.js` las siguientes funciones, exportándolas:

```js
export function toDateStr(date) { ... }
export function getDateRange(periodo) { ... }
export function getPrevDateRange(periodo) { ... }
export function generarId() { ... }
```

En `app.js`, eliminar esas definiciones y agregar al inicio:

```js
import { toDateStr, getDateRange, getPrevDateRange, generarId } from './dateUtils.js';
```

**Verificación:** La app debe funcionar exactamente igual en el navegador.

---

## Paso 2 — Crear `unit/package.json`

```json
{
  "name": "appgastos-unit",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "jsdom": "^24.0.0"
  }
}
```

---

## Paso 3 — Crear `unit/vitest.config.js`

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    root: '.',
    include: ['tests/**/*.test.js'],
  },
});
```

---

## Paso 4 — Crear `unit/tests/constants.test.js`

Importa desde `../../js/constants.js`. Tests:

- `CATEGORIAS` tiene exactamente 7 elementos
- `COLORES_CAT` tiene el mismo largo que `CATEGORIAS`
- `MESES` tiene exactamente 12 elementos

---

## Paso 5 — Crear `unit/tests/dateUtils.test.js`

Importa desde `../../js/dateUtils.js`. Usa `vi.useFakeTimers()` y `vi.setSystemTime()` en `beforeEach` para fijar la fecha a un lunes conocido (ej: 2026-06-29).

Tests:
- `getDateRange('semanal')` → start es lunes, end es domingo de esa semana
- `getPrevDateRange('semanal')` → start/end de la semana anterior exacta
- `getDateRange('mensual')` → start = día 1 del mes, end = último día del mes
- `getPrevDateRange('mensual')` → start/end del mes anterior
- `getDateRange('anual')` → start = 2026-01-01, end = 2026-12-31
- `getPrevDateRange('anual')` → start = 2025-01-01, end = 2025-12-31
- `generarId()` llamado dos veces produce valores distintos

Restaurar con `vi.useRealTimers()` en `afterEach`.

---

## Paso 6 — Crear `unit/tests/storage.test.js`

Importa desde `../../js/storage.js`. Limpia con `localStorage.clear()` en `beforeEach`.

Tests:
- `getGastos()` devuelve `[]` cuando localStorage está vacío
- `addGasto(gasto)` + `getGastos()` devuelve el gasto añadido
- `deleteGasto(id)` elimina solo el gasto con ese ID
- `updateGasto(id, campos)` actualiza solo los campos indicados, no toca los demás
- `getGastosByDateRange(start, end)` devuelve solo los gastos dentro del rango
- `getGastos()` devuelve `[]` si localStorage contiene JSON inválido (usar `localStorage.setItem('appGastos_gastos', 'corrupto')`)

---

## Paso 7 — Crear `unit/tests/ui.test.js`

Importa desde `../../js/ui.js`. En `beforeEach` crear e inyectar los elementos DOM necesarios:

```js
document.body.innerHTML = `
  <tbody id="cuerpoTabla"></tbody>
  <p id="mensajeVacio" class="hidden"></p>
  <div id="leyendas"></div>
`;
```

Tests para `renderTabla`:
- Con lista vacía: `#mensajeVacio` no tiene clase `hidden`
- Con gastos: filas ordenadas de fecha más reciente a más antigua

Tests para `renderLegendas`:
- Sin gastos: muestra mensaje de "Sin gastos registrados"
- Con gastos y sin período anterior: muestra total sin delta porcentual
- Con gastos y período anterior con datos: muestra porcentaje de variación (más/menos)
- Identifica correctamente la categoría con mayor gasto
- Incluye mensaje de variación por categoría solo cuando supera el 5%
- No incluye mensaje de variación cuando la diferencia es ≤5%

---

## Paso 8 — Crear `unit/tests/charts.test.js`

Importa `updateCharts` desde `../../js/charts.js`. Antes de los tests, definir e inyectar el mock de `Chart`:

```js
// Mock de Chart.js (llega por CDN en browser, no existe en jsdom)
class MockChart {
  constructor(ctx, config) { this.config = config; }
  update() {}
}

beforeAll(() => {
  // Crear canvas fake para initCharts
  document.body.innerHTML = `
    <canvas id="graficoDona"></canvas>
    <canvas id="graficoBarras"></canvas>
  `;
  vi.stubGlobal('Chart', MockChart);
  initCharts();
});

afterAll(() => vi.unstubAllGlobals());
```

Tests para `updateCharts`:
- Modo semanal: labels del dataset de barras son `['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']`
- Modo mensual: labels del dataset de barras comienzan con `'Sem 1'`
- Modo anual: labels del dataset de barras tienen 12 elementos
- Sin gastos: dona recibe label `'Sin gastos'` y un solo dato `[1]`
- Con gastos en una sola categoría: dona recibe exactamente esa categoría en labels

---

## Paso 9 — Instalar dependencias y verificar

```bash
cd unit && npm install
npm test
```

Todos los tests deben pasar en verde.

---

## Paso 10 — Commit y PR

```bash
git add js/dateUtils.js js/app.js unit/
git commit -m "feat: add unit test suite with Vitest + extract dateUtils module"
gh pr create --title "feat: unit tests with Vitest (storage, dates, UI, charts)"
```

---

## Orden de implementación

```
Paso 1  → Extraer dateUtils.js        (refactor, sin dependencias)
Paso 2  → package.json                (setup)
Paso 3  → vitest.config.js            (setup)
Paso 4  → constants.test.js           (más simple, valida setup)
Paso 5  → dateUtils.test.js           (lógica crítica)
Paso 6  → storage.test.js             (CRUD + localStorage)
Paso 7  → ui.test.js                  (DOM + jsdom)
Paso 8  → charts.test.js              (mock de Chart global)
Paso 9  → npm install + npm test      (verificación final)
Paso 10 → commit + PR
```
