# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

`appGastos` es una aplicación web estática de gestión de gastos personales. Sin backend, sin build step, sin npm. Corre directamente en el navegador usando ES6 modules nativos y Chart.js vía CDN.

**Stack:** HTML + CSS + Vanilla JS (ES6 modules) + Chart.js 4.4.3 (CDN)  
**Almacenamiento:** `localStorage` — clave `appGastos_gastos`, array JSON  
**Moneda:** DOP (pesos dominicanos)  
**Producción:** https://raydel-suarez.github.io/appGastos/ (GitHub Pages, rama `main`, raíz `/`)

## Desarrollo local

```bash
# Opción A — servidor estático sin instalación
npx serve .

# Opción B — extensión Live Server de VS Code
# Click derecho en index.html → "Open with Live Server"
```

No hay `npm install`, `npm build`, ni paso de compilación. Los módulos JS usan `type="module"` en el HTML, por lo que abrir `index.html` como `file://` fallará por CORS — usar siempre un servidor local.

## Despliegue

Push a `main` → GitHub Pages redespliega automáticamente en ~1 minuto.

```bash
git push origin main
```

## Pruebas E2E

Hay dos suites de pruebas con propósitos distintos:

| Suite | Cuándo usar | Dónde corre |
|---|---|---|
| **Playwright + Gherkin + Allure** (`e2e/`) | Regresiones locales antes de hacer push | `http://localhost:3000` |
| **TestSprite** | Smoke tests en producción después de desplegar | `https://raydel-suarez.github.io/appGastos/` |

### Suite local: Playwright + Gherkin + Allure

```bash
# 1. Levantar el servidor estático (desde la raíz del repo)
npx serve . -p 3000

# 2. Ejecutar los tests (desde e2e/)
cd e2e && npm test

# 3. Ver el reporte Allure
cd e2e && npm run report
```

**Estructura de la suite:**
```
e2e/
├── features/gastos/flujo-critico.feature   # escenarios en Gherkin (español)
├── steps/gastos/gastos.steps.ts            # step definitions TypeScript
├── pages/GastosPage.ts                     # Page Object — selectores centralizados
├── support/fixtures.ts                     # fixtures de playwright-bdd
└── playwright.config.ts                    # config: baseURL, Allure reporter
```

- Usar el skill `/automator` para agregar o actualizar escenarios
- Usar el agente `automatizador` para el ciclo completo (cambio + ejecución + reintento)

### Suite en producción: TestSprite

Las pruebas corren con TestSprite contra la URL de producción.

```bash
# Ejecutar un test existente
testsprite test run <test-id> \
  --target-url https://raydel-suarez.github.io/appGastos/ \
  --wait --timeout 600

# Crear y ejecutar un test nuevo desde plan
testsprite test create \
  --plan-from plan.json --run --wait \
  --target-url https://raydel-suarez.github.io/appGastos/ \
  --timeout 600
```

- Project ID de TestSprite: `f60711fe-642c-4662-becf-6b2b7a2e868c`
- Dashboard: https://www.testsprite.com/dashboard/tests/f60711fe-642c-4662-becf-6b2b7a2e868c
- Usar el skill `/pruebas` para el flujo guiado completo.

## Arquitectura

### Flujo de datos

`app.js` es el único punto de entrada y coordinador. Cuando cambia el estado (nuevo gasto, eliminación, cambio de período), llama a `actualizarDashboard()`, que:

1. Calcula el rango de fechas del período activo y el anterior con `getDateRange` / `getPrevDateRange`
2. Obtiene gastos filtrados de `storage.js`
3. Pasa los datos a `charts.js` (redibuja dona y barras) y a `ui.js` (renderiza tabla y leyendas)

La variable `periodoActivo` en `app.js` es el único estado en memoria; todo lo demás vive en localStorage.

### Módulos

| Módulo | Responsabilidad |
|---|---|
| `js/app.js` | Punto de entrada: inicializa, gestiona eventos, calcula rangos de fecha, llama al resto |
| `js/storage.js` | CRUD sobre `localStorage` — `addGasto`, `deleteGasto`, `getGastos`, `getGastosByDateRange` |
| `js/ui.js` | Renderiza la tabla de gastos y el panel de leyendas comparativas |
| `js/charts.js` | Inicializa y actualiza el gráfico de dona y el de barras vía Chart.js |
| `js/constants.js` | Fuente de verdad: `CATEGORIAS`, `COLORES_CAT`, `MESES` |

### Modelo de datos

```json
{
  "id": "<Date.now().toString(36) + random>",
  "fecha": "2026-06-25",
  "monto": 1500,
  "categoria": "Alimentación",
  "descripcion": "Almuerzo en restaurante"
}
```

Las categorías válidas son exactamente las exportadas en `constants.js → CATEGORIAS`. Los colores del gráfico están indexados en el mismo orden en `COLORES_CAT`.

### Reglas del gráfico de barras

- **Semanal:** una barra por día, lunes a domingo de la semana actual
- **Mensual:** una barra por semana calendario (lunes–domingo) del mes actual — calculadas dinámicamente en `getWeeksInMonth`
- **Anual:** una barra por mes usando `MESES` de `constants.js`

### Leyendas comparativas (`ui.js → renderLegendas`)

Compara el período activo contra el inmediatamente anterior. Genera hasta 3 frases: total con delta porcentual, categoría de mayor gasto, categoría con mayor variación (solo si el cambio supera el 5%). Si no hay datos del período anterior, omite el delta.
